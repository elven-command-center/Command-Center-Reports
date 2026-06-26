/* @elven-observability/decks-skill — elven-deck-charts.js
 *
 * Motor de gráficos SVG dos decks Elven. Mesma engine do deck canônico
 * kontik-zupper-incident-2026-05-17, generalizada para qualquer dado.
 *
 * Três tipos:
 *   ElvenDeck.lineChart(el, series, opts)     linhas (séries temporais)
 *   ElvenDeck.groupedBars(el, labels, series) barras agrupadas (hoje vs ontem)
 *   ElvenDeck.barChart(el, series, opts)      barras de série única
 *
 * Uso no deck:
 *
 *   <div class="chart" id="g-orders"></div>
 *   ...
 *   <script src="elven-deck-charts.js"></script>
 *   <script>
 *     function renderCharts() {
 *       ElvenDeck.groupedBars(
 *         document.getElementById("g-orders"),
 *         ["00","01","02", ...],
 *         [
 *           { name: "hoje",  data: [93,50,30, ...], color: ElvenDeck.colors.red },
 *           { name: "ontem", data: [143,63,41, ...], color: ElvenDeck.colors.teal }
 *         ]
 *       );
 *     }
 *     window.addEventListener("load", renderCharts);
 *     window.addEventListener("resize", renderCharts);
 *   </script>
 *
 * O renderizador de PDF chama window.renderCharts() explicitamente — então
 * SEMPRE defina a função com esse nome e registre nos eventos load/resize.
 *
 * Detecção dark: se o .chart estiver dentro de um .slide.dark, grid e
 * eixos clareiam automaticamente. Nada a configurar.
 */

