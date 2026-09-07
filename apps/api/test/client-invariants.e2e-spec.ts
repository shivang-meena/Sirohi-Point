import { cartQuantityError } from '../../client/src/lib/cart-rules';
import { getRoleHomePath } from '../../client/src/lib/role-navigation';
import type { Product } from '@sirohi/contracts';

describe('Shared client purchase and navigation rules', () => {
  const product = { name: 'Test', stock: 20, minimumB2BQuantity: 10, allowB2BBackorder: false } as Product;
  it('enforces B2B MOQ and whole quantities', () => {
    expect(cartQuantityError(product, 9, true)).toContain('10');
    expect(cartQuantityError(product, 10, true)).toBeNull();
    expect(cartQuantityError(product, 10.5, true)).not.toBeNull();
    expect(cartQuantityError(product, 0, true)).not.toBeNull();
  });
  it('permits customer single units but never customer backorders', () => {
    expect(cartQuantityError(product, 1, false)).toBeNull();
    expect(cartQuantityError({ ...product, allowB2BBackorder: true }, 21, false)).not.toBeNull();
  });
  it('allows bulk backorders only when admin enabled them', () => {
    expect(cartQuantityError(product, 21, true)).not.toBeNull();
    expect(cartQuantityError({ ...product, allowB2BBackorder: true }, 1000, true)).toBeNull();
  });
  it('routes each supported role to its own home', () => {
    expect(getRoleHomePath('CUSTOMER')).toBe('/customer');
    expect(getRoleHomePath('BUSINESS')).toBe('/business');
    expect(getRoleHomePath('CONTRACTOR')).toBe('/technician');
    expect(getRoleHomePath('ADMIN')).toBe('/admin');
  });
});
