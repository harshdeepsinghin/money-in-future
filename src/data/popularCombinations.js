// src/data/popularCombinations.js

// Permutations used to programmatically generate sitemap URLs
const sipAmounts = [300, 500, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 7500, 10000, 15000, 20000, 25000, 50000];
const sipYears = [3, 5, 7, 10, 12, 15, 20, 25, 30];
const sipRates = [10, 12, 14, 15, 18, 20];

const lumpAmounts = [10000, 25000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];
const lumpYears = [3, 5, 10, 15, 20, 25, 30];
const lumpRates = [10, 12, 14, 15, 18];

const stepUpStarting = [1000, 2000, 5000, 10000, 20000];
const stepUpPcts = [5, 10];
const stepUpYears = [5, 10, 15, 20, 25, 30];
const stepUpRates = [12, 15];

const swpCorpus = [1000000, 2500000, 5000000, 10000000];
const swpWithdrawals = [5000, 10000, 25000, 50000, 75000];
const swpYears = [10, 15, 20, 25, 30];
const swpRates = [7, 8, 9, 10];

/**
 * Get curated, high-quality combinations localized per currency for search engine discoverability.
 */
export function getCuratedIndexScenarios() {
  return {
    INR: {
      sip: [
        { url: '/calculators/sip?monthly=500&years=5&rate=12&currency=INR', text: 'If I invest ₹500 per month for 5 years at 12% return' },
        { url: '/calculators/sip?monthly=1000&years=10&rate=12&currency=INR', text: 'If I invest ₹1,00,000 per month for 30 years at 12% return' },
        { url: '/calculators/sip?monthly=1000&years=10&rate=12&currency=INR', text: 'If I invest ₹1,000 per month for 10 years at 12% return' },
        { url: '/calculators/sip?monthly=2000&years=15&rate=12&currency=INR', text: 'If I invest ₹2,000 per month for 15 years at 12% return' },
        { url: '/calculators/sip?monthly=5000&years=20&rate=12&currency=INR', text: 'If I invest ₹5,000 per month for 20 years at 12% return' },
        { url: '/calculators/sip?monthly=10000&years=20&rate=12&currency=INR', text: 'If I invest ₹10,000 per month for 20 years at 12% return' },
        { url: '/calculators/sip?monthly=15000&years=15&rate=12&currency=INR', text: 'If I invest ₹15,000 per month for 15 years at 12% return' },
        { url: '/calculators/sip?monthly=20000&years=25&rate=12&currency=INR', text: 'If I invest ₹20,000 per month for 25 years at 12% return' },
        { url: '/calculators/sip?monthly=25000&years=25&rate=12&currency=INR', text: 'If I invest ₹25,000 per month for 25 years at 12% return' },
        { url: '/calculators/sip?monthly=50000&years=30&rate=12&currency=INR', text: 'If I invest ₹50,000 per month for 30 years at 12% return' },
        { url: '/calculators/sip?monthly=5000&years=35&rate=8&currency=INR', text: 'If I invest ₹5,000 every month for retirement' },
        { url: '/calculators/sip?monthly=10000&years=20&rate=12&currency=INR', text: 'If I invest ₹10,000 monthly for 20 years' },
        { url: '/calculators/sip?monthly=2000&years=10&rate=12&currency=INR', text: 'SIP calculator for ₹2,000 per month' },
        { url: '/calculators/sip?monthly=100000&years=30&rate=12&currency=INR', text: '₹1 lakh SIP after 30 years' },
        { url: '/calculators/sip?monthly=50000&years=20&rate=12&currency=INR', text: '₹50,000 monthly investment returns' }
      ],
      lumpSum: [
        { url: '/calculators/lump-sum?principal=10000&years=5&rate=12&currency=INR', text: 'If I invest ₹10,000 lump sum for 5 years at 12% returns' },
        { url: '/calculators/lump-sum?principal=50000&years=10&rate=12&currency=INR', text: 'If I invest ₹50,000 lump sum for 10 years at 12% returns' },
        { url: '/calculators/lump-sum?principal=100000&years=10&rate=12&currency=INR', text: 'If I invest ₹1 Lakh lump sum for 10 years at 12% returns' },
        { url: '/calculators/lump-sum?principal=500000&years=10&rate=12&currency=INR', text: 'If I invest ₹5 Lakhs lump sum for 10 years at 12% returns' },
        { url: '/calculators/lump-sum?principal=1000000&years=15&rate=12&currency=INR', text: 'If I invest ₹10 Lakhs lump sum for 15 years at 12% returns' },
        { url: '/calculators/lump-sum?principal=5000000&years=15&rate=12&currency=INR', text: 'If I invest ₹50 Lakhs lump sum for 15 years at 12% returns' }
      ],
      stepUp: [
        { url: '/calculators/step-up-sip?starting_sip=5000&step_up_pct=10&years=10&rate=12&currency=INR', text: 'Start ₹5,000 SIP with 10% annual increase for 10 years at 12%' },
        { url: '/calculators/step-up-sip?starting_sip=10000&step_up_pct=10&years=15&rate=12&currency=INR', text: 'Start ₹10,000 SIP with 10% annual increase for 15 years at 12%' }
      ],
      swp: [
        { url: '/calculators/swp?initial_corpus=2500000&monthly_withdrawal=15000&years=15&rate=8&currency=INR', text: 'Withdraw ₹15,000/mo from ₹25 Lakhs corpus over 15 years' },
        { url: '/calculators/swp?initial_corpus=5000000&monthly_withdrawal=30000&years=20&rate=8&currency=INR', text: 'Withdraw ₹30,000/mo from ₹50 Lakhs corpus over 20 years' }
      ]
    },
    USD: {
      sip: [
        { url: '/calculators/sip?monthly=100&years=10&rate=8&currency=USD', text: 'If I invest $100 per month for 10 years at 8% return' },
        { url: '/calculators/sip?monthly=250&years=20&rate=8&currency=USD', text: 'If I invest $250 per month for 20 years at 8% return' },
        { url: '/calculators/sip?monthly=500&years=30&rate=10&currency=USD', text: 'If I invest $500 per month for 30 years at 10% return' },
        { url: '/calculators/sip?monthly=1000&years=20&rate=10&currency=USD', text: 'If I invest $1,000 per month for 20 years at 10% return' },
        { url: '/calculators/sip?monthly=2000&years=30&rate=10&currency=USD', text: 'If I invest $2,000 per month for 30 years at 10% return' },
        { url: '/calculators/sip?monthly=5000&years=30&rate=10&currency=USD', text: 'If I invest $5,000 per month for 30 years at 10% return' },
        { url: '/calculators/sip?monthly=500&years=35&rate=8&currency=USD', text: 'If I invest $500 a month for retirement' },
        { url: '/calculators/sip?monthly=1000&years=25&rate=8&currency=USD', text: 'If I invest $1,000 a month until retirement' },
        { url: '/calculators/sip?monthly=2500&years=25&rate=8&currency=USD', text: 'If I invest $2,500 per month for 25 years' },
        { url: '/calculators/sip?monthly=500&years=15&rate=8&currency=USD', text: 'What if I invest $500 every month?' },
        { url: '/calculators/sip?monthly=1000&years=20&rate=8&currency=USD', text: 'How much will $1,000 per month grow in 20 years?' },
        { url: '/calculators/sip?monthly=200&years=10&rate=8&currency=USD', text: '$200 monthly investment calculator' },
        { url: '/calculators/sip?monthly=100&years=15&rate=8&currency=USD', text: '$100 a month investment returns' },
        { url: '/calculators/sip?monthly=5000&years=25&rate=8&currency=USD', text: '$5000 monthly investment calculator' }
      ],
      lumpSum: [
        { url: '/calculators/lump-sum?principal=1000&years=5&rate=8&currency=USD', text: 'If I invest $1,000 lump sum for 5 years at 8% returns' },
        { url: '/calculators/lump-sum?principal=5000&years=10&rate=8&currency=USD', text: 'If I invest $5,000 lump sum for 10 years at 8% returns' },
        { url: '/calculators/lump-sum?principal=10000&years=15&rate=10&currency=USD', text: 'If I invest $10,000 lump sum for 15 years at 10% returns' },
        { url: '/calculators/lump-sum?principal=50000&years=20&rate=10&currency=USD', text: 'If I invest $50,000 lump sum for 20 years at 10% returns' },
        { url: '/calculators/lump-sum?principal=100000&years=25&rate=10&currency=USD', text: 'If I invest $100,000 lump sum for 25 years at 10% returns' }
      ],
      stepUp: [
        { url: '/calculators/step-up-sip?starting_sip=500&step_up_pct=5&years=15&rate=8&currency=USD', text: 'Start $500 SIP with 5% annual increase for 15 years at 8%' },
        { url: '/calculators/step-up-sip?starting_sip=1000&step_up_pct=10&years=20&rate=10&currency=USD', text: 'Start $1,000 SIP with 10% annual increase for 20 years at 10%' }
      ],
      swp: [
        { url: '/calculators/swp?initial_corpus=100000&monthly_withdrawal=500&years=15&rate=6&currency=USD', text: 'Withdraw $500/mo from $100,000 nest egg over 15 years' },
        { url: '/calculators/swp?initial_corpus=500000&monthly_withdrawal=2500&years=25&rate=6&currency=USD', text: 'Withdraw $2,500/mo from $500,000 nest egg over 25 years' }
      ]
    },
    GBP: {
      sip: [
        { url: '/calculators/sip?monthly=100&years=10&rate=7&currency=GBP', text: 'If I invest £100 per month for 10 years' },
        { url: '/calculators/sip?monthly=250&years=20&rate=7&currency=GBP', text: 'If I invest £250 per month for 20 years' },
        { url: '/calculators/sip?monthly=500&years=25&rate=8&currency=GBP', text: 'If I invest £500 per month for 25 years' },
        { url: '/calculators/sip?monthly=1000&years=30&rate=8&currency=GBP', text: 'If I invest £1,000 per month for 30 years' },
        { url: '/calculators/sip?monthly=2000&years=25&rate=8&currency=GBP', text: 'If I invest £2,000 per month for retirement' },
        { url: '/calculators/sip?monthly=500&years=20&rate=7&currency=GBP', text: '£500 monthly investment calculator' },
        { url: '/calculators/sip?monthly=200&years=15&rate=7&currency=GBP', text: '£200 per month investment' },
        { url: '/calculators/sip?monthly=1000&years=20&rate=8&currency=GBP', text: '£1000 monthly savings growth' }
      ],
      lumpSum: [
        { url: '/calculators/lump-sum?principal=5000&years=10&rate=7&currency=GBP', text: 'If I invest £5,000 lump sum for 10 years' },
        { url: '/calculators/lump-sum?principal=10000&years=15&rate=7&currency=GBP', text: 'If I invest £10,000 lump sum for 15 years' }
      ],
      stepUp: [
        { url: '/calculators/step-up-sip?starting_sip=250&step_up_pct=5&years=15&rate=7&currency=GBP', text: 'Start £250 SIP with 5% step-up for 15 years' }
      ],
      swp: [
        { url: '/calculators/swp?initial_corpus=250000&monthly_withdrawal=1000&years=20&rate=5&currency=GBP', text: 'Withdraw £1,000/mo from £250,000 corpus' }
      ]
    },
    EUR: {
      sip: [
        { url: '/calculators/sip?monthly=100&years=10&rate=7&currency=EUR', text: 'If I invest €100 per month for 10 years' },
        { url: '/calculators/sip?monthly=250&years=20&rate=7&currency=EUR', text: 'If I invest €250 per month for 20 years' },
        { url: '/calculators/sip?monthly=500&years=25&rate=8&currency=EUR', text: 'If I invest €500 per month for 25 years' },
        { url: '/calculators/sip?monthly=1000&years=30&rate=8&currency=EUR', text: 'If I invest €1,000 per month for 30 years' },
        { url: '/calculators/sip?monthly=2000&years=25&rate=8&currency=EUR', text: 'If I invest €2,000 monthly for retirement' },
        { url: '/calculators/sip?monthly=500&years=20&rate=7&currency=EUR', text: '€500 monthly investment calculator' },
        { url: '/calculators/sip?monthly=100&years=15&rate=7&currency=EUR', text: '€100 monthly investment returns' },
        { url: '/calculators/sip?monthly=1000&years=20&rate=8&currency=EUR', text: '€1000 monthly investment growth' }
      ],
      lumpSum: [
        { url: '/calculators/lump-sum?principal=5000&years=10&rate=7&currency=EUR', text: 'If I invest €5,000 lump sum for 10 years' },
        { url: '/calculators/lump-sum?principal=10000&years=15&rate=7&currency=EUR', text: 'If I invest €10,000 lump sum for 15 years' }
      ],
      stepUp: [
        { url: '/calculators/step-up-sip?starting_sip=250&step_up_pct=5&years=15&rate=7&currency=EUR', text: 'Start €250 SIP with 5% step-up for 15 years' }
      ],
      swp: [
        { url: '/calculators/swp?initial_corpus=250000&monthly_withdrawal=1000&years=20&rate=5&currency=EUR', text: 'Withdraw €1,000/mo from €250,000 corpus' }
      ]
    },
    CAD: {
      sip: [
        { url: '/calculators/sip?monthly=100&years=10&rate=7&currency=CAD', text: 'If I invest C$100 per month for 10 years' },
        { url: '/calculators/sip?monthly=250&years=20&rate=7&currency=CAD', text: 'If I invest C$250 per month for 20 years' },
        { url: '/calculators/sip?monthly=500&years=25&rate=8&currency=CAD', text: 'If I invest C$500 per month for 25 years' },
        { url: '/calculators/sip?monthly=1000&years=25&rate=8&currency=CAD', text: 'If I invest C$1,000 per month for retirement' }
      ],
      lumpSum: [
        { url: '/calculators/lump-sum?principal=10000&years=10&rate=7&currency=CAD', text: 'If I invest C$10,000 lump sum' }
      ],
      stepUp: [
        { url: '/calculators/step-up-sip?starting_sip=500&step_up_pct=5&years=15&rate=7&currency=CAD', text: 'Start C$500 SIP with 5% step-up' }
      ],
      swp: [
        { url: '/calculators/swp?initial_corpus=250000&monthly_withdrawal=1000&years=20&rate=5&currency=CAD', text: 'Withdraw C$1,000/mo from C$250,000 corpus' }
      ]
    },
    AUD: {
      sip: [
        { url: '/calculators/sip?monthly=100&years=10&rate=7&currency=AUD', text: 'If I invest A$100 per month for 10 years' },
        { url: '/calculators/sip?monthly=250&years=20&rate=7&currency=AUD', text: 'If I invest A$250 per month for 20 years' },
        { url: '/calculators/sip?monthly=500&years=25&rate=8&currency=AUD', text: 'If I invest A$500 per month for 25 years' },
        { url: '/calculators/sip?monthly=1000&years=25&rate=8&currency=AUD', text: 'If I invest A$1,000 per month for retirement' }
      ],
      lumpSum: [
        { url: '/calculators/lump-sum?principal=10000&years=10&rate=7&currency=AUD', text: 'If I invest A$10,000 lump sum' }
      ],
      stepUp: [
        { url: '/calculators/step-up-sip?starting_sip=500&step_up_pct=5&years=15&rate=7&currency=AUD', text: 'Start A$500 SIP with 5% step-up' }
      ],
      swp: [
        { url: '/calculators/swp?initial_corpus=250000&monthly_withdrawal=1000&years=20&rate=5&currency=AUD', text: 'Withdraw A$1,000/mo from A$250,000 corpus' }
      ]
    }
  };
}

