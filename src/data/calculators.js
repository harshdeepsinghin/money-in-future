// src/data/calculators.js
// Auto-extracted and formatted calculators configuration database

export const calculators = [
  {
    "filename": "sip.html",
    "title": "SIP Calculator",
    "metaDescription": "Calculate your mutual fund SIP (Systematic Investment Plan) returns in real-time. Optimize for Indian mutual funds with inflation adjustment and capital gains taxation.",
    "keywords": "sip calculator, mutual fund sip, sip interest, cagr compounding, ltcg tax equity",
    "inputs": [
      {
        "id": "monthly_sip",
        "label": "Monthly SIP (₹)",
        "min": 500,
        "max": 200000,
        "step": 500,
        "value": 10000,
        "type": "slider",
        "displayValue": "₹10,000"
      },
      {
        "id": "return_rate",
        "label": "Expected Annual Return (CAGR %)",
        "min": 1,
        "max": 30,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 1,
        "max": 40,
        "step": 1,
        "value": 15,
        "type": "slider",
        "displayValue": "15"
      }
    ],
    "results": [
      {
        "id": "total-invested",
        "label": "Invested Amount"
      },
      {
        "id": "total-gains",
        "label": "Total Gains"
      },
      {
        "id": "total-corpus",
        "label": "Nominal Corpus"
      },
      {
        "id": "adjusted-corpus",
        "label": "Inflation Adjusted"
      },
      {
        "id": "post-tax-corpus",
        "label": "Post-Tax Corpus",
        "conditional": "tax"
      }
    ],
    "supportTax": true,
    "supportInflation": true,
    "seoContent": "\n      <h2>Understanding Mutual Fund SIP Compounding</h2>\n      <p>A Systematic Investment Plan (SIP) allows you to invest a fixed amount regularly in mutual funds, helping you benefit from rupee cost averaging and power of compounding.</p>\n      <h3>Popular SIP Calculations</h3>\n      <p>Click on any of the popular search scenarios below to load the calculator with pre-configured values:</p>\n      <ul id=\"popular-sip-scenarios\">\n        <li><a href=\"/calculators/sip?monthly=300&years=3&rate=14\">If I invest ₹300 per month for 3 years at 14% return</a></li>\n        <li><a href=\"/calculators/sip?monthly=500&years=5&rate=12\">If I invest ₹500 per month for 5 years at 12% return</a></li>\n        <li><a href=\"/calculators/sip?monthly=1000&years=10&rate=12\">If I invest ₹1,00,000 per month for 30 years at 12% return</a></li>\n        <li><a href=\"/calculators/sip?monthly=1000&years=10&rate=12\">If I invest ₹1,000 per month for 10 years at 12% return</a></li>\n        <li><a href=\"/calculators/sip?monthly=5000&years=15&rate=15\">If I invest ₹5,000 per month for 15 years at 15% return</a></li>\n        <li><a href=\"/calculators/sip?monthly=10000&years=20&rate=12\">If I invest ₹10,000 per month for 20 years at 12% return</a></li>\n      </ul>\n      <h3>Frequently Asked Questions</h3>\n      <div class=\"faq-list\">\n        <div class=\"faq-item\">\n          <div class=\"faq-question\">What is CAGR compounding?</div>\n          <div class=\"faq-answer\">Compound Annual Growth Rate (CAGR) measures the geometric progression ratio that provides a constant rate of return over the period. Using CAGR monthly compounding is the standard for retail investment evaluations.</div>\n        </div>\n        <div class=\"faq-item\">\n          <div class=\"faq-question\">How is Equity LTCG taxed in India?</div>\n          <div class=\"faq-answer\">Starting FY 2024-25, Long-Term Capital Gains (LTCG) on equity investments are taxed at 12.5% for gains exceeding ₹1.25 Lakhs in a financial year.</div>\n        </div>\n      </div>\n    ",
    "bindingScript": "\n      const defaults = { monthly_sip: 10000, return_rate: 12, years: 15, 'tax-type': 'equity_ltcg', 'custom-tax-rate': 12.5, 'inflation-rate': 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      \n      const elements = ['monthly_sip', 'return_rate', 'years', 'tax-type', 'custom-tax-rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'monthly_sip') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate' || id === 'custom-tax-rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n        \n        // Hide/show flat tax input based on selection\n        const customTaxGroup = document.getElementById('custom-tax-group');\n        if (customTaxGroup) {\n          customTaxGroup.style.display = (state['tax-type'] === 'custom' || state['tax-type'] === 'slab') ? 'block' : 'none';\n        }\n      }\n      \n      function calculate() {\n        const P = isNaN(state.monthly_sip) ? 10000 : state.monthly_sip;\n        const annualRate = isNaN(state.return_rate) ? 12 : state.return_rate;\n        const years = isNaN(state.years) || state.years <= 0 ? 15 : state.years;\n        const i = FinanceEngine.getMonthlyRate(annualRate);\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        const inflationRate = state['inflation-rate'];\n        const r_real = ((1 + annualRate / 100) / (1 + inflationRate / 100)) - 1;\n        \n        // Populate Table\n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        \n        const headers = ['Year', 'Invested', 'Returns', 'Corpus', 'Real Corpus', 'Taxable Gains', 'Estimated Tax', 'Post-Tax Corpus'];\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        \n        let tableRows = [];\n        let runningBalance = 0;\n        let cumulativeInvested = 0;\n        \n        for (let y = 1; y <= years; y++) {\n          const startMonth = (y - 1) * 12 + 1;\n          const endMonth = y * 12;\n          \n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          if (compoundingFreq === 'monthly') {\n            for (let m = startMonth; m <= endMonth; m++) {\n              cumulativeInvested += P;\n              runningBalance = (runningBalance + P) * (1 + i);\n            }\n          } else {\n            const rate = annualRate / 100;\n            const interestOnStart = runningBalance * rate;\n            const interestOnDeposits = P * rate * 6.5;\n            cumulativeInvested += P * 12;\n            runningBalance = runningBalance + (P * 12) + interestOnStart + interestOnDeposits;\n          }\n          \n          const runningRealBalance = FinanceEngine.getRealValue(runningBalance, inflationRate, y);\n          \n          const yGains = runningBalance - cumulativeInvested;\n          const yTaxResults = FinanceEngine.estimateTax(yGains, state['tax-type'], state['custom-tax-rate']);\n          const yPostTaxCorpus = runningBalance - yTaxResults.tax;\n          \n          tableRows.push([\n            y,\n            cumulativeInvested,\n            yGains,\n            runningBalance,\n            runningRealBalance,\n            yTaxResults.taxableGains,\n            yTaxResults.tax,\n            yPostTaxCorpus\n          ]);\n        }\n        \n        const totalInvested = cumulativeInvested;\n        const fv = runningBalance;\n        const totalGains = fv - totalInvested;\n        const realCorpus = tableRows[tableRows.length - 1][4];\n        const realGains = realCorpus - totalInvested;\n        \n        const taxResults = FinanceEngine.estimateTax(totalGains, state['tax-type'], state['custom-tax-rate']);\n        const estimatedTax = taxResults.tax;\n        const postTaxCorpus = fv - estimatedTax;\n        \n        // Update summary cards\n        document.getElementById('total-invested').textContent = FinanceEngine.formatINRSmart(totalInvested);\n        document.getElementById('total-gains').textContent = FinanceEngine.formatINRSmart(totalGains);\n        document.getElementById('total-corpus').textContent = FinanceEngine.formatINRSmart(fv);\n        document.getElementById('adjusted-corpus').textContent = FinanceEngine.formatINRSmart(realCorpus);\n        const realGainLossEl = document.getElementById('real-gain-loss');\n        if (realGainLossEl) {\n          const realCAGR = (r_real * 100).toFixed(2);\n          realGainLossEl.innerHTML = \"Real CAGR: \" + realCAGR + \"% &nbsp;&middot;&nbsp; Real Gain: \" + FinanceEngine.formatINRSmart(realGains);\n        }\n        // Post-tax card (conditional)\n        const postTaxEl = document.getElementById('post-tax-corpus');\n        if (postTaxEl) postTaxEl.textContent = FinanceEngine.formatINRSmart(postTaxCorpus);\n        document.querySelectorAll('[data-conditional=\"tax\"]').forEach(el => {\n          el.style.display = (state['tax-type'] && state['tax-type'] !== 'none') ? '' : 'none';\n        });\n        \n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINRSmart(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        // Update Chart\n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[1],\n          gains: row[2],\n          nominal: row[3],\n          real: row[4]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData,\n          ['invested', 'gains', 'nominal', 'real'],\n          ['#6e6e73', '#ff9f0a', '#0071e3', '#30d158'],\n          ['Invested', 'Net Gains', 'Corpus', 'Real Value']);\n        \n        // Bind Export Buttons\n        const csvExporter = FinanceEngine.exportData('sip-calculator', \n          { 'Monthly SIP': P, 'Return CAGR %': annualRate, 'Years': years, 'Inflation %': inflationRate },\n          { 'Invested Amount': totalInvested, 'Total Corpus': fv, 'Total Gains': totalGains, 'Inflation Adjusted': realCorpus, 'Estimated Tax': estimatedTax, 'Post-Tax Corpus': postTaxCorpus },\n          headers,\n          tableRows\n        );\n        \n        // Remove old event listeners\n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      // Event bindings\n      elements.forEach(id => {\n        const el = document.getElementById(id);\n        if (!el) return;\n        el.addEventListener('input', (e) => {\n          state[id] = e.target.value;\n          if (typeof defaults[id] === 'number') state[id] = parseFloat(state[id]);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "step-up-sip.html",
    "title": "Step-Up SIP Calculator",
    "metaDescription": "Maximize compounding by stepping up your monthly SIP contributions annually. Model compound interest, target inflation rates, and capital gains tax on mutual funds.",
    "keywords": "step-up sip calculator, mutual fund step up, annual step up sip, compounding planner",
    "inputs": [
      {
        "id": "starting_sip",
        "label": "Starting Monthly SIP (₹)",
        "min": 500,
        "max": 200000,
        "step": 500,
        "value": 10000,
        "type": "slider",
        "displayValue": "₹10,000"
      },
      {
        "id": "step_up_pct",
        "label": "Annual Step-Up (%)",
        "min": 1,
        "max": 30,
        "step": 1,
        "value": 10,
        "type": "slider",
        "displayValue": "10%"
      },
      {
        "id": "return_rate",
        "label": "Expected Return (CAGR %)",
        "min": 1,
        "max": 30,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 1,
        "max": 40,
        "step": 1,
        "value": 15,
        "type": "slider",
        "displayValue": "15"
      }
    ],
    "results": [
      {
        "id": "total-invested",
        "label": "Total Invested"
      },
      {
        "id": "total-gains",
        "label": "Total Gains"
      },
      {
        "id": "total-corpus",
        "label": "Nominal Corpus"
      },
      {
        "id": "adjusted-corpus",
        "label": "Inflation Adjusted"
      },
      {
        "id": "post-tax-corpus",
        "label": "Post-Tax Corpus",
        "conditional": "tax"
      }
    ],
    "supportTax": true,
    "supportInflation": true,
    "seoContent": "\n      <h2>Why Step-Up SIP Accelerates Wealth Creation</h2>\n      <p>By increasing your monthly SIP amount in proportion to your salary hikes (e.g. 10% step-up each year), your final corpus grows exponentially larger than a standard flat SIP.</p>\n    ",
    "bindingScript": "\n      const defaults = { starting_sip: 10000, step_up_pct: 10, return_rate: 12, years: 15, 'tax-type': 'equity_ltcg', 'custom-tax-rate': 12.5, 'inflation-rate': 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      \n      const elements = ['starting_sip', 'step_up_pct', 'return_rate', 'years', 'tax-type', 'custom-tax-rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'starting_sip') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'step_up_pct' || id === 'return_rate' || id === 'custom-tax-rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n        \n        const customTaxGroup = document.getElementById('custom-tax-group');\n        if (customTaxGroup) {\n          customTaxGroup.style.display = (state['tax-type'] === 'custom' || state['tax-type'] === 'slab') ? 'block' : 'none';\n        }\n      }\n      \n      function calculate() {\n        const startSIP = isNaN(state.starting_sip) ? 10000 : state.starting_sip;\n        const stepUp = isNaN(state.step_up_pct) ? 10 : state.step_up_pct;\n        const annualRate = isNaN(state.return_rate) ? 12 : state.return_rate;\n        const years = isNaN(state.years) || state.years <= 0 ? 15 : state.years;\n        const inflationRate = isNaN(state['inflation-rate']) ? 6 : state['inflation-rate'];\n        const i = FinanceEngine.getMonthlyRate(annualRate);\n        \n        const r_real = ((1 + annualRate / 100) / (1 + inflationRate / 100)) - 1;\n        \n        const headers = ['Year', 'Monthly SIP', 'Invested', 'Returns', 'Corpus', 'Real Corpus', 'Taxable Gains', 'Estimated Tax', 'Post-Tax Corpus'];\n        \n        let tableRows = [];\n        let runningBalance = 0;\n        let cumulativeInvested = 0;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        \n        for (let y = 1; y <= years; y++) {\n          const currentSIP = startSIP * Math.pow(1 + stepUp / 100, y - 1);\n          \n          if (compoundingFreq === 'monthly') {\n            const compoundingFreq = state['compounding-freq'] || 'monthly';\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              cumulativeInvested += currentSIP;\n              runningBalance = (runningBalance + currentSIP) * (1 + i);\n            }\n          } else {\n            const rate = annualRate / 100;\n            const interestOnStart = runningBalance * rate;\n            const interestOnDeposits = currentSIP * rate * 6.5;\n            cumulativeInvested += currentSIP * 12;\n            runningBalance = runningBalance + (currentSIP * 12) + interestOnStart + interestOnDeposits;\n          }\n          } else {\n            const rate = annualRate / 100;\n            const interestOnStart = runningBalance * rate;\n            const interestOnDeposits = currentSIP * rate * 6.5;\n            \n            cumulativeInvested += currentSIP * 12;\n            runningBalance = runningBalance + (currentSIP * 12) + interestOnStart + interestOnDeposits;\n          }\n          \n          const runningRealBalance = FinanceEngine.getRealValue(runningBalance, inflationRate, y);\n          \n          const yGains = runningBalance - cumulativeInvested;\n          const yTaxResults = FinanceEngine.estimateTax(yGains, state['tax-type'], state['custom-tax-rate']);\n          const yPostTaxCorpus = runningBalance - yTaxResults.tax;\n          \n          tableRows.push([\n            y,\n            currentSIP,\n            cumulativeInvested,\n            yGains,\n            runningBalance,\n            runningRealBalance,\n            yTaxResults.taxableGains,\n            yTaxResults.tax,\n            yPostTaxCorpus\n          ]);\n        }\n        \n        const totalInvested = tableRows[tableRows.length - 1][2];\n        const fv = tableRows[tableRows.length - 1][4];\n        const totalGains = fv - totalInvested;\n        const realCorpus = tableRows[tableRows.length - 1][5];\n        const realGains = realCorpus - totalInvested;\n        const estimatedTax = tableRows[tableRows.length - 1][7];\n        const postTaxCorpus = fv - estimatedTax;\n        \n        document.getElementById('total-invested').textContent = FinanceEngine.formatINRSmart(totalInvested);\n        document.getElementById('total-gains').textContent = FinanceEngine.formatINRSmart(totalGains);\n        document.getElementById('total-corpus').textContent = FinanceEngine.formatINRSmart(fv);\n        document.getElementById('adjusted-corpus').textContent = FinanceEngine.formatINRSmart(realCorpus);\n        const realGainLossEl = document.getElementById('real-gain-loss');\n        if (realGainLossEl) {\n          const realCAGR = (r_real * 100).toFixed(2);\n          realGainLossEl.innerHTML = \"Real CAGR: \" + realCAGR + \"% &nbsp;&middot;&nbsp; Real Gain: \" + FinanceEngine.formatINRSmart(realGains);\n        }\n        const postTaxEl = document.getElementById('post-tax-corpus');\n        if (postTaxEl) postTaxEl.textContent = FinanceEngine.formatINRSmart(postTaxCorpus);\n        document.querySelectorAll('[data-conditional=\"tax\"]').forEach(el => {\n          el.style.display = (state['tax-type'] && state['tax-type'] !== 'none') ? '' : 'none';\n        });\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        \n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINRSmart(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[2],\n          gains: row[3],\n          nominal: row[4],\n          real: row[5]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData,\n          ['invested', 'gains', 'nominal', 'real'],\n          ['#6e6e73', '#ff9f0a', '#0071e3', '#30d158'],\n          ['Invested', 'Net Gains', 'Corpus', 'Real Value']);\n        \n        const csvExporter = FinanceEngine.exportData('step-up-sip-calculator', \n          { 'Starting SIP': startSIP, 'Step-Up %': stepUp, 'Return CAGR %': annualRate, 'Years': years },\n          { 'Invested Amount': totalInvested, 'Total Corpus': fv, 'Total Gains': totalGains, 'Inflation Adjusted': realCorpus },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        const el = document.getElementById(id);\n        if (!el) return;\n        el.addEventListener('input', (e) => {\n          state[id] = e.target.value;\n          if (typeof defaults[id] === 'number') state[id] = parseFloat(state[id]);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "reverse-sip.html",
    "title": "Reverse SIP Calculator",
    "metaDescription": "Find the required monthly SIP contribution to reach your target savings or investment corpus. Input expected CAGR and target duration.",
    "keywords": "reverse sip, target corpus calculator, monthly sip goal planner, required sip",
    "inputs": [
      {
        "id": "target_corpus",
        "label": "Target Corpus (₹)",
        "min": 100000,
        "max": 100000000,
        "step": 100000,
        "value": 10000000,
        "type": "slider",
        "displayValue": "₹1,00,00,000"
      },
      {
        "id": "return_rate",
        "label": "Expected Return (CAGR %)",
        "min": 1,
        "max": 30,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 1,
        "max": 40,
        "step": 1,
        "value": 15,
        "type": "slider",
        "displayValue": "15"
      }
    ],
    "results": [
      {
        "id": "required-sip",
        "label": "Required Monthly SIP"
      },
      {
        "id": "total-invested",
        "label": "Total Invested Amount"
      },
      {
        "id": "total-gains",
        "label": "Estimated Gains"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "seoContent": "\n      <h2>Goal-Based Planning with Reverse SIP</h2>\n      <p>Instead of calculating what a given SIP yields, the Reverse SIP Calculator determines exactly how much you must invest monthly today to meet a specific goal tomorrow.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly',  target_corpus: 10000000, return_rate: 12, years: 15 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      \n      const elements = [ 'compounding-freq', 'target_corpus', 'return_rate', 'years'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'target_corpus') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const target = state.target_corpus;\n        const annualRate = state.return_rate;\n        const years = state.years;\n        \n        const i = FinanceEngine.getMonthlyRate(annualRate);\n        const months = years * 12;\n        \n        // Required SIP: target / [ ((1+i)^m - 1)/i * (1+i) ]\n        let requiredSIP = 0;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        if (compoundingFreq === 'monthly') {\n          requiredSIP = target / (((Math.pow(1 + i, months) - 1) / i) * (1 + i));\n        } else {\n          let low = 0, high = target;\n          for (let iter = 0; iter < 100; iter++) {\n            const mid = (low + high) / 2;\n            const rows = FinanceEngine.calculateGrowth(0, mid, years, annualRate, 'yearly', 0);\n            if (rows[rows.length - 1].corpus < target) low = mid;\n            else high = mid;\n          }\n          requiredSIP = low;\n        }\n        const totalInvested = requiredSIP * months;\n        const gains = target - totalInvested;\n        \n        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(requiredSIP) + ' / mo';\n        document.getElementById('total-invested').textContent = FinanceEngine.formatINR(totalInvested);\n        document.getElementById('total-gains').textContent = FinanceEngine.formatINR(gains);\n        \n        const headers = ['Year', 'Monthly SIP', 'Invested', 'Returns', 'Corpus'];\n        let tableRows = [];\n        let runningBalance = 0;\n        let cumulativeInvested = 0;\n        \n        for (let y = 1; y <= years; y++) {\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              cumulativeInvested += requiredSIP;\n              runningBalance = (runningBalance + requiredSIP) * (1 + i);\n            }\n          } else {\n            const rate = annualRate / 100;\n            const interestOnStart = runningBalance * rate;\n            const interestOnDeposits = requiredSIP * rate * 6.5;\n            cumulativeInvested += requiredSIP * 12;\n            runningBalance = runningBalance + (requiredSIP * 12) + interestOnStart + interestOnDeposits;\n          }\n          \n          tableRows.push([\n            y,\n            Math.round(requiredSIP),\n            Math.round(cumulativeInvested),\n            Math.round(runningBalance - cumulativeInvested),\n            Math.round(runningBalance)\n          ]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[2],\n          nominal: row[4]\n        }));\n        \n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#6e6e73', '#0071e3']);\n        \n        const csvExporter = FinanceEngine.exportData('reverse-sip-calculator', \n          { 'Target Corpus': target, 'Return CAGR %': annualRate, 'Years': years },\n          { 'Required Monthly SIP': requiredSIP, 'Total Invested': totalInvested, 'Total Gains': gains },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        const el = document.getElementById(id);\n        if (!el) return;\n        el.addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "lump-sum.html",
    "title": "Lump Sum Calculator",
    "metaDescription": "Calculate compound returns on lump sum investments. Estimate mutual fund or equity growth using standard annual CAGR rates, taxes, and inflation.",
    "keywords": "lump sum calculator, mutual fund lump sum, compound interest, standard cagr",
    "inputs": [
      {
        "id": "principal",
        "label": "Investment Amount (₹)",
        "min": 1000,
        "max": 10000000,
        "step": 5000,
        "value": 100000,
        "type": "slider",
        "displayValue": "₹1,00,000"
      },
      {
        "id": "return_rate",
        "label": "Expected Return (CAGR %)",
        "min": 1,
        "max": 30,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 1,
        "max": 45,
        "step": 1,
        "value": 10,
        "type": "slider",
        "displayValue": "10"
      }
    ],
    "results": [
      {
        "id": "total-invested",
        "label": "Invested Amount"
      },
      {
        "id": "total-gains",
        "label": "Total Gains"
      },
      {
        "id": "total-corpus",
        "label": "Nominal Corpus"
      },
      {
        "id": "adjusted-corpus",
        "label": "Inflation Adjusted"
      },
      {
        "id": "post-tax-corpus",
        "label": "Post-Tax Corpus",
        "conditional": "tax"
      }
    ],
    "supportTax": true,
    "supportInflation": true,
    "seoContent": "\n      <h2>Understanding Lump Sum Wealth Compounding</h2>\n      <p>Lump sum investments grow based on annual CAGR compounding where the total investment begins accumulating growth from Day 1.</p>\n    ",
    "bindingScript": "\n      const defaults = { principal: 100000, return_rate: 12, years: 10, 'tax-type': 'equity_ltcg', 'custom-tax-rate': 12.5, 'inflation-rate': 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      \n      const elements = ['principal', 'return_rate', 'years', 'tax-type', 'custom-tax-rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'principal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate' || id === 'custom-tax-rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n        \n        const customTaxGroup = document.getElementById('custom-tax-group');\n        if (customTaxGroup) {\n          customTaxGroup.style.display = (state['tax-type'] === 'custom' || state['tax-type'] === 'slab') ? 'block' : 'none';\n        }\n      }\n      \n      function calculate() {\n        const P = state.principal;\n        const r = state.return_rate;\n        const years = state.years;\n        const inf = state['inflation-rate'];\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        \n        const headers = ['Year', 'Invested', 'Returns', 'Corpus', 'Real Corpus', 'Taxable Gains', 'Estimated Tax', 'Post-Tax Corpus'];\n        let tableRows = [];\n        \n        for (let y = 1; y <= years; y++) {\n          let yCorpus = 0;\n          if (compoundingFreq === 'monthly') {\n            const i = FinanceEngine.getMonthlyRate(r);\n            yCorpus = P * Math.pow(1 + i, y * 12);\n          } else {\n            yCorpus = P * Math.pow(1 + r/100, y);\n          }\n          const yGains = yCorpus - P;\n          const yReal = FinanceEngine.getRealValue(yCorpus, inf, y);\n          const yTax = FinanceEngine.estimateTax(yGains, state['tax-type'], state['custom-tax-rate']);\n          const yPostTax = yCorpus - yTax.tax;\n          \n          tableRows.push([\n            y,\n            P,\n            yGains,\n            yCorpus,\n            yReal,\n            yTax.taxableGains,\n            yTax.tax,\n            yPostTax\n          ]);\n        }\n        \n        const fv = tableRows[tableRows.length - 1][3];\n        const gains = fv - P;\n        const realVal = tableRows[tableRows.length - 1][4];\n        const realGains = realVal - P;\n        const taxResults = FinanceEngine.estimateTax(gains, state['tax-type'], state['custom-tax-rate']);\n        const postTaxCorpus = fv - taxResults.tax;\n        \n        document.getElementById('total-invested').textContent = FinanceEngine.formatINRSmart(P);\n        document.getElementById('total-gains').textContent = FinanceEngine.formatINRSmart(gains);\n        document.getElementById('total-corpus').textContent = FinanceEngine.formatINRSmart(fv);\n        document.getElementById('adjusted-corpus').textContent = FinanceEngine.formatINRSmart(realVal);\n        const realGainLossEl = document.getElementById('real-gain-loss');\n        if (realGainLossEl) {\n          const r_real = ((1 + r / 100) / (1 + inf / 100)) - 1;\n          const realCAGR = (r_real * 100).toFixed(2);\n          realGainLossEl.innerHTML = \"Real CAGR: \" + realCAGR + \"% &nbsp;&middot;&nbsp; Real Gain: \" + FinanceEngine.formatINRSmart(realGains);\n        }\n        const postTaxEl = document.getElementById('post-tax-corpus');\n        if (postTaxEl) postTaxEl.textContent = FinanceEngine.formatINRSmart(postTaxCorpus);\n        document.querySelectorAll('[data-conditional=\"tax\"]').forEach(el => {\n          el.style.display = (state['tax-type'] && state['tax-type'] !== 'none') ? '' : 'none';\n        });\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINRSmart(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[1],\n          gains: row[2],\n          nominal: row[3],\n          real: row[4]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData,\n          ['invested', 'gains', 'nominal', 'real'],\n          ['#6e6e73', '#ff9f0a', '#0071e3', '#30d158'],\n          ['Invested', 'Net Gains', 'Corpus', 'Real Value']);\n        \n        const csvExporter = FinanceEngine.exportData('lumpsum-calculator', \n          { 'Investment': P, 'Return %': r, 'Years': years },\n          { 'Corpus': fv, 'Gains': gains, 'Real Value': realVal },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        const el = document.getElementById(id);\n        if (!el) return;\n        el.addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "reverse-lump-sum.html",
    "title": "Reverse Lump Sum Calculator",
    "metaDescription": "Find the required initial lump sum investment to achieve a target financial goal.",
    "keywords": "reverse lumpsum, target amount lumpsum, goal lumpsum, compound returns",
    "inputs": [
      {
        "id": "target_corpus",
        "label": "Target Corpus (₹)",
        "min": 100000,
        "max": 100000000,
        "step": 100000,
        "value": 10000000,
        "type": "slider",
        "displayValue": "₹1,00,00,000"
      },
      {
        "id": "return_rate",
        "label": "Expected Return (CAGR %)",
        "min": 1,
        "max": 30,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 1,
        "max": 40,
        "step": 1,
        "value": 15,
        "type": "slider",
        "displayValue": "15"
      }
    ],
    "results": [
      {
        "id": "required-lump",
        "label": "Required Investment"
      },
      {
        "id": "estimated-gains",
        "label": "Compound Gains"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "seoContent": "\n      <h2>Required Lump Sum Planning</h2>\n      <p>Compute the exact amount of money you must commit to an asset today in order to meet a goal at a specific future date.</p>\n    ",
    "bindingScript": "\n      const defaults = { target_corpus: 10000000, return_rate: 12, years: 15 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['target_corpus', 'return_rate', 'years'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'target_corpus') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const target = state.target_corpus;\n        const r = state.return_rate;\n        const years = state.years;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        \n        let reqLump = 0;\n        if (compoundingFreq === 'monthly') {\n          const i = FinanceEngine.getMonthlyRate(r);\n          reqLump = target / Math.pow(1 + i, years * 12);\n        } else {\n          reqLump = target / Math.pow(1 + r/100, years);\n        }\n        const gains = target - reqLump;\n        \n        document.getElementById('required-lump').textContent = FinanceEngine.formatINRSmart(reqLump);\n        document.getElementById('estimated-gains').textContent = FinanceEngine.formatINRSmart(gains);\n        \n        const headers = ['Year', 'Invested', 'Gains', 'Corpus'];\n        let tableRows = [];\n        \n        for (let y = 1; y <= years; y++) {\n          let yCorpus = 0;\n          if (compoundingFreq === 'monthly') {\n            const i = FinanceEngine.getMonthlyRate(r);\n            yCorpus = reqLump * Math.pow(1 + i, y * 12);\n          } else {\n            yCorpus = reqLump * Math.pow(1 + r/100, y);\n          }\n          tableRows.push([\n            y,\n            Math.round(reqLump),\n            Math.round(yCorpus - reqLump),\n            Math.round(yCorpus)\n          ]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINRSmart(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[1],\n          nominal: row[3]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#6e6e73', '#0071e3']);\n        \n        const csvExporter = FinanceEngine.exportData('reverse-lumpsum-calculator', \n          { 'Target': target, 'Return %': r, 'Years': years },\n          { 'Required Investment': reqLump, 'Gains': gains },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "swp.html",
    "title": "SWP Calculator",
    "metaDescription": "Plan your regular withdrawals from mutual funds using a Systematic Withdrawal Plan (SWP) calculator. Calculate capital preservation and corpus lifespan.",
    "keywords": "swp calculator, systematic withdrawal plan, retirement monthly income, capital preservation",
    "inputs": [
      {
        "id": "initial_corpus",
        "label": "Initial Corpus (₹)",
        "min": 100000,
        "max": 100000000,
        "step": 100000,
        "value": 5000000,
        "type": "slider",
        "displayValue": "₹50,00,000"
      },
      {
        "id": "monthly_withdrawal",
        "label": "Monthly Withdrawal (₹)",
        "min": 1000,
        "max": 500000,
        "step": 1000,
        "value": 30000,
        "type": "slider",
        "displayValue": "₹30,000"
      },
      {
        "id": "return_rate",
        "label": "Expected Return (CAGR %)",
        "min": 1,
        "max": 30,
        "step": 0.5,
        "value": 9,
        "type": "slider",
        "displayValue": "9%"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 1,
        "max": 40,
        "step": 1,
        "value": 15,
        "type": "slider",
        "displayValue": "15"
      },
      {
        "id": "waiting_period",
        "label": "Waiting Period (Years)",
        "min": 0,
        "max": 20,
        "step": 1,
        "value": 0,
        "type": "slider",
        "displayValue": "0"
      }
    ],
    "results": [
      {
        "id": "remaining-corpus",
        "label": "Remaining Corpus"
      },
      {
        "id": "total-withdrawn",
        "label": "Total Withdrawals"
      },
      {
        "id": "final-gains",
        "label": "Earned Returns"
      },
      {
        "id": "depletion-year",
        "label": "Corpus Lifespan"
      }
    ],
    "supportCompounding": true,
    "supportTax": false,
    "supportInflation": false,
    "seoContent": "\n      <h2>Retirement Planning with SWP</h2>\n      <p>A Systematic Withdrawal Plan (SWP) allows you to withdraw a fixed amount of money regularly from your mutual fund investments, while the remaining balance continues to compound.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly', initial_corpus: 5000000, monthly_withdrawal: 30000, return_rate: 9, years: 15, waiting_period: 0 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['compounding-freq', 'initial_corpus', 'monthly_withdrawal', 'return_rate', 'years', 'waiting_period'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'initial_corpus' || id === 'monthly_withdrawal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const corpus = state.initial_corpus;\n        const withdrawal = state.monthly_withdrawal;\n        const r = state.return_rate;\n        const years = state.years;\n        const waitingPeriod = state.waiting_period || 0;\n        \n        const i = FinanceEngine.getMonthlyRate(r);\n        \n        let balance = corpus;\n        let cumulativeWithdrawn = 0;\n        let cumulativeInterest = 0;\n        \n        const headers = ['Year', 'Beginning Balance', 'Withdrawn', 'Interest Earned', 'Ending Balance'];\n        let tableRows = [];\n        \n        for (let y = 1; y <= years; y++) {\n          const begBal = balance;\n          let yWithdrawn = 0;\n          let yInterest = 0;\n          \n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          const isWaiting = y <= waitingPeriod;\n          \n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              if (balance <= 0 && !isWaiting) {\n                balance = 0;\n                continue;\n              }\n              if (!isWaiting) {\n                const actualWithdraw = Math.min(balance, withdrawal);\n                yWithdrawn += actualWithdraw;\n                balance -= actualWithdraw;\n              }\n              const interest = balance * i;\n              yInterest += interest;\n              balance = balance + interest;\n            }\n          } else {\n            // Yearly compounding\n            const yearStart = balance;\n            if (!isWaiting) {\n              for (let m = 1; m <= 12; m++) {\n                const actualWithdraw = Math.min(balance, withdrawal);\n                yWithdrawn += actualWithdraw;\n                balance -= actualWithdraw;\n              }\n              yInterest = Math.max(0, yearStart * (r / 100) - yWithdrawn * (r / 100) * (6.5 / 12));\n              balance = balance + yInterest;\n            } else {\n              yInterest = yearStart * (r / 100);\n              balance = balance + yInterest;\n            }\n          }\n          \n          cumulativeWithdrawn += yWithdrawn;\n          cumulativeInterest += yInterest;\n          \n          tableRows.push([\n            y,\n            begBal,\n            yWithdrawn,\n            yInterest,\n            balance\n          ]);\n        }\n        \n        document.getElementById('remaining-corpus').textContent = FinanceEngine.formatINRSmart(balance);\n        document.getElementById('total-withdrawn').textContent = FinanceEngine.formatINRSmart(cumulativeWithdrawn);\n        document.getElementById('final-gains').textContent = FinanceEngine.formatINRSmart(cumulativeInterest);\n        \n        // Calculate depletion year\n        let depletionYr = 'Perpetual';\n        let simBalance = corpus;\n        let foundDepletion = false;\n        \n        for (let y = 1; y <= 100; y++) {\n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          const isWaiting = y <= waitingPeriod;\n          let yWithdrawn = 0;\n          let yInterest = 0;\n          const yearStart = simBalance;\n          \n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              if (simBalance <= 0) {\n                depletionYr = 'Depletes in Year ' + (y - 1);\n                foundDepletion = true;\n                break;\n              }\n              \n              const interest = simBalance * i;\n              simBalance += interest;\n              \n              if (!isWaiting) {\n                const actualWithdraw = Math.min(simBalance, withdrawal);\n                simBalance -= actualWithdraw;\n              }\n              \n              if (simBalance <= 0 && !isWaiting) {\n                depletionYr = 'Depletes in Year ' + y;\n                foundDepletion = true;\n                break;\n              }\n            }\n          } else {\n            // Yearly compounding\n            if (!isWaiting) {\n              for (let m = 1; m <= 12; m++) {\n                if (simBalance <= 0) {\n                  depletionYr = 'Depletes in Year ' + (y - 1);\n                  foundDepletion = true;\n                  break;\n                }\n                const actualWithdraw = Math.min(simBalance, withdrawal);\n                simBalance -= actualWithdraw;\n                yWithdrawn += actualWithdraw;\n              }\n              if (simBalance <= 0) {\n                depletionYr = 'Depletes in Year ' + y;\n                foundDepletion = true;\n              } else {\n                yInterest = Math.max(0, yearStart * (r / 100) - withdrawal * (r / 100) * 6.5);\n                simBalance += yInterest;\n              }\n            } else {\n              yInterest = yearStart * (r / 100);\n              simBalance += yInterest;\n            }\n          }\n          if (foundDepletion) break;\n        }\n        if (!foundDepletion) {\n          depletionYr = 'Perpetual (100+ Yrs)';\n        }\n        \n        document.getElementById('depletion-year').textContent = depletionYr;\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINRSmart(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          nominal: row[4]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal'], ['#0071e3']);\n        \n        const csvExporter = FinanceEngine.exportData('swp-calculator', \n          { 'Initial Corpus': corpus, 'Monthly Withdrawal': withdrawal, 'CAGR %': r, 'Years': years, 'Waiting Period': waitingPeriod },\n          { 'Remaining Corpus': balance, 'Total Withdrawals': cumulativeWithdrawn, 'Interest Earned': cumulativeInterest, 'Lifespan': depletionYr },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        const el = document.getElementById(id);\n        if (!el) return;\n        el.addEventListener('input', (e) => {\n          state[id] = e.target.value;\n          if (typeof defaults[id] === 'number') state[id] = parseFloat(state[id]);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "reverse-swp.html",
    "title": "Reverse SWP Calculator",
    "metaDescription": "Find the required initial corpus to generate a specific monthly withdrawal income for retirement without running out of money.",
    "keywords": "reverse swp, required retirement corpus, target swp calculator, retirement income planning",
    "inputs": [
      {
        "id": "desired_withdrawal",
        "label": "Desired Monthly Income (₹)",
        "min": 5000,
        "max": 500000,
        "step": 5000,
        "value": 50000,
        "type": "slider",
        "displayValue": "₹50,000"
      },
      {
        "id": "return_rate",
        "label": "Expected Return (CAGR %)",
        "min": 1,
        "max": 20,
        "step": 0.5,
        "value": 8,
        "type": "slider",
        "displayValue": "8%"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 1,
        "max": 40,
        "step": 1,
        "value": 20,
        "type": "slider",
        "displayValue": "20"
      }
    ],
    "results": [
      {
        "id": "required-corpus",
        "label": "Required Initial Corpus"
      },
      {
        "id": "total-withdrawn",
        "label": "Total Payouts"
      },
      {
        "id": "gains-portion",
        "label": "Returns Needed"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "seoContent": "\n      <h2>Funding Your Retirement Payouts</h2>\n      <p>Estimate the required initial nest egg size to pay out a targeted monthly amount over your retirement years, assuming a specific compounding growth rate.</p>\n    ",
    "bindingScript": "\n      const defaults = { desired_withdrawal: 50000, return_rate: 8, years: 20 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['desired_withdrawal', 'return_rate', 'years'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'desired_withdrawal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const withdrawal = state.desired_withdrawal;\n        const r = state.return_rate;\n        const years = state.years;\n        \n        const i = FinanceEngine.getMonthlyRate(r);\n        const months = years * 12;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        \n        let reqCorpus = 0;\n        if (compoundingFreq === 'monthly') {\n          // Annuity-due: withdrawal at beginning of each month\n          reqCorpus = withdrawal * ((1 - Math.pow(1 + i, -months)) / i) * (1 + i);\n        } else {\n          // Binary search for required corpus under yearly compounding.\n          let low = 0, high = withdrawal * months * 2;\n          for (let iter = 0; iter < 100; iter++) {\n            const mid = (low + high) / 2;\n            let balance = mid;\n            let ok = true;\n            for (let y = 1; y <= years; y++) {\n              const yearStart = balance;\n              for (let m = 1; m <= 12; m++) {\n                balance -= withdrawal; // forced: must pay full withdrawal\n                if (balance < -0.01) { ok = false; break; }\n              }\n              if (!ok) break;\n              // Yearly interest on starting balance minus mid-year approximation for withdrawals\n              const yInterest = Math.max(0, yearStart * (r / 100) - withdrawal * 12 * (r / 100) * (6.5 / 12));\n              balance += yInterest;\n            }\n            if (ok) high = mid;\n            else low = mid;\n          }\n          reqCorpus = high;\n        }\n        const totalPayout = withdrawal * months;\n        const interestRequired = totalPayout - reqCorpus;\n        \n        document.getElementById('required-corpus').textContent = FinanceEngine.formatINRSmart(reqCorpus);\n        document.getElementById('total-withdrawn').textContent = FinanceEngine.formatINRSmart(totalPayout);\n        document.getElementById('gains-portion').textContent = FinanceEngine.formatINRSmart(interestRequired);\n        \n        const headers = ['Year', 'Beginning Balance', 'Withdrawn', 'Interest Earned', 'Ending Balance'];\n        let tableRows = [];\n        let balance = reqCorpus;\n        \n        for (let y = 1; y <= years; y++) {\n          const beg = balance;\n          let yInterest = 0;\n          let yWithdrawn = 0;\n\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              if (balance <= 0) continue;\n              // Withdrawal at beginning of month (annuity-due)\n              const actualWithdraw = Math.min(balance, withdrawal);\n              balance -= actualWithdraw;\n              yWithdrawn += actualWithdraw;\n              const interest = balance * i;\n              balance += interest;\n              yInterest += interest;\n            }\n          } else {\n            // Yearly compounding: forced monthly withdrawals, then one annual interest credit\n            for (let m = 1; m <= 12; m++) {\n              if (balance <= 0) continue;\n              const actualWithdraw = Math.min(balance, withdrawal);\n              balance -= actualWithdraw;\n              yWithdrawn += actualWithdraw;\n            }\n            yInterest = Math.max(0, beg * (r / 100) - withdrawal * 12 * (r / 100) * (6.5 / 12));\n            balance += yInterest;\n          }\n\n          tableRows.push([\n            y,\n            beg,\n            yWithdrawn,\n            yInterest,\n            balance\n          ]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINRSmart(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          nominal: row[4]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal'], ['#0071e3']);\n        \n        const csvExporter = FinanceEngine.exportData('reverse-swp-calculator', \n          { 'Desired Withdrawal': withdrawal, 'Return %': r, 'Years': years },\n          { 'Required Corpus': reqCorpus, 'Total Withdrawn': totalPayout, 'Interest Required': interestRequired },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "step-up-swp.html",
    "title": "Step-Up SWP Calculator",
    "metaDescription": "Estimate systematic withdrawal plan sustainability with annual step-ups to match inflation or cost of living increases.",
    "keywords": "step-up swp, inflation withdrawal planner, retirement depletion calculator",
    "inputs": [
      {
        "id": "initial_corpus",
        "label": "Initial Corpus (₹)",
        "min": 100000,
        "max": 100000000,
        "step": 100000,
        "value": 5000000,
        "type": "slider",
        "displayValue": "₹50,00,000"
      },
      {
        "id": "monthly_withdrawal",
        "label": "Initial Monthly Withdrawal (₹)",
        "min": 1000,
        "max": 500000,
        "step": 1000,
        "value": 30000,
        "type": "slider",
        "displayValue": "₹30,000"
      },
      {
        "id": "step_up_pct",
        "label": "Annual Step-Up (%)",
        "min": 1,
        "max": 20,
        "step": 1,
        "value": 6,
        "type": "slider",
        "displayValue": "6%"
      },
      {
        "id": "return_rate",
        "label": "Expected Return (CAGR %)",
        "min": 1,
        "max": 20,
        "step": 0.5,
        "value": 9,
        "type": "slider",
        "displayValue": "9%"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 1,
        "max": 40,
        "step": 1,
        "value": 20,
        "type": "slider",
        "displayValue": "20"
      },
      {
        "id": "waiting_period",
        "label": "Waiting Period (Years)",
        "min": 0,
        "max": 20,
        "step": 1,
        "value": 0,
        "type": "slider",
        "displayValue": "0"
      }
    ],
    "results": [
      {
        "id": "remaining-corpus",
        "label": "Remaining Corpus"
      },
      {
        "id": "total-withdrawn",
        "label": "Total Payouts"
      },
      {
        "id": "depletion-year",
        "label": "Corpus Lifespan"
      }
    ],
    "supportCompounding": true,
    "supportTax": false,
    "supportInflation": false,
    "seoContent": "\n      <h2>Managing Inflation in Retirement Withdrawals</h2>\n      <p>Stepping up your SWP withdrawals annually helps you preserve purchasing power as inflation drives costs higher.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly', initial_corpus: 5000000, monthly_withdrawal: 30000, step_up_pct: 6, return_rate: 9, years: 20, waiting_period: 0 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['compounding-freq', 'initial_corpus', 'monthly_withdrawal', 'step_up_pct', 'return_rate', 'years', 'waiting_period'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'initial_corpus' || id === 'monthly_withdrawal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'step_up_pct' || id === 'return_rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const corpus = state.initial_corpus;\n        const initialW = state.monthly_withdrawal;\n        const stepUp = state.step_up_pct;\n        const r = state.return_rate;\n        const years = state.years;\n        const waitingPeriod = state.waiting_period || 0;\n        \n        const i = FinanceEngine.getMonthlyRate(r);\n        \n        let balance = corpus;\n        let cumulativeWithdrawn = 0;\n        \n        const headers = ['Year', 'Monthly Withdrawal', 'Beginning Balance', 'Withdrawn', 'Interest Earned', 'Ending Balance'];\n        let tableRows = [];\n        \n        for (let y = 1; y <= years; y++) {\n          const isWaiting = y <= waitingPeriod;\n          const withdrawalYearIdx = isWaiting ? 0 : (y - waitingPeriod);\n          const currentW = isWaiting ? 0 : initialW * Math.pow(1 + stepUp / 100, withdrawalYearIdx - 1);\n          const beg = balance;\n          let yWithdrawn = 0;\n          let yInterest = 0;\n          \n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              if (balance <= 0) {\n                balance = 0;\n                continue;\n              }\n              \n              if (!isWaiting) {\n                const actualWithdraw = Math.min(balance, currentW);\n                balance -= actualWithdraw;\n                yWithdrawn += actualWithdraw;\n              }\n              \n              const interest = balance * i;\n              balance += interest;\n              yInterest += interest;\n            }\n          } else {\n            // Yearly compounding\n            const yearStart = balance;\n            if (!isWaiting) {\n              for (let m = 1; m <= 12; m++) {\n                const actualWithdraw = Math.min(balance, currentW);\n                balance -= actualWithdraw;\n                yWithdrawn += actualWithdraw;\n              }\n              yInterest = Math.max(0, yearStart * (r / 100) - currentW * (r / 100) * 6.5);\n              balance += yInterest;\n            } else {\n              yInterest = yearStart * (r / 100);\n              balance += yInterest;\n            }\n          }\n          \n          cumulativeWithdrawn += yWithdrawn;\n          \n          tableRows.push([\n            y,\n            currentW,\n            beg,\n            yWithdrawn,\n            yInterest,\n            balance\n          ]);\n        }\n        \n        // Calculate depletion year\n        let depletionYr = 'Perpetual';\n        let simBalance = corpus;\n        let foundDepletion = false;\n        \n        for (let y = 1; y <= 100; y++) {\n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          const isWaiting = y <= waitingPeriod;\n          const withdrawalYearIdx = isWaiting ? 0 : (y - waitingPeriod);\n          const currentW = isWaiting ? 0 : initialW * Math.pow(1 + stepUp / 100, withdrawalYearIdx - 1);\n          let yWithdrawn = 0;\n          let yInterest = 0;\n          const yearStart = simBalance;\n          \n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              if (simBalance <= 0) {\n                depletionYr = 'Depletes in Year ' + (y - 1);\n                foundDepletion = true;\n                break;\n              }\n              \n              if (!isWaiting) {\n                const actualWithdraw = Math.min(simBalance, currentW);\n                simBalance -= actualWithdraw;\n                yWithdrawn += actualWithdraw;\n              }\n              \n              const interest = simBalance * i;\n              simBalance += interest;\n              \n              if (simBalance <= 0 && !isWaiting) {\n                depletionYr = 'Depletes in Year ' + y;\n                foundDepletion = true;\n                break;\n              }\n            }\n          } else {\n            // Yearly compounding\n            if (!isWaiting) {\n              for (let m = 1; m <= 12; m++) {\n                if (simBalance <= 0) {\n                  depletionYr = 'Depletes in Year ' + (y - 1);\n                  foundDepletion = true;\n                  break;\n                }\n                const actualWithdraw = Math.min(simBalance, currentW);\n                simBalance -= actualWithdraw;\n                yWithdrawn += actualWithdraw;\n              }\n              if (simBalance <= 0) {\n                depletionYr = 'Depletes in Year ' + y;\n                foundDepletion = true;\n              } else {\n                yInterest = Math.max(0, yearStart * (r / 100) - currentW * (r / 100) * 6.5);\n                simBalance += yInterest;\n              }\n            } else {\n              yInterest = yearStart * (r / 100);\n              simBalance += yInterest;\n            }\n          }\n          if (foundDepletion) break;\n        }\n        if (!foundDepletion) {\n          depletionYr = 'Perpetual (100+ Yrs)';\n        }\n        \n        document.getElementById('remaining-corpus').textContent = FinanceEngine.formatINRSmart(balance);\n        document.getElementById('total-withdrawn').textContent = FinanceEngine.formatINRSmart(cumulativeWithdrawn);\n        document.getElementById('depletion-year').textContent = depletionYr;\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINRSmart(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          nominal: row[5]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal'], ['#0071e3']);\n        \n        const csvExporter = FinanceEngine.exportData('step-up-swp-calculator', \n          { 'Corpus': corpus, 'Initial Withdraw': initialW, 'Step Up %': stepUp, 'Return %': r, 'Years': years, 'Waiting Period': waitingPeriod },\n          { 'Remaining Corpus': balance, 'Total Withdrawals': cumulativeWithdrawn, 'Lifespan': depletionYr },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        const el = document.getElementById(id);\n        if (!el) return;\n        el.addEventListener('input', (e) => {\n          state[id] = e.target.value;\n          if (typeof defaults[id] === 'number') state[id] = parseFloat(state[id]);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "retirement.html",
    "title": "Retirement Planner",
    "metaDescription": "Find your target retirement nest egg. Estimate required monthly savings, inflation-adjusted post-retirement expenses, and annuity lifespan.",
    "keywords": "retirement planner, retirement corpus calculator, fire nest egg size, retirement sip planner",
    "inputs": [
      {
        "id": "current_age",
        "label": "Current Age (Years)",
        "min": 18,
        "max": 60,
        "step": 1,
        "value": 30,
        "type": "slider",
        "displayValue": "30"
      },
      {
        "id": "retire_age",
        "label": "Retirement Age (Years)",
        "min": 35,
        "max": 70,
        "step": 1,
        "value": 55,
        "type": "slider",
        "displayValue": "55"
      },
      {
        "id": "life_expectancy",
        "label": "Life Expectancy (Years)",
        "min": 70,
        "max": 100,
        "step": 1,
        "value": 85,
        "type": "slider",
        "displayValue": "85"
      },
      {
        "id": "monthly_expenses",
        "label": "Current Monthly Expenses (₹)",
        "min": 10000,
        "max": 1000000,
        "step": 5000,
        "value": 50000,
        "type": "slider",
        "displayValue": "₹50,000"
      },
      {
        "id": "pre_return",
        "label": "Pre-retirement Return CAGR (%)",
        "min": 4,
        "max": 20,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      },
      {
        "id": "post_return",
        "label": "Post-retirement Return CAGR (%)",
        "min": 3,
        "max": 15,
        "step": 0.5,
        "value": 8,
        "type": "slider",
        "displayValue": "8%"
      }
    ],
    "results": [
      {
        "id": "required-corpus",
        "label": "Required Corpus at Retirement"
      },
      {
        "id": "required-sip",
        "label": "Required Monthly SIP Today"
      },
      {
        "id": "inflated-expenses",
        "label": "Monthly Expense at Retirement"
      }
    ],
    "supportTax": false,
    "supportInflation": true,
    "seoContent": "\n      <h2>Retirement Nest Egg Strategy</h2>\n      <p>Inflation is the biggest threat to retirement. A monthly expense of ₹50,000 today will expand dramatically over 20-30 years. This planner calculates your target corpus and required monthly savings.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly',  current_age: 30, retire_age: 55, life_expectancy: 85, monthly_expenses: 50000, pre_return: 12, post_return: 8, 'inflation-rate': 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = [ 'compounding-freq', 'current_age', 'retire_age', 'life_expectancy', 'monthly_expenses', 'pre_return', 'post_return', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'monthly_expenses') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'pre_return' || id === 'post_return' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const curAge = state.current_age;\n        let retAge = state.retire_age;\n        if (retAge <= curAge) {\n          retAge = curAge + 1;\n          state.retire_age = retAge;\n          document.getElementById('retire_age').value = retAge;\n          document.getElementById('retire_age-val').textContent = retAge;\n        }\n        \n        let lifeExp = state.life_expectancy;\n        if (lifeExp <= retAge) {\n          lifeExp = retAge + 5;\n          state.life_expectancy = lifeExp;\n          document.getElementById('life_expectancy').value = lifeExp;\n          document.getElementById('life_expectancy-val').textContent = lifeExp;\n        }\n        \n        const expenses = state.monthly_expenses;\n        const preR = state.pre_return;\n        const postR = state.post_return;\n        const inf = state['inflation-rate'];\n        \n        const yearsToRet = retAge - curAge;\n        const yearsInRet = lifeExp - retAge;\n        \n        // Expenses at retirement\n        const inflatedW = expenses * Math.pow(1 + inf / 100, yearsToRet);\n        \n        // Post retirement compounding\n        const iPost = FinanceEngine.getMonthlyRate(postR);\n        const infM = FinanceEngine.getMonthlyRate(inf);\n        const retirementMonths = yearsInRet * 12;\n        \n        // Calculate PV of retirement annuity: sum of inflated withdrawals discounted at postR\n        let reqCorpus = 0;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        if (compoundingFreq === 'monthly') {\n          for (let m = 1; m <= retirementMonths; m++) {\n            const w = inflatedW * Math.pow(1 + infM, m - 1);\n            reqCorpus += w / Math.pow(1 + iPost, m);\n          }\n        } else {\n          let tempCorpus = 0;\n          let low = 0, high = inflatedW * 12 * yearsInRet * 2;\n          for (let iter = 0; iter < 100; iter++) {\n            tempCorpus = (low + high) / 2;\n            let balance = tempCorpus;\n            let ok = true;\n            for (let y = 1; y <= yearsInRet; y++) {\n              const currentW = inflatedW * Math.pow(1 + inf / 100, y - 1);\n              const yearStart = balance;\n              for (let m = 1; m <= 12; m++) {\n                balance -= currentW;\n              }\n              if (balance < 0) {\n                ok = false;\n                break;\n              }\n              const interest = Math.max(0, yearStart * (postR / 100) - currentW * (postR / 100) * 6.5);\n              balance += interest;\n            }\n            if (ok) high = tempCorpus;\n            else low = tempCorpus;\n          }\n          reqCorpus = high;\n        }\n        \n        // Pre retirement SIP accumulation to reach reqCorpus\n        const iPre = FinanceEngine.getMonthlyRate(preR);\n        const preMonths = yearsToRet * 12;\n        let reqSIP = 0;\n        if (compoundingFreq === 'monthly') {\n          reqSIP = reqCorpus * iPre / ((Math.pow(1 + iPre, preMonths) - 1) * (1 + iPre));\n        } else {\n          let low = 0, high = reqCorpus;\n          for (let iter = 0; iter < 100; iter++) {\n            const mid = (low + high) / 2;\n            const rows = FinanceEngine.calculateGrowth(0, mid, yearsToRet, preR, 'yearly', 0);\n            if (rows[rows.length - 1].corpus < reqCorpus) low = mid;\n            else high = mid;\n          }\n          reqSIP = low;\n        }\n        \n        document.getElementById('required-corpus').textContent = FinanceEngine.formatINR(reqCorpus);\n        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';\n        document.getElementById('inflated-expenses').textContent = FinanceEngine.formatINR(inflatedW) + ' / mo';\n        \n        const headers = ['Year', 'Age', 'Accumulated Corpus', 'Inflation-Adjusted Corpus'];\n        let tableRows = [];\n        let balance = 0;\n        \n        for (let y = 1; y <= yearsToRet; y++) {\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              balance = (balance + reqSIP) * (1 + iPre);\n            }\n          } else {\n            const rate = preR / 100;\n            const interest = balance * rate + reqSIP * rate * 6.5;\n            balance = balance + reqSIP * 12 + interest;\n          }\n          tableRows.push([\n            y,\n            curAge + y,\n            Math.round(balance),\n            Math.round(FinanceEngine.getRealValue(balance, inf, y))\n          ]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx <= 1 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Age ' + row[1],\n          nominal: row[2],\n          real: row[3]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal', 'real'], ['#0071e3', '#30d158']);\n        \n        const csvExporter = FinanceEngine.exportData('retirement-planner', \n          { 'Current Age': curAge, 'Retire Age': retAge, 'Life Expectancy': lifeExp, 'Current Expenses': expenses, 'Pre CAGR': preR, 'Post CAGR': postR, 'Inflation': inf },\n          { 'Required Corpus': reqCorpus, 'Required SIP': reqSIP, 'Expenses At Retirement': inflatedW },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "fire.html",
    "title": "FIRE Calculator",
    "metaDescription": "Find your Financial Independence, Retire Early (FIRE) metrics. Calculate Lean FIRE, Fat FIRE, and SWR sustainability rules.",
    "keywords": "fire calculator, lean fire, fat fire, financial independence retire early, safe withdrawal rate",
    "inputs": [
      {
        "id": "annual_expenses",
        "label": "Annual Expenses (₹)",
        "min": 100000,
        "max": 10000000,
        "step": 50000,
        "value": 600000,
        "type": "slider",
        "displayValue": "₹6,00,000"
      },
      {
        "id": "swr",
        "label": "Safe Withdrawal Rate (SWR %)",
        "min": 2,
        "max": 6,
        "step": 0.1,
        "value": 3.5,
        "type": "slider",
        "displayValue": "3.5%"
      },
      {
        "id": "current_savings",
        "label": "Current Net Worth (₹)",
        "min": 0,
        "max": 50000000,
        "step": 100000,
        "value": 2000000,
        "type": "slider",
        "displayValue": "₹20,00,000"
      },
      {
        "id": "monthly_savings",
        "label": "Monthly Savings Rate (₹)",
        "min": 0,
        "max": 500000,
        "step": 2000,
        "value": 40000,
        "type": "slider",
        "displayValue": "₹40,000"
      },
      {
        "id": "return_rate",
        "label": "Return CAGR (%)",
        "min": 4,
        "max": 20,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      }
    ],
    "results": [
      {
        "id": "fire-number",
        "label": "Standard FIRE Number"
      },
      {
        "id": "lean-fire",
        "label": "Lean FIRE"
      },
      {
        "id": "fat-fire",
        "label": "Fat FIRE"
      },
      {
        "id": "years-to-fire",
        "label": "Years to FIRE"
      }
    ],
    "supportTax": false,
    "supportInflation": true,
    "seoContent": "\n      <h2>Financial Independence Retire Early (FIRE) Strategy</h2>\n      <p>Your FIRE Number represents the target investment portfolio size where your annual expenses are fully covered by a safe, inflation-adjusted withdrawal rate (typically 3% to 4%) indefinitely.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly',  annual_expenses: 600000, swr: 3.5, current_savings: 2000000, monthly_savings: 40000, return_rate: 12, 'inflation-rate': 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = [ 'compounding-freq', 'annual_expenses', 'swr', 'current_savings', 'monthly_savings', 'return_rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'annual_expenses' || id === 'current_savings' || id === 'monthly_savings') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'swr' || id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const expenses = state.annual_expenses;\n        const swr = state.swr;\n        const savings = state.current_savings;\n        const monthlyS = state.monthly_savings;\n        const r = state.return_rate;\n        const inf = state['inflation-rate'];\n        \n        const fireNo = expenses / (swr / 100);\n        const leanFire = fireNo * 0.75;\n        const fatFire = fireNo * 1.5;\n        \n        document.getElementById('fire-number').textContent = FinanceEngine.formatINR(fireNo);\n        document.getElementById('lean-fire').textContent = FinanceEngine.formatINR(leanFire);\n        document.getElementById('fat-fire').textContent = FinanceEngine.formatINR(fatFire);\n        \n        let fireReached = false;\n        let yearsToFire = 0;\n        \n        if (savings >= fireNo) {\n          fireReached = true;\n          yearsToFire = 0;\n        }\n        \n        const headers = ['Year', 'Annual Expenses (Inflated)', 'Net Worth', 'FIRE Target'];\n        let tableRows = [];\n        let nw = savings;\n        const i = FinanceEngine.getMonthlyRate(r);\n        \n        for (let y = 1; y <= 35; y++) {\n          const infExpenses = expenses * Math.pow(1 + inf / 100, y);\n          const yTarget = infExpenses / (swr / 100);\n          \n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              nw = (nw + monthlyS) * (1 + i);\n            }\n          } else {\n            const rate = r / 100;\n            const interestOnStart = nw * rate;\n            const interestOnDeposits = monthlyS * rate * 6.5;\n            nw = nw + (monthlyS * 12) + interestOnStart + interestOnDeposits;\n          }\n          \n          if (nw >= yTarget && !fireReached) {\n            fireReached = true;\n            yearsToFire = y;\n          }\n          \n          tableRows.push([\n            y,\n            Math.round(infExpenses),\n            Math.round(nw),\n            Math.round(yTarget)\n          ]);\n        }\n        \n        document.getElementById('years-to-fire').textContent = fireReached ? (yearsToFire === 0 ? '0 years (Already Achieved!)' : yearsToFire + ' years') : 'Out of scope (>35 yrs)';\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[3], // fire target\n          nominal: row[2]   // net worth\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#6e6e73', '#0071e3']);\n        \n        const csvExporter = FinanceEngine.exportData('fire-calculator', \n          { 'Expenses': expenses, 'SWR %': swr, 'Savings NW': savings, 'Monthly Add': monthlyS, 'CAGR %': r },\n          { 'FIRE Number': fireNo, 'Lean FIRE': leanFire, 'Fat FIRE': fatFire },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "goal.html",
    "title": "Goal Planner",
    "metaDescription": "Find required SIP and lump sum investments needed to hit a target money goal.",
    "keywords": "goal calculator, goal planner, sip goal planner, financial targets calculator",
    "inputs": [
      {
        "id": "target_goal",
        "label": "Goal Target Amount (₹)",
        "min": 10000,
        "max": 50000000,
        "step": 10000,
        "value": 5000000,
        "type": "slider",
        "displayValue": "₹50,00,000"
      },
      {
        "id": "years",
        "label": "Years to Goal",
        "min": 1,
        "max": 30,
        "step": 1,
        "value": 8,
        "type": "slider",
        "displayValue": "8"
      },
      {
        "id": "return_rate",
        "label": "Expected CAGR (%)",
        "min": 1,
        "max": 25,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      }
    ],
    "results": [
      {
        "id": "inflated-goal",
        "label": "Inflation-Adjusted Target"
      },
      {
        "id": "required-sip",
        "label": "Required Monthly SIP"
      },
      {
        "id": "required-lump",
        "label": "Required Lump Sum"
      }
    ],
    "supportTax": false,
    "supportInflation": true,
    "seoContent": "\n      <h2>Financial Goal Planning</h2>\n      <p>Estimate the target amount needed to satisfy a goal in the future, adjusting for inflation, and view the required savings rate to achieve it.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly',  target_goal: 5000000, years: 8, return_rate: 12, 'inflation-rate': 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = [ 'compounding-freq', 'target_goal', 'years', 'return_rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'target_goal') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const goal = state.target_goal;\n        const years = state.years;\n        const r = state.return_rate;\n        const inf = state['inflation-rate'];\n        \n        const inflatedGoal = goal * Math.pow(1 + inf / 100, years);\n        const i = FinanceEngine.getMonthlyRate(r);\n        const months = years * 12;\n        \n        let reqSIP = 0;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        if (compoundingFreq === 'monthly') {\n          reqSIP = inflatedGoal * i / ((Math.pow(1 + i, months) - 1) * (1 + i));\n        } else {\n          let low = 0, high = inflatedGoal;\n          for (let iter = 0; iter < 100; iter++) {\n            const mid = (low + high) / 2;\n            const rows = FinanceEngine.calculateGrowth(0, mid, years, r, 'yearly', 0);\n            if (rows[rows.length - 1].corpus < inflatedGoal) low = mid;\n            else high = mid;\n          }\n          reqSIP = low;\n        }\n        const reqLump = inflatedGoal / Math.pow(1 + r/100, years);\n        \n        document.getElementById('inflated-goal').textContent = FinanceEngine.formatINR(inflatedGoal);\n        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';\n        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);\n        \n        const headers = ['Year', 'SIP Cumulative Invested', 'SIP Corpus', 'Lump Sum Corpus'];\n        let tableRows = [];\n        let sipBal = 0;\n        let sipInvest = 0;\n        \n        for (let y = 1; y <= years; y++) {\n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              sipInvest += reqSIP;\n              sipBal = (sipBal + reqSIP) * (1 + i);\n            }\n          } else {\n            const rate = r / 100;\n            const interestOnStart = sipBal * rate;\n            const interestOnDeposits = reqSIP * rate * 6.5;\n            sipInvest += reqSIP * 12;\n            sipBal = sipBal + (reqSIP * 12) + interestOnStart + interestOnDeposits;\n          }\n          const lumpBal = reqLump * Math.pow(1 + r/100, y);\n          tableRows.push([\n            y,\n            Math.round(sipInvest),\n            Math.round(sipBal),\n            Math.round(lumpBal)\n          ]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[2],\n          nominal: row[3]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);\n        \n        const csvExporter = FinanceEngine.exportData('goal-planner', \n          { 'Goal': goal, 'Years': years, 'CAGR %': r, 'Inflation': inf },\n          { 'Inflated Target': inflatedGoal, 'Required SIP': reqSIP, 'Required Lump': reqLump },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "education-planner.html",
    "title": "Education Planner",
    "metaDescription": "Plan and invest for your child's higher education costs. Adjust for education-specific inflation and mutual fund compounding.",
    "keywords": "education planner, college fund calculator, child education corpus, sip college fund",
    "inputs": [
      {
        "id": "college_cost",
        "label": "Current College Admission Cost (₹)",
        "min": 100000,
        "max": 20000000,
        "step": 100000,
        "value": 2000000,
        "type": "slider",
        "displayValue": "₹20,00,000"
      },
      {
        "id": "years_to_college",
        "label": "Years until College",
        "min": 1,
        "max": 21,
        "step": 1,
        "value": 12,
        "type": "slider",
        "displayValue": "12"
      },
      {
        "id": "return_rate",
        "label": "Expected CAGR (%)",
        "min": 4,
        "max": 20,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      }
    ],
    "results": [
      {
        "id": "inflated-cost",
        "label": "Inflated College Cost"
      },
      {
        "id": "required-sip",
        "label": "Required Monthly SIP"
      },
      {
        "id": "required-lump",
        "label": "Required Lump Sum"
      }
    ],
    "supportTax": false,
    "supportInflation": true,
    "seoContent": "\n      <h2>Education Cost Inflation Planning</h2>\n      <p>Education costs in India often expand at 8% to 10% annually, which is higher than normal CPI inflation. Accumulating a target fund is crucial.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly',  college_cost: 2000000, years_to_college: 12, return_rate: 12, 'inflation-rate': 10 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = [ 'compounding-freq', 'college_cost', 'years_to_college', 'return_rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'college_cost') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const cost = state.college_cost;\n        const years = state.years_to_college;\n        const r = state.return_rate;\n        const inf = state['inflation-rate'];\n        \n        const inflated = cost * Math.pow(1 + inf / 100, years);\n        const i = FinanceEngine.getMonthlyRate(r);\n        const months = years * 12;\n        \n        let reqSIP = 0;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        if (compoundingFreq === 'monthly') {\n          reqSIP = inflated * i / ((Math.pow(1 + i, months) - 1) * (1 + i));\n        } else {\n          let low = 0, high = inflated;\n          for (let iter = 0; iter < 100; iter++) {\n            const mid = (low + high) / 2;\n            const rows = FinanceEngine.calculateGrowth(0, mid, years, r, 'yearly', 0);\n            if (rows[rows.length - 1].corpus < inflated) low = mid;\n            else high = mid;\n          }\n          reqSIP = low;\n        }\n        const reqLump = inflated / Math.pow(1 + r/100, years);\n        \n        document.getElementById('inflated-cost').textContent = FinanceEngine.formatINR(inflated);\n        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';\n        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);\n        \n        const headers = ['Year', 'SIP Invested', 'SIP Corpus', 'Lump Sum Corpus'];\n        let tableRows = [];\n        let sipBal = 0;\n        let sipInvest = 0;\n        for (let y = 1; y <= years; y++) {\n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              sipInvest += reqSIP;\n              sipBal = (sipBal + reqSIP) * (1 + i);\n            }\n          } else {\n            const rate = r / 100;\n            const interestOnStart = sipBal * rate;\n            const interestOnDeposits = reqSIP * rate * 6.5;\n            sipInvest += reqSIP * 12;\n            sipBal = sipBal + (reqSIP * 12) + interestOnStart + interestOnDeposits;\n          }\n          const lump = reqLump * Math.pow(1 + r/100, y);\n          tableRows.push([y, Math.round(sipInvest), Math.round(sipBal), Math.round(lump)]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[2],\n          nominal: row[3]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);\n        \n        const csvExporter = FinanceEngine.exportData('education-planner', \n          { 'Current Cost': cost, 'Years': years, 'Return %': r, 'Inflation %': inf },\n          { 'Inflated Cost': inflated, 'SIP': reqSIP, 'Lump Sum': reqLump },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "marriage-planner.html",
    "title": "Marriage Planner",
    "metaDescription": "Plan for wedding expenses. Compute required monthly savings and lump sum targets with inflation adjustments.",
    "keywords": "marriage planner, wedding cost calculator, wedding savings planner, wedding fund sip",
    "inputs": [
      {
        "id": "wedding_cost",
        "label": "Current Marriage Cost Estimate (₹)",
        "min": 100000,
        "max": 20000000,
        "step": 100000,
        "value": 2000000,
        "type": "slider",
        "displayValue": "₹20,00,000"
      },
      {
        "id": "years_to_marriage",
        "label": "Years to Wedding",
        "min": 1,
        "max": 15,
        "step": 1,
        "value": 6,
        "type": "slider",
        "displayValue": "6"
      },
      {
        "id": "return_rate",
        "label": "Expected CAGR (%)",
        "min": 4,
        "max": 20,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      }
    ],
    "results": [
      {
        "id": "inflated-cost",
        "label": "Inflated Wedding Cost"
      },
      {
        "id": "required-sip",
        "label": "Required Monthly SIP"
      },
      {
        "id": "required-lump",
        "label": "Required Lump Sum"
      }
    ],
    "supportTax": false,
    "supportInflation": true,
    "seoContent": "\n      <h2>Wedding Goal Planner</h2>\n      <p>Estimate weddings budgets inflation over time and secure capital allocation rules for the goal.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly',  wedding_cost: 2000000, years_to_marriage: 6, return_rate: 12, 'inflation-rate': 7 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = [ 'compounding-freq', 'wedding_cost', 'years_to_marriage', 'return_rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'wedding_cost') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const cost = state.wedding_cost;\n        const years = state.years_to_marriage;\n        const r = state.return_rate;\n        const inf = state['inflation-rate'];\n        \n        const inflated = cost * Math.pow(1 + inf / 100, years);\n        const i = FinanceEngine.getMonthlyRate(r);\n        const months = years * 12;\n        \n        let reqSIP = 0;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        if (compoundingFreq === 'monthly') {\n          reqSIP = inflated * i / ((Math.pow(1 + i, months) - 1) * (1 + i));\n        } else {\n          let low = 0, high = inflated;\n          for (let iter = 0; iter < 100; iter++) {\n            const mid = (low + high) / 2;\n            const rows = FinanceEngine.calculateGrowth(0, mid, years, r, 'yearly', 0);\n            if (rows[rows.length - 1].corpus < inflated) low = mid;\n            else high = mid;\n          }\n          reqSIP = low;\n        }\n        const reqLump = inflated / Math.pow(1 + r/100, years);\n        \n        document.getElementById('inflated-cost').textContent = FinanceEngine.formatINR(inflated);\n        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';\n        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);\n        \n        const headers = ['Year', 'SIP Invested', 'SIP Corpus', 'Lump Sum Corpus'];\n        let tableRows = [];\n        let sipBal = 0;\n        let sipInvest = 0;\n        for (let y = 1; y <= years; y++) {\n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              sipInvest += reqSIP;\n              sipBal = (sipBal + reqSIP) * (1 + i);\n            }\n          } else {\n            const rate = r / 100;\n            const interestOnStart = sipBal * rate;\n            const interestOnDeposits = reqSIP * rate * 6.5;\n            sipInvest += reqSIP * 12;\n            sipBal = sipBal + (reqSIP * 12) + interestOnStart + interestOnDeposits;\n          }\n          const lump = reqLump * Math.pow(1 + r/100, y);\n          tableRows.push([y, Math.round(sipInvest), Math.round(sipBal), Math.round(lump)]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[2],\n          nominal: row[3]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);\n        \n        const csvExporter = FinanceEngine.exportData('marriage-planner', \n          { 'Current Cost': cost, 'Years': years, 'Return %': r, 'Inflation %': inf },\n          { 'Inflated Cost': inflated, 'SIP': reqSIP, 'Lump': reqLump },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "house-down-payment.html",
    "title": "House Down Payment Planner",
    "metaDescription": "Plan for your dream house down payment. Model property value inflation, custom down payment percentage, and investment SIP rules.",
    "keywords": "house down payment planner, home loan down payment, house saving calculator",
    "inputs": [
      {
        "id": "property_value",
        "label": "Target Property Value Today (₹)",
        "min": 1000000,
        "max": 100000000,
        "step": 500000,
        "value": 8000000,
        "type": "slider",
        "displayValue": "₹80,00,000"
      },
      {
        "id": "down_pay_pct",
        "label": "Down Payment (%)",
        "min": 10,
        "max": 100,
        "step": 5,
        "value": 20,
        "type": "slider",
        "displayValue": "20%"
      },
      {
        "id": "years",
        "label": "Years to Purchase",
        "min": 1,
        "max": 15,
        "step": 1,
        "value": 5,
        "type": "slider",
        "displayValue": "5"
      },
      {
        "id": "return_rate",
        "label": "Expected CAGR (%)",
        "min": 4,
        "max": 20,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      }
    ],
    "results": [
      {
        "id": "inflated-downpayment",
        "label": "Required Down Payment"
      },
      {
        "id": "required-sip",
        "label": "Required Monthly SIP"
      },
      {
        "id": "required-lump",
        "label": "Required Lump Sum"
      }
    ],
    "supportTax": false,
    "supportInflation": true,
    "seoContent": "\n      <h2>Real Estate Buying Planner</h2>\n      <p>Estimate the inflated cost of your target down payment and create a savings strategy.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly',  property_value: 8000000, down_pay_pct: 20, years: 5, return_rate: 12, 'inflation-rate': 7 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = [ 'compounding-freq', 'property_value', 'down_pay_pct', 'years', 'return_rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'property_value') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'down_pay_pct' || id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const val = state.property_value;\n        const pct = state.down_pay_pct;\n        const years = state.years;\n        const r = state.return_rate;\n        const inf = state['inflation-rate'];\n        \n        const inflatedProp = val * Math.pow(1 + inf / 100, years);\n        const reqDownPayment = inflatedProp * (pct / 100);\n        \n        const i = FinanceEngine.getMonthlyRate(r);\n        const months = years * 12;\n        let reqSIP = 0;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        if (compoundingFreq === 'monthly') {\n          reqSIP = reqDownPayment * i / ((Math.pow(1 + i, months) - 1) * (1 + i));\n        } else {\n          let low = 0, high = reqDownPayment;\n          for (let iter = 0; iter < 100; iter++) {\n            const mid = (low + high) / 2;\n            const rows = FinanceEngine.calculateGrowth(0, mid, years, r, 'yearly', 0);\n            if (rows[rows.length - 1].corpus < reqDownPayment) low = mid;\n            else high = mid;\n          }\n          reqSIP = low;\n        }\n        const reqLump = reqDownPayment / Math.pow(1 + r/100, years);\n        \n        document.getElementById('inflated-downpayment').textContent = FinanceEngine.formatINR(reqDownPayment);\n        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';\n        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);\n        \n        const headers = ['Year', 'SIP Invested', 'SIP Corpus', 'Lump Sum Corpus'];\n        let tableRows = [];\n        let sipBal = 0;\n        let sipInvest = 0;\n        for (let y = 1; y <= years; y++) {\n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              sipInvest += reqSIP;\n              sipBal = (sipBal + reqSIP) * (1 + i);\n            }\n          } else {\n            const rate = r / 100;\n            const interestOnStart = sipBal * rate;\n            const interestOnDeposits = reqSIP * rate * 6.5;\n            sipInvest += reqSIP * 12;\n            sipBal = sipBal + (reqSIP * 12) + interestOnStart + interestOnDeposits;\n          }\n          const lump = reqLump * Math.pow(1 + r/100, y);\n          tableRows.push([y, Math.round(sipInvest), Math.round(sipBal), Math.round(lump)]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[2],\n          nominal: row[3]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);\n        \n        const csvExporter = FinanceEngine.exportData('house-downpayment-planner', \n          { 'Prop Value': val, 'Down Pay %': pct, 'Years': years, 'Return %': r, 'Property Inflation %': inf },\n          { 'Down Payment Required': reqDownPayment, 'SIP': reqSIP, 'Lump Sum': reqLump },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "child-corpus.html",
    "title": "Child Corpus Planner",
    "metaDescription": "Build a major corpus for your child's future milestones. Calculate target savings with CAGR growth and inflation.",
    "keywords": "child corpus calculator, child milestones savings, child future calculator",
    "inputs": [
      {
        "id": "target_amount",
        "label": "Desired Milestone Amount Today (₹)",
        "min": 100000,
        "max": 20000000,
        "step": 100000,
        "value": 5000000,
        "type": "slider",
        "displayValue": "₹50,00,000"
      },
      {
        "id": "current_age",
        "label": "Child's Current Age (Years)",
        "min": 0,
        "max": 17,
        "step": 1,
        "value": 2,
        "type": "slider",
        "displayValue": "2"
      },
      {
        "id": "target_age",
        "label": "Target Milestone Age (Years)",
        "min": 18,
        "max": 25,
        "step": 1,
        "value": 21,
        "type": "slider",
        "displayValue": "21"
      },
      {
        "id": "return_rate",
        "label": "Expected CAGR (%)",
        "min": 4,
        "max": 20,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      }
    ],
    "results": [
      {
        "id": "inflated-corpus",
        "label": "Inflated Target Corpus"
      },
      {
        "id": "required-sip",
        "label": "Required Monthly SIP"
      },
      {
        "id": "required-lump",
        "label": "Required Lump Sum"
      }
    ],
    "supportTax": false,
    "supportInflation": true,
    "seoContent": "\n      <h2>Child Milestones Wealth Planning</h2>\n      <p>Estimate targets for major milestones (weddings, business capital, downpayment gifts) at child milestone ages.</p>\n    ",
    "bindingScript": "\n      const defaults = { 'compounding-freq': 'monthly',  target_amount: 5000000, current_age: 2, target_age: 21, return_rate: 12, 'inflation-rate': 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = [ 'compounding-freq', 'target_amount', 'current_age', 'target_age', 'return_rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'target_amount') valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n            else if (id === 'return_rate' || id === 'inflation-rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = state[id];\n          }\n        });\n      }\n      \n      function calculate() {\n        const amt = state.target_amount;\n        const curA = state.current_age;\n        let tarA = state.target_age;\n        if (tarA <= curA) {\n          tarA = curA + 1;\n          state.target_age = tarA;\n          document.getElementById('target_age').value = tarA;\n          document.getElementById('target_age-val').textContent = tarA;\n        }\n        \n        const r = state.return_rate;\n        const inf = state['inflation-rate'];\n        \n        const years = tarA - curA;\n        const inflated = amt * Math.pow(1 + inf / 100, years);\n        const i = FinanceEngine.getMonthlyRate(r);\n        const months = years * 12;\n        \n        let reqSIP = 0;\n        const compoundingFreq = state['compounding-freq'] || 'monthly';\n        if (compoundingFreq === 'monthly') {\n          reqSIP = inflated * i / ((Math.pow(1 + i, months) - 1) * (1 + i));\n        } else {\n          let low = 0, high = inflated;\n          for (let iter = 0; iter < 100; iter++) {\n            const mid = (low + high) / 2;\n            const rows = FinanceEngine.calculateGrowth(0, mid, years, r, 'yearly', 0);\n            if (rows[rows.length - 1].corpus < inflated) low = mid;\n            else high = mid;\n          }\n          reqSIP = low;\n        }\n        const reqLump = inflated / Math.pow(1 + r/100, years);\n        \n        document.getElementById('inflated-corpus').textContent = FinanceEngine.formatINR(inflated);\n        document.getElementById('required-sip').textContent = FinanceEngine.formatINR(reqSIP) + ' / mo';\n        document.getElementById('required-lump').textContent = FinanceEngine.formatINR(reqLump);\n        \n        const headers = ['Year', 'SIP Invested', 'SIP Corpus', 'Lump Sum Corpus'];\n        let tableRows = [];\n        let sipBal = 0;\n        let sipInvest = 0;\n        for (let y = 1; y <= years; y++) {\n          const compoundingFreq = state['compounding-freq'] || 'monthly';\n          if (compoundingFreq === 'monthly') {\n            for (let m = 1; m <= 12; m++) {\n              sipInvest += reqSIP;\n              sipBal = (sipBal + reqSIP) * (1 + i);\n            }\n          } else {\n            const rate = r / 100;\n            const interestOnStart = sipBal * rate;\n            const interestOnDeposits = reqSIP * rate * 6.5;\n            sipInvest += reqSIP * 12;\n            sipBal = sipBal + (reqSIP * 12) + interestOnStart + interestOnDeposits;\n          }\n          const lump = reqLump * Math.pow(1 + r/100, y);\n          tableRows.push([y, Math.round(sipInvest), Math.round(sipBal), Math.round(lump)]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[2],\n          nominal: row[3]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#0071e3', '#30d158']);\n        \n        const csvExporter = FinanceEngine.exportData('child-corpus-planner', \n          { 'Target Amount': amt, 'Child Age': curA, 'Target Age': tarA, 'Return %': r, 'Inflation %': inf },\n          { 'Inflated Target': inflated, 'SIP': reqSIP, 'Lump Sum': reqLump },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    ",
    "supportCompounding": true
  },
  {
    "filename": "net-worth-projection.html",
    "title": "Net Worth Projection",
    "metaDescription": "Model your future net worth by combining current assets, debts, yearly savings additions, and expected growth rates.",
    "keywords": "net worth projection, wealth builder calculator, asset liability projection",
    "inputs": [
      {
        "id": "equity_assets",
        "label": "Equity Assets (₹)",
        "min": 0,
        "max": 50000000,
        "step": 100000,
        "value": 2000000,
        "type": "slider",
        "displayValue": "₹20,00,000"
      },
      {
        "id": "debt_assets",
        "label": "Debt / Cash Assets (₹)",
        "min": 0,
        "max": 20000000,
        "step": 50000,
        "value": 1000000,
        "type": "slider",
        "displayValue": "₹10,00,000"
      },
      {
        "id": "liabilities",
        "label": "Total Outstanding Debts (₹)",
        "min": 0,
        "max": 20000000,
        "step": 50000,
        "value": 500000,
        "type": "slider",
        "displayValue": "₹5,00,000"
      },
      {
        "id": "annual_savings",
        "label": "Yearly Savings Additions (₹)",
        "min": 0,
        "max": 5000000,
        "step": 20000,
        "value": 500000,
        "type": "slider",
        "displayValue": "₹5,00,000"
      },
      {
        "id": "growth_rate",
        "label": "Average Asset Growth CAGR (%)",
        "min": 1,
        "max": 25,
        "step": 0.5,
        "value": 10,
        "type": "slider",
        "displayValue": "10%"
      }
    ],
    "results": [
      {
        "id": "net-worth",
        "label": "Current Net Worth"
      },
      {
        "id": "projected-assets",
        "label": "Assets (15 Yrs)"
      },
      {
        "id": "projected-nw",
        "label": "Net Worth (15 Yrs)"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "seoContent": "\n      <h2>Projecting Net Worth Expansion</h2>\n      <p>Your net worth is defined as Total Assets minus Total Liabilities. Growing this number involves growing assets while paying down debt.</p>\n    ",
    "bindingScript": "\n      const defaults = { equity_assets: 2000000, debt_assets: 1000000, liabilities: 500000, annual_savings: 500000, growth_rate: 10 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['equity_assets', 'debt_assets', 'liabilities', 'annual_savings', 'growth_rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'growth_rate') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n          }\n        });\n      }\n      \n      function calculate() {\n        const equity = state.equity_assets;\n        const debt = state.debt_assets;\n        const liab = state.liabilities;\n        const savings = state.annual_savings;\n        const growth = state.growth_rate;\n        \n        const curNW = equity + debt - liab;\n        \n        const headers = ['Year', 'Assets', 'Liabilities', 'Net Worth'];\n        let tableRows = [];\n        let runningAssets = equity + debt;\n        let runningLiab = liab;\n        \n        for (let y = 1; y <= 15; y++) {\n          runningAssets = runningAssets * (1 + growth / 100) + savings;\n          runningLiab = Math.max(0, runningLiab - savings * 0.2); // assume paying off 20% of savings towards liabilities\n          tableRows.push([y, Math.round(runningAssets), Math.round(runningLiab), Math.round(runningAssets - runningLiab)]);\n        }\n        \n        document.getElementById('net-worth').textContent = FinanceEngine.formatINR(curNW);\n        document.getElementById('projected-assets').textContent = FinanceEngine.formatINR(runningAssets);\n        document.getElementById('projected-nw').textContent = FinanceEngine.formatINR(runningAssets - runningLiab);\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[2], // liabilities\n          nominal: row[3]   // net worth\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#e5484d', '#30d158']);\n        \n        const csvExporter = FinanceEngine.exportData('net-worth-projection', \n          { 'Equity': equity, 'Debt': debt, 'Liabilities': liab, 'Savings Addition': savings, 'Growth CAGR': growth },\n          { 'Current NW': curNW, 'Assets 15Yr': runningAssets, 'Net Worth 15Yr': runningAssets - runningLiab },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "asset-allocation.html",
    "title": "Asset Allocation Calculator",
    "metaDescription": "Rebalance your portfolio by calculating current allocation deviations from target equity, debt, gold, and cash weights.",
    "keywords": "asset allocation calculator, portfolio rebalancing tool, target asset weights",
    "inputs": [
      {
        "id": "equity_val",
        "label": "Current Equity (₹)",
        "min": 0,
        "max": 20000000,
        "step": 50000,
        "value": 500000,
        "type": "slider",
        "displayValue": "₹5,00,000"
      },
      {
        "id": "debt_val",
        "label": "Current Debt (₹)",
        "min": 0,
        "max": 20000000,
        "step": 50000,
        "value": 300000,
        "type": "slider",
        "displayValue": "₹3,00,000"
      },
      {
        "id": "gold_val",
        "label": "Current Gold (₹)",
        "min": 0,
        "max": 10000000,
        "step": 20000,
        "value": 100000,
        "type": "slider",
        "displayValue": "₹1,00,000"
      },
      {
        "id": "cash_val",
        "label": "Current Cash (₹)",
        "min": 0,
        "max": 10000000,
        "step": 10000,
        "value": 100000,
        "type": "slider",
        "displayValue": "₹1,00,000"
      },
      {
        "id": "target_equity",
        "label": "Target Equity (%)",
        "min": 0,
        "max": 100,
        "step": 5,
        "value": 60,
        "type": "slider",
        "displayValue": "60%"
      },
      {
        "id": "target_debt",
        "label": "Target Debt (%)",
        "min": 0,
        "max": 100,
        "step": 5,
        "value": 20,
        "type": "slider",
        "displayValue": "20%"
      },
      {
        "id": "target_gold",
        "label": "Target Gold (%)",
        "min": 0,
        "max": 100,
        "step": 5,
        "value": 10,
        "type": "slider",
        "displayValue": "10%"
      }
    ],
    "results": [
      {
        "id": "total-portfolio",
        "label": "Total Portfolio Value"
      },
      {
        "id": "rebalance-action",
        "label": "Rebalance Status",
        "subLabel": "Requires adjustments"
      }
    ],
    "customInputsHtml": "\n      <div class=\"input-group\">\n        <div class=\"input-label-row\">\n          <label>Target Cash (%)</label>\n          <span id=\"target_cash-val\" style=\"font-weight:600; color:var(--accent-color);\">10%</span>\n        </div>\n        <div style=\"font-size:0.8rem; color:var(--text-secondary); margin-top:0.25rem; line-height:1.4;\">\n          Calculated automatically (100% - Target Equity - Target Debt - Target Gold)\n        </div>\n      </div>\n    ",
    "supportTax": false,
    "supportInflation": false,
    "noChart": false,
    "chartLegend": "\n      <div class=\"legend-item\"><span class=\"legend-color\" style=\"background-color: #0071e3;\"></span>Equity</div>\n      <div class=\"legend-item\"><span class=\"legend-color\" style=\"background-color: #30d158;\"></span>Debt</div>\n      <div class=\"legend-item\"><span class=\"legend-color\" style=\"background-color: #ffd60a;\"></span>Gold</div>\n      <div class=\"legend-item\"><span class=\"legend-color\" style=\"background-color: #86868b;\"></span>Cash</div>\n    ",
    "seoContent": "\n      <h2>Portfolio Rebalancing Analysis</h2>\n      <p>Maintaining target asset allocation weights secures optimal risk-adjusted returns. Rebalancing periodically prevents style drift.</p>\n    ",
    "bindingScript": "\n      const defaults = { equity_val: 500000, debt_val: 300000, gold_val: 100000, cash_val: 100000, target_equity: 60, target_debt: 20, target_gold: 10 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['equity_val', 'debt_val', 'gold_val', 'cash_val', 'target_equity', 'target_debt', 'target_gold'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id.startsWith('target_')) valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n          }\n        });\n      }\n      \n      function calculate() {\n        const eq = state.equity_val;\n        const dt = state.debt_val;\n        const gd = state.gold_val;\n        const cs = state.cash_val;\n        const total = eq + dt + gd + cs;\n        \n        let tEq = state.target_equity;\n        let tDt = state.target_debt;\n        let tGd = state.target_gold;\n        let tCs = 100 - (tEq + tDt + tGd);\n        if (tCs < 0) {\n          tCs = 0;\n          const sum = tEq + tDt + tGd;\n          tEq = Math.round((tEq / sum) * 100);\n          tDt = Math.round((tDt / sum) * 100);\n          tGd = 100 - (tEq + tDt);\n        }\n        \n        const targetCashVal = document.getElementById('target_cash-val');\n        if (targetCashVal) {\n          targetCashVal.textContent = tCs + '%';\n        }\n        \n        const currentAlloc = {\n          equity: total > 0 ? (eq / total) * 100 : 0,\n          debt: total > 0 ? (dt / total) * 100 : 0,\n          gold: total > 0 ? (gd / total) * 100 : 0,\n          cash: total > 0 ? (cs / total) * 100 : 0\n        };\n        \n        const targetAlloc = { equity: tEq, debt: tDt, gold: tGd, cash: tCs };\n        \n        const requiredAmounts = {\n          equity: total * (tEq / 100),\n          debt: total * (tDt / 100),\n          gold: total * (tGd / 100),\n          cash: total * (tCs / 100)\n        };\n        \n        const deviation = {\n          equity: eq - requiredAmounts.equity,\n          debt: dt - requiredAmounts.debt,\n          gold: gd - requiredAmounts.gold,\n          cash: cs - requiredAmounts.cash\n        };\n        \n        document.getElementById('total-portfolio').textContent = FinanceEngine.formatINR(total);\n        \n        let rebalanceNeeded = false;\n        const devThreshold = 5;\n        for (const k in currentAlloc) {\n          if (Math.abs(currentAlloc[k] - targetAlloc[k]) > devThreshold) rebalanceNeeded = true;\n        }\n        document.getElementById('rebalance-action').textContent = rebalanceNeeded ? 'Action Needed' : 'Balanced';\n        \n        const headers = ['Asset Class', 'Current Value', 'Current Alloc %', 'Target Alloc %', 'Target Value', 'Adjustment (Buy/Sell)'];\n        const tableRows = [\n          ['Equity', eq, currentAlloc.equity.toFixed(1) + '%', targetAlloc.equity + '%', Math.round(requiredAmounts.equity), Math.round(-deviation.equity)],\n          ['Debt', dt, currentAlloc.debt.toFixed(1) + '%', targetAlloc.debt + '%', Math.round(requiredAmounts.debt), Math.round(-deviation.debt)],\n          ['Gold', gd, currentAlloc.gold.toFixed(1) + '%', targetAlloc.gold + '%', Math.round(requiredAmounts.gold), Math.round(-deviation.gold)],\n          ['Cash', cs, currentAlloc.cash.toFixed(1) + '%', targetAlloc.cash + '%', Math.round(requiredAmounts.cash), Math.round(-deviation.cash)]\n        ];\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        \n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => {\n            if (idx === 0 || idx === 2 || idx === 3) return '<td>' + v + '</td>';\n            const valStr = FinanceEngine.formatINR(Math.abs(v), false);\n            if (idx === 5) {\n              const color = v > 0 ? 'var(--success-color)' : (v < 0 ? 'var(--text-primary)' : 'var(--text-secondary)');\n              const sign = v > 0 ? 'Buy ' : (v < 0 ? 'Sell ' : '');\n              return `<td style=\"color:\\${color}; font-weight:600;\">\\${sign}\\${v === 0 ? 'No Change' : valStr}</td>`;\n            }\n            return '<td>' + valStr + '</td>';\n          }).join('') + '</tr>'\n        ).join('');\n        \n        const slices = [\n          { label: 'Equity', value: eq, color: '#0071e3' },\n          { label: 'Debt', value: dt, color: '#30d158' },\n          { label: 'Gold', value: gd, color: '#ffd60a' },\n          { label: 'Cash', value: cs, color: '#86868b' }\n        ];\n        FinanceEngine.renderDonutChart('chart-container', slices);\n        \n        const csvExporter = FinanceEngine.exportData('asset-allocation', \n          { 'Current Equity': eq, 'Current Debt': dt, 'Current Gold': gd, 'Current Cash': cs },\n          { 'Total Portfolio': total },\n          headers,\n          tableRows.map(r => [r[0], r[1], r[2], r[3], r[4], r[5]])\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "cagr.html",
    "title": "CAGR Calculator",
    "metaDescription": "Find the Compound Annual Growth Rate (CAGR) of your investments over any period of years.",
    "keywords": "cagr calculator, compound annual growth rate, cagr calculation formula, investment return cagr",
    "inputs": [
      {
        "id": "initial_val",
        "label": "Initial Value (₹)",
        "min": 100,
        "max": 10000000,
        "step": 500,
        "value": 100000,
        "type": "slider",
        "displayValue": "₹1,00,000"
      },
      {
        "id": "final_val",
        "label": "Final Value (₹)",
        "min": 100,
        "max": 50000000,
        "step": 1000,
        "value": 250000,
        "type": "slider",
        "displayValue": "₹2,50,000"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 0.1,
        "max": 40,
        "step": 0.1,
        "value": 5,
        "type": "slider",
        "displayValue": "5"
      }
    ],
    "results": [
      {
        "id": "cagr-result",
        "label": "Compound Annual Growth Rate (CAGR)"
      },
      {
        "id": "absolute-return",
        "label": "Absolute Return"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "noChart": true,
    "noTable": true,
    "seoContent": "\n      <h2>Compound Annual Growth Rate</h2>\n      <p>CAGR measures the mean annual growth rate of an investment over a specified period of time longer than one year, assuming the investment compounds annually.</p>\n    ",
    "bindingScript": "\n      const defaults = { initial_val: 100000, final_val: 250000, years: 5 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['initial_val', 'final_val', 'years'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'years') valDisplay.textContent = state[id];\n            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n          }\n        });\n      }\n      \n      function calculate() {\n        const init = state.initial_val;\n        const final = state.final_val;\n        const years = state.years;\n        \n        const cagr = (Math.pow(final / init, 1 / years) - 1) * 100;\n        const absReturn = ((final - init) / init) * 100;\n        \n        document.getElementById('cagr-result').textContent = cagr.toFixed(2) + '%';\n        document.getElementById('absolute-return').textContent = absReturn.toFixed(2) + '%';\n        \n        const csvExporter = FinanceEngine.exportData('cagr-calculator', \n          { 'Initial': init, 'Final': final, 'Years': years },\n          { 'CAGR %': cagr, 'Absolute Return %': absReturn }\n        );\n        if (document.getElementById('btn-export-csv')) document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;\n        if (document.getElementById('btn-export-json')) document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;\n        if (document.getElementById('btn-copy-table')) document.getElementById('btn-copy-table').style.display = 'none';\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "xirr.html",
    "title": "XIRR Calculator",
    "metaDescription": "Calculate the Extended Internal Rate of Return (XIRR) for irregular transaction cashflows (SIPs, lump sums, and withdrawals).",
    "keywords": "xirr calculator, irregular cashflow return, xirr mutual funds, xirr solver",
    "inputs": [],
    "results": [
      {
        "id": "xirr-result",
        "label": "Calculated XIRR (Annualized CAGR)"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "noChart": true,
    "noTable": true,
    "customInputsHtml": "\n      <div id=\"cashflow-builder\" style=\"margin-top: 1.5rem;\">\n        <span style=\"font-weight: 600; display:block; margin-bottom: 0.5rem;\">Cash Flows (Negative = Investment, Positive = Return/Balance)</span>\n        <div id=\"flows-list\" style=\"display:flex; flex-direction:column; gap:0.75rem;\">\n          <!-- Flow rows -->\n        </div>\n        <button class=\"btn btn-secondary\" id=\"btn-add-flow\" style=\"margin-top: 1rem; width:100%; justify-content:center;\">+ Add Cash Flow</button>\n      </div>\n    ",
    "seoContent": "\n      <h2>Calculating Returns on Irregular Cash Flows</h2>\n      <p>XIRR is the standard method used in personal finance to compute annualized CAGR when investments, additions, and withdrawals occur on irregular dates.</p>\n    ",
    "bindingScript": "\n      let cashFlows = [\n        { date: '2025-01-01', amount: -10000 },\n        { date: '2025-06-15', amount: -5000 },\n        { date: '2026-01-01', amount: 17000 }\n      ];\n      \n      function renderFlows() {\n        const container = document.getElementById('flows-list');\n        container.innerHTML = '';\n        \n        cashFlows.forEach((flow, idx) => {\n          const row = document.createElement('div');\n          row.style.display = 'flex';\n          row.style.gap = '0.5rem';\n          row.style.alignItems = 'center';\n          \n          row.innerHTML = `\n            <input type=\"date\" value=\"${flow.date}\" class=\"flow-date\" style=\"flex: 1;\" aria-label=\"Date\">\n            <input type=\"number\" value=\"${flow.amount}\" class=\"flow-amount\" style=\"flex: 1;\" placeholder=\"Amount (negative if invested)\" aria-label=\"Amount\">\n            <button class=\"btn-delete-flow\" style=\"background:none; border:none; color:var(--text-secondary); cursor:pointer; padding: 0.5rem;\" aria-label=\"Delete\">\n              <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"currentColor\"><path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\"/></svg>\n            </button>\n          `;\n          \n          row.querySelector('.flow-date').addEventListener('change', (e) => {\n            cashFlows[idx].date = e.target.value;\n            calculate();\n          });\n          \n          row.querySelector('.flow-amount').addEventListener('input', (e) => {\n            cashFlows[idx].amount = parseFloat(e.target.value) || 0;\n            calculate();\n          });\n          \n          row.querySelector('.btn-delete-flow').addEventListener('click', () => {\n            if (cashFlows.length <= 2) {\n              FinanceEngine.showToast('At least 2 cash flows are required');\n              return;\n            }\n            cashFlows.splice(idx, 1);\n            renderFlows();\n            calculate();\n          });\n          \n          container.appendChild(row);\n        });\n      }\n      \n      function calculate() {\n        const parsedFlows = cashFlows.map(f => ({\n          date: new Date(f.date),\n          amount: f.amount\n        })).filter(f => !isNaN(f.date.getTime()));\n        \n        const xirr = FinanceEngine.calculateXIRR(parsedFlows);\n        const resultDisplay = document.getElementById('xirr-result');\n        \n        if (isNaN(xirr)) {\n          resultDisplay.textContent = 'Solver Error (check values)';\n        } else {\n          resultDisplay.textContent = xirr.toFixed(2) + '%';\n        }\n        \n        const csvExporter = FinanceEngine.exportData('xirr-calculator', \n          { 'Cashflows Count': cashFlows.length },\n          { 'XIRR %': xirr },\n          ['Date', 'Amount'],\n          cashFlows.map(f => [f.date, f.amount])\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n      }\n      \n      document.getElementById('btn-add-flow').onclick = () => {\n        const lastFlow = cashFlows[cashFlows.length - 1];\n        const nextDate = new Date(lastFlow.date);\n        nextDate.setMonth(nextDate.getMonth() + 6);\n        \n        cashFlows.push({\n          date: nextDate.toISOString().slice(0, 10),\n          amount: -5000\n        });\n        renderFlows();\n        calculate();\n      };\n      \n      renderFlows();\n      calculate();\n    "
  },
  {
    "filename": "inflation.html",
    "title": "Inflation Calculator",
    "metaDescription": "Measure the impact of inflation on your money. Calculate future purchasing power erosion and nominal cash equivalents.",
    "keywords": "inflation calculator, purchasing power erosion, future value inflation",
    "inputs": [
      {
        "id": "amount",
        "label": "Current Amount (₹)",
        "min": 100,
        "max": 10000000,
        "step": 500,
        "value": 100000,
        "type": "slider",
        "displayValue": "₹1,00,000"
      },
      {
        "id": "inflation_rate",
        "label": "Average Annual Inflation (%)",
        "min": 1,
        "max": 15,
        "step": 0.5,
        "value": 6,
        "type": "slider",
        "displayValue": "6%"
      },
      {
        "id": "years",
        "label": "Duration (Years)",
        "min": 1,
        "max": 40,
        "step": 1,
        "value": 10,
        "type": "slider",
        "displayValue": "10"
      }
    ],
    "results": [
      {
        "id": "future-nominal",
        "label": "Future Value Required (to keep parity)"
      },
      {
        "id": "purchasing-power",
        "label": "Eroded Value (Purchasing Power)"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "seoContent": "\n      <h2>The Erosion of Purchasing Power</h2>\n      <p>Inflation decreases the real value of cash over time. An item costing ₹10,000 today will require a higher dollar/rupee amount to purchase in 10 years.</p>\n    ",
    "bindingScript": "\n      const defaults = { amount: 100000, inflation_rate: 6, years: 10 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['amount', 'inflation_rate', 'years'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const el = document.getElementById(id);\n          if (!el) return;\n          if (document.activeElement !== el) el.value = state[id]; const slider = document.getElementById(id + '-slider'); if (slider) slider.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'inflation_rate') valDisplay.textContent = state[id] + '%';\n            else if (id === 'years') valDisplay.textContent = state[id];\n            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n          }\n        });\n      }\n      \n      function calculate() {\n        const amt = state.amount;\n        const inf = state.inflation_rate;\n        const years = state.years;\n        \n        const futureNom = amt * Math.pow(1 + inf/100, years);\n        const erodedVal = amt / Math.pow(1 + inf/100, years);\n        \n        document.getElementById('future-nominal').textContent = FinanceEngine.formatINR(futureNom);\n        document.getElementById('purchasing-power').textContent = FinanceEngine.formatINR(erodedVal);\n        \n        const headers = ['Year', 'Purchasing Power', 'Nominal Cost Equivalency'];\n        let tableRows = [];\n        for (let y = 1; y <= years; y++) {\n          tableRows.push([\n            y,\n            Math.round(amt / Math.pow(1 + inf/100, y)),\n            Math.round(amt * Math.pow(1 + inf/100, y))\n          ]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          nominal: row[2], // nominal cost\n          real: row[1]     // real purchasing power\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['nominal', 'real'], ['#e5484d', '#30d158']);\n        \n        const csvExporter = FinanceEngine.exportData('inflation-calculator', \n          { 'Amount': amt, 'Inflation %': inf, 'Years': years },\n          { 'Future Nominal Required': futureNom, 'Purchasing Power': erodedVal },\n          headers,\n          tableRows\n        );\n        \n        const btnCsv = document.getElementById('btn-export-csv');\n        const btnJson = document.getElementById('btn-export-json');\n        const btnCopy = document.getElementById('btn-copy-table');\n        \n        btnCsv.replaceWith(btnCsv.cloneNode(true));\n        btnJson.replaceWith(btnJson.cloneNode(true));\n        btnCopy.replaceWith(btnCopy.cloneNode(true));\n        \n        document.getElementById('btn-export-csv').addEventListener('click', csvExporter.exportCSV);\n        document.getElementById('btn-export-json').addEventListener('click', csvExporter.exportJSON);\n        document.getElementById('btn-copy-table').addEventListener('click', () => FinanceEngine.copyTableToClipboard(headers, tableRows));\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "real-return.html",
    "title": "Real Return Calculator",
    "metaDescription": "Find your real net return on investments after subtracting tax obligations and annual inflation rates.",
    "keywords": "real return calculator, post tax real return, inflation adjusted returns",
    "inputs": [
      {
        "id": "nominal_return",
        "label": "Nominal Asset Return (%)",
        "min": 1,
        "max": 30,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      },
      {
        "id": "tax_rate",
        "label": "Your Income Tax Slab (%)",
        "min": 0,
        "max": 40,
        "step": 1,
        "value": 20,
        "type": "slider",
        "displayValue": "20%"
      },
      {
        "id": "inflation_rate",
        "label": "Expected Annual Inflation (%)",
        "min": 1,
        "max": 15,
        "step": 0.5,
        "value": 6,
        "type": "slider",
        "displayValue": "6%"
      }
    ],
    "results": [
      {
        "id": "post-tax-nominal",
        "label": "Post-Tax Nominal Return"
      },
      {
        "id": "real-return-result",
        "label": "Net Real Rate of Return"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "noChart": true,
    "noTable": true,
    "seoContent": "\n      <h2>The Real Rate of Return</h2>\n        </math>\n      </div>\n    ",
    "bindingScript": "\n      const defaults = { nominal_return: 12, tax_rate: 20, inflation_rate: 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['nominal_return', 'tax_rate', 'inflation_rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const elVal = document.getElementById(id); if (elVal && document.activeElement !== elVal) elVal.value = state[id]; const sliderVal = document.getElementById(id + '-slider'); if (sliderVal) sliderVal.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) valDisplay.textContent = state[id] + '%';\n        });\n      }\n      \n      function calculate() {\n        const nom = state.nominal_return / 100;\n        const tax = state.tax_rate / 100;\n        const inf = state.inflation_rate / 100;\n        \n        const postTaxNom = nom * (1 - tax);\n        const realReturn = ((1 + postTaxNom) / (1 + inf) - 1) * 100;\n        \n        document.getElementById('post-tax-nominal').textContent = (postTaxNom * 100).toFixed(2) + '%';\n        document.getElementById('real-return-result').textContent = realReturn.toFixed(2) + '%';\n        \n        const csvExporter = FinanceEngine.exportData('real-return-calculator', \n          { 'Nominal Return': nom*100, 'Tax Rate': tax*100, 'Inflation': inf*100 },\n          { 'Post Tax Nominal %': postTaxNom*100, 'Real Return %': realReturn }\n        );\n        if (document.getElementById('btn-export-csv')) document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;\n        if (document.getElementById('btn-export-json')) document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;\n        if (document.getElementById('btn-copy-table')) document.getElementById('btn-copy-table').style.display = 'none';\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "emi.html",
    "title": "EMI Calculator",
    "metaDescription": "Calculate Equated Monthly Installments (EMI) for home, car, or personal loans. Generate standard interest summaries and amortization schedules.",
    "keywords": "emi calculator, loan emi, home loan calculator, reducing balance emi",
    "inputs": [
      {
        "id": "loan_amount",
        "label": "Loan Amount (₹)",
        "min": 10000,
        "max": 20000000,
        "step": 10000,
        "value": 5000000,
        "type": "slider",
        "displayValue": "₹50,00,000"
      },
      {
        "id": "interest_rate",
        "label": "Interest Rate (Nominal annual %)",
        "min": 4,
        "max": 20,
        "step": 0.1,
        "value": 8.5,
        "type": "slider",
        "displayValue": "8.5%"
      },
      {
        "id": "tenure",
        "label": "Loan Tenure (Years)",
        "min": 1,
        "max": 30,
        "step": 1,
        "value": 20,
        "type": "slider",
        "displayValue": "20"
      }
    ],
    "results": [
      {
        "id": "emi-result",
        "label": "Equated Monthly Installment (EMI)"
      },
      {
        "id": "total-interest",
        "label": "Total Interest Payable"
      },
      {
        "id": "total-payment",
        "label": "Total Loan Payments"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "seoContent": "\n      <h2>Understanding Reducing Interest Loans</h2>\n      <p>EMIs are computed using a reducing balance method where interest is computed monthly on the outstanding loan balance.</p>\n    ",
    "bindingScript": "\n      const defaults = { loan_amount: 5000000, interest_rate: 8.5, tenure: 20 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['loan_amount', 'interest_rate', 'tenure'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const elVal = document.getElementById(id); if (elVal && document.activeElement !== elVal) elVal.value = state[id]; const sliderVal = document.getElementById(id + '-slider'); if (sliderVal) sliderVal.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'interest_rate') valDisplay.textContent = state[id] + '%';\n            else if (id === 'tenure') valDisplay.textContent = state[id];\n            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n          }\n        });\n      }\n      \n      function calculate() {\n        const P = state.loan_amount;\n        const R = state.interest_rate;\n        const y = state.tenure;\n        \n        const r_m = R / 12 / 100; // nominal interest rate/12\n        const m = y * 12;\n        \n        const emi = P * r_m * Math.pow(1 + r_m, m) / (Math.pow(1 + r_m, m) - 1);\n        const totalPay = emi * m;\n        const totalInt = totalPay - P;\n        \n        document.getElementById('emi-result').textContent = FinanceEngine.formatINR(emi) + ' / mo';\n        document.getElementById('total-interest').textContent = FinanceEngine.formatINR(totalInt);\n        document.getElementById('total-payment').textContent = FinanceEngine.formatINR(totalPay);\n        \n        const headers = ['Year', 'Principal Paid', 'Interest Paid', 'Total Paid', 'Remaining Balance'];\n        let tableRows = [];\n        let balance = P;\n        \n        for (let yr = 1; yr <= y; yr++) {\n          let yrInterest = 0;\n          let yrPrincipal = 0;\n          \n          for (let month = 1; month <= 12; month++) {\n            const interest = balance * r_m;\n            const principal = emi - interest;\n            yrInterest += interest;\n            yrPrincipal += principal;\n            balance -= principal;\n          }\n          \n          tableRows.push([\n            yr,\n            Math.round(yrPrincipal),\n            Math.round(yrInterest),\n            Math.round(yrPrincipal + yrInterest),\n            Math.round(Math.max(0, balance))\n          ]);\n        }\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[4], // remaining balance\n          nominal: row[4]\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested'], ['#e5484d']);\n        \n        const csvExporter = FinanceEngine.exportData('emi-calculator', \n          { 'Loan Amount': P, 'Rate': R, 'Tenure': y },\n          { 'EMI': emi, 'Total Interest': totalInt, 'Total Payment': totalPay },\n          headers,\n          tableRows\n        );\n        if (document.getElementById('btn-export-csv')) document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;\n        if (document.getElementById('btn-export-json')) document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;\n        if (document.getElementById('btn-copy-table')) document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "loan-prepayment.html",
    "title": "Loan Prepayment Calculator",
    "metaDescription": "Find interest savings and tenure reduction by prepaying lumpsum amounts or monthly top-ups on loans.",
    "keywords": "loan prepayment calculator, home loan prepayment savings, prepay emi calculator",
    "inputs": [
      {
        "id": "loan_amount",
        "label": "Loan Amount (₹)",
        "min": 10000,
        "max": 20000000,
        "step": 10000,
        "value": 5000000,
        "type": "slider",
        "displayValue": "₹50,00,000"
      },
      {
        "id": "interest_rate",
        "label": "Interest Rate (%)",
        "min": 4,
        "max": 20,
        "step": 0.1,
        "value": 8.5,
        "type": "slider",
        "displayValue": "8.5%"
      },
      {
        "id": "tenure",
        "label": "Original Tenure (Years)",
        "min": 1,
        "max": 30,
        "step": 1,
        "value": 20,
        "type": "slider",
        "displayValue": "20"
      },
      {
        "id": "prepay_monthly",
        "label": "Extra Monthly Prepayment (₹)",
        "min": 0,
        "max": 100000,
        "step": 1000,
        "value": 5000,
        "type": "slider",
        "displayValue": "₹5,000"
      }
    ],
    "results": [
      {
        "id": "total-interest-saved",
        "label": "Interest Amount Saved"
      },
      {
        "id": "months-saved",
        "label": "Tenure Saved",
        "subLabel": "Months early"
      },
      {
        "id": "new-total-interest",
        "label": "New Total Interest"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "seoContent": "\n      <h2>The Leverage of Loan Prepayment</h2>\n      <p>Adding regular pre-payments reduces your principal balance, lowering interest compound growth and saving thousands in interest payout.</p>\n    ",
    "bindingScript": "\n      const defaults = { loan_amount: 5000000, interest_rate: 8.5, tenure: 20, prepay_monthly: 5000 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['loan_amount', 'interest_rate', 'tenure', 'prepay_monthly'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const elVal = document.getElementById(id); if (elVal && document.activeElement !== elVal) elVal.value = state[id]; const sliderVal = document.getElementById(id + '-slider'); if (sliderVal) sliderVal.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'interest_rate') valDisplay.textContent = state[id] + '%';\n            else if (id === 'tenure') valDisplay.textContent = state[id];\n            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n          }\n        });\n      }\n      \n      function calculate() {\n        const P = state.loan_amount;\n        const R = state.interest_rate;\n        const y = state.tenure;\n        const extraM = state.prepay_monthly;\n        \n        const r_m = R / 12 / 100;\n        const originalMonths = y * 12;\n        const standardEMI = P * r_m * Math.pow(1 + r_m, originalMonths) / (Math.pow(1 + r_m, originalMonths) - 1);\n        \n        // 1. Original loan parameters\n        let origInt = 0;\n        let origBal = P;\n        for (let m = 1; m <= originalMonths; m++) {\n          const interest = origBal * r_m;\n          origInt += interest;\n          origBal = origBal - (standardEMI - interest);\n        }\n        \n        // 2. Prepayment loan parameters\n        let prepayInt = 0;\n        let prepayBal = P;\n        let monthsRun = 0;\n        \n        const headers = ['Year', 'Prepay Principal', 'Interest Paid', 'Prepay Balance', 'Original Balance'];\n        let tableRows = [];\n        \n        let yInt = 0;\n        let yPrinc = 0;\n        let yOriginalBal = P;\n        \n        for (let m = 1; m <= originalMonths; m++) {\n          if (prepayBal <= 0) break;\n          \n          monthsRun++;\n          const interest = prepayBal * r_m;\n          prepayInt += interest;\n          yInt += interest;\n          \n          let actualPay = standardEMI;\n          if (prepayBal + interest < standardEMI) {\n            actualPay = prepayBal + interest;\n          }\n          \n          let princ = actualPay - interest;\n          prepayBal -= princ;\n          yPrinc += princ;\n          \n          // Apply extra monthly prepayment\n          if (prepayBal > 0) {\n            const actualExtra = Math.min(prepayBal, extraM);\n            prepayBal -= actualExtra;\n            yPrinc += actualExtra;\n          }\n          \n          // Record original comparison balance\n          const origIntM = yOriginalBal * r_m;\n          yOriginalBal -= (standardEMI - origIntM);\n          if (yOriginalBal < 0) yOriginalBal = 0;\n          \n          if (m % 12 === 0 || prepayBal <= 0) {\n            const yr = Math.ceil(m / 12);\n            tableRows.push([\n              yr,\n              Math.round(yPrinc),\n              Math.round(yInt),\n              Math.round(Math.max(0, prepayBal)),\n              Math.round(yOriginalBal)\n            ]);\n            yInt = 0;\n            yPrinc = 0;\n          }\n        }\n        \n        const savedMonths = originalMonths - monthsRun;\n        const savedInterest = origInt - prepayInt;\n        \n        document.getElementById('total-interest-saved').textContent = FinanceEngine.formatINR(savedInterest);\n        document.getElementById('months-saved').textContent = savedMonths + ' months';\n        document.getElementById('new-total-interest').textContent = FinanceEngine.formatINR(prepayInt);\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => '<td>' + (idx === 0 ? v : FinanceEngine.formatINR(v, false)) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Yr ' + row[0],\n          invested: row[3], // prepay balance\n          nominal: row[4]   // original balance\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#30d158', '#e5484d']);\n        \n        const csvExporter = FinanceEngine.exportData('loan-prepayment', \n          { 'Loan Amount': P, 'Interest %': R, 'Tenure': y, 'Monthly Prepay': extraM },\n          { 'Interest Saved': savedInterest, 'Months Saved': savedMonths, 'New Interest': prepayInt },\n          headers,\n          tableRows\n        );\n        if (document.getElementById('btn-export-csv')) document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;\n        if (document.getElementById('btn-export-json')) document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;\n        if (document.getElementById('btn-copy-table')) document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "emergency-fund.html",
    "title": "Emergency Fund Calculator",
    "metaDescription": "Find your target emergency savings size. Calculate fixed rent, utilities, food, and variable medical coverages.",
    "keywords": "emergency fund calculator, contingency savings, cash reserve planner",
    "inputs": [
      {
        "id": "fixed_expenses",
        "label": "Rent / Home Loan EMI (₹)",
        "min": 0,
        "max": 200000,
        "step": 2000,
        "value": 20000,
        "type": "slider",
        "displayValue": "₹20,000"
      },
      {
        "id": "food_expenses",
        "label": "Groceries / Food Costs (₹)",
        "min": 0,
        "max": 100000,
        "step": 1000,
        "value": 10000,
        "type": "slider",
        "displayValue": "₹10,000"
      },
      {
        "id": "insurance_utilities",
        "label": "Insurance & Utilities (₹)",
        "min": 0,
        "max": 100000,
        "step": 1000,
        "value": 8000,
        "type": "slider",
        "displayValue": "₹8,000"
      },
      {
        "id": "coverage_months",
        "label": "Coverage Duration (Months)",
        "min": 3,
        "max": 12,
        "step": 1,
        "value": 6,
        "type": "slider",
        "displayValue": "6"
      }
    ],
    "results": [
      {
        "id": "target-fund",
        "label": "Total Contingency Fund"
      },
      {
        "id": "monthly-total",
        "label": "Total Monthly Expense"
      },
      {
        "id": "allocation-cash",
        "label": "Allocation: Liquid Cash (30%)"
      }
    ],
    "supportTax": false,
    "supportInflation": false,
    "noChart": false,
    "chartLegend": "\n      <div class=\"legend-item\"><span class=\"legend-color\" style=\"background-color: #ffd60a;\"></span>Cash/Savings</div>\n      <div class=\"legend-item\"><span class=\"legend-color\" style=\"background-color: #0071e3;\"></span>Liquid/Arbitrage</div>\n      <div class=\"legend-item\"><span class=\"legend-color\" style=\"background-color: #30d158;\"></span>Short-Term FD</div>\n    ",
    "seoContent": "\n      <h2>The Contingency Nest Egg</h2>\n      <p>An emergency fund provides safety against job loss, medical emergencies, or unexpected capital bills. Having 3 to 12 months is standard.</p>\n    ",
    "bindingScript": "\n      const defaults = { fixed_expenses: 20000, food_expenses: 10000, insurance_utilities: 8000, coverage_months: 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['fixed_expenses', 'food_expenses', 'insurance_utilities', 'coverage_months'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const elVal = document.getElementById(id); if (elVal && document.activeElement !== elVal) elVal.value = state[id]; const sliderVal = document.getElementById(id + '-slider'); if (sliderVal) sliderVal.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'coverage_months') valDisplay.textContent = state[id];\n            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n          }\n        });\n      }\n      \n      function calculate() {\n        const fixed = state.fixed_expenses;\n        const food = state.food_expenses;\n        const ins = state.insurance_utilities;\n        const months = state.coverage_months;\n        \n        const monthlyTotal = fixed + food + ins;\n        const targetFund = monthlyTotal * months;\n        \n        const cashAllocation = targetFund * 0.3;\n        const liquidAllocation = targetFund * 0.5;\n        const fdAllocation = targetFund * 0.2;\n        \n        document.getElementById('target-fund').textContent = FinanceEngine.formatINR(targetFund);\n        document.getElementById('monthly-total').textContent = FinanceEngine.formatINR(monthlyTotal) + ' / mo';\n        document.getElementById('allocation-cash').textContent = FinanceEngine.formatINR(cashAllocation);\n        \n        const headers = ['Asset Class', 'Recommneded %', 'Allocated Amount', 'Typical Instruments'];\n        const tableRows = [\n          ['Liquid Cash', '30%', Math.round(cashAllocation), 'Savings A/c / Instant Cash'],\n          ['Liquid / Arbitrage Funds', '50%', Math.round(liquidAllocation), 'Mutual Fund Liquid/Arbitrage'],\n          ['Short-Term FD', '20%', Math.round(fdAllocation), 'Sweep-In Fixed Deposit']\n        ];\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => idx === 2 ? '<td>' + FinanceEngine.formatINR(v, false) + '</td>' : '<td>' + v + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        // Render Donut Chart\n        const slices = [\n          { label: 'Cash', value: cashAllocation, color: '#ffd60a' },\n          { label: 'Liquid', value: liquidAllocation, color: '#0071e3' },\n          { label: 'FD', value: fdAllocation, color: '#30d158' }\n        ];\n        FinanceEngine.renderDonutChart('chart-container', slices);\n        \n        const csvExporter = FinanceEngine.exportData('emergency-fund', \n          { 'Fixed Exp': fixed, 'Food': food, 'Ins & Utl': ins, 'Coverage Months': months },\n          { 'Contingency Fund': targetFund },\n          headers,\n          tableRows\n        );\n        if (document.getElementById('btn-export-csv')) document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;\n        if (document.getElementById('btn-export-json')) document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;\n        if (document.getElementById('btn-copy-table')) document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  },
  {
    "filename": "financial-independence.html",
    "title": "FI Timeline Calculator",
    "metaDescription": "Find when your investment returns will cover your living expenses, indicating financial independence.",
    "keywords": "fi timeline, financial independence timeline, when can i retire, swr retirement timeline",
    "inputs": [
      {
        "id": "current_age",
        "label": "Current Age (Years)",
        "min": 18,
        "max": 60,
        "step": 1,
        "value": 28,
        "type": "slider",
        "displayValue": "28"
      },
      {
        "id": "net_worth",
        "label": "Current Net Worth (₹)",
        "min": 0,
        "max": 50000000,
        "step": 100000,
        "value": 1500000,
        "type": "slider",
        "displayValue": "₹15,00,000"
      },
      {
        "id": "monthly_savings",
        "label": "Monthly Savings additions (₹)",
        "min": 1000,
        "max": 500000,
        "step": 1000,
        "value": 50000,
        "type": "slider",
        "displayValue": "₹50,000"
      },
      {
        "id": "monthly_expenses",
        "label": "Monthly Living Expenses (₹)",
        "min": 5000,
        "max": 500000,
        "step": 1000,
        "value": 40000,
        "type": "slider",
        "displayValue": "₹40,000"
      },
      {
        "id": "swr",
        "label": "Safe Withdrawal Rate (SWR %)",
        "min": 2,
        "max": 6,
        "step": 0.1,
        "value": 4,
        "type": "slider",
        "displayValue": "4.0%"
      },
      {
        "id": "return_rate",
        "label": "Return CAGR (%)",
        "min": 4,
        "max": 20,
        "step": 0.5,
        "value": 12,
        "type": "slider",
        "displayValue": "12%"
      }
    ],
    "results": [
      {
        "id": "fi-age",
        "label": "Age Reaching FI"
      },
      {
        "id": "fi-corpus",
        "label": "FI Corpus Reached"
      },
      {
        "id": "years-to-fi",
        "label": "Years to FI"
      }
    ],
    "supportTax": false,
    "supportInflation": true,
    "seoContent": "\n      <h2>The Financial Independence Timeline</h2>\n      <p>Financial Independence is reached when your safe withdrawal rate (SWR) exceeds your annual living expenses adjusted for inflation.</p>\n    ",
    "bindingScript": "\n      const defaults = { current_age: 28, net_worth: 1500000, monthly_savings: 50000, monthly_expenses: 40000, swr: 4.0, return_rate: 12, 'inflation-rate': 6 };\n      let state = FinanceEngine.getUrlParams(defaults);\n      const elements = ['current_age', 'net_worth', 'monthly_savings', 'monthly_expenses', 'swr', 'return_rate', 'inflation-rate'];\n      \n      function syncUI() {\n        elements.forEach(id => {\n          const elVal = document.getElementById(id); if (elVal && document.activeElement !== elVal) elVal.value = state[id]; const sliderVal = document.getElementById(id + '-slider'); if (sliderVal) sliderVal.value = state[id];\n          const valDisplay = document.getElementById(id + '-val');\n          if (valDisplay) {\n            if (id === 'current_age' || id === 'inflation-rate') valDisplay.textContent = state[id];\n            else if (id === 'return_rate' || id === 'swr') valDisplay.textContent = state[id] + '%';\n            else valDisplay.textContent = FinanceEngine.formatINR(state[id]);\n          }\n        });\n      }\n      \n      function calculate() {\n        const curAge = state.current_age;\n        const nw = state.net_worth;\n        const savings = state.monthly_savings;\n        const expenses = state.monthly_expenses;\n        const swr = state.swr;\n        const r = state.return_rate;\n        const inf = state['inflation-rate'];\n        \n        const i = FinanceEngine.getMonthlyRate(r);\n        \n        let runningNW = nw;\n        let fiReached = false;\n        let fiAge = 'N/A';\n        let fiCorpus = 0;\n        let yearsRun = 0;\n        \n        const todayExpenses = expenses * 12;\n        const todayTarget = todayExpenses / (swr / 100);\n        if (nw >= todayTarget) {\n          fiReached = true;\n          fiAge = curAge + ' (Already Achieved!)';\n          fiCorpus = nw;\n          yearsRun = 0;\n        }\n        \n        const headers = ['Year', 'Age', 'Living Expenses (Inflated)', 'Net Worth', 'FI Target'];\n        let tableRows = [];\n        \n        for (let y = 1; y <= 40; y++) {\n          const infExpenses = expenses * 12 * Math.pow(1 + inf/100, y);\n          const fiTarget = infExpenses / (swr / 100);\n          \n          for (let m = 1; m <= 12; m++) {\n            runningNW = (runningNW + savings) * (1 + i);\n          }\n          \n          if (runningNW >= fiTarget && !fiReached) {\n            fiReached = true;\n            fiAge = curAge + y;\n            fiCorpus = runningNW;\n            yearsRun = y;\n          }\n          \n          tableRows.push([\n            y,\n            curAge + y,\n            Math.round(infExpenses),\n            Math.round(runningNW),\n            Math.round(fiTarget)\n          ]);\n        }\n        \n        document.getElementById('fi-age').textContent = fiAge;\n        document.getElementById('fi-corpus').textContent = FinanceEngine.formatINR(fiCorpus);\n        document.getElementById('years-to-fi').textContent = fiReached ? (yearsRun === 0 ? '0 (Already Achieved!)' : yearsRun + ' years') : 'Out of scope (>40 yrs)';\n        \n        const tableBody = document.getElementById('table-body');\n        const headersRow = document.getElementById('table-headers-row');\n        headersRow.innerHTML = headers.map(h => '<th>' + h + '</th>').join('');\n        tableBody.innerHTML = tableRows.map(row => \n          '<tr>' + row.map((v, idx) => (idx <= 1) ? '<td>' + v + '</td>' : '<td>' + FinanceEngine.formatINR(v, false) + '</td>').join('') + '</tr>'\n        ).join('');\n        \n        const chartData = tableRows.map(row => ({\n          label: 'Age ' + row[1],\n          invested: row[4], // target\n          nominal: row[3]   // net worth\n        }));\n        FinanceEngine.renderLineChart('chart-container', chartData, ['invested', 'nominal'], ['#6e6e73', '#30d158']);\n        \n        const csvExporter = FinanceEngine.exportData('fi-timeline', \n          { 'Age': curAge, 'Net Worth': nw, 'Savings': savings, 'Expenses': expenses, 'Return %': r },\n          { 'FI Age': fiAge, 'FI Corpus': fiCorpus, 'Years to FI': yearsRun },\n          headers,\n          tableRows\n        );\n        if (document.getElementById('btn-export-csv')) document.getElementById('btn-export-csv').onclick = csvExporter.exportCSV;\n        if (document.getElementById('btn-export-json')) document.getElementById('btn-export-json').onclick = csvExporter.exportJSON;\n        if (document.getElementById('btn-copy-table')) document.getElementById('btn-copy-table').onclick = () => FinanceEngine.copyTableToClipboard(headers, tableRows);\n      }\n      \n      elements.forEach(id => {\n        document.getElementById(id).addEventListener('input', (e) => {\n          state[id] = parseFloat(e.target.value);\n          syncUI();\n          calculate();\n          FinanceEngine.updateUrlParams(state);\n        });\n      });\n      \n      syncUI();\n      calculate();\n    "
  }
];
