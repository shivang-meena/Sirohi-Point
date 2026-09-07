import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { CustomerAddress, CustomerAddressInput } from '@sirohi/contracts';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AddressesService {
  private readonly memory = new Map<string, CustomerAddress[]>();
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<CustomerAddress[]> {
    if (!process.env.DATABASE_URL) return this.memory.get(userId) ?? [];
    const addresses = await this.prisma.customerAddress.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }] });
    return addresses.map((address) => this.toPublic(address));
  }

  async save(userId: string, input: CustomerAddressInput): Promise<CustomerAddress> {
    if (!process.env.DATABASE_URL) {
      const current = this.memory.get(userId) ?? [];
      const address: CustomerAddress = { id: randomUUID(), ...input, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const next = input.isDefault ? current.map((item) => ({ ...item, isDefault: false })) : current;
      this.memory.set(userId, [address, ...next]);
      return address;
    }
    const address = await this.prisma.$transaction(async (tx) => {
      if (input.isDefault) await tx.customerAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      return tx.customerAddress.create({ data: { userId, ...input } });
    });
    return this.toPublic(address);
  }

  async makeDefault(userId: string, id: string): Promise<CustomerAddress> {
    if (!process.env.DATABASE_URL) {
      const current = this.memory.get(userId) ?? [];
      const selected = current.find((item) => item.id === id);
      if (!selected) throw new NotFoundException('Address not found');
      const next = current.map((item) => ({ ...item, isDefault: item.id === id }));
      this.memory.set(userId, next);
      return next.find((item) => item.id === id)!;
    }
    const address = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.customerAddress.findFirst({ where: { id, userId } });
      if (!existing) throw new NotFoundException('Address not found');
      await tx.customerAddress.updateMany({ where: { userId }, data: { isDefault: false } });
      return tx.customerAddress.update({ where: { id }, data: { isDefault: true } });
    });
    return this.toPublic(address);
  }

  private toPublic(address: { id: string; label: string; line1: string; city: string; state: string | null; postalCode: string | null; latitude: number | null; longitude: number | null; isDefault: boolean; createdAt: Date; updatedAt: Date }): CustomerAddress {
    return { id: address.id, label: address.label, line1: address.line1, city: address.city, ...(address.state ? { state: address.state } : {}), ...(address.postalCode ? { postalCode: address.postalCode } : {}), ...(address.latitude !== null ? { latitude: address.latitude } : {}), ...(address.longitude !== null ? { longitude: address.longitude } : {}), isDefault: address.isDefault, createdAt: address.createdAt.toISOString(), updatedAt: address.updatedAt.toISOString() };
  }
}
