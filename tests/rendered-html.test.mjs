import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const clientRoot = new URL('../dist/client/', import.meta.url);

test('production export contains responsive metadata and Sirohi content', async () => {
  const html = await readFile(new URL('index.html', clientRoot), 'utf8');
  assert.match(html, /<title[^>]*>Sirohi Point \| Shop Products for Home and Business<\/title>/i);
  assert.match(html, /name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5"/i);
  assert.match(html, /name="color-scheme" content="light dark"/i);
  assert.match(html, /property="og:image" content="https:\/\/sirohi-point-marketplace\.talent35791\.chatgpt\.site\/og\.png"/i);
  assert.match(html, /Shop hardware, electrical, electronics, paint/i);
  assert.doesNotMatch(html, /Everything your next project needs/i);
  assert.doesNotMatch(html, /Shop products for home, repair and business/i);
});

test('production export includes customer and administration routes', async () => {
  await Promise.all(['catalog.html', 'services.html', 'cart.html', 'dashboard.html', 'login.html', 'signup.html', 'admin/index.html', 'admin/login.html', 'product/[id].html'].map((route) => access(new URL(route, clientRoot))));
});

test('hosting worker falls back to the Expo shell only for HTML navigation', async () => {
  const workerUrl = new URL('../dist/server/index.js', import.meta.url);
  workerUrl.searchParams.set('test', `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const html = await readFile(new URL('index.html', clientRoot), 'utf8');
  const env = { ASSETS: { fetch: async (request) => new URL(request.url).pathname === '/index.html' ? new Response(html, { status: 200, headers: { 'content-type': 'text/html' } }) : new Response('Not found', { status: 404 }) } };
  const navigation = await worker.fetch(new Request('https://sirohi.test/catalog', { headers: { accept: 'text/html' } }), env);
  assert.equal(navigation.status, 200);
  assert.match(await navigation.text(), /Sirohi Point \| Shop Products for Home and Business/);
  const missingAsset = await worker.fetch(new Request('https://sirohi.test/missing.png', { headers: { accept: 'image/png' } }), env);
  assert.equal(missingAsset.status, 404);
  const postRequest = await worker.fetch(new Request('https://sirohi.test/catalog', { method: 'POST' }), env);
  assert.equal(postRequest.status, 404);
});
