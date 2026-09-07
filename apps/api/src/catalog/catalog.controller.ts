import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { catalogQuerySchema } from '@sirohi/contracts';

import { CatalogService } from './catalog.service';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller({ path: 'catalog', version: '1' })
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async findAll(@Query() query: CatalogQueryDto) {
    return this.findAllB2c(query);
  }

  @Get('categories')
  async findCategories() {
    return { data: await this.catalogService.findCategories() };
  }

  @Get('b2c')
  async findAllB2c(@Query() query: CatalogQueryDto) {
    const parsed = catalogQuerySchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const products = await this.catalogService.findAllForSegment(parsed.data, 'B2C');
    return { data: products, meta: { count: products.length } };
  }

  @Get('b2c/:id')
  async findOneB2c(@Param('id') id: string) {
    return { data: await this.catalogService.findOneForSegment(id, 'B2C') };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('BUSINESS')
  @Get('b2b')
  async findAllB2b(@Query() query: CatalogQueryDto) {
    const parsed = catalogQuerySchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const products = await this.catalogService.findAllForSegment(parsed.data, 'B2B');
    return { data: products, meta: { count: products.length } };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles('BUSINESS')
  @Get('b2b/:id')
  async findOneB2b(@Param('id') id: string) {
    return { data: await this.catalogService.findOneForSegment(id, 'B2B') };
  }

}
