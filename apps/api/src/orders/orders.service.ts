import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { CreateOrderInput, OrderDetails, OrderStatus, OrderSummary, PriceSegment } from '@sirohi/contracts';
import { CatalogService } from '../catalog/catalog.service';
import { PrismaService } from '../prisma/prisma.service';

const stages: OrderStatus[] = ['CONFIRMED', 'ACCEPTED', 'PACKED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const orderInclude = { customer: { select: { name: true, email: true } }, items: { include: { product: { select: { name: true } } } } } as const;
type OrderRecord = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

@Injectable()
export class OrdersService {
  private readonly memoryOrders: OrderDetails[] = [];
  constructor(private readonly catalog: CatalogService, private readonly prisma: PrismaService) {}

  private async transaction<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      try { return await this.prisma.$transaction(work, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); }
      catch (error) {
        if (attempt < 3 && error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') continue;
        throw error;
      }
    }
  }

  async create(input: CreateOrderInput, customerId: string, buyerSegment: PriceSegment): Promise<OrderSummary> {
    if (new Set(input.items.map((item) => item.productId)).size !== input.items.length) throw new BadRequestException('Each product must appear only once');
    const prepare = async (tx?: Prisma.TransactionClient) => {
      const items = [];
      for (const item of input.items) {
        const record = tx ? await tx.product.findUnique({ where: { id: item.productId }, include: { inventory: true } }) : null;
        if (tx && (!record?.active || (buyerSegment === 'B2B' && record.b2bPriceInPaise === null))) throw new BadRequestException('A product is no longer available');
        const product = record ? {
          name: record.name, stock: record.inventory?.available ?? 0,
          priceInPaise: buyerSegment === 'B2B' ? record.b2bPriceInPaise! : record.b2cPriceInPaise,
          minimumB2BQuantity: record.minimumB2BQuantity, allowB2BBackorder: record.allowB2BBackorder,
        } : await this.catalog.findOneForSegment(item.productId, buyerSegment);
        const minimum = buyerSegment === 'B2B' ? product.minimumB2BQuantity ?? 1 : 1;
        if (!Number.isInteger(item.quantity) || item.quantity < minimum || item.quantity > 100000) throw new BadRequestException(product.name + ': quantity must be a whole number between ' + minimum + ' and 100000');
        const backorderedQuantity = Math.max(0, item.quantity - product.stock);
        if (backorderedQuantity && (buyerSegment === 'B2C' || !product.allowB2BBackorder)) throw new BadRequestException(product.name + ' has only ' + product.stock + ' available');
        items.push({ productId: item.productId, productName: product.name, quantity: item.quantity, backorderedQuantity, unitPriceInPaise: product.priceInPaise, buyerSegment });
        const reserved = item.quantity - backorderedQuantity;
        if (tx && reserved) await tx.inventory.update({ where: { productId: item.productId }, data: { reserved: { increment: reserved }, available: { decrement: reserved } } });
      }
      const totalInPaise = items.reduce((sum, item) => sum + item.quantity * item.unitPriceInPaise, 0);
      if (totalInPaise > 2147483647) throw new BadRequestException('Order total is too large; please split it into smaller orders');
      return { items, totalInPaise, itemCount: items.reduce((sum, item) => sum + item.quantity, 0) };
    };
    if (!process.env.DATABASE_URL) {
      const prepared = await prepare();
      const order: OrderDetails = { ...prepared, items: prepared.items.map((item) => ({ ...item, id: randomUUID() })), id: randomUUID(), customerId, buyerSegment, paymentMethod: input.paymentMethod, deliveryAddress: input.deliveryAddress, createdAt: new Date().toISOString(), status: 'CONFIRMED', approvalStatus: 'PENDING' };
      this.memoryOrders.unshift(order);
      return order;
    }
    return this.transaction(async (tx) => {
      const prepared = await prepare(tx);
      return this.toDetails(await tx.order.create({ data: { customerId, buyerSegment, paymentMethod: input.paymentMethod, deliveryAddress: input.deliveryAddress, totalInPaise: prepared.totalInPaise, itemCount: prepared.itemCount, items: { create: prepared.items.map(({ productName: _name, ...item }) => item) } }, include: orderInclude }));
    });
  }

  async listForCustomer(customerId: string): Promise<OrderDetails[]> {
    if (!process.env.DATABASE_URL) return this.memoryOrders.filter((order) => order.customerId === customerId);
    return (await this.prisma.order.findMany({ where: { customerId }, include: orderInclude, orderBy: { createdAt: 'desc' } })).map((order) => this.toDetails(order));
  }
  async findOneForCustomer(customerId: string, id: string): Promise<OrderDetails> {
    const order = (await this.listForCustomer(customerId)).find((item) => item.id === id);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
  async listForAdmin(): Promise<OrderDetails[]> {
    if (!process.env.DATABASE_URL) return [...this.memoryOrders];
    return (await this.prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: 'desc' } })).map((order) => this.toDetails(order));
  }
  approve(id: string, adminId: string) { return this.change(id, 'ACCEPTED', adminId); }
  reject(id: string, adminId: string, reason: string) { return this.cancelOrder(id, adminId, reason, true); }
  cancel(id: string, adminId: string, reason: string) { return this.cancelOrder(id, adminId, reason, false); }
  updateStatus(id: string, status: OrderStatus) {
    if (status === 'CANCELLED') throw new BadRequestException('Use the cancel action and provide a cancellation reason');
    return this.change(id, status);
  }

  private async cancelOrder(id: string, adminId: string, reason: string, rejectPending: boolean): Promise<OrderSummary> {
    if (!reason.trim()) throw new BadRequestException('A cancellation reason is required');
    if (!process.env.DATABASE_URL) {
      const order = this.memoryOrders.find((item) => item.id === id);
      if (!order) throw new NotFoundException('Order not found');
      if (order.status === 'CANCELLED' || order.status === 'DELIVERED') throw new BadRequestException('A cancelled or delivered order cannot be cancelled');
      if (rejectPending && order.approvalStatus !== 'PENDING') throw new BadRequestException('This order was already approved; use cancel order instead');
      order.status = 'CANCELLED';
      order.approvalStatus = order.approvalStatus === 'PENDING' ? 'REJECTED' : order.approvalStatus;
      order.cancellationReason = reason;
      return order;
    }
    return this.transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id }, include: orderInclude });
      if (!existing) throw new NotFoundException('Order not found');
      if (existing.status === 'CANCELLED' || existing.status === 'DELIVERED') throw new BadRequestException('A cancelled or delivered order cannot be cancelled');
      if (rejectPending && existing.approvalStatus !== 'PENDING') throw new BadRequestException('This order was already approved; use cancel order instead');
      for (const item of existing.items) {
        const reserved = item.quantity - item.backorderedQuantity;
        if (reserved) await tx.inventory.update({ where: { productId: item.productId }, data: { reserved: { decrement: reserved }, available: { increment: reserved } } });
      }
      return this.toDetails(await tx.order.update({ where: { id }, data: { status: 'CANCELLED', approvalStatus: existing.approvalStatus === 'PENDING' ? 'REJECTED' : existing.approvalStatus, approvedById: adminId, approvedAt: new Date(), rejectionReason: reason }, include: orderInclude }));
    });
  }

  private async change(id: string, status: OrderStatus, adminId?: string, reason?: string, reject = false): Promise<OrderSummary> {
    const validate = (order: OrderSummary) => {
      if (order.status === status) return;
      if (order.status === 'CANCELLED' || order.status === 'DELIVERED') throw new BadRequestException('A cancelled or delivered order cannot be changed');
      if (reject && order.approvalStatus !== 'PENDING') throw new BadRequestException('Only pending orders can be rejected; use cancellation for an approved order');
      if (status !== 'CANCELLED' && !(adminId && status === 'ACCEPTED') && order.approvalStatus !== 'APPROVED') throw new BadRequestException('Approve this order before updating fulfilment');
      if (status !== 'CANCELLED' && stages.indexOf(status) <= stages.indexOf(order.status)) throw new BadRequestException('Order status cannot move backwards');
    };
    if (!process.env.DATABASE_URL) {
      const order = this.memoryOrders.find((item) => item.id === id);
      if (!order) throw new NotFoundException('Order not found');
      validate(order);
      order.status = status;
      if (reject) order.approvalStatus = 'REJECTED';
      else if (adminId) order.approvalStatus = 'APPROVED';
      return order;
    }
    return this.transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id }, include: orderInclude });
      if (!existing) throw new NotFoundException('Order not found');
      validate(this.toDetails(existing));
      if (existing.status === status) return this.toDetails(existing);
      if (status === 'CANCELLED' || status === 'DELIVERED') {
        for (const item of existing.items) {
          const reserved = item.quantity - item.backorderedQuantity;
          if (status === 'DELIVERED' && item.backorderedQuantity) {
            const stock = await tx.inventory.findUnique({ where: { productId: item.productId } });
            if (!stock || stock.available < item.backorderedQuantity) throw new BadRequestException('Restock backordered products before marking delivered');
            await tx.inventory.update({ where: { productId: item.productId }, data: { available: { decrement: item.backorderedQuantity }, onHand: { decrement: item.backorderedQuantity } } });
          }
          if (reserved) await tx.inventory.update({ where: { productId: item.productId }, data: { reserved: { decrement: reserved }, ...(status === 'CANCELLED' ? { available: { increment: reserved } } : { onHand: { decrement: reserved } }) } });
        }
      }
      return this.toDetails(await tx.order.update({ where: { id }, data: { status, ...(adminId ? { approvalStatus: reject ? 'REJECTED' : 'APPROVED', approvedById: adminId, approvedAt: new Date(), rejectionReason: reason ?? null } : {}) }, include: orderInclude }));
    });
  }

  private toDetails(order: OrderRecord): OrderDetails {
    return { id: order.id, customerId: order.customerId, buyerName: order.customer.name, ...(order.customer.email ? { buyerEmail: order.customer.email } : {}), buyerSegment: order.buyerSegment, status: order.status, approvalStatus: order.approvalStatus, paymentMethod: order.paymentMethod, deliveryAddress: order.deliveryAddress, ...(order.rejectionReason ? { cancellationReason: order.rejectionReason } : {}), totalInPaise: order.totalInPaise, itemCount: order.itemCount, createdAt: order.createdAt.toISOString(), items: order.items.map((item) => ({ id: item.id, productId: item.productId, productName: item.product.name, quantity: item.quantity, backorderedQuantity: item.backorderedQuantity, unitPriceInPaise: item.unitPriceInPaise, buyerSegment: item.buyerSegment })) };
  }
}
