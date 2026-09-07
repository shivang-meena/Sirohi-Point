import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { createOrderSchema } from '@sirohi/contracts';

import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrdersService } from './orders.service';

@Controller({ path: 'orders', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@Roles('CUSTOMER', 'BUSINESS')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
