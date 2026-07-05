/**
 * Financial Calculators Engine - core mathematical calculations,
 * SVG charting, CSV/JSON exports, and formatting.
 */

// Register a global ResizeObserver for responsive SVG charts
const chartResizeObserver = new ResizeObserver(entries => {
  requestAnimationFrame(() => {
    for (let entry of entries) {
      const container = entry.target;
      const { width, height } = entry.contentRect;
      if (container.lastWidth === width && container.lastHeight === height) {
        continue;
      }
      container.lastWidth = width;
      container.lastHeight = height;
      
      if (container.chartData) {
        const { type, data, valueKeys, colors, lineLabels, slices } = container.chartData;
        chartResizeObserver.unobserve(container);
        if (type === 'line') {
          FinanceEngine.renderLineChart(container.id, data, valueKeys, colors, lineLabels, false);
        } else if (type === 'donut') {
          FinanceEngine.renderDonutChart(container.id, slices, false);
        }
        chartResizeObserver.observe(container);
      }
    }
  });
});

const CurrencyRegistry = {
  INR: { code: 'INR', symbol: '₹', defaultLocale: 'en-IN', system: 'indian', defaultInflation: 6 },
  USD: { code: 'USD', symbol: '$', defaultLocale: 'en-US', system: 'international', defaultInflation: 3 },
  GBP: { code: 'GBP', symbol: '£', defaultLocale: 'en-GB', system: 'international', defaultInflation: 3 },
  EUR: { code: 'EUR', symbol: '€', defaultLocale: 'de-DE', system: 'international', defaultInflation: 2 },
  AUD: { code: 'AUD', symbol: 'A$', defaultLocale: 'en-AU', system: 'international', defaultInflation: 3 },
  CAD: { code: 'CAD', symbol: 'C$', defaultLocale: 'en-CA', system: 'international', defaultInflation: 3 }
};

const CurrencyManager = {
  formattersCache: new Map(),
  MAX_CACHE_SIZE: 64,

  getPreferences() {
    try {
      const stored = localStorage.getItem('moneyinfuture_user_prefs');
      const prefs = stored ? JSON.parse(stored) : {};
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        const urlCurrency = params.get('currency') || params.get('curr');
        if (urlCurrency && ['INR', 'USD', 'GBP', 'EUR', 'AUD', 'CAD'].includes(urlCurrency.toUpperCase())) {
          prefs.currency = urlCurrency.toUpperCase();
        }
      }
      return prefs;
    } catch (e) {
      return {};
    }
  },

  setPreference(key, value) {
    try {
      const prefs = this.getPreferences();
      prefs[key] = value;
      localStorage.setItem('moneyinfuture_user_prefs', JSON.stringify(prefs));
      if (key === 'currency' && typeof window !== 'undefined' && window.location) {
        const params = new URLSearchParams(window.location.search);
        params.set('currency', value);
        if (params.has('curr')) {
          params.delete('curr');
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    } catch (e) {}
  },

  _hasRegion(tag) {
    return tag && (tag.includes('-') || tag.includes('_'));
  },

  _detectFromLanguages() {
    if (typeof navigator === 'undefined' || !navigator.languages || navigator.languages.length === 0) return null;
    for (const lang of navigator.languages) {
      if (!this._hasRegion(lang)) continue;
      const lower = lang.toLowerCase();
      if (lower.endsWith('-in') || lower === 'en-in') return 'INR';
      if (lower.endsWith('-us') || lower === 'en-us') return 'USD';
      if (lower.endsWith('-gb') || lower === 'en-gb') return 'GBP';
      if (lower.endsWith('-au') || lower === 'en-au') return 'AUD';
      if (lower.endsWith('-ca') || lower === 'en-ca') return 'CAD';
    }
    return null;
  },

  _detectFromLocale() {
    if (typeof Intl === 'undefined' || !Intl.NumberFormat) return null;
    const locale = Intl.NumberFormat().resolvedOptions().locale;
    if (!locale || !this._hasRegion(locale)) return null;
    const lower = locale.toLowerCase();
    if (lower.endsWith('-in') || lower === 'en-in') return 'INR';
    if (lower.endsWith('-us') || lower === 'en-us') return 'USD';
    if (lower.endsWith('-gb') || lower === 'en-gb') return 'GBP';
    if (lower.endsWith('-au') || lower === 'en-au') return 'AUD';
    if (lower.endsWith('-ca') || lower === 'en-ca') return 'CAD';
    return null;
  },

  _detectFromTimezone() {
    if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) return null;
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz) return null;
      if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) return 'INR';
      if (tz === 'Europe/London') return 'GBP';
      if (tz.startsWith('Australia/')) return 'AUD';
      if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver')) return 'CAD';
      if (tz.startsWith('America/New_York') || tz.startsWith('America/Los_Angeles') || tz.startsWith('America/Chicago') || tz.startsWith('America/Denver')) return 'USD';
      if (tz.startsWith('Europe/')) {
        const nonEuroTZs = ['Europe/Oslo', 'Europe/Copenhagen', 'Europe/Stock_holm', 'Europe/Stockholm', 'Europe/Warsaw', 'Europe/Prague', 'Europe/Budapest', 'Europe/Zurich'];
        if (!nonEuroTZs.some(prefix => tz.startsWith(prefix))) {
          return 'EUR';
        }
      }
    } catch (e) {}
    return null;
  },

  detectDefaultCurrency() {
    const prefs = this.getPreferences();
    if (prefs.currency) return prefs.currency;

    let detected = this._detectFromTimezone() ||
                   this._detectFromLanguages() ||
                   this._detectFromLocale();

    return detected || 'INR';
  },

  getActiveCurrency() {
    const code = this.getPreferences().currency || this.detectDefaultCurrency();
    return CurrencyRegistry[code] || CurrencyRegistry.INR;
  },

  getActiveLocale() {
    const prefs = this.getPreferences();
    if (prefs.locale) return prefs.locale;
    const currency = this.getActiveCurrency();
    return currency.defaultLocale || 'en-IN';
  },

  getFormatter(locale, currencyCode, decimals, style = 'currency') {
    const cacheKey = `${locale}_${currencyCode}_${decimals}_${style}`;
    
    if (this.formattersCache.has(cacheKey)) {
      const formatter = this.formattersCache.get(cacheKey);
      this.formattersCache.delete(cacheKey);
      this.formattersCache.set(cacheKey, formatter);
      return formatter;
    }

    if (this.formattersCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.formattersCache.keys().next().value;
      this.formattersCache.delete(oldestKey);
    }

    const options = {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    };
    if (style === 'currency') {
      options.style = 'currency';
      options.currency = currencyCode;
    }

    let formatter;
    try {
      formatter = new Intl.NumberFormat(locale, options);
    } catch (e) {
      try {
        formatter = new Intl.NumberFormat('en-US', options);
      } catch (err) {
        formatter = {
          format(val) {
            return (style === 'currency' ? (CurrencyRegistry[currencyCode]?.symbol || '$') : '') + val.toFixed(decimals);
          },
          formatToParts(val) {
            return [
              { type: 'currency', value: CurrencyRegistry[currencyCode]?.symbol || '$' },
              { type: 'integer', value: Math.floor(val).toString() },
              { type: 'decimal', value: '.' },
              { type: 'fraction', value: (val % 1).toFixed(decimals).substring(2) }
            ];
          }
        };
      }
    }

    this.formattersCache.set(cacheKey, formatter);
    return formatter;
  },

  format(value, includeSymbol = true, decimals = null) {
    if (value === null || value === undefined || isNaN(value)) {
      value = 0;
    }
    const currency = this.getActiveCurrency();
    const locale = this.getActiveLocale();

    let dec = 0;
    if (decimals !== null) {
      dec = decimals;
    } else {
      dec = FinanceEngine.getDecimalPlacesPref();
      if (Math.abs(value) < 1000 && value % 1 !== 0) {
        dec = 2;
      }
    }

    if (includeSymbol) {
      return this.getFormatter(locale, currency.code, dec, 'currency').format(value);
    } else {
      return this.getFormatter(locale, currency.code, dec, 'decimal').format(value);
    }
  }
};