(function () {
  "use strict";

  var colors = {
    teal: "#00bfa5",
    teal2: "#00897b",
    blue: "#0d47a1",
    cyan: "#00e5ff",
    lime: "#d7ff63",
    red: "#ff5252",
    amber: "#fbbf24",
    violet: "#7c3aed",
    slate: "#64748b",
  };

  function scale(v, min, max, a, b) {
    if (max === min) return (a + b) / 2;
    return a + ((v - min) / (max - min)) * (b - a);
  }

  function fmt(v) {
    if (v >= 1000000) return (v / 1000000).toFixed(1) + "M";
    if (v >= 1000) return Math.round(v / 1000) + "k";
    return Math.round(v).toString();
  }

  /* Valor exato com separador de milhar pt-BR (ex.: 1754 -> "1.754"). */
  function fmtExact(v) {
    return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  function labelColor(dark) { return dark ? "#ffffff" : "#0f1923"; }

  function isDark(el) { return el.closest(".dark") != null; }
  function gridColor(dark) { return dark ? "rgba(255,255,255,.12)" : "rgba(15,25,35,.12)"; }
  function axisColor(dark) { return dark ? "rgba(255,255,255,.62)" : "#64748b"; }
  function legendColor(dark) { return dark ? "rgba(255,255,255,.78)" : "#475569"; }

  /* Marcas do eixo x igualmente espaçadas (default ~7). */
  function spreadTicks(n, count) {
    count = count || 7;
    if (n <= count) return Array.from({ length: n }, function (_, i) { return i; });
    var ticks = [];
    for (var t = 0; t < count; t++) ticks.push(Math.round(scale(t, 0, count - 1, 0, n - 1)));
    return ticks;
  }

  /* ---- Line chart -------------------------------------------------- */
  function lineChart(el, series, opts) {
    if (!el) return;
    opts = opts || {};
    var w = el.clientWidth || 500;
    var h = el.clientHeight || 260;
    var p = { l: 48, r: 22, t: 20, b: 38 };
    var dark = isDark(el);
    var labels = opts.labels || (series[0] ? series[0].data.map(function (_, i) { return String(i); }) : []);
    var n = labels.length;
    var ticks = opts.xticks || spreadTicks(n, opts.labelCount);

    var all = series.reduce(function (acc, s) { return acc.concat(s.data); }, []);
    var min = opts.min != null ? opts.min : Math.min(0, Math.min.apply(null, all));
    var max = opts.max != null ? opts.max : Math.max.apply(null, all) * 1.08;

    var xs = labels.map(function (_, i) { return scale(i, 0, n - 1, p.l, w - p.r); });
    var y = function (v) { return scale(v, min, max, h - p.b, p.t); };

    var svg = '<svg viewBox="0 0 ' + w + " " + h + '" width="100%" height="100%" role="img">';

    for (var i = 0; i <= 4; i++) {
      var yy = scale(i, 0, 4, h - p.b, p.t);
      svg += '<line x1="' + p.l + '" y1="' + yy + '" x2="' + (w - p.r) + '" y2="' + yy +
        '" stroke="' + gridColor(dark) + '" stroke-width="1"/>';
    }

    /* marcador vertical pontilhado (ex: "08:15") */
    if (opts.markIndex != null && xs[opts.markIndex] != null) {
      var mx = xs[opts.markIndex];
      svg += '<line x1="' + mx + '" y1="' + p.t + '" x2="' + mx + '" y2="' + (h - p.b) +
        '" stroke="' + colors.amber + '" stroke-width="1.6" stroke-dasharray="5 5"/>';
      svg += '<text x="' + (mx + 6) + '" y="' + (p.t + 12) +
        '" font-size="11" font-weight="900" fill="' + colors.amber + '">' + (opts.markLabel || "") + "</text>";
    }

    /* linha de threshold horizontal */
    if (opts.threshold != null) {
      var ty = y(opts.threshold);
      svg += '<line x1="' + p.l + '" y1="' + ty + '" x2="' + (w - p.r) + '" y2="' + ty +
        '" stroke="' + colors.red + '" stroke-width="1.6" stroke-dasharray="6 6"/>';
      svg += '<text x="' + (w - p.r - 4) + '" y="' + (ty - 6) +
        '" text-anchor="end" font-size="11" font-weight="800" fill="' + colors.red + '">' +
        (opts.thresholdLabel || "threshold") + "</text>";
    }

    series.forEach(function (s) {
      var d = s.data.map(function (v, i) {
        return (i === 0 ? "M" : "L") + xs[i].toFixed(1) + "," + y(v).toFixed(1);
      }).join(" ");
      svg += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="' +
        (s.width || 3) + '" stroke-linecap="round" stroke-linejoin="round"/>';
      var lastX = xs[xs.length - 1];
      var lastY = y(s.data[s.data.length - 1]);
      svg += '<circle cx="' + lastX + '" cy="' + lastY + '" r="4" fill="' + s.color + '"/>';
      if (!opts.hideEndLabels) {
        svg += '<text x="' + (lastX - 6) + '" y="' + (lastY - 9) +
          '" text-anchor="end" font-size="11" font-weight="800" fill="' + s.color + '">' +
          s.name + "</text>";
      }
    });

    ticks.forEach(function (i) {
      if (i < 0 || i >= n || !labels[i]) return;
      svg += '<text x="' + xs[i] + '" y="' + (h - 12) +
        '" text-anchor="middle" font-size="11" fill="' + axisColor(dark) + '">' + labels[i] + "</text>";
    });

    [0, 0.5, 1].forEach(function (t) {
      var val = min + (max - min) * t;
      var yv = y(val);
      svg += '<text x="' + (p.l - 10) + '" y="' + (yv + 4) +
        '" text-anchor="end" font-size="11" fill="' + axisColor(dark) + '">' +
        (opts.percent ? Math.round(val) + "%" : fmt(val)) + "</text>";
    });

    svg += "</svg>";
    el.innerHTML = svg;
  }

  /* ---- Grouped bars (multi-série: hoje vs ontem) -------------------- */
  function groupedBars(el, labels, series, opts) {
    if (!el) return;
    opts = opts || {};
    var w = el.clientWidth || 500;
    var h = el.clientHeight || 260;
    var p = { l: 48, r: 18, t: 26, b: 36 };
    var dark = isDark(el);
    var all = series.reduce(function (acc, s) { return acc.concat(s.data); }, []);
    var max = opts.max != null ? opts.max : Math.max.apply(null, all) * 1.15;
    var groupW = (w - p.l - p.r) / labels.length;
    var barW = groupW / (series.length + 1.2);
    var y = function (v) { return scale(v, 0, max, h - p.b, p.t); };

    var svg = '<svg viewBox="0 0 ' + w + " " + h + '" width="100%" height="100%" role="img">';

    for (var i = 0; i <= 4; i++) {
      var yy = scale(i, 0, 4, h - p.b, p.t);
      svg += '<line x1="' + p.l + '" y1="' + yy + '" x2="' + (w - p.r) + '" y2="' + yy +
        '" stroke="' + gridColor(dark) + '"/>';
    }

    series.forEach(function (s, si) {
      s.data.forEach(function (v, i) {
        var x = p.l + i * groupW + groupW * 0.17 + si * barW;
        var yv = y(v);
        svg += '<rect x="' + x + '" y="' + yv + '" width="' + (barW * 0.86) +
          '" height="' + (h - p.b - yv) + '" fill="' + s.color + '"/>';
      });
    });

    var ticks = opts.xticks || spreadTicks(labels.length, opts.labelCount || labels.length);
    ticks.forEach(function (i) {
      if (i < 0 || i >= labels.length || !labels[i]) return;
      var x = p.l + i * groupW + groupW / 2;
      svg += '<text x="' + x + '" y="' + (h - 12) +
        '" text-anchor="middle" font-size="11" fill="' + axisColor(dark) + '">' + labels[i] + "</text>";
    });

    [0, 0.5, 1].forEach(function (t) {
      var val = max * t;
      var yv = y(val);
      svg += '<text x="' + (p.l - 10) + '" y="' + (yv + 4) +
        '" text-anchor="end" font-size="11" fill="' + axisColor(dark) + '">' + fmt(val) + "</text>";
    });

    /* legenda no topo-esquerdo */
    var lx = p.l + 2;
    series.forEach(function (s) {
      svg += '<rect x="' + lx + '" y="2" width="10" height="10" fill="' + s.color + '"/>';
      svg += '<text x="' + (lx + 15) + '" y="12" font-size="11" font-weight="800" fill="' +
        legendColor(dark) + '">' + s.name + "</text>";
      lx += s.name.length * 7 + 38;
    });

    svg += "</svg>";
    el.innerHTML = svg;
  }

  /* ---- Bar chart (série única) ------------------------------------- */
  function barChart(el, series, opts) {
    if (!el) return;
    opts = opts || {};
    var w = el.clientWidth || 500;
    var h = el.clientHeight || 260;
    var p = { l: 44, r: 20, t: 18, b: 36 };
    var dark = isDark(el);
    var labels = opts.labels || series.data.map(function (_, i) { return String(i); });
    var n = labels.length;
    var ticks = opts.xticks || spreadTicks(n, opts.labelCount);
    var max = opts.max != null ? opts.max : Math.max.apply(null, series.data) * 1.12;
    var bw = (w - p.l - p.r) / series.data.length;
    var y = function (v) { return scale(v, 0, max, h - p.b, p.t); };

    var svg = '<svg viewBox="0 0 ' + w + " " + h + '" width="100%" height="100%" role="img">';

    for (var i = 0; i <= 4; i++) {
      var yy = scale(i, 0, 4, h - p.b, p.t);
      svg += '<line x1="' + p.l + '" y1="' + yy + '" x2="' + (w - p.r) + '" y2="' + yy +
        '" stroke="' + gridColor(dark) + '"/>';
    }

    series.data.forEach(function (v, i) {
      var x = p.l + i * bw + bw * 0.18;
      var yv = y(v);
      var color = opts.hot != null && v >= opts.hot ? colors.red : series.color;
      svg += '<rect x="' + x + '" y="' + yv + '" width="' + (bw * 0.64) +
        '" height="' + (h - p.b - yv) + '" fill="' + color + '"/>';
      /* rótulo de dados acima da barra */
      var lblX = p.l + i * bw + bw / 2;
      var lbl = opts.percent ? Math.round(v) + "%" : fmtExact(v);
      svg += '<text x="' + lblX + '" y="' + (yv - 6) +
        '" text-anchor="middle" font-size="12" font-weight="800" fill="' +
        labelColor(dark) + '">' + lbl + "</text>";
    });

    ticks.forEach(function (i) {
      if (i < 0 || i >= n || !labels[i]) return;
      var x = p.l + i * bw + bw / 2;
      svg += '<text x="' + x + '" y="' + (h - 12) +
        '" text-anchor="middle" font-size="11" fill="' + axisColor(dark) + '">' + labels[i] + "</text>";
    });

    [0, 0.5, 1].forEach(function (t) {
      var val = max * t;
      var yv = y(val);
      svg += '<text x="' + (p.l - 10) + '" y="' + (yv + 4) +
        '" text-anchor="end" font-size="11" fill="' + axisColor(dark) + '">' +
        (opts.percent ? Math.round(val) + "%" : fmt(val)) + "</text>";
    });

    svg += "</svg>";
    el.innerHTML = svg;
  }

  window.ElvenDeck = {
    colors: colors,
    lineChart: lineChart,
    groupedBars: groupedBars,
    barChart: barChart,
    fmt: fmt,
  };
})();
