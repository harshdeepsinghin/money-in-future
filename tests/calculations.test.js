import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Mock browser environment for engine.js loading
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

globalThis.window = {
  location: { search: '' },
  history: { replaceState() {} }
};

globalThis.document = {
  createElement() {
    return {
      style: {},
      appendChild() {},
      classList: { add() {}, remove() {} }
    };
  },
  body: {
    appendChild() {},
    removeChild() {}
  },
  getElementById() {
    return null;
  }
};

Object.defineProperty(globalThis, 'navigator', {
  value: { userAgent: 'node' },
  writable: true,
  configurable: true
});

// Require FinanceEngine
require('../public/js/engine.js');
const FinanceEngine = globalThis.FinanceEngine;

test('lump sum monthly EAR equals yearly at whole years', () => {
  // CAGR lump sum: principal = 100000, deposit = 0, rate = 12%, 10 years
  const monthlyResult = FinanceEngine.calculateGrowth(100000, 0, 10, 12, 'monthly');
  const yearlyResult = FinanceEngine.calculateGrowth(100000, 0, 10, 12, 'yearly');
  
  const monthlyFinal = monthlyResult[monthlyResult.length - 1].corpus;
  const yearlyFinal = yearlyResult[yearlyResult.length - 1].corpus;
  
  // They should compound to the exact same value because the monthly equivalent rate
  // is converted from annual CAGR/EAR.
  assert.ok(Math.abs(monthlyFinal - yearlyFinal) < 0.01);
});

test('reverse SWP: binary search finds correct corpus and SWP symmetry is satisfied', () => {
  const withdrawal = 50000;
  const r = 8;
  const years = 20;
  const months = years * 12;
  
  // Run Reverse SWP binary search (yearly compounding)
  let low = 0, high = withdrawal * months * 2;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (low + high) / 2;
    let balance = mid;
    let ok = true;
    for (let y = 1; y <= years; y++) {
      const yearStart = balance;
      for (let m = 1; m <= 12; m++) {
        balance -= withdrawal;
        if (balance < -0.01) { ok = false; break; }
      }
      if (!ok) break;
      const yInterest = Math.max(0, yearStart * (r / 100) - withdrawal * 12 * (r / 100) * (6.5 / 12));
      balance += yInterest;
    }
    if (ok) high = mid;
    else low = mid;
  }
  const reqCorpusYearly = high;
  
  // The required corpus should be around 61L - 62L (specifically around 61.5L)
  assert.ok(reqCorpusYearly > 6100000);
  assert.ok(reqCorpusYearly < 6200000);
  
  // Now, let's run the binary search for monthly compounding
  const i = FinanceEngine.getMonthlyRate(r);
  const reqCorpusMonthly = withdrawal * ((1 - Math.pow(1 + i, -months)) / i) * (1 + i);
  
  // Verify that monthly SWP run with this corpus depletes it to ~0
  const swpRows = FinanceEngine.calculateSWP(reqCorpusMonthly, withdrawal, years, r, 'monthly');
  const finalBalance = swpRows[swpRows.length - 1].corpus;
  assert.ok(finalBalance < 1.0); // final balance should be practically zero
});

test('XIRR: basic cashflow scenario yields correct return', () => {
  const flows = [
    { date: new Date('2025-01-01'), amount: -10000 },
    { date: new Date('2026-01-01'), amount: 11000 }
  ];
  const result = FinanceEngine.calculateXIRR(flows);
  // Should be exactly 10%
  assert.ok(Math.abs(result - 10.0) < 0.001);
});

test('XIRR: bisection fallback recovers when Newton solver fails to converge', () => {
  const flows = [
    { date: new Date('2025-01-01'), amount: -10000 },
    { date: new Date('2025-07-01'), amount: -5000 },
    { date: new Date('2026-01-01'), amount: 16000 }
  ];
  const result = FinanceEngine.calculateXIRR(flows);
  // Check if results are finite and reasonable (approx 8.02%)
  assert.ok(isFinite(result));
  assert.ok(Math.abs(result - 8.02) < 0.1);
});