const IndianFormatterStrategy = {
  toWords(num) {
    return FinanceEngine.numberToIndianWords(num);
  },
  
  getColorCodedHtml(value, decimals) {
    return renderTokenizedHtml(value, decimals, 'indian');
  }
};

const InternationalFormatterStrategy = {
  toWords(num) {
    return FinanceEngine.numberToInternationalWords(num);
  },

  getColorCodedHtml(value, decimals) {
    return renderTokenizedHtml(value, decimals, 'international');
  }
};

function renderTokenizedHtml(value, decimals, system) {
  const currency = CurrencyManager.getActiveCurrency();
  const locale = CurrencyManager.getActiveLocale();
  const formatter = CurrencyManager.getFormatter(locale, currency.code, decimals, 'currency');
  
  let parts;
  try {
    parts = formatter.formatToParts(value);
  } catch (e) {
    const formatted = formatter.format(value);
    return `<span class="color-currency-symbol">${currency.symbol}</span>${formatted.replace(currency.symbol, '')}`;
  }

  const integerParts = parts.filter(p => p.type === 'integer');
  const totalIntegerGroups = integerParts.length;

  let integerCount = 0;

  return parts.map(p => {
    if (p.type === 'integer') {
      const groupIndexFromRight = totalIntegerGroups - 1 - integerCount;
      integerCount++;

      let className = 'color-group-4';
      if (groupIndexFromRight === 0) className = 'color-group-0';
      else if (groupIndexFromRight === 1) className = 'color-group-1';
      else if (groupIndexFromRight === 2) className = 'color-group-2';
      else if (groupIndexFromRight === 3) className = 'color-group-3';

      return `<span class="${className}">${p.value}</span>`;
    }
    if (p.type === 'currency') {
      return `<span class="color-currency-symbol">${p.value}</span>`;
    }
    if (p.type === 'fraction') {
      return `<span class="color-decimals">${p.value}</span>`;
    }
    return p.value;
  }).join('');
}

function getActiveStrategy() {
  const currency = CurrencyManager.getActiveCurrency();
  return currency.system === 'indian' ? IndianFormatterStrategy : InternationalFormatterStrategy;
}

