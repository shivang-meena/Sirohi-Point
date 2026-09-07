import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  adminBannerInputSchema,
  adminProductInputSchema,
  orderCancellationSchema,
  orderRejectionSchema,
  orderStatusUpdateSchema,
} from '@sirohi/contracts';

import { AuthGuard } from '../auth/auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

@Controller({ path: 'admin', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  async overview() {
    return { data: await this.admin.overview() };
  }

  @Get('products')
  async products() {
    return { data: await this.admin.listProducts() };
  }

  @Post('products')
  async createProduct(@Body() body: unknown) {
    const parsed = adminProductInputSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return { data: await this.admin.createProduct(parsed.data) };
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: unknown) {
    const parsed = adminProductInputSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return { data: await this.admin.updateProduct(id, parsed.data) };
  }

  @Delete('products/:id')
  async removeProduct(@Param('id') id: string) {
    return { data: await this.admin.removeProduct(id) };
  }

  @Get('users')
  async users() {
    return { data: await this.admin.listUsers() };
  }

  @Get('users/:id')
  async userProfile(@Param('id') id: string) {
    return { data: await this.admin.getUserProfile(id) };
  }

  @Delete('users/:id')
  async removeUser(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return { data: await this.admin.removeUser(id, admin.id) };
  }

  @Patch('users/:id/restore')
  async restoreUser(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return { data: await this.admin.restoreUser(id, admin.id) };
  }

  @Get('businesses')
  async businesses() {
    return { data: await this.admin.listBusinessProfiles() };
  }

  @Patch('businesses/:id/approve')
  async approveBusiness(@Param('id') id: string) {
    return { data: await this.admin.approveBusiness(id) };
  }

  @Patch('businesses/:id/reject')
  async rejectBusiness(@Param('id') id: string) {
    return { data: await this.admin.rejectBusiness(id) };
  }

  @Patch('businesses/:id/reapprove')
  async reapproveBusiness(@Param('id') id: string) {
    return { data: await this.admin.reapproveBusiness(id) };
  }

  @Get('orders')
  async orders() {
    return { data: await this.admin.listOrders() };
  }

  @Patch('orders/:id/approve')
  async approveOrder(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return { data: await this.admin.approveOrder(id, admin.id) };
  }

  @Patch('orders/:id/reject')
  async rejectOrder(@Param('id') id: string, @Body() body: unknown, @CurrentUser() admin: AuthenticatedUser) {
    const parsed = orderCancellationSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return { data: await this.admin.rejectOrder(id, admin.id, parsed.data.reason) };
  }

  @Patch('orders/:id/cancel')
  async cancelOrder(@Param('id') id: string, @Body() body: unknown, @CurrentUser() admin: AuthenticatedUser) {
    const parsed = orderCancellationSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return { data: await this.admin.cancelOrder(id, admin.id, parsed.data.reason) };
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() body: unknown) {
    const parsed = orderStatusUpdateSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return { data: await this.admin.updateOrderStatus(id, parsed.data.status) };
  }

  @Get('service-bookings')
  async serviceBookings() {
    return { data: await this.admin.listServiceBookings() };
  }

  @Patch('service-bookings/:id/approve')
  async approveServiceBooking(@Param('id') id: string, @CurrentUser() admin: AuthenticatedUser) {
    return { data: await this.admin.approveServiceBooking(id, admin.id) };
  }

  @Patch('service-bookings/:id/reject')
  async rejectServiceBooking(@Param('id') id: string, @Body() body: unknown) {
    const parsed = orderRejectionSchema.safeParse(body ?? {});
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return { data: await this.admin.rejectServiceBooking(id, parsed.data.reason) };
  }

  @Get('contractors')
  async contractors() {
    return { data: await this.admin.listContractorProfiles() };
  }

  @Patch('contractors/:id/approve')
  async approveContractor(@Param('id') id: string) {
    return { data: await this.admin.approveContractor(id) };
  }

  @Patch('contractors/:id/reject')
  async rejectContractor(@Param('id') id: string) {
    return { data: await this.admin.rejectContractor(id) };
  }

  @Patch('contractors/:id/reapprove')
  async reapproveContractor(@Param('id') id: string) {
    return { data: await this.admin.reapproveContractor(id) };
  }

  @Get('banners')
  async banners() {
    return { data: await this.admin.listBanners(false) };
  }

  @Post('banners')
  async createBanner(@Body() body: unknown) {
    const parsed = adminBannerInputSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return { data: await this.admin.createBanner(parsed.data) };
  }

  @Patch('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() body: unknown) {
    const parsed = adminBannerInputSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return { data: await this.admin.updateBanner(id, parsed.data) };
  }

  @Delete('banners/:id')
  async removeBanner(@Param('id') id: string) {
    return { data: await this.admin.removeBanner(id) };
  }

  @Post('uploads')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 3 * 1024 * 1024 } }),
  )
  upload(
    @UploadedFile()
    file?: {
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Choose a PNG, JPEG, WebP or other image file',
      );
    }
    return {
      data: {
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        size: file.size,
      },
    };
  }
}
