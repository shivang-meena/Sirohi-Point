import { randomUUID } from 'node:crypto';

import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AdminBusinessDetails,
  AdminBannerInput,
  AdminOverview,
  AdminProduct,
  AdminProductInput,
  AdminHsnInput,
  AdminUserProfile,
  ContractorAdminDetails,
  Banner,
  OrderDetails,
  OrderSummary,
} from '@sirohi/contracts';

import { AuthService } from '../auth/auth.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CatalogService } from '../catalog/catalog.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';
import { ServicesService } from '../services/services.service';

const fallbackHsnMaster = [
  { id: '00000000-0000-4000-8000-000000002001', code: '3917', description: 'Plastic pipes, tubes and fittings', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002002', code: '6910', description: 'Ceramic sanitary fixtures', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002003', code: '3209', description: 'Water-based paints and varnishes', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002004', code: '8536', description: 'Electrical switching and connection apparatus', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002005', code: '8509', description: 'Domestic electro-mechanical appliances', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002006', code: '7318', description: 'Iron or steel fasteners', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002007', code: '3926', description: 'Other plastic articles', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002008', code: '8481', description: 'Taps, cocks, valves and similar appliances', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002009', code: '7412', description: 'Copper tube or pipe fittings', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002010', code: '7307', description: 'Iron or steel tube or pipe fittings', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002011', code: '3922', description: 'Plastic sanitary ware', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002012', code: '8537', description: 'Boards, panels and consoles for electric control', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002013', code: '8544', description: 'Insulated wires and cables', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002014', code: '8539', description: 'Electric filament and LED lamps', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002015', code: '8516', description: 'Electric water heaters and other electro-thermic appliances', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002016', code: '8413', description: 'Pumps for liquids', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002017', code: '3208', description: 'Paints and varnishes in non-aqueous medium', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002018', code: '3210', description: 'Other paints and varnishes', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002019', code: '3214', description: 'Putty, mastics and painters fillings', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002020', code: '9603', description: 'Brooms, brushes and paint brushes', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002021', code: '7315', description: 'Iron or steel chain', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002022', code: '8201', description: 'Agricultural hand tools', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002023', code: '8203', description: 'Pliers, pincers and similar hand tools', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002024', code: '8205', description: 'Other hand tools', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002025', code: '8433', description: 'Harvesting or threshing machinery', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002026', code: '8436', description: 'Other agricultural machinery', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002027', code: '8211', description: 'Knives with cutting blades', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002028', code: '9613', description: 'Cigarette lighters and other lighters', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002029', code: '8513', description: 'Portable electric lamps', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002030', code: '3923', description: 'Plastic containers and packing articles', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002031', code: '8302', description: 'Base metal mountings and fittings', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002032', code: '7326', description: 'Other articles of iron or steel', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002033', code: '6912', description: 'Ceramic tableware and household articles', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002034', code: '3402', description: 'Organic surface-active and cleaning preparations', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
  { id: '00000000-0000-4000-8000-000000002035', code: '3506', description: 'Prepared glues and adhesives', cgstRate: 9, sgstRate: 9, igstRate: 18, active: true },
];

@Injectable()
export class AdminService {
  private readonly memoryBanners: Banner[] = [
    {
      id: 'banner-hardware',
      audience: 'B2C',
      title: 'Hardware deals',
      badge: 'SITE ESSENTIALS',
      productId: 'hardware-pata-bolt',
      ctaLabel: 'Shop now',
      backgroundColor: '#0B1F33',
      sortOrder: 0,
      active: true,
    },
    {
      id: 'banner-electrical',
      audience: 'B2C',
      title: 'Electrical essentials',
      badge: 'POPULAR',
      productId: 'electrical-modular-switch',
      ctaLabel: 'View product',
      backgroundColor: '#123F75',
      sortOrder: 1,
      active: true,
    },
    {
      id: 'banner-paint',
      audience: 'B2C',
      title: 'Paint & finish',
      badge: 'PROJECT READY',
      productId: 'paint-interior-emulsion',
      ctaLabel: 'Shop paint',
      backgroundColor: '#26384B',
      sortOrder: 2,
      active: true,
    },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: CatalogService,
    private readonly auth: AuthService,
    private readonly orders: OrdersService,
    private readonly services: ServicesService,
  ) {}

  async overview(): Promise<AdminOverview> {
    const [users, products, banners] = await Promise.all([
      this.auth.listUsers(),
      this.catalog.findAllAdmin(),
      this.listBanners(false),
    ]);
    return {
      userCount: users.length,
      activeUserCount: users.filter((user) => user.active).length,
      productCount: products.length,
      activeProductCount: products.filter((product) => product.active).length,
      bannerCount: banners.length,
    };
  }

  listProducts(): Promise<AdminProduct[]> {
    return this.catalog.findAllAdmin();
  }

  async listHsnMaster() {
    if (!process.env.DATABASE_URL) return fallbackHsnMaster;
    return this.prisma.hsnMaster.findMany({ where: { active: true }, orderBy: { code: 'asc' }, select: { id: true, code: true, description: true, cgstRate: true, sgstRate: true, igstRate: true, active: true } });
  }

  async createHsnMaster(input: AdminHsnInput) {
    if (!process.env.DATABASE_URL) {
      const existing = fallbackHsnMaster.find((hsn) => hsn.code === input.code);
      if (existing) { Object.assign(existing, input); return existing; }
      const created = { id: randomUUID(), ...input, active: true };
      fallbackHsnMaster.push(created);
      return created;
    }
    return this.prisma.hsnMaster.upsert({
      where: { code: input.code },
      update: { description: input.description, cgstRate: input.cgstRate, sgstRate: input.sgstRate, igstRate: input.igstRate, active: true },
      create: { code: input.code, description: input.description, cgstRate: input.cgstRate, sgstRate: input.sgstRate, igstRate: input.igstRate },
      select: { id: true, code: true, description: true, cgstRate: true, sgstRate: true, igstRate: true, active: true },
    });
  }

  createProduct(input: AdminProductInput) {
    return this.catalog.create(input);
  }

  updateProduct(id: string, input: AdminProductInput) {
    return this.catalog.update(id, input);
  }

  removeProduct(id: string) {
    return this.catalog.remove(id);
  }

  listUsers(): Promise<AuthenticatedUser[]> {
    return this.auth.listUsers();
  }

  async getUserProfile(id: string): Promise<AdminUserProfile> {
    if (!process.env.DATABASE_URL) {
      const user = (await this.auth.listUsers()).find((item) => item.id === id);
      if (!user) throw new NotFoundException('User not found');
      const [orders, bookings, businesses, contractors] = await Promise.all([
        this.orders.listForAdmin(), this.services.listForAdmin(), this.auth.listBusinessProfiles(), this.services.listContractorProfiles(),
      ]);
      return {
        ...user,
        orderCount: orders.filter((order) => order.customerId === id).length,
        serviceRequestCount: bookings.filter((booking) => booking.customerId === id).length,
        addresses: [],
        businessProfile: businesses.find((profile) => profile.userId === id),
        contractorProfile: contractors.find((profile) => profile.userId === id),
      };
    }
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        addresses: { orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] },
        businessProfile: true,
        contractorProfile: { include: { services: true } },
        _count: { select: { orders: true, serviceBookings: true } },
      },
    });
    if (!user?.email) throw new NotFoundException('User not found');
    const contractorProfile: ContractorAdminDetails | undefined = user.contractorProfile ? {
      id: user.contractorProfile.id, userId: user.contractorProfile.userId, name: user.name, email: user.email, phone: user.phone,
      skills: user.contractorProfile.skills, serviceArea: user.contractorProfile.serviceArea, latitude: user.contractorProfile.latitude, longitude: user.contractorProfile.longitude,
      serviceRadiusKm: user.contractorProfile.serviceRadiusKm, experienceYears: user.contractorProfile.experienceYears, bio: user.contractorProfile.bio,
      rating: user.contractorProfile.rating, verified: user.contractorProfile.verified, approvalStatus: user.contractorProfile.approvalStatus, availability: user.contractorProfile.availability,
      services: user.contractorProfile.services.map((service) => ({ id: service.id, serviceType: service.serviceType, description: service.description ?? undefined, visitChargeInPaise: service.visitChargeInPaise, priceFromInPaise: service.priceFromInPaise ?? undefined, priceToInPaise: service.priceToInPaise ?? undefined })),
    } : undefined;
    return {
      id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, active: user.active, createdAt: user.createdAt.toISOString(),
      orderCount: user._count.orders, serviceRequestCount: user._count.serviceBookings,
      addresses: user.addresses.map((address) => ({ id: address.id, label: address.label, ...(address.name ? { name: address.name } : {}), line1: address.line1, ...(address.houseNumber ? { houseNumber: address.houseNumber } : {}), city: address.city, ...(address.state ? { state: address.state } : {}), ...(address.postalCode ? { postalCode: address.postalCode } : {}), ...(address.phone ? { phone: address.phone } : {}), ...(address.alternatePhone ? { alternatePhone: address.alternatePhone } : {}), ...(address.latitude !== null ? { latitude: address.latitude } : {}), ...(address.longitude !== null ? { longitude: address.longitude } : {}), isDefault: address.isDefault, createdAt: address.createdAt.toISOString(), updatedAt: address.updatedAt.toISOString() })),
      businessProfile: user.businessProfile ? { id: user.businessProfile.id, userId: user.businessProfile.userId, businessName: user.businessProfile.businessName, ...(user.businessProfile.businessType ? { businessType: user.businessProfile.businessType } : {}), ...(user.businessProfile.gstin ? { gstin: user.businessProfile.gstin } : {}), billingAddress: user.businessProfile.billingAddress, ...(user.businessProfile.shippingAddress ? { shippingAddress: user.businessProfile.shippingAddress } : {}), approvalStatus: user.businessProfile.approvalStatus as 'PENDING' | 'APPROVED' | 'REJECTED', verified: user.businessProfile.verified } : undefined,
      contractorProfile,
    };
  }

  removeUser(id: string, actingAdminId: string) {
    return this.auth.deactivateUser(id, actingAdminId);
  }

  restoreUser(id: string, actingAdminId: string) {
    return this.auth.activateUser(id, actingAdminId);
  }

  listBusinessProfiles(): Promise<AdminBusinessDetails[]> {
    return this.auth.listBusinessProfiles();
  }

  approveBusiness(id: string) {
    return this.auth.updateBusinessApproval(id, 'APPROVED');
  }

  rejectBusiness(id: string) {
    return this.auth.updateBusinessApproval(id, 'REJECTED');
  }

  reapproveBusiness(id: string) {
    return this.auth.updateBusinessApproval(id, 'APPROVED');
  }

  listOrders(): Promise<OrderDetails[]> {
    return this.orders.listForAdmin();
  }

  approveOrder(id: string, adminId: string): Promise<OrderSummary> {
    return this.orders.approve(id, adminId);
  }

  rejectOrder(id: string, adminId: string, reason: string): Promise<OrderSummary> {
    return this.orders.reject(id, adminId, reason);
  }

  cancelOrder(id: string, adminId: string, reason: string): Promise<OrderSummary> {
    return this.orders.cancel(id, adminId, reason);
  }

  updateOrderStatus(id: string, status: 'CONFIRMED' | 'ACCEPTED' | 'PACKED' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'): Promise<OrderSummary> {
    return this.orders.updateStatus(id, status);
  }

  listServiceBookings() {
    return this.services.listForAdmin();
  }

  listContractorProfiles() {
    return this.services.listContractorProfiles();
  }

  approveContractor(id: string) {
    return this.services.approveContractor(id);
  }

  rejectContractor(id: string) {
    return this.services.rejectContractor(id);
  }

  reapproveContractor(id: string) {
    return this.services.approveContractor(id);
  }

  approveServiceBooking(id: string, adminId: string) {
    return this.services.approveBooking(id, adminId);
  }

  rejectServiceBooking(id: string, reason?: string) {
    return this.services.rejectBooking(id, reason);
  }

  async listBanners(publicOnly: boolean, audience?: 'B2C' | 'B2B'): Promise<Banner[]> {
    if (!process.env.DATABASE_URL) {
      return this.memoryBanners
        .filter((banner) => !publicOnly || banner.active)
        .filter((banner) => !audience || banner.audience === audience || banner.audience === 'BOTH')
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
    const records = await this.prisma.banner.findMany({
      where: {
        ...(publicOnly ? { active: true } : {}),
        ...(audience ? { audience: { in: [audience, 'BOTH'] } } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return records.map((record) => ({
      id: record.id,
      title: record.title,
      ...(record.subtitle ? { subtitle: record.subtitle } : {}),
      ...(record.badge ? { badge: record.badge } : {}),
      ...(record.imageUrl ? { imageUrl: record.imageUrl } : {}),
      ...(record.productId ? { productId: record.productId } : {}),
      ...(record.ctaLabel ? { ctaLabel: record.ctaLabel } : {}),
      audience: record.audience,
      backgroundColor: record.backgroundColor,
      sortOrder: record.sortOrder,
      active: record.active,
    }));
  }

  async createBanner(input: AdminBannerInput): Promise<Banner> {
    if (!process.env.DATABASE_URL) {
      const banner: Banner = { id: randomUUID(), ...input, audience: input.audience ?? 'B2C' };
      this.memoryBanners.push(banner);
      return banner;
    }
    const record = await this.prisma.banner.create({ data: input });
    return {
      id: record.id,
      title: record.title,
      ...(record.subtitle ? { subtitle: record.subtitle } : {}),
      ...(record.badge ? { badge: record.badge } : {}),
      ...(record.imageUrl ? { imageUrl: record.imageUrl } : {}),
      ...(record.productId ? { productId: record.productId } : {}),
      ...(record.ctaLabel ? { ctaLabel: record.ctaLabel } : {}),
      audience: record.audience,
      backgroundColor: record.backgroundColor,
      sortOrder: record.sortOrder,
      active: record.active,
    };
  }

  async updateBanner(id: string, input: AdminBannerInput): Promise<Banner> {
    if (!process.env.DATABASE_URL) {
      const index = this.memoryBanners.findIndex((banner) => banner.id === id);
      if (index < 0) throw new NotFoundException('Banner not found');
      this.memoryBanners[index] = { id, ...input, audience: input.audience ?? 'B2C' };
      return this.memoryBanners[index];
    }
    const record = await this.prisma.banner.update({
      where: { id },
      data: input,
    });
    return {
      id: record.id,
      title: record.title,
      ...(record.subtitle ? { subtitle: record.subtitle } : {}),
      ...(record.badge ? { badge: record.badge } : {}),
      ...(record.imageUrl ? { imageUrl: record.imageUrl } : {}),
      ...(record.productId ? { productId: record.productId } : {}),
      ...(record.ctaLabel ? { ctaLabel: record.ctaLabel } : {}),
      audience: record.audience,
      backgroundColor: record.backgroundColor,
      sortOrder: record.sortOrder,
      active: record.active,
    };
  }

  async removeBanner(id: string): Promise<{ id: string }> {
    if (!process.env.DATABASE_URL) {
      const index = this.memoryBanners.findIndex((banner) => banner.id === id);
      if (index < 0) throw new NotFoundException('Banner not found');
      this.memoryBanners.splice(index, 1);
      return { id };
    }
    await this.prisma.banner.delete({ where: { id } });
    return { id };
  }
}