const FinanceEngine = {
  // Tax configurations (FY 2024-25 Budget updates, reviewed June 2026)
  TaxConfig: {
    equity_ltcg: {
      rate: 0.125,
      exemption: 125000,
      description: 'Equity LTCG (12.5% tax on gains exceeding ₹1.25L)'
    },
    equity_stcg: {
      rate: 0.20,
      exemption: 0,
      description: 'Equity STCG (20% flat)'
    },
    lastReviewed: 'June 2026'
  },

  // 1. Math Helpers
  
  /**
   * Convert annual return to monthly return rate using CAGR method
   */
  getMonthlyRate(annualRatePercentage) {
    return Math.pow(1 + annualRatePercentage / 100, 1 / 12) - 1;
  },

  /**
   * Adjust value for inflation: nominalValue / (1 + inflation)^years
   */
  getRealValue(nominalValue, inflationPercentage, years) {
    const inf = inflationPercentage / 100;
    return nominalValue / Math.pow(1 + inf, years);
  },

  /**
   * Estimate Indian taxation using the config-driven system.
   */
  estimateTax(gains, type, customRate = 30) {
    if (gains <= 0) return { tax: 0, taxableGains: 0 };
    
    const config = this.TaxConfig[type];
    if (config) {
      const taxableGains = Math.max(0, gains - config.exemption);
      const tax = taxableGains * config.rate;
      return { tax, taxableGains };
    } else if (type === 'slab' || type === 'custom') {
      const rate = parseFloat(customRate) || 0;
      const tax = gains * (rate / 100);
      return { tax, taxableGains: gains };
    }
    
    return { tax: 0, taxableGains: 0 };
  },

  /**
   * Core compounding engine supporting monthly/yearly frequency.
   * Math verified for Indian standards.
   */
  calculateGrowth(principal, monthlyDeposit, years, annualRate, compoundingFreq = 'monthly', annualStepUp = 0) {
    const rate = annualRate / 100;
    let balance = principal;
    let cumulativeInvested = principal;
    const tableRows = [];

    for (let y = 1; y <= years; y++) {
      const currentSIP = monthlyDeposit * Math.pow(1 + annualStepUp / 100, y - 1);
      const yStartBalance = balance;
      let yInvested = 0;

      if (compoundingFreq === 'monthly') {
        // True CAGR monthly equivalent rate: (1 + annualRate)^(1/12) - 1
        const i = Math.pow(1 + rate, 1/12) - 1;
        for (let m = 1; m <= 12; m++) {
          balance = (balance + currentSIP) * (1 + i);
          yInvested += currentSIP;
        }
      } else {
        // Yearly compounding (EAR): interest credited once at year-end
        // Mid-year approximation for monthly SIPs deposited throughout the year
        const interestOnStart = balance * rate;
        const interestOnDeposits = currentSIP * 12 * rate * (6.5 / 12);
        balance = balance + (currentSIP * 12) + interestOnStart + interestOnDeposits;
        yInvested = currentSIP * 12;
      }

      cumulativeInvested += yInvested;
      const totalGains = balance - cumulativeInvested;

      tableRows.push({
        year: y,
        monthlySIP: currentSIP,
        invested: cumulativeInvested,
        gains: totalGains,
        corpus: balance
      });
    }

    return tableRows;
  },

  /**
   * SWP growth engine supporting monthly/yearly compounding.
   */
  calculateSWP(principal, monthlyWithdrawal, years, annualRate, compoundingFreq = 'monthly', annualStepUp = 0) {
    const rate = annualRate / 100;
    let balance = principal;
    let totalWithdrawn = 0;
    const tableRows = [];

    for (let y = 1; y <= years; y++) {
      const currentSWP = monthlyWithdrawal * Math.pow(1 + annualStepUp / 100, y - 1);
      let yWithdrawn = 0;

      if (compoundingFreq === 'monthly') {
        // Beginning-of-month (annuity-due): withdrawal before interest — consistent with all SWP pages
        const i = Math.pow(1 + rate, 1/12) - 1;
        for (let m = 1; m <= 12; m++) {
          const withdrawal = Math.min(balance, currentSWP);
          balance = balance - withdrawal;
          yWithdrawn += withdrawal;
          balance = balance * (1 + i);
        }
      } else {
        // Yearly compounding:
        const yearStartBalance = balance;
        for (let m = 1; m <= 12; m++) {
          const withdrawal = Math.min(balance, currentSWP);
          balance = balance - withdrawal;
          yWithdrawn += withdrawal;
        }
        // Interest calculated on start balance minus mid-year approximation for withdrawals
        const interest = Math.max(0, yearStartBalance * rate - currentSWP * 12 * rate * (6.5 / 12));
        balance = balance + interest;
      }

      totalWithdrawn += yWithdrawn;
      
      tableRows.push({
        year: y,
        monthlyWithdrawal: currentSWP,
        withdrawn: totalWithdrawn,
        corpus: balance
      });

      if (balance <= 0) {
        balance = 0;
        break;
      }
    }

    return tableRows;
  },

  // 2. Formatting Helpers

  /**
   * Helper to retrieve preferred decimal places setting from user preferences
   */
  getDecimalPlacesPref() {
    try {
      const stored = localStorage.getItem('moneyinfuture_user_prefs');
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs && prefs.decimalPlaces !== undefined) {
          return parseInt(prefs.decimalPlaces);
        }
      }
    } catch (e) {}
    return 0; // Default to 0 decimal places
  },
  
  /**
   * Format a number into preferred currency format
   */
  formatINR(value, includeSymbol = true, decimals = null) {
    return CurrencyManager.format(value, includeSymbol, decimals);
  },

  /**
   * Smart currency formatter
   */
  formatINRSmart(value, includeSymbol = true) {
    let decimals = null;
    if (!includeSymbol) {
      const rounded = Math.round(value * 100) / 100;
      decimals = (rounded % 1 !== 0) ? 2 : 0;
    }
    return CurrencyManager.format(value, includeSymbol, decimals);
  },

  /**
   * Format a percentage
   */
  formatPercent(value, decimals = null) {
    if (isNaN(value)) return '0%';
    const dec = decimals !== null ? decimals : this.getDecimalPlacesPref();
    return value.toFixed(dec) + '%';
  },

  /**
   * Convert number to words in the Indian Numbering System
   */
  numberToIndianWords(num) {
    if (num === null || num === undefined || isNaN(num)) return '';
    num = Math.round(num);
    if (num === 0) return 'Zero';
    if (num < 0) return 'Minus ' + this.numberToIndianWords(Math.abs(num));

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                   'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    function convertLessThanOneThousand(n) {
      let str = '';
      if (n >= 100) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += units[n] + ' ';
      }
      return str.trim();
    }

    let result = '';
    let crores = Math.floor(num / 10000000);
    let remainder = num % 10000000;
    let lakhs = Math.floor(remainder / 100000);
    remainder %= 100000;
    let thousands = Math.floor(remainder / 1000);
    remainder %= 1000;

    if (crores > 0) {
      result += (crores >= 100 ? this.numberToIndianWords(crores) : convertLessThanOneThousand(crores)) + ' Crore ';
    }
    if (lakhs > 0) {
      result += convertLessThanOneThousand(lakhs) + ' Lakh ';
    }
    if (thousands > 0) {
      result += convertLessThanOneThousand(thousands) + ' Thousand ';
    }
    if (remainder > 0) {
      result += convertLessThanOneThousand(remainder) + ' ';
    }

    return result.trim().replace(/\s+/g, ' ');
  },

  /**
   * Return HTML string with color-coded tags using native tokenized parts
   */
  getColorCodedINRHtml(text) {
    if (!text || (typeof text !== 'string')) return null;
    const numericVal = parseFloat(text.replace(/[^\d.-]/g, '')) || 0;
    const hasDecimals = text.includes('.');
    const decimals = hasDecimals ? text.split('.')[1].length : 0;
    return getActiveStrategy().getColorCodedHtml(numericVal, decimals);
  },

  /**
   * Convert number to words in the International Numbering System (Millions/Billions)
   */
  numberToInternationalWords(num) {
    if (num === null || num === undefined || isNaN(num)) return '';
    num = Math.round(num);
    if (num === 0) return 'Zero';
    if (num < 0) return 'Minus ' + this.numberToInternationalWords(Math.abs(num));

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

    function convertGroup(n) {
      let str = '';
      if (n >= 100) {
        str += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += ones[n] + ' ';
      }
      return str.trim();
    }

    let result = '';
    let scaleIdx = 0;

    while (num > 0) {
      let group = num % 1000;
      if (group > 0) {
        const groupStr = convertGroup(group);
        const scaleStr = scales[scaleIdx];
        result = groupStr + (scaleStr ? ' ' + scaleStr : '') + ' ' + result;
      }
      num = Math.floor(num / 1000);
      scaleIdx++;
    }

    return result.trim().replace(/\s+/g, ' ');
  },

  /**
   * Dynamic Words Router based on selected strategy
   */
  numberToWords(num) {
    return getActiveStrategy().toWords(num);
  },

  // 3. XIRR Newton-Raphson Solver
  
  /**
   * Calculate XIRR
   * cashFlows: Array of { date: Date, amount: number }
   * Note: Investments must be negative, returns/final valuation positive.
   */
  calculateXIRR(cashFlows) {
    if (cashFlows.length < 2) return NaN;

    // Sort by date
    const flows = [...cashFlows].sort((a, b) => a.date - b.date);
    const d0 = flows[0].date;

    // Time fractions (years since d0)
    const t = flows.map(f => (f.date - d0) / (365 * 24 * 60 * 60 * 1000));
    const values = flows.map(f => f.amount);

    // Validate: must have at least one positive and one negative cashflow
    const hasPositive = values.some(v => v > 0);
    const hasNegative = values.some(v => v < 0);
    if (!hasPositive || !hasNegative) return NaN;

    // Objective function: NPV = sum CF_i / (1 + r)^t_i
    const f = (r) => {
      let sum = 0;
      for (let i = 0; i < values.length; i++) {
        const denom = Math.pow(1 + r, t[i]);
        if (!isFinite(denom) || denom === 0) return NaN;
        sum += values[i] / denom;
      }
      return sum;
    };

    // First derivative: sum -t_i * CF_i / (1 + r)^(t_i + 1)
    const df = (r) => {
      let sum = 0;
      for (let i = 0; i < values.length; i++) {
        sum += -t[i] * values[i] / Math.pow(1 + r, t[i] + 1);
      }
      return sum;
    };

    // Newton-Raphson loop
    let r = 0.1; // initial guess: 10%
    const maxIterations = 100;
    const precision = 1e-7;
    let converged = false;

    for (let k = 0; k < maxIterations; k++) {
      const val = f(r);
      const deriv = df(r);
      
      if (Math.abs(deriv) < 1e-12) break; // prevent division by zero
      
      const nextR = r - val / deriv;

      // Sanity-check: if Newton diverges, break and fall back to bisection
      if (!isFinite(nextR) || nextR < -0.999 || nextR > 100) break;
      
      if (Math.abs(nextR - r) < precision) {
        r = nextR;
        converged = true;
        break;
      }
      r = nextR;
    }
    
    if (converged) return r * 100; // return as percentage

    // Bisection fallback: bracket between -99% and +1000%
    let lo = -0.999, hi = 10.0;
    const fLo = f(lo);
    const fHi = f(hi);

    // If f doesn't change sign in this bracket, try wider hi
    if (isFinite(fLo) && isFinite(fHi) && fLo * fHi > 0) {
      return r * 100; // return best Newton guess
    }

    let bLo = lo, bHi = hi;
    for (let k = 0; k < 200; k++) {
      const mid = (bLo + bHi) / 2;
      const fMid = f(mid);
      if (!isFinite(fMid)) break;
      if (Math.abs(bHi - bLo) < precision) {
        return mid * 100;
      }
      if (fMid * f(bLo) <= 0) {
        bHi = mid;
      } else {
        bLo = mid;
      }
    }
    return ((bLo + bHi) / 2) * 100;
  },

  // 4. State URL Synchronization
  
  /**
   * Parse parameters from URL
   */
  getUrlParams(defaults) {
    const params = new URLSearchParams(window.location.search);
    const result = { ...defaults };
    
    // Load from cache first
    let cachedPrefs = {};
    try {
      const stored = localStorage.getItem('moneyinfuture_shared_prefs');
      if (stored) {
        cachedPrefs = JSON.parse(stored);
      }
    } catch (e) {}

    const preferenceMapping = {
      'return_rate': 'pref_return_rate',
      'nominal_return': 'pref_return_rate',
      'pre_return': 'pref_return_rate',
      'post_return': 'pref_return_rate',
      'rate': 'pref_return_rate',
      'years': 'pref_years',
      'tenure': 'pref_years',
      'duration': 'pref_years',
      'years_to_college': 'pref_years',
      'years_to_goal': 'pref_years',
      'years_to_fi': 'pref_years',
      'inflation-rate': 'pref_inflation_rate',
      'inflation_rate': 'pref_inflation_rate',
      'compounding-freq': 'pref_compounding_freq',
      'compounding_freq': 'pref_compounding_freq',
      'tax-type': 'pref_tax_type',
      'tax_type': 'pref_tax_type',
      'custom-tax-rate': 'pref_tax_rate',
      'custom_tax_rate': 'pref_tax_rate',
      'tax_rate': 'pref_tax_rate'
    };

    for (const key in defaults) {
      const prefKey = preferenceMapping[key];
      if (prefKey && cachedPrefs[prefKey] !== undefined && cachedPrefs[prefKey] !== null) {
        const val = cachedPrefs[prefKey];
        if (typeof defaults[key] === 'number') {
          const parsed = parseFloat(val);
          result[key] = isNaN(parsed) ? defaults[key] : parsed;
        } else if (typeof defaults[key] === 'boolean') {
          result[key] = val === true || val === 'true';
        } else {
          result[key] = val;
        }
      }
      
      // URL parameters override cache (supporting flexible synonyms / alias names)
      const aliases = {
        'monthly_sip': ['monthly_sip', 'monthly', 'amount', 'amt', 'invest', 'investment', 'p'],
        'starting_sip': ['starting_sip', 'starting', 'start'],
        'monthly_withdrawal': ['monthly_withdrawal', 'withdrawal', 'swp', 'withdraw'],
        'principal': ['principal', 'investment', 'amount', 'amt', 'lump', 'lumpsum', 'p'],
        'target_corpus': ['target_corpus', 'target', 'goal', 'corpus'],
        'initial_corpus': ['initial_corpus', 'corpus', 'principal', 'amount'],
        'return_rate': ['return_rate', 'rate', 'interest', 'return', 'r', 'percent'],
        'years': ['years', 'duration', 'tenure', 'time', 'period', 'y']
      };

      let paramVal = null;
      if (aliases[key]) {
        for (const alias of aliases[key]) {
          if (params.has(alias)) {
            paramVal = params.get(alias);
            break;
          }
        }
      }
      if (paramVal === null && params.has(key)) {
        paramVal = params.get(key);
      }

      if (paramVal !== null) {
        if (typeof defaults[key] === 'number') {
          const parsed = parseFloat(paramVal);
          result[key] = isNaN(parsed) ? defaults[key] : parsed;
        } else if (typeof defaults[key] === 'boolean') {
          result[key] = paramVal === 'true';
        } else {
          result[key] = paramVal;
        }
      }

      // Enforce max bounds to prevent browser hanging on large input projections
      if (['years', 'duration', 'tenure', 'years_to_goal', 'years_to_fi', 'years_to_college', 'years_to_marriage'].includes(key)) {
        const maxVal = key === 'tenure' ? 35 : 100;
        if (result[key] > maxVal) {
          result[key] = maxVal;
        }
      }
    }
    const proxy = new Proxy(result, {
      set(target, prop, value) {
        let finalVal = value;
        if (typeof value === 'number' && isNaN(value)) {
          if (defaults && typeof defaults[prop] === 'string') {
            const el = document.getElementById(prop);
            finalVal = el ? el.value : defaults[prop];
          }
        }
        target[prop] = finalVal;
        return true;
      }
    });
    return proxy;
  },

  /**
   * Update URL parameters without reloading page
   */
  updateUrlParams(paramsObj) {
    const params = new URLSearchParams(window.location.search);
    
    // Read current cache
    let cachedPrefs = {};
    try {
      const stored = localStorage.getItem('moneyinfuture_shared_prefs');
      if (stored) {
        cachedPrefs = JSON.parse(stored);
      }
    } catch (e) {}

    const preferenceMapping = {
      'return_rate': 'pref_return_rate',
      'nominal_return': 'pref_return_rate',
      'pre_return': 'pref_return_rate',
      'post_return': 'pref_return_rate',
      'rate': 'pref_return_rate',
      'years': 'pref_years',
      'tenure': 'pref_years',
      'duration': 'pref_years',
      'years_to_college': 'pref_years',
      'years_to_goal': 'pref_years',
      'years_to_fi': 'pref_years',
      'inflation-rate': 'pref_inflation_rate',
      'inflation_rate': 'pref_inflation_rate',
      'compounding-freq': 'pref_compounding_freq',
      'compounding_freq': 'pref_compounding_freq',
      'tax-type': 'pref_tax_type',
      'tax_type': 'pref_tax_type',
      'custom-tax-rate': 'pref_tax_rate',
      'custom_tax_rate': 'pref_tax_rate',
      'tax_rate': 'pref_tax_rate'
    };

    let cacheChanged = false;

    for (const key in paramsObj) {
      if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
        params.set(key, paramsObj[key]);
        
        const prefKey = preferenceMapping[key];
        if (prefKey) {
          cachedPrefs[prefKey] = paramsObj[key];
          cacheChanged = true;
        }
      }
    }

    if (cacheChanged) {
      try {
        localStorage.setItem('moneyinfuture_shared_prefs', JSON.stringify(cachedPrefs));
      } catch (e) {}
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: newUrl }, '', newUrl);
  },

  // 5. SVG Line Chart Generator

  /**
   * Render a responsive SVG line chart with toggleable lines and interactive legend.
   * containerId: string
   * data: Array of objects with label + valueKey fields
   * valueKeys: Array of strings — keys to plot
   * colors: Array of color strings matching valueKeys
   * lineLabels: Optional array of human-readable labels for legend chips
   * observe: bool — whether to attach ResizeObserver
   */
  renderLineChart(containerId, data, valueKeys, colors, lineLabels, observe = true) {
    // Handle old call signature where 5th arg was bool (observe)
    if (typeof lineLabels === 'boolean') {
      observe = lineLabels;
      lineLabels = null;
    }
    const container = document.getElementById(containerId);
    if (!container) return;

    if (container.pendingAnimationFrame) {
      cancelAnimationFrame(container.pendingAnimationFrame);
    }

    container.pendingAnimationFrame = requestAnimationFrame(() => {
      container.pendingAnimationFrame = null;
      
      // Clear container
      container.innerHTML = '';

      // Map chart keys to result element IDs
      const keyToIdMap = {
        invested: 'total-invested',
        gains: ['total-gains', 'interest-portion', 'estimated-gains', 'total-interest', 'interest-earned', 'gains-portion', 'final-gains'],
        nominal: ['total-corpus', 'future-value', 'final-amount', 'remaining-corpus', 'required-corpus', 'nest-egg', 'target-corpus', 'ending-balance', 'corpus', 'value'],
        real: 'adjusted-corpus',
        postTax: 'post-tax-corpus',
        posttax: 'post-tax-corpus',
        'post-tax': 'post-tax-corpus'
      };

      const isMetricEnabled = (key) => {
        let el = document.getElementById(key);
        if (!el) {
          const ids = keyToIdMap[key];
          if (ids) {
            if (Array.isArray(ids)) {
              for (const id of ids) {
                el = document.getElementById(id);
                if (el) break;
              }
            } else {
              el = document.getElementById(ids);
            }
          }
        }
        if (!el) {
          el = document.querySelector(`[id*="${key}"]`);
        }
        if (el) {
          const card = el.closest('.metric-card');
          if (card) {
            const display = card.style.display;
            const isImportantNone = card.style.getPropertyValue('display') === 'none';
            if (display === 'none' || isImportantNone || window.getComputedStyle(card).display === 'none') {
              return false;
            }
          }
        }
        return true;
      };

      const activeKeys = [];
      const activeColors = [];
      const activeLabels = [];

      valueKeys.forEach((key, idx) => {
        if (isMetricEnabled(key)) {
          activeKeys.push(key);
          activeColors.push(colors[idx]);
          activeLabels.push(lineLabels ? lineLabels[idx] : null);
        }
      });

      valueKeys = activeKeys;
      colors = activeColors;
      lineLabels = lineLabels ? activeLabels : null;
    
    // Store data for ResizeObserver
    container.chartData = { type: 'line', data, valueKeys, colors, lineLabels };
    if (observe) {
      chartResizeObserver.observe(container);
    }
    
    const rect = container.getBoundingClientRect();
    const width = rect.width || 300;
    const height = rect.height || 280;
    container.lastWidth = width;
    container.lastHeight = height;
    
    const padding = { top: 20, right: 30, bottom: 40, left: 70 };
    const chartWidth = Math.max(50, width - padding.left - padding.right);
    const chartHeight = Math.max(50, height - padding.top - padding.bottom);
    
    // Find min/max values
    let minVal = 0;
    let maxVal = 0;
    
    data.forEach(d => {
      valueKeys.forEach(key => {
        const val = d[key];
        if (val > maxVal) maxVal = val;
        if (val < minVal) minVal = val;
      });
    });
    
    // Add 10% buffer to maxVal
    maxVal = maxVal * 1.1 || 100;
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.overflow = 'visible';
    
    // Gradients definitions
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    colors.forEach((color, idx) => {
      const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
      grad.setAttribute('id', `grad-${containerId}-${idx}`);
      grad.setAttribute('x1', '0%');
      grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '0%');
      grad.setAttribute('y2', '100%');
      
      const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', color);
      stop1.setAttribute('stop-opacity', '0.25');
      
      const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', color);
      stop2.setAttribute('stop-opacity', '0.0');
      
      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);
    });
    svg.appendChild(defs);
    
    // Coordinate mapping functions
    const getX = (index) => padding.left + (data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth);
    const getY = (value) => padding.top + chartHeight - ((value - minVal) / (maxVal - minVal)) * chartHeight;
    
    // Render Y gridlines & labels
    const gridCount = 5;
    for (let i = 0; i <= gridCount; i++) {
      const gridVal = minVal + (maxVal - minVal) * (i / gridCount);
      const y = getY(gridVal);
      
      // Grid line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - padding.right);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'var(--border-color)');
      line.setAttribute('stroke-width', '1');
      if (i > 0 && i < gridCount) {
        line.setAttribute('stroke-dasharray', '4 4');
      }
      svg.appendChild(line);
      
      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', padding.left - 10);
      text.setAttribute('y', y + 4);
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-family', 'var(--font-mono)');
      text.setAttribute('font-size', '10px');
      text.setAttribute('fill', 'var(--text-secondary)');
      
      // Short format for large numbers
      let displayVal = gridVal;
      if (gridVal >= 10000000) {
        displayVal = (gridVal / 10000000).toFixed(1) + ' Cr';
      } else if (gridVal >= 100000) {
        displayVal = (gridVal / 100000).toFixed(1) + ' L';
      } else if (gridVal >= 1000) {
        displayVal = (gridVal / 1000).toFixed(1) + ' K';
      } else {
        displayVal = Math.round(gridVal);
      }
      
      text.textContent = displayVal === 0 ? '0' : '₹' + displayVal;
      svg.appendChild(text);
    }
    
    // Render X labels (show ~5 labels max)
    const labelStep = Math.max(1, Math.floor(data.length / 5));
    data.forEach((d, idx) => {
      if (idx % labelStep === 0 || idx === data.length - 1) {
        const x = getX(idx);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', height - padding.bottom + 20);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'var(--font-sans)');
        text.setAttribute('font-size', '10px');
        text.setAttribute('fill', 'var(--text-secondary)');
        text.textContent = d.label;
        svg.appendChild(text);
      }
    });
    
    // Build lookup: key → human label
    const defaultLabels = { invested: 'Invested', corpus: 'Corpus', nominal: 'Corpus', real: 'Real Value', gains: 'Net Gains', withdrawn: 'Withdrawn', balance: 'Balance' };
    let labels = lineLabels || valueKeys.map(k => defaultLabels[k] || (k.charAt(0).toUpperCase() + k.slice(1)));

    // Translate labels dynamically based on active level
    if (window.FinanceTerminologies) {
      const level = window.currentFinanceLevel || 'simple';
      const terms = window.FinanceTerminologies;
      const mapping = window.termIdMapping;
      labels = labels.map(label => {
        const cleanLabel = label.toLowerCase().trim();
        let termKey = null;
        if (mapping && mapping[cleanLabel]) {
          termKey = mapping[cleanLabel];
        } else {
          for (const k in terms) {
            const tiers = terms[k].tiers;
            if (
              (tiers.professional && tiers.professional.label.toLowerCase() === cleanLabel) ||
              (tiers.investor && tiers.investor.label.toLowerCase() === cleanLabel) ||
              (tiers.simple && tiers.simple.label && tiers.simple.label.toLowerCase() === cleanLabel)
            ) {
              termKey = k;
              break;
            }
          }
        }
        if (termKey && terms[termKey] && terms[termKey].tiers[level]) {
          const tierData = terms[termKey].tiers[level];
          if (tierData && tierData.label) {
            return tierData.label;
          }
        }
        return label;
      });
    }

    // Rebuild the HTML legend dynamically to keep it in sync
    const legendContainer = document.getElementById('chart-legend-container');
    if (legendContainer) {
      legendContainer.innerHTML = valueKeys.map((key, index) => {
        const color = colors[index];
        const label = labels[index];
        return `<div class="legend-item"><span class="legend-color" style="background-color: ${color};"></span>${label}</div>`;
      }).join('');
    }

    // Track visibility per series (all visible by default)
    const visible = valueKeys.map(() => true);

    // Per-series SVG group references (area + line + dots)
    const seriesGroups = [];

    // Plot lines & area fills
    valueKeys.forEach((key, keyIdx) => {
      const color = colors[keyIdx];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('data-series', keyIdx);

      let pathD = '';
      let areaD = `M ${getX(0)} ${getY(0)} `;

      data.forEach((d, idx) => {
        const x = getX(idx);
        const y = getY(d[key]);
        const seg = `${idx === 0 ? 'M' : 'L'} ${x} ${y} `;
        pathD += seg;
        areaD += seg;
      });
      areaD += `L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${getX(0)} ${padding.top + chartHeight} Z`;

      const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      area.setAttribute('d', areaD);
      area.setAttribute('fill', `url(#grad-${containerId}-${keyIdx})`);
      g.appendChild(area);

      const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      linePath.setAttribute('d', pathD);
      linePath.setAttribute('fill', 'none');
      linePath.setAttribute('stroke', color);
      linePath.setAttribute('stroke-width', keyIdx === 1 ? '2.5' : '1.75');
      if (keyIdx === 0) linePath.setAttribute('stroke-dasharray', '3 3');
      g.appendChild(linePath);

      data.forEach((d, idx) => {
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', getX(idx));
        dot.setAttribute('cy', getY(d[key]));
        dot.setAttribute('r', '3');
        dot.setAttribute('fill', color);
        dot.setAttribute('stroke', 'var(--card-bg)');
        dot.setAttribute('stroke-width', '1');
        g.appendChild(dot);
      });

      svg.appendChild(g);
      seriesGroups.push(g);
    });

    // Hover group
    const hoverGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    hoverGroup.setAttribute('visibility', 'hidden');

    const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine.setAttribute('y1', padding.top);
    vLine.setAttribute('y2', padding.top + chartHeight);
    vLine.setAttribute('stroke', 'var(--text-secondary)');
    vLine.setAttribute('stroke-width', '1');
    vLine.setAttribute('stroke-dasharray', '2 2');
    hoverGroup.appendChild(vLine);

    const circles = valueKeys.map((key, keyIdx) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', '5');
      circle.setAttribute('fill', colors[keyIdx]);
      circle.setAttribute('stroke', 'var(--bg-primary)');
      circle.setAttribute('stroke-width', '1.5');
      hoverGroup.appendChild(circle);
      return circle;
    });

    svg.appendChild(hoverGroup);
    container.appendChild(svg);

    // Build interactive legend chips (injected into #chart-legend-container if found)
    const legendEl = container.closest('.chart-card') && container.closest('.chart-card').querySelector('#chart-legend-container');
    if (legendEl) {
      legendEl.innerHTML = '';
      valueKeys.forEach((key, keyIdx) => {
        const chip = document.createElement('div');
        chip.className = 'legend-item legend-chip';
        chip.setAttribute('data-series', keyIdx);
        chip.style.cursor = 'pointer';
        chip.style.transition = 'opacity 0.2s';
        chip.innerHTML = `<span class="legend-color" style="background-color:${colors[keyIdx]};display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;"></span>${labels[keyIdx]}`;
        chip.addEventListener('click', () => {
          visible[keyIdx] = !visible[keyIdx];
          seriesGroups[keyIdx].style.display = visible[keyIdx] ? '' : 'none';
          circles[keyIdx].style.display = visible[keyIdx] ? '' : 'none';
          chip.style.opacity = visible[keyIdx] ? '1' : '0.35';
          chip.style.textDecoration = visible[keyIdx] ? '' : 'line-through';
        });
        legendEl.appendChild(chip);
      });
    }

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.style.cssText = 'position:absolute;background:var(--card-bg);opacity:0.97;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid var(--border-color);padding:0.6rem 0.9rem;border-radius:10px;font-size:0.8rem;font-family:var(--font-sans);color:var(--text-primary);box-shadow:0 8px 30px rgba(0,0,0,0.08);pointer-events:none;display:none;z-index:10;transition:left 0.04s ease-out,top 0.04s ease-out;';
    container.appendChild(tooltip);

    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    overlay.setAttribute('x', '0'); overlay.setAttribute('y', '0');
    overlay.setAttribute('width', width); overlay.setAttribute('height', height);
    overlay.setAttribute('fill', 'transparent');
    overlay.style.cursor = 'crosshair';
    svg.appendChild(overlay);

    const onMouseMove = (e) => {
      const containerRect = container.getBoundingClientRect();
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      const xPct = (svgP.x - padding.left) / chartWidth;
      let dataIdx = Math.max(0, Math.min(data.length - 1, Math.round(xPct * (data.length - 1))));
      const item = data[dataIdx];
      const targetX = getX(dataIdx);

      vLine.setAttribute('x1', targetX); vLine.setAttribute('x2', targetX);
      valueKeys.forEach((key, ki) => {
        circles[ki].setAttribute('cx', targetX);
        circles[ki].setAttribute('cy', getY(item[key]));
        circles[ki].style.display = visible[ki] ? '' : 'none';
      });
      hoverGroup.setAttribute('visibility', 'visible');

      let html = `<div style="font-weight:600;margin-bottom:0.3rem;">${item.label}</div>`;
      valueKeys.forEach((key, ki) => {
        if (!visible[ki]) return;
        html += `<div style="display:flex;justify-content:space-between;gap:1rem;align-items:center;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[ki]};"></span>
          <span style="color:var(--text-secondary);margin-right:auto;padding-left:4px;">${labels[ki]}:</span>
          <span style="font-family:var(--font-mono);font-weight:600;">${FinanceEngine.formatINRSmart(item[key])}</span>
        </div>`;
      });
      tooltip.innerHTML = html;
      tooltip.style.display = 'block';

      const tooltipRect = tooltip.getBoundingClientRect();
      const scaleX = containerRect.width / width;
      const scaleY = containerRect.height / height;
      let left = (targetX + 15) * scaleX;
      if (left + tooltipRect.width > containerRect.width) left = (targetX - 15) * scaleX - tooltipRect.width;
      let top = getY(item[valueKeys[0]]) * scaleY - tooltipRect.height / 2;
      top = Math.max(padding.top * scaleY, Math.min((height - padding.bottom) * scaleY - tooltipRect.height, top));
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    };

      const onMouseLeave = () => { hoverGroup.setAttribute('visibility', 'hidden'); tooltip.style.display = 'none'; };
      overlay.addEventListener('mousemove', onMouseMove);
      overlay.addEventListener('mouseleave', onMouseLeave);
    });
  },

  // 6. SVG Donut Chart Generator (e.g. for Asset Allocation)
  
  /**
   * Render a responsive SVG Donut chart
   * containerId: string
   * slices: Array of { label: string, value: number, color: string }
   */
  renderDonutChart(containerId, slices, observe = true) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (container.pendingAnimationFrame) {
      cancelAnimationFrame(container.pendingAnimationFrame);
    }

    container.pendingAnimationFrame = requestAnimationFrame(() => {
      container.pendingAnimationFrame = null;
      container.innerHTML = '';

    container.chartData = { type: 'donut', slices };
    if (observe) {
      chartResizeObserver.observe(container);
    }

    const rect = container.getBoundingClientRect();
    const width = rect.width || 300;
    const height = rect.height || 280;
    container.lastWidth = width;
    container.lastHeight = height;
    const minSize = Math.max(50, Math.min(width, height) - 40);
    const radius = minSize / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const strokeWidth = 35;
    const innerRadius = Math.max(5, radius - strokeWidth / 2);

    const total = slices.reduce((sum, s) => sum + s.value, 0);
    if (total <= 0) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    let accumulatedAngle = -Math.PI / 2; // start from top (12 o'clock)

    slices.forEach((slice) => {
      if (slice.value <= 0) return;
      const angle = (slice.value / total) * 2 * Math.PI;

      // Calculate path endpoints
      const x1 = centerX + innerRadius * Math.cos(accumulatedAngle);
      const y1 = centerY + innerRadius * Math.sin(accumulatedAngle);

      accumulatedAngle += angle;

      const x2 = centerX + innerRadius * Math.cos(accumulatedAngle);
      const y2 = centerY + innerRadius * Math.sin(accumulatedAngle);

      const largeArc = angle > Math.PI ? 1 : 0;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${x2} ${y2}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', slice.color);
      path.setAttribute('stroke-width', strokeWidth);
      
      // Subtle hover effect
      path.style.transition = 'opacity 0.2s';
      path.style.cursor = 'pointer';
      path.addEventListener('mouseenter', () => path.style.opacity = '0.8');
      path.addEventListener('mouseleave', () => path.style.opacity = '1');

      svg.appendChild(path);
    });

    // Add a center summary card text inside the donut
    const textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    textGroup.setAttribute('text-anchor', 'middle');
    textGroup.setAttribute('dominant-baseline', 'middle');

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', centerX);
    label.setAttribute('y', centerY - 8);
    label.setAttribute('font-family', 'var(--font-sans)');
    label.setAttribute('font-size', '11px');
    label.setAttribute('fill', 'var(--text-secondary)');
    label.textContent = 'TOTAL';
    textGroup.appendChild(label);

    const val = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    val.setAttribute('x', centerX);
    val.setAttribute('y', centerY + 12);
    val.setAttribute('font-family', 'var(--font-mono)');
    val.setAttribute('font-size', '16px');
    val.setAttribute('font-weight', '700');
    val.setAttribute('fill', 'var(--text-primary)');
    val.textContent = FinanceEngine.formatINR(total);
    textGroup.appendChild(val);

      svg.appendChild(textGroup);
      container.appendChild(svg);
    });
  },

  // 7. CSV/JSON Export Utilities
  
  /**
   * Helper class to construct and export calculator data to CSV & JSON
   */
  exportData(calcName, inputs, results, tableHeaders, tableRows) {
    const today = new Date().toISOString().slice(0, 10);
    const filename = `${calcName}-${today}`;

    // Export formats object
    return {
      exportCSV() {
        let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
        
        // 1. Inputs Section
        csvContent += 'Parameter,Value\n';
        for (const key in inputs) {
          csvContent += `"${key}",${inputs[key]}\n`;
        }
        csvContent += '\n';

        // 2. Results Section
        csvContent += 'Metric,Value\n';
        for (const key in results) {
          csvContent += `"${key}",${results[key]}\n`;
        }
        csvContent += '\n';

        // 3. Projections Table Section
        if (tableHeaders && tableRows && tableRows.length > 0) {
          csvContent += tableHeaders.join(',') + '\n';
          tableRows.forEach(row => {
            csvContent += row.join(',') + '\n';
          });
        }

        FinanceEngine._triggerDownload(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
      },

      exportJSON() {
        const jsonObject = {
          calculator: calcName,
          exportDate: today,
          inputs: inputs,
          results: results,
          yearlyProjections: tableRows ? tableRows.map(row => {
            const rowObj = {};
            tableHeaders.forEach((header, idx) => {
              rowObj[header] = isNaN(row[idx]) ? row[idx] : parseFloat(row[idx]);
            });
            return rowObj;
          }) : []
        };

        const jsonString = JSON.stringify(jsonObject, null, 2);
        FinanceEngine._triggerDownload(jsonString, `${filename}.json`, 'application/json;charset=utf-8;');
      }
    };
  },

  /**
   * Helper function to trigger browser download
   */
  _triggerDownload(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Copy text table to clipboard
   */
  copyTableToClipboard(headers, rows) {
    let text = headers.join('\t') + '\n';
    rows.forEach(row => {
      text += row.join('\t') + '\n';
    });

    const triggerBtnFeedback = () => {
      const btn = document.getElementById('btn-copy-table');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('copied');
        }, 1500);
      }
    };
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        FinanceEngine.showToast('Table copied to clipboard!');
        triggerBtnFeedback();
      }).catch(err => {
        console.error('Could not copy table: ', err);
        const success = FinanceEngine._fallbackCopyText(text);
        if (success) triggerBtnFeedback();
      });
    } else {
      const success = FinanceEngine._fallbackCopyText(text);
      if (success) triggerBtnFeedback();
    }
  },

  /**
   * Fallback copy text using standard textarea select & execCommand
   */
  _fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    let successful = false;
    try {
      successful = document.execCommand('copy');
      if (successful) {
        FinanceEngine.showToast('Table copied to clipboard!');
      } else {
        FinanceEngine.showToast('Failed to copy table.');
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
      FinanceEngine.showToast('Failed to copy table.');
    }
    document.body.removeChild(textArea);
    return successful;
  },

  /**
   * Show toast alert in UI
   */
  showToast(message) {
    let toast = document.getElementById('toast-alert');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-alert';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.FinanceEngine = FinanceEngine;
  globalThis.CurrencyManager = CurrencyManager;
  globalThis.CurrencyRegistry = CurrencyRegistry;
  globalThis.IndianFormatterStrategy = IndianFormatterStrategy;
  globalThis.InternationalFormatterStrategy = InternationalFormatterStrategy;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FinanceEngine;
  FinanceEngine.CurrencyManager = CurrencyManager;
  FinanceEngine.CurrencyRegistry = CurrencyRegistry;
}