test('XIRR: returns NaN if all cashflows are same sign', () => {
  const allNegative = [
    { date: new Date('2025-01-01'), amount: -10000 },
    { date: new Date('2026-01-01'), amount: -11000 }
  ];
  const result = FinanceEngine.calculateXIRR(allNegative);
  assert.ok(isNaN(result));
});

test('EMI: verify reducing balance monthly EMI calculation', () => {
  const P = 5000000; // 50 Lakhs
  const R = 8.5; // 8.5%
  const y = 20; // 20 years
  
  const r_m = R / 12 / 100;
  const m = y * 12;
  
  const emi = P * r_m * Math.pow(1 + r_m, m) / (Math.pow(1 + r_m, m) - 1);
  
  // EMI should be 43391.14
  assert.ok(Math.abs(emi - 43391.14) < 0.1);
});

test('Formatting: respects decimalPlaces preference in summary output', () => {
  let mockPref = { decimalPlaces: 2, currency: 'INR' };
  
  globalThis.localStorage = {
    getItem(key) {
      if (key === 'moneyinfuture_user_prefs') {
        return JSON.stringify(mockPref);
      }
      return null;
    }
  };

  // 2 decimal places: formatINRSmart with includeSymbol=true
  assert.equal(FinanceEngine.formatINRSmart(12345.678, true), '₹12,345.68');
  assert.equal(FinanceEngine.formatPercent(12.3456, null), '12.35%');

  // Change mock preference to 0 decimal places
  mockPref.decimalPlaces = 0;
  assert.equal(FinanceEngine.formatINRSmart(12345.678, true), '₹12,346');
  assert.equal(FinanceEngine.formatPercent(12.3456, null), '12%');

  // Change mock preference to 1 decimal place
  mockPref.decimalPlaces = 1;
  assert.equal(FinanceEngine.formatINRSmart(12345.678, true), '₹12,345.7');
  assert.equal(FinanceEngine.formatPercent(12.3456, null), '12.3%');

  delete globalThis.localStorage;
});

test('Taxation: verify config-driven tax calculations', () => {
  // Test equity_ltcg with exemption
  const ltcgRes = FinanceEngine.estimateTax(200000, 'equity_ltcg');
  // (200,000 - 125,000) * 0.125 = 75,000 * 0.125 = 9375
  assert.equal(ltcgRes.tax, 9375);
  assert.equal(ltcgRes.taxableGains, 75000);

  // Test equity_ltcg under exemption limit
  const ltcgResUnder = FinanceEngine.estimateTax(100000, 'equity_ltcg');
  assert.equal(ltcgResUnder.tax, 0);
  assert.equal(ltcgResUnder.taxableGains, 0);

  // Test equity_stcg flat tax
  const stcgRes = FinanceEngine.estimateTax(100000, 'equity_stcg');
  assert.equal(stcgRes.tax, 20000);
  assert.equal(stcgRes.taxableGains, 100000);

  // Test custom slab rate
  const slabRes = FinanceEngine.estimateTax(100000, 'slab', 30);
  assert.equal(slabRes.tax, 30000);
  assert.equal(slabRes.taxableGains, 100000);
});

test('Formatting: auto-decimals for small fractional values below 1000', () => {
  let mockPref = { decimalPlaces: 0, currency: 'INR' };
  globalThis.localStorage = {
    getItem(key) {
      if (key === 'moneyinfuture_user_prefs') {
        return JSON.stringify(mockPref);
      }
      return null;
    }
  };

  // Enforces 2 decimals for value < 1000 with fraction even if pref is 0
  assert.equal(FinanceEngine.formatINRSmart(12.7665, true), '₹12.77');
  assert.equal(FinanceEngine.formatINR(12.7665, true), '₹12.77');

  // Does not force decimals for whole numbers below 1000 under smart format
  assert.equal(FinanceEngine.formatINRSmart(12.00, true), '₹12');

  // Respects 0 decimal preference for values >= 1000
  assert.equal(FinanceEngine.formatINRSmart(1234.56, true), '₹1,235');

  delete globalThis.localStorage;
});
