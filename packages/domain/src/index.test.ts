import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateCartTotal, calculatePaintEstimate } from './index';

test('paint estimate applies coats and wastage', () => {
  const result = calculatePaintEstimate({ widthFeet: 18, heightFeet: 10, coats: 2 });
  assert.equal(result.areaSquareFeet, 180);
  assert.equal(result.litres, 5);
  assert.equal(result.estimatedCostInPaise, 260000);
});

test('cart total uses integer paise', () => {
  const total = calculateCartTotal([
    {
      product: {
        id: 'p1',
        name: 'Switch',
        slug: 'switch',
        category: 'Electrical',
        brand: 'Anchor',
        description: 'Modular switch',
        priceInPaise: 54900,
        rating: 4.7,
        reviewCount: 10,
        stock: 25,
        tone: 'teal',
        serviceAvailable: true,
      },
      quantity: 2,
    },
  ]);
  assert.equal(total, 109800);
});
