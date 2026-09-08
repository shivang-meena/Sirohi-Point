import { BadRequestException, Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { createOrderSchema } from '@sirohi/contracts';

import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';
import { RazorpayService } from './razorpay.service';

@Controller({ path: 'orders', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@Roles('CUSTOMER', 'BUSINESS')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService, private readonly razorpay: RazorpayService) {}

  @Post('razorpay/initiate')
  async initiateRazorpayPayment(
    @Body() body: unknown,
    @CurrentUser() customer: AuthenticatedUser,
  ) {
    if (customer.role !== 'CUSTOMER') throw new BadRequestException('Razorpay checkout is available for customer orders only');
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (parsed.data.paymentMethod !== 'ONLINE') throw new BadRequestException('Razorpay payments require the online payment method');
    const quote = await this.ordersService.quote(parsed.data, 'B2C');
    const merchantOrderId = this.razorpay.createMerchantOrderId();
    const payment = await this.razorpay.createPayment(merchantOrderId, quote.totalInPaise, { customerId: customer.id, input: parsed.data, amount: quote.totalInPaise });
    return { data: payment };
  }

  @Post('razorpay/verify')
  async verifyRazorpayPayment(
    @Body() body: unknown,
    @CurrentUser() customer: AuthenticatedUser,
  ) {
    if (customer.role !== 'CUSTOMER') throw new BadRequestException('Razorpay checkout is available for customer orders only');
    if (!body || typeof body !== 'object') throw new BadRequestException('Razorpay payment details are required');
    const input = body as Record<string, unknown>;
    const razorpayOrderId = typeof input.razorpayOrderId === 'string' ? input.razorpayOrderId : '';
    const razorpayPaymentId = typeof input.razorpayPaymentId === 'string' ? input.razorpayPaymentId : '';
    const razorpaySignature = typeof input.razorpaySignature === 'string' ? input.razorpaySignature : '';
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) throw new BadRequestException('Razorpay payment details are incomplete');
    const pending = this.razorpay.getPendingPayment(razorpayOrderId);
    if (!pending || pending.customerId !== customer.id) throw new BadRequestException('This Razorpay payment session is not available');
    const payment = await this.razorpay.verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }, pending.amount);
    let orderId = pending.orderId;
    if (payment.state === 'COMPLETED' && !orderId) {
      const order = await this.ordersService.create(pending.input, customer.id, 'B2C');
      orderId = order.id;
      this.razorpay.setCompletedOrder(razorpayOrderId, order.id);
    }
    return { data: { orderId: orderId ?? '', razorpayOrderId, state: payment.state, amount: payment.amount } };
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
