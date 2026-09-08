import { randomUUID } from 'node:crypto';
import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { createOrderSchema } from '@sirohi/contracts';

import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';
import { PhonePeService } from './phonepe.service';

@Controller({ path: 'orders', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@Roles('CUSTOMER', 'BUSINESS')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, private readonly phonePe: PhonePeService) {}

  @Post('phonepe/initiate')
  async initiatePhonePePayment(
    @Body() body: unknown,
    @CurrentUser() customer: AuthenticatedUser,
  ) {
    if (customer.role !== 'CUSTOMER') throw new BadRequestException('PhonePe checkout is available for customer orders only');
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (parsed.data.paymentMethod !== 'ONLINE') throw new BadRequestException('PhonePe payments require the online payment method');
    const quote = await this.ordersService.quote(parsed.data, 'B2C');
    const merchantOrderId = `SP-${randomUUID()}`;
    const payment = await this.phonePe.createPayment(merchantOrderId, quote.totalInPaise, { customerId: customer.id, input: parsed.data, amount: quote.totalInPaise });
    return { data: { merchantOrderId, redirectUrl: payment.redirectUrl } };
  }

  @Get('phonepe/verify/:merchantOrderId')
  async verifyPhonePePayment(
    @Param('merchantOrderId') merchantOrderId: string,
    @CurrentUser() customer: AuthenticatedUser,
  ) {
    if (customer.role !== 'CUSTOMER') throw new BadRequestException('PhonePe checkout is available for customer orders only');
    const pending = this.phonePe.getPendingPayment(merchantOrderId);
    if (!pending || pending.customerId !== customer.id) throw new BadRequestException('This PhonePe payment session is not available');
    const payment = await this.phonePe.getPaymentStatus(merchantOrderId);
    if (payment.amount !== undefined && payment.amount !== pending.amount) {
      throw new BadRequestException('The PhonePe payment amount does not match the order amount');
    }
    let orderId = pending.orderId;
    if (payment.state === 'COMPLETED' && !orderId) {
      const order = await this.ordersService.create(pending.input, customer.id, 'B2C');
      orderId = order.id;
      this.phonePe.setCompletedOrder(merchantOrderId, order.id);
    }
    return { data: { orderId: orderId ?? '', merchantOrderId, state: payment.state, amount: payment.amount ?? pending.amount } };
  }

  @Post()
  async create(
    @Body() body: unknown,
    @CurrentUser() customer: AuthenticatedUser,
  ) {
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const buyerSegment = customer.role === 'BUSINESS' ? 'B2B' : 'B2C';
    return { data: await this.ordersService.create(parsed.data, customer.id, buyerSegment) };
  }

  @Get()
  async list(@CurrentUser() customer: AuthenticatedUser) {
    return { data: await this.ordersService.listForCustomer(customer.id) };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() customer: AuthenticatedUser) {
    return { data: await this.ordersService.findOneForCustomer(customer.id, id) };
  }
}
