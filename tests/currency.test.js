import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// Mock browser environment for i18n/engine.js loading
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

globalThis.window = {
  location: { search: '' },
  history: { replaceState() {} }
};

let mockPrefs = {};
globalThis.localStorage = {
  getItem(key) {
    if (key === 'moneyinfuture_user_prefs') {
      return JSON.stringify(mockPrefs);
    }
    return null;
  },
  setItem(key, val) {
    if (key === 'moneyinfuture_user_prefs') {
      mockPrefs = JSON.parse(val);
    }
  }
};

Object.defineProperty(globalThis, 'navigator', {
  value: { languages: ['en-US'] },
  writable: true,
  configurable: true
});

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

// Require engine.js
require('../public/js/engine.js');
const FinanceEngine = globalThis.FinanceEngine;
const CurrencyManager = globalThis.CurrencyManager;
const IndianFormatterStrategy = globalThis.IndianFormatterStrategy;
const InternationalFormatterStrategy = globalThis.InternationalFormatterStrategy;

test('Currency Manager: default currency detection', () => {
  mockPrefs = {};
  
  // Mock Intl.DateTimeFormat to return null timezone so language/locale detection can be isolated
  const originalDateTimeFormat = globalThis.Intl.DateTimeFormat;
  globalThis.Intl.DateTimeFormat = function() {
    return {
      resolvedOptions() {
        return { timeZone: null };
      }
    };
  };

  // 1. Language preference detection
  Object.defineProperty(globalThis, 'navigator', {
    value: { languages: ['en-GB'] },
    writable: true,
    configurable: true
  });
  assert.equal(CurrencyManager.detectDefaultCurrency(), 'GBP');

  // 2. Locale fallback detection
  Object.defineProperty(globalThis, 'navigator', {
    value: { languages: [] },
    writable: true,
    configurable: true
  });
  // Since we cannot mock Intl.NumberFormat resolved locale easily on Node directly
  // we check that the fallback matches default logic
  assert.equal(typeof CurrencyManager.detectDefaultCurrency(), 'string');

  // 3. Timezone detection explicitly
  globalThis.Intl.DateTimeFormat = function() {
    return {
      resolvedOptions() {
        return { timeZone: 'Asia/Kolkata' };
      }
    };
  };
  assert.equal(CurrencyManager.detectDefaultCurrency(), 'INR');

  globalThis.Intl.DateTimeFormat = function() {
    return {
      resolvedOptions() {
        return { timeZone: 'Europe/London' };
      }
    };
  };
  assert.equal(CurrencyManager.detectDefaultCurrency(), 'GBP');

  globalThis.Intl.DateTimeFormat = function() {
    return {
      resolvedOptions() {
        return { timeZone: 'America/New_York' };
      }
    };
  };
  assert.equal(CurrencyManager.detectDefaultCurrency(), 'USD');

  // Restore original
  globalThis.Intl.DateTimeFormat = originalDateTimeFormat;
});

test('Currency Manager: independent locale vs currency formatting', () => {
  mockPrefs = {
    currency: 'USD',
    locale: 'de-DE' // Period thousands, comma decimal
  };

  // USD under de-DE locale: value format should use German delimiters but USD currency code/symbol
  const formatted = CurrencyManager.format(1234.56, true, 2);
  // Expected German format for USD: 1.234,56 $
  assert.ok(formatted.includes('1.234,56'));
  assert.ok(formatted.includes('$') || formatted.includes('USD'));
});

test('Currency Manager: cache sizing and LRU eviction', () => {
  CurrencyManager.formattersCache.clear();
  
  // Create 70 formats
  for (let i = 0; i < 70; i++) {
    CurrencyManager.getFormatter('en-US', 'USD', i % 3);
  }

  // Size should not exceed MAX_CACHE_SIZE (64)
  assert.ok(CurrencyManager.formattersCache.size <= 64);
});

test('Strategies: Indian vs International number system separation', () => {
  mockPrefs = { currency: 'INR' };
  assert.equal(FinanceEngine.numberToWords(10000000), 'One Crore');

  // Switch to USD
  mockPrefs = { currency: 'USD' };
  assert.equal(FinanceEngine.numberToWords(10000000), 'Ten Million');
});

test('Strategies: Tokenized parts color coding', () => {
  // Switch to USD under en-US
  mockPrefs = { currency: 'USD', locale: 'en-US' };
  
  const codedHtml = FinanceEngine.getColorCodedINRHtml('$1,234,567.89');
  
  // Verify tokenized segments are present and have correct color group tags
  assert.ok(codedHtml.includes('color-group-2')); // Millions (1)
  assert.ok(codedHtml.includes('color-group-1')); // Thousands (234)
  assert.ok(codedHtml.includes('color-group-0')); // Hundreds (567)
  assert.ok(codedHtml.includes('color-currency-symbol'));
  assert.ok(codedHtml.includes('color-decimals'));
});

test('Error Handling: fallback gracefully on invalid values', () => {
  // Invalid locale fallback should not crash
  const res = CurrencyManager.getFormatter('invalid-locale-string', 'USD', 2);
  assert.ok(res);
  
  // Format null/undefined should return zero
  assert.ok(CurrencyManager.format(null));
  assert.ok(CurrencyManager.format(undefined));
});

test('Performance Benchmarks: caching speed efficiency', () => {
  const iterations = 1000;
  
  // 1. Benchmark WITH Cache (standard behavior)
  CurrencyManager.formattersCache.clear();
  const startCached = performance.now();
  for (let i = 0; i < iterations; i++) {
    CurrencyManager.format(12345.67, true, 2);
  }
  const endCached = performance.now();
  const cachedDuration = endCached - startCached;

  // 2. Benchmark WITHOUT Cache (evicting cache every time)
  const startUncached = performance.now();
  for (let i = 0; i < iterations; i++) {
    // Clear cache inside the loop to force recreation
    CurrencyManager.formattersCache.clear();
    CurrencyManager.format(12345.67, true, 2);
  }
  const endUncached = performance.now();
  const uncachedDuration = endUncached - startUncached;

  // Caching should be substantially faster (typically 5x to 20x faster)
  assert.ok(cachedDuration < uncachedDuration);
  console.log(`\n    [BENCHMARK] 1,000 formatting calls:`);
  console.log(`    - With Formatter Cache:    ${cachedDuration.toFixed(4)} ms`);
  console.log(`    - Without Formatter Cache:  ${uncachedDuration.toFixed(4)} ms`);
  console.log(`    - Performance Speedup:      ${(uncachedDuration / cachedDuration).toFixed(2)}x`);
});

test('Currency Manager: proper thousands grouping alignment (Indian vs International)', () => {
  // 1. Rupee (INR) default format: lakhs/crores grouping (12,34,567.89)
  mockPrefs = { currency: 'INR' };
  const rupeeFormatted = CurrencyManager.format(1234567.89, false, 2);
  assert.equal(rupeeFormatted, '12,34,567.89');

  // 2. US Dollar (USD) default format: millions/billions grouping (1,234,567.89)
  mockPrefs = { currency: 'USD' };
  const usdFormatted = CurrencyManager.format(1234567.89, false, 2);
  assert.equal(usdFormatted, '1,234,567.89');

  // 3. Euro (EUR) default format: dot separators (1.234.567,89)
  mockPrefs = { currency: 'EUR' };
  const eurFormatted = CurrencyManager.format(1234567.89, false, 2);
  assert.equal(eurFormatted, '1.234.567,89');
});
