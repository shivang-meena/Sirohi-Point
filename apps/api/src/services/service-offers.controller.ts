import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { serviceOfferInputSchema } from '@sirohi/contracts';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ServiceOffersService } from './service-offers.service';

@Controller({ path: 'services/offers', version: '1' })
export class PublicServiceOffersController {
  constructor(private readonly offers: ServiceOffersService) {}
  @Get() async list() { return { data: await this.offers.list() }; }
}

@Controller({ path: 'admin/service-offers', version: '1' })
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminServiceOffersController {
  constructor(private readonly offers: ServiceOffersService) {}
  @Get() async list() { return { data: await this.offers.list(true) }; }
  @Post() async create(@Body() body: unknown) { return { data: await this.offers.save(this.parse(body)) }; }
  @Patch(':id') async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown) { return { data: await this.offers.save(this.parse(body), id) }; }
  private parse(body: unknown) {
    const parsed = serviceOfferInputSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return parsed.data;
  }
}