/**
 * Generate full sitemap URLs (absolute paths with query parameters)
 */
export function generateSitemapUrls(siteUrl) {
  const urls = [];

  // 1. SIP Calculator Combinations
  for (const amt of sipAmounts) {
    for (const yr of sipYears) {
      for (const rt of sipRates) {
        urls.push(`${siteUrl}/calculators/sip?monthly=${amt}&years=${yr}&rate=${rt}`);
      }
    }
  }

  // 2. Lump Sum Calculator Combinations
  for (const amt of lumpAmounts) {
    for (const yr of lumpYears) {
      for (const rt of lumpRates) {
        urls.push(`${siteUrl}/calculators/lump-sum?principal=${amt}&years=${yr}&rate=${rt}`);
      }
    }
  }

  // 3. Step-Up SIP Combinations
  for (const start of stepUpStarting) {
    for (const pct of stepUpPcts) {
      for (const yr of stepUpYears) {
        for (const rt of stepUpRates) {
          urls.push(`${siteUrl}/calculators/step-up-sip?starting_sip=${start}&step_up_pct=${pct}&years=${yr}&rate=${rt}`);
        }
      }
    }
  }

  // 4. SWP Combinations
  for (const corp of swpCorpus) {
    for (const wtd of swpWithdrawals) {
      for (const yr of swpYears) {
        for (const rt of swpRates) {
          if (wtd * 12 < corp) {
            urls.push(`${siteUrl}/calculators/swp?initial_corpus=${corp}&monthly_withdrawal=${wtd}&years=${yr}&rate=${rt}`);
          }
        }
      }
    }
  }

  // 5. Add curated international scenarios explicitly to sitemaps
  const curated = getCuratedIndexScenarios();
  for (const cCode in curated) {
    const scenarios = curated[cCode];
    for (const key in scenarios) {
      for (const item of scenarios[key]) {
        urls.push(`${siteUrl}${item.url}`);
      }
    }
  }

  return urls;
}
