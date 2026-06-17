(function () {
  'use strict';

  var MAX_YEARS = 8;
  var chartInstance = null;

  var DEFAULTS = {
    lifeMonths: 96,
    annualUsage: 20000,
    fuelEfficiencyMpg: 15,
    purchasePrice: 50000,
    disposalCost: 1000,
    salvagePct: 20,
    depreciationMethod: 'double',
    serviceCosts: [0, 1500, 1500, 1500, 300, 1350, 2500, 2000, 10000],
    fuelPricePerLiter: [0, 1.5, 1.6, 1.75, 1.9, 2.0, 2.1, 2.3, 2.5]
  };

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function toNumber(v) {
    var n = parseFloat(String(v || '').replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? null : n;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function kmPerLiterFromMpg(mpg) {
    return mpg * 0.425144;
  }

  function computeLifeYears(lifeMonths) {
    return clamp(Math.round(lifeMonths / 12), 1, MAX_YEARS);
  }

  function computeDepreciation(opts) {
    var method = opts.method;
    var lifeYears = opts.lifeYears;
    var purchasePrice = opts.purchasePrice;
    var salvageValue = opts.salvageValue;
    var dep = new Array(MAX_YEARS + 1).fill(0);
    if (lifeYears <= 0) return dep;

    var costBasis = Math.max(0, purchasePrice - salvageValue);

    if (method === 'double') {
      var rate = 2 / lifeYears;
      var book = purchasePrice;
      for (var y = 1; y <= lifeYears; y++) {
        var d = rate * book;
        if (y === lifeYears) d = Math.max(0, book - salvageValue);
        dep[y] = Math.round(d * 100) / 100;
        book -= d;
      }
      return dep;
    }

    var sumDigits = (lifeYears * (lifeYears + 1)) / 2;
    for (var y2 = 1; y2 <= lifeYears; y2++) {
      dep[y2] = Math.round(((lifeYears - y2 + 1) / sumDigits) * costBasis * 100) / 100;
    }
    return dep;
  }

  function buildYearList(container, opts) {
    var html = '';
    for (var y = 1; y <= MAX_YEARS; y++) {
      var id = opts.inputIdPrefix + y;
      var val = opts.values[y] != null ? opts.values[y] : '';
      html +=
        '<div class="replacement-year-row" data-year-row="' + y + '">' +
        '  <label for="' + id + '">Year ' + y + '</label>' +
        '  <div class="replacement-year-input">' +
        '    <input id="' + id + '" type="number" inputmode="decimal" ' +
        '      step="' + (opts.step || 1) + '" min="' + (opts.min != null ? opts.min : 0) + '" ' +
        '      value="' + escapeHtml(val) + '">' +
        '  </div>' +
        (opts.suffixText ? '  <div class="replacement-year-suffix">' + escapeHtml(opts.suffixText) + '</div>' : '  <div></div>') +
        '</div>';
    }
    container.innerHTML = html;
  }

  function formatPerKm(v) {
    return '₹' + (Math.round(v * 100) / 100).toFixed(2) + '/km';
  }

  function round4(arr, years) {
    return years.map(function (yr) {
      return Math.round((arr[yr] || 0) * 10000) / 10000;
    });
  }

  function registerChartPlugins() {
    if (typeof Chart === 'undefined' || Chart.registry.plugins.get('annotation')) return;
    var plugin = window.chartjsPluginAnnotation || window['chartjs-plugin-annotation'];
    if (plugin) Chart.register(plugin);
  }

  function renderChart(opts) {
    var canvas = document.getElementById('replacement-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    registerChartPlugins();

    var years = opts.years;
    var series = opts.series;
    var labels = years.map(function (y) { return 'Year ' + y; });
    var optimalIdx = opts.recommendedYear - 1;

    var datasets = [
      {
        label: 'Acquisition',
        data: round4(series.acquisition, years),
        borderColor: 'rgba(0, 82, 255, 0.45)',
        backgroundColor: 'rgba(0, 82, 255, 0.14)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        stack: 'cost',
        order: 2
      },
      {
        label: 'Service',
        data: round4(series.service, years),
        borderColor: 'rgba(0, 82, 255, 0.6)',
        backgroundColor: 'rgba(0, 82, 255, 0.22)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        stack: 'cost',
        order: 2
      },
      {
        label: 'Fuel',
        data: round4(series.fuel, years),
        borderColor: 'rgba(0, 82, 255, 0.75)',
        backgroundColor: 'rgba(0, 82, 255, 0.32)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        stack: 'cost',
        order: 2
      },
      {
        label: 'Total cost',
        data: round4(series.total, years),
        borderColor: '#0052FF',
        backgroundColor: 'rgba(0, 82, 255, 0.06)',
        borderWidth: 3,
        fill: false,
        tension: 0.35,
        pointRadius: years.map(function (_, i) { return i === optimalIdx ? 7 : 4; }),
        pointHoverRadius: 8,
        pointBackgroundColor: years.map(function (_, i) {
          return i === optimalIdx ? '#EA580C' : '#fff';
        }),
        pointBorderColor: years.map(function (_, i) {
          return i === optimalIdx ? '#EA580C' : '#0052FF';
        }),
        pointBorderWidth: years.map(function (_, i) { return i === optimalIdx ? 3 : 2; }),
        order: 1
      },
      {
        label: 'Minimum avg. cost',
        data: years.map(function () { return opts.minAvgCost; }),
        borderColor: '#7C3AED',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        order: 0
      }
    ];

    var annotations = {
      optimalBand: {
        type: 'box',
        xMin: optimalIdx - 0.35,
        xMax: optimalIdx + 0.35,
        backgroundColor: 'rgba(234, 88, 12, 0.08)',
        borderWidth: 0
      },
      optimalLine: {
        type: 'line',
        xMin: optimalIdx,
        xMax: optimalIdx,
        borderColor: '#EA580C',
        borderWidth: 2,
        borderDash: [4, 4],
        label: {
          display: true,
          content: 'Optimal · Yr ' + opts.recommendedYear,
          position: 'start',
          backgroundColor: '#EA580C',
          color: '#fff',
          font: { size: 11, weight: '600', family: 'Inter, system-ui, sans-serif' },
          padding: { top: 4, bottom: 4, left: 8, right: 8 },
          borderRadius: 4
        }
      }
    };

    if (opts.lifeYears <= MAX_YEARS) {
      annotations.lifeLine = {
        type: 'line',
        xMin: opts.lifeYears - 1,
        xMax: opts.lifeYears - 1,
        borderColor: '#64748B',
        borderWidth: 1.5,
        borderDash: [3, 5],
        label: {
          display: true,
          content: 'Est. life',
          position: 'end',
          backgroundColor: 'rgba(100, 116, 139, 0.9)',
          color: '#fff',
          font: { size: 10, weight: '600', family: 'Inter, system-ui, sans-serif' },
          padding: 4,
          borderRadius: 4
        }
      };
    }

    var chartOpts = {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'start',
            labels: {
              usePointStyle: true,
              pointStyle: 'line',
              padding: 16,
              font: { size: 12, weight: '600', family: 'Inter, system-ui, sans-serif' },
              color: '#475569'
            }
          },
          tooltip: {
            backgroundColor: '#0F172A',
            titleFont: { size: 13, weight: '700', family: 'Inter, system-ui, sans-serif' },
            bodyFont: { size: 12, family: 'Inter, system-ui, sans-serif' },
            padding: 12,
            cornerRadius: 8,
            filter: function (item) {
              return item.dataset.label !== 'Minimum avg. cost';
            },
            callbacks: {
              label: function (ctx) {
                return ' ' + ctx.dataset.label + ': ' + formatPerKm(ctx.parsed.y);
              },
              afterBody: function (items) {
                if (!items.length) return;
                var idx = items[0].dataIndex;
                var total = opts.series.total[opts.years[idx]];
                return '\nMin avg cost: ' + formatPerKm(opts.minAvgCost);
              }
            }
          },
          annotation: { annotations: annotations }
        },
        scales: {
          x: {
            grid: { display: false },
            title: {
              display: true,
              text: 'Vehicle age (years)',
              font: { size: 12, weight: '600', family: 'Inter, system-ui, sans-serif' },
              color: '#334155'
            },
            ticks: {
              font: { size: 12, weight: '500', family: 'Inter, system-ui, sans-serif' },
              color: '#64748B'
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: 'rgba(15, 23, 42, 0.06)' },
            title: {
              display: true,
              text: 'Annual cost per km',
              font: { size: 12, weight: '600', family: 'Inter, system-ui, sans-serif' },
              color: '#334155'
            },
            ticks: {
              font: { size: 11, family: 'Inter, system-ui, sans-serif' },
              color: '#64748B',
              callback: function (v) { return formatPerKm(v); }
            }
          }
        }
      }
    };

    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }

    chartInstance = new Chart(canvas.getContext('2d'), chartOpts);
  }

  function readStateFromInputs() {
    var lifeMonths = toNumber(document.getElementById('repl-life-months').value);
    var annualUsage = toNumber(document.getElementById('repl-annual-usage').value);
    var fuelEfficiencyMpg = toNumber(document.getElementById('repl-fuel-eff').value);
    var purchasePrice = toNumber(document.getElementById('repl-purchase-price').value);
    var disposalCost = toNumber(document.getElementById('repl-disposal-cost').value);
    var salvagePct = toNumber(document.getElementById('repl-salvage-pct').value);
    var deprRadio = document.querySelector('input[name="repl-depr"]:checked');
    var depreciationMethod = deprRadio ? deprRadio.value : 'double';

    lifeMonths = lifeMonths == null ? DEFAULTS.lifeMonths : lifeMonths;
    annualUsage = annualUsage == null ? DEFAULTS.annualUsage : annualUsage;
    fuelEfficiencyMpg = fuelEfficiencyMpg == null ? DEFAULTS.fuelEfficiencyMpg : fuelEfficiencyMpg;
    purchasePrice = purchasePrice == null ? DEFAULTS.purchasePrice : purchasePrice;
    disposalCost = disposalCost == null ? DEFAULTS.disposalCost : disposalCost;
    salvagePct = salvagePct == null ? DEFAULTS.salvagePct : salvagePct;

    var serviceCosts = new Array(MAX_YEARS + 1).fill(0);
    for (var y = 1; y <= MAX_YEARS; y++) {
      var el = document.getElementById('repl-service-cost-' + y);
      var n = el ? toNumber(el.value) : null;
      serviceCosts[y] = n == null ? (DEFAULTS.serviceCosts[y] || 0) : n;
    }

    var fuelPricePerLiter = new Array(MAX_YEARS + 1).fill(0);
    for (var f = 1; f <= MAX_YEARS; f++) {
      var el2 = document.getElementById('repl-fuel-price-' + f);
      var n2 = el2 ? toNumber(el2.value) : null;
      fuelPricePerLiter[f] = n2 == null ? (DEFAULTS.fuelPricePerLiter[f] || 0) : n2;
    }

    return {
      lifeMonths: lifeMonths,
      annualUsage: annualUsage,
      fuelEfficiencyMpg: fuelEfficiencyMpg,
      purchasePrice: purchasePrice,
      disposalCost: disposalCost,
      salvagePct: salvagePct,
      depreciationMethod: depreciationMethod,
      serviceCosts: serviceCosts,
      fuelPricePerLiter: fuelPricePerLiter
    };
  }

  function recompute() {
    var state = readStateFromInputs();
    var lifeYears = computeLifeYears(state.lifeMonths);
    var salvageValue = state.purchasePrice * (state.salvagePct / 100);
    var kmPerLiter = kmPerLiterFromMpg(Math.max(0.1, state.fuelEfficiencyMpg));
    var annualLiters = kmPerLiter > 0 ? (state.annualUsage / kmPerLiter) : 0;

    var depreciation = computeDepreciation({
      method: state.depreciationMethod,
      lifeYears: lifeYears,
      purchasePrice: state.purchasePrice,
      salvageValue: salvageValue
    });

    var annualFuelCost = new Array(MAX_YEARS + 1).fill(0);
    for (var y = 1; y <= MAX_YEARS; y++) {
      annualFuelCost[y] = Math.round(annualLiters * state.fuelPricePerLiter[y] * 100) / 100;
    }

    var annualCostPerKm = new Array(MAX_YEARS + 1).fill(0);
    var acquisitionPerKm = new Array(MAX_YEARS + 1).fill(0);
    var servicePerKm = new Array(MAX_YEARS + 1).fill(0);
    var fuelPerKm = new Array(MAX_YEARS + 1).fill(0);
    var usage = Math.max(1, state.annualUsage);

    for (var yc = 1; yc <= MAX_YEARS; yc++) {
      var disposalHere = yc === lifeYears ? state.disposalCost : 0;
      acquisitionPerKm[yc] = depreciation[yc] / usage;
      servicePerKm[yc] = (state.serviceCosts[yc] + disposalHere) / usage;
      fuelPerKm[yc] = annualFuelCost[yc] / usage;
      annualCostPerKm[yc] = acquisitionPerKm[yc] + servicePerKm[yc] + fuelPerKm[yc];
    }

    var yearsArr = [];
    for (var k = 1; k <= MAX_YEARS; k++) yearsArr.push(k);

    var bestYear = 1;
    var bestAvg = Infinity;
    for (var age = 1; age <= MAX_YEARS; age++) {
      var sum = 0;
      for (var s = 1; s <= age; s++) {
        sum += state.serviceCosts[s] + annualFuelCost[s] + depreciation[s];
      }
      var totalCost = sum + state.purchasePrice - salvageValue + state.disposalCost;
      var avg = totalCost / (Math.max(1, state.annualUsage) * age);
      if (avg < bestAvg) {
        bestAvg = avg;
        bestYear = age;
      }
    }

    var recoEl = document.getElementById('replacement-reco');
    if (recoEl) recoEl.textContent = 'Optimal: Year ' + bestYear + ' · ' + formatPerKm(bestAvg);

    renderChart({
      years: yearsArr,
      series: {
        acquisition: acquisitionPerKm,
        service: servicePerKm,
        fuel: fuelPerKm,
        total: annualCostPerKm
      },
      recommendedYear: bestYear,
      lifeYears: lifeYears,
      minAvgCost: bestAvg
    });
  }

  function bindEvents() {
    ['repl-life-months', 'repl-annual-usage', 'repl-fuel-eff', 'repl-purchase-price', 'repl-disposal-cost', 'repl-salvage-pct'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', recompute);
        el.addEventListener('change', recompute);
      }
    });

    document.querySelectorAll('input[name="repl-depr"]').forEach(function (r) {
      r.addEventListener('change', recompute);
    });

    for (var y = 1; y <= MAX_YEARS; y++) {
      var sEl = document.getElementById('repl-service-cost-' + y);
      if (sEl) {
        sEl.addEventListener('input', recompute);
        sEl.addEventListener('change', recompute);
      }
      var fEl = document.getElementById('repl-fuel-price-' + y);
      if (fEl) {
        fEl.addEventListener('input', recompute);
        fEl.addEventListener('change', recompute);
      }
    }
  }

  function init() {
    document.getElementById('repl-life-months').value = DEFAULTS.lifeMonths;
    document.getElementById('repl-annual-usage').value = DEFAULTS.annualUsage;
    document.getElementById('repl-fuel-eff').value = DEFAULTS.fuelEfficiencyMpg;
    document.getElementById('repl-purchase-price').value = DEFAULTS.purchasePrice;
    document.getElementById('repl-disposal-cost').value = DEFAULTS.disposalCost;
    document.getElementById('repl-salvage-pct').value = DEFAULTS.salvagePct;

    var serviceContainer = document.getElementById('repl-service-list');
    var fuelContainer = document.getElementById('repl-fuel-list');
    if (serviceContainer) {
      buildYearList(serviceContainer, {
        inputIdPrefix: 'repl-service-cost-',
        values: DEFAULTS.serviceCosts,
        suffixText: '₹',
        step: 100,
        min: 0
      });
    }
    if (fuelContainer) {
      buildYearList(fuelContainer, {
        inputIdPrefix: 'repl-fuel-price-',
        values: DEFAULTS.fuelPricePerLiter,
        suffixText: '₹ / liter',
        step: 0.05,
        min: 0
      });
    }

    bindEvents();
    recompute();
  }

  if (document.body.getAttribute('data-subpage') === 'replacement') {
    init();
  }
})();
