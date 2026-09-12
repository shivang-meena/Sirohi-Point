// Local-only browser QA fixtures. No existing user, product or schema is modified.
const { randomUUID, randomBytes, scryptSync } = require('node:crypto');
const { execFileSync, spawn } = require('node:child_process');
const { resolve } = require('node:path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const original = new URL(process.env.DATABASE_URL);
if (!['localhost', '127.0.0.1', '[::1]'].includes(original.hostname)) throw new Error('Browser fixtures are local-only');
const mode = process.argv[2];
const schema = mode === 'create' ? 'workflow_ui_' + randomUUID().replace(/-/g, '') : process.argv[3];
if (!/^workflow_ui_[a-f0-9]{32}$/.test(schema ?? '')) throw new Error('Invalid test schema');
const url = new URL(original); url.searchParams.set('schema', schema);
async function main() {
  const owner = new PrismaClient({ datasourceUrl: original.toString() });
  if (mode === 'cleanup') {
    // The caller supplies the exact schema returned by create. The prefix and UUID are validated above.
    await owner.$executeRawUnsafe('DROP SCHEMA IF EXISTS "' + schema + '" CASCADE');
    await owner.$disconnect(); console.log('Removed isolated browser fixture schema ' + schema); return;
  }
  if (mode === 'serve') {
    const found = await owner.$queryRaw`SELECT schema_name FROM information_schema.schemata WHERE schema_name = ${schema}`;
    await owner.$disconnect(); if (!found.length) throw new Error('Test schema does not exist');
    const child = spawn(process.execPath, [require.resolve('@nestjs/cli/bin/nest.js'), 'start'], { cwd: resolve(__dirname, '../apps/api'), env: { ...process.env, DATABASE_URL: url.toString(), PORT: '5001', CORS_ORIGINS: 'http://localhost:8082' }, stdio: 'inherit' });
    child.on('exit', (code) => { process.exitCode = code ?? 0; }); return;
  }
  if (mode !== 'create') throw new Error('Use create, serve <schema>, or cleanup <schema>');
  await owner.$executeRawUnsafe('CREATE SCHEMA "' + schema + '"'); await owner.$disconnect();
  execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy', '--schema', resolve(__dirname, '../apps/api/prisma/schema.prisma')], { env: { ...process.env, DATABASE_URL: url.toString() }, stdio: 'pipe' });
  const db = new PrismaClient({ datasourceUrl: url.toString() });
  const password = 'BrowserWorkflow#2026';
  const salt = randomBytes(16); const hash = 'scrypt$' + salt.toString('base64url') + '$' + scryptSync(password, salt, 64).toString('base64url');
  for (const role of ['ADMIN', 'CUSTOMER', 'BUSINESS', 'CONTRACTOR']) {
    await db.user.create({ data: { name: 'QA ' + role, email: role.toLowerCase() + '@browser.test', passwordHash: hash, role,
      ...(role === 'BUSINESS' ? { businessProfile: { create: { businessName: 'QA Wholesale', billingAddress: '42 QA Street, Hapur', approvalStatus: 'APPROVED', verified: true } } } : {}),
      ...(role === 'CONTRACTOR' ? { contractorProfile: { create: { skills: ['Electrical'], serviceArea: 'Hapur', latitude: 28.73, longitude: 77.78, bio: 'QA profile from the database', approvalStatus: 'APPROVED', availability: 'AVAILABLE', verified: true, services: { create: { serviceType: 'Electrician Booking', visitChargeInPaise: 50000 } } } } } : {})
    } });
  }
  const product = await db.product.create({ data: { id: 'qa-switch', name: 'QA Electrical Switch', slug: 'qa-switch', brand: 'QA Brand', category: 'Electrical', description: 'Browser workflow test product', priceInPaise: 10000, b2cPriceInPaise: 10000, b2bPriceInPaise: 8000, minimumB2BQuantity: 10, serviceAvailable: true, inventory: { create: { available: 100, onHand: 100 } } } });
  await db.banner.create({ data: { title: 'QA Wholesale Offer', audience: 'B2B', productId: product.id, subtitle: 'Wholesale price and minimum quantity', ctaLabel: 'Shop bulk' } });
  await db.serviceOffer.create({ data: { title: 'QA Service Discount', discountInPaise: 10000 } });
  await db.$disconnect();
  console.log(JSON.stringify({ schema, password, accounts: ['admin@browser.test', 'customer@browser.test', 'business@browser.test', 'contractor@browser.test'] }));
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
