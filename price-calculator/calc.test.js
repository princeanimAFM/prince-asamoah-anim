// Run with: node --test price-calculator/calc.test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate, roundUpToPrice } = require('./calc.js');

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.005, `${actual} != ${expected}`);

const base = {
  currency: 'GBP', designerPrice: 40, weightKg: 0.5, courierPerKg: 12,
  transferFeePct: 0, dutyPct: 12, hasOriginProof: false, courierIncludesTaxes: false,
  packaging: 0, ukDelivery: 4, paymentFeePct: 1.5, paymentFeeFixed: 0.2,
  deliveryCharge: 0, targetMarginPct: 30, vatRegistered: false, sellingPrice: 95
};

test('adds duty and import VAT on item plus freight when not VAT registered', () => {
  const r = calculate(base);
  near(r.freight, 6);
  near(r.customsValue, 46);
  near(r.duty, 5.52);
  near(r.importVat, 10.304);
  near(r.costs, 40 + 6 + 5.52 + 10.304 + 4);
  near(r.paymentFee, 1.625);
  near(r.profit, 95 - 1.625 - r.costs);
  assert.equal(r.outputVat, 0);
});

test('origin proof removes duty', () => {
  const r = calculate({ ...base, hasOriginProof: true });
  near(r.duty, 0);
  near(r.importVat, 9.2);
});

test('courier price that already includes taxes adds no duty or VAT', () => {
  const r = calculate({ ...base, courierIncludesTaxes: true });
  near(r.duty, 0);
  near(r.importVat, 0);
  assert.ok(!r.notes.includes('lowValueShipments'));
});

test('VAT registered: import VAT reclaimed, 20% of takings goes to HMRC', () => {
  const r = calculate({ ...base, vatRegistered: true });
  near(r.importVatCost, 0);
  near(r.importVatReclaimed, 10.304);
  near(r.outputVat, 95 / 6);
  near(r.profit, 95 - 95 / 6 - 1.625 - (40 + 6 + 5.52 + 4));
});

test('converts cedis using the exchange rate', () => {
  const r = calculate({ ...base, currency: 'GHS', designerPrice: 600, ghsPerGbp: 15 });
  near(r.itemCost, 40);
  const missing = calculate({ ...base, currency: 'GHS', designerPrice: 600, ghsPerGbp: 0 });
  near(missing.itemCost, 0);
  assert.ok(missing.notes.includes('needsRate'));
});

test('suggested price meets the target margin', () => {
  for (const vatRegistered of [false, true]) {
    const r = calculate({ ...base, vatRegistered, sellingPrice: 0, deliveryCharge: 3.5 });
    assert.ok(r.usingSuggestedPrice);
    assert.equal(Math.round(r.suggestedPrice * 100) % 100, 99);
    assert.ok(r.marginPct >= 30, `margin ${r.marginPct}`);
    const cheaper = calculate({ ...base, vatRegistered, sellingPrice: r.suggestedPrice - 1, deliveryCharge: 3.5 });
    assert.ok(cheaper.marginPct < 30 + 2);
  }
});

test('impossible margin gives no suggestion', () => {
  const r = calculate({ ...base, sellingPrice: 0, targetMarginPct: 99 });
  assert.equal(r.suggestedPrice, null);
  assert.ok(r.notes.includes('marginTooHigh'));
});

test('ignores negative and junk numbers', () => {
  const r = calculate({ ...base, designerPrice: -50, weightKg: 'abc' });
  near(r.itemCost, 0);
  near(r.freight, 0);
});

test('rounds prices up to .99', () => {
  assert.equal(roundUpToPrice(87.32), 87.99);
  assert.equal(roundUpToPrice(87.99), 87.99);
  assert.equal(roundUpToPrice(88), 88.99);
  assert.equal(roundUpToPrice(0), 0.99);
});
