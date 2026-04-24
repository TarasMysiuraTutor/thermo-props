import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '../i18n.jsx';
import * as Water from '../water.js';

const CHART_PROPS = [
  { key: 'rho',    sym: 'ρ',  tkey: 'prop.density', ukey: 'unit.density' },
  { key: 'cp',     sym: 'cₚ', tkey: 'prop.cp',      ukey: 'unit.cp' },
  { key: 'lambda', sym: 'λ',  tkey: 'prop.lambda',  ukey: 'unit.lambda' },
  { key: 'mu',     sym: 'μ',  tkey: 'prop.mu',      ukey: 'unit.mu' },
  { key: 'nu',     sym: 'ν',  tkey: 'prop.nu',      ukey: 'unit.nu' },
  { key: 'a',      sym: 'a',  tkey: 'prop.a',       ukey: 'unit.a' },
  { key: 'Pr',     sym: 'Pr', tkey: 'prop.Pr',      ukey: 'unit.Pr' },
  { key: 'beta',   sym: 'β',  tkey: 'prop.beta',    ukey: 'unit.beta' },
  { key: 'h',      sym: 'h',  tkey: 'prop.h',       ukey: 'unit.h' },
];

function linearTicks(min, max, n) {
  const span = max - min;
  if (span <= 0) return [min];
  const raw = span / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  let step = 10 * mag;
  if (norm < 1.5) step = mag;
  else if (norm < 3) step = 2 * mag;
  else if (norm < 7) step = 5 * mag;
  const start = Math.ceil(min / step) * step;
  const ticks = [];
  for (let v = start; v <= max + 1e-9; v += step) ticks.push(v);
  return ticks;
}

function logTicks(min, max) {
  const ticks = [];
  const e0 = Math.floor(Math.log10(Math.max(min, 1e-12)));
  const e1 = Math.ceil(Math.log10(max));
  for (let e = e0; e <= e1; e++) {
    const v = Math.pow(10, e);
    if (v >= min * 0.999 && v <= max * 1.001) ticks.push(v);
  }
  return ticks;
}

function fmtTick(v) {
  const a = Math.abs(v);
  if (a === 0) return '0';
  if (a >= 10000 || a < 0.01) return v.toExponential(0).replace('+', '');
  if (a >= 100) return v.toFixed(0);
  if (a >= 10)  return v.toFixed(1);
  if (a >= 1)   return v.toFixed(2);
  return v.toPrecision(2);
}

function fmtTooltipVal(v) {
  const a = Math.abs(v);
  if (a === 0) return '0';
  if (a >= 10000 || a < 0.001) return v.toExponential(3);
  if (a >= 1000) return v.toFixed(1);
  if (a >= 10)   return v.toFixed(2);
  if (a >= 1)    return v.toFixed(3);
  return v.toPrecision(4);
}

const W = 720, H = 320, PL = 64, PR = 18, PT = 22, PB = 44;
const PW = W - PL - PR;
const PH = H - PT - PB;
const Tmin = -100, Tmax = 800, N = 360;

function buildChartData(propKey, pMPa) {
  const ice = [], liq = [], stm = [];
  for (let i = 0; i <= N; i++) {
    const T = Tmin + (Tmax - Tmin) * i / N;
    let d;
    try {
      const ph = Water.phase(T, pMPa);
      d = ph === 'ice'   ? Water.computeIce(T, pMPa)
        : ph === 'steam' ? Water.computeSteam(T, pMPa)
                         : Water.compute(T, pMPa);
      const v = d[propKey];
      if (!isFinite(v) || v == null) continue;
      const arr = ph === 'ice' ? ice : ph === 'steam' ? stm : liq;
      arr.push([T, v]);
    } catch (_) { /* skip */ }
  }
  return { ice, liq, stm };
}

function buildScales(ice, liq, stm) {
  const allV = ice.concat(liq).concat(stm).map((p) => p[1]);
  if (allV.length < 2) return null;
  let vmin = Math.min(...allV), vmax = Math.max(...allV);
  if (vmin === vmax) { vmin -= 1; vmax += 1; }
  const useLog = vmin > 0 && vmax / Math.max(vmin, 1e-12) > 50;
  if (!useLog) {
    const span = vmax - vmin;
    vmin -= span * 0.05;
    vmax += span * 0.05;
  }
  return { vmin, vmax, useLog };
}

function makeTy(scales) {
  const { vmin, vmax, useLog } = scales;
  if (useLog) {
    const lmin = Math.log10(Math.max(vmin, 1e-12));
    const lmax = Math.log10(vmax);
    return (v) => PT + PH - (Math.log10(Math.max(v, 1e-12)) - lmin) / (lmax - lmin) * PH;
  }
  return (v) => PT + PH - (v - vmin) / (vmax - vmin) * PH;
}

function tx(T) {
  return PL + (T - Tmin) / (Tmax - Tmin) * PW;
}

function pathFor(pts, ty) {
  return pts.map((p, i) => (i ? 'L' : 'M') + tx(p[0]).toFixed(1) + ',' + ty(p[1]).toFixed(1)).join(' ');
}

export default function Chart({ result }) {
  const { t } = useI18n();
  const [propKey, setPropKey] = useState('rho');
  const [hover, setHover] = useState(null);
  const wrapRef = useRef(null);
  const svgRef = useRef(null);

  const { T: curT, pMPa } = result;
  const Tsat = useMemo(() => Water.saturationTemp(pMPa), [pMPa]);

  const { ice, liq, stm } = useMemo(() => buildChartData(propKey, pMPa), [propKey, pMPa]);
  const scales = useMemo(() => buildScales(ice, liq, stm), [ice, liq, stm]);

  if (!scales) {
    return (
      <div className="chart-section" style={{ display: 'block' }}>
        <div className="chart-head">
          <h3 className="chart-title">{t('chart.title')}</h3>
        </div>
        <div className="chart-wrap" />
      </div>
    );
  }

  const ty = makeTy(scales);
  const meta = CHART_PROPS.find((p) => p.key === propKey) || CHART_PROPS[0];
  const xticks = [-100, -50, 0, 100, 200, 300, 400, 500, 600, 700, 800].filter((v) => v >= Tmin && v <= Tmax);
  const yticks = scales.useLog ? logTicks(scales.vmin, scales.vmax) : linearTicks(scales.vmin, scales.vmax, 5);
  const ylab = `${meta.sym}, ${t(meta.ukey)}${scales.useLog ? ' (log)' : ''}`;

  function svgPointFromEvent(evt) {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    return pt.matrixTransform(ctm.inverse());
  }

  function onMove(evt) {
    const e = evt.touches ? evt.touches[0] : evt;
    if (!e) return;
    const p = svgPointFromEvent(e);
    if (!p) return;
    const Th = Tmin + (p.x - PL) / PW * (Tmax - Tmin);
    let best = null, bestDist = Infinity, bestPhase = null;
    for (const pt of ice) { const d = Math.abs(pt[0] - Th); if (d < bestDist) { bestDist = d; best = pt; bestPhase = 'ice'; } }
    for (const pt of liq) { const d = Math.abs(pt[0] - Th); if (d < bestDist) { bestDist = d; best = pt; bestPhase = 'liquid'; } }
    for (const pt of stm) { const d = Math.abs(pt[0] - Th); if (d < bestDist) { bestDist = d; best = pt; bestPhase = 'steam'; } }
    if (!best) return;
    setHover({ T: best[0], v: best[1], phase: bestPhase });
  }

  function onLeave() { setHover(null); }

  // Tooltip positioning (in wrap coordinates)
  let tooltip = null;
  if (hover && wrapRef.current && svgRef.current) {
    const svg = svgRef.current;
    const wrap = wrapRef.current;
    const wrapRect = wrap.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const x = tx(hover.T);
    const y = ty(hover.v);
    const sx = svgRect.left + (x / W) * svgRect.width;
    const sy = svgRect.top + (y / H) * svgRect.height;
    let left = sx - wrapRect.left;
    let top = sy - wrapRect.top;
    const halfW = 80;
    const minL = halfW + 4, maxL = wrapRect.width - halfW - 4;
    if (left < minL) left = minL;
    if (left > maxL) left = maxL;
    if (top < 70) top = 70;
    const phaseKey = hover.phase === 'steam' ? 'phase.steam' : hover.phase === 'ice' ? 'phase.ice' : 'phase.water';
    tooltip = { left, top, phaseKey };
  }

  function exportPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const clone = svg.cloneNode(true);
    const srcEls = [svg, ...svg.querySelectorAll('*')];
    const dstEls = [clone, ...clone.querySelectorAll('*')];
    const props = [
      'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-opacity',
      'fill-opacity', 'opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor',
    ];
    for (let i = 0; i < srcEls.length; i++) {
      const cs = getComputedStyle(srcEls[i]);
      let style = '';
      for (const p of props) {
        const v = cs.getPropertyValue(p);
        if (v) style += `${p}:${v};`;
      }
      dstEls[i].setAttribute('style', style);
    }
    clone.querySelectorAll('.chart-hover, .chart-overlay').forEach((el) => el.remove());

    const bodyCs = getComputedStyle(document.body);
    const bg = (bodyCs.getPropertyValue('--surface') || bodyCs.backgroundColor || '#ffffff').trim() || '#ffffff';

    const scale = 2;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width',  W * scale);
    clone.setAttribute('height', H * scale);
    clone.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const bgRect = document.createElementNS(SVG_NS, 'rect');
    bgRect.setAttribute('x', 0); bgRect.setAttribute('y', 0);
    bgRect.setAttribute('width', W); bgRect.setAttribute('height', H);
    bgRect.setAttribute('fill', bg);
    clone.insertBefore(bgRect, clone.firstChild);

    const xml = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, W * scale, H * scale);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const fname = `H2O_${propKey}_${pMPa.toFixed(3)}MPa_${stamp}.png`;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fname;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }, 'image/png');
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  const hoverX = hover ? tx(hover.T) : 0;
  const hoverY = hover ? ty(hover.v) : 0;
  const hoverDotClass = hover ? `chart-hover-dot ${hover.phase}` : 'chart-hover-dot';

  return (
    <div className="chart-section" style={{ display: 'block' }}>
      <div className="chart-head">
        <h3 className="chart-title">{t('chart.title')}</h3>
        <div className="chart-controls">
          <label htmlFor="chartPropSelect">{t('chart.propLabel')}</label>
          <select
            id="chartPropSelect"
            className="chart-select"
            value={propKey}
            onChange={(e) => setPropKey(e.target.value)}
          >
            {CHART_PROPS.map((p) => (
              <option key={p.key} value={p.key}>{p.sym} — {t(p.tkey)}</option>
            ))}
          </select>
          <button type="button" className="chart-btn" onClick={exportPng}>
            {t('chart.exportPng')}
          </button>
        </div>
      </div>

      <div className="chart-wrap" ref={wrapRef}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="chart-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x={PL} y={PT} width={PW} height={PH} className="chart-plot" />
          {xticks.map((v) => {
            const x = tx(v).toFixed(1);
            return (
              <g key={`x${v}`}>
                <line x1={x} y1={PT} x2={x} y2={PT + PH} className="chart-grid" />
                <text x={x} y={PT + PH + 16} className="chart-tick" textAnchor="middle">{v}</text>
              </g>
            );
          })}
          {yticks.map((v, i) => {
            const y = ty(v).toFixed(1);
            return (
              <g key={`y${i}`}>
                <line x1={PL} y1={y} x2={PL + PW} y2={y} className="chart-grid" />
                <text x={PL - 6} y={Number(y) + 3} className="chart-tick" textAnchor="end">{fmtTick(v)}</text>
              </g>
            );
          })}
          {Tsat >= Tmin && Tsat <= Tmax && (
            <>
              <line x1={tx(Tsat).toFixed(1)} y1={PT} x2={tx(Tsat).toFixed(1)} y2={PT + PH} className="chart-tsat" />
              <text x={tx(Tsat).toFixed(1)} y={PT - 6} className="chart-tsat-label" textAnchor="middle">
                Tₛ {Tsat.toFixed(1)}°C
              </text>
            </>
          )}
          {curT >= Tmin && curT <= Tmax && (
            <line x1={tx(curT).toFixed(1)} y1={PT} x2={tx(curT).toFixed(1)} y2={PT + PH} className="chart-cur" />
          )}
          {ice.length > 1 && <path d={pathFor(ice, ty)} className="chart-ice" />}
          {liq.length > 1 && <path d={pathFor(liq, ty)} className="chart-liquid" />}
          {stm.length > 1 && <path d={pathFor(stm, ty)} className="chart-steam" />}
          <text x={PL + PW / 2} y={H - 8} className="chart-axis" textAnchor="middle">T, °C</text>
          <text x={PL} y={PT - 8} className="chart-axis">{ylab}</text>

          <g className="chart-hover" style={{ display: hover ? '' : 'none' }}>
            <line className="chart-hover-line" x1={hoverX} y1={PT} x2={hoverX} y2={PT + PH} />
            <circle className={hoverDotClass} cx={hoverX} cy={hoverY} r="4" />
          </g>
          <rect
            className="chart-overlay"
            x={PL} y={PT} width={PW} height={PH}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            onTouchStart={onMove}
            onTouchMove={onMove}
            onTouchEnd={onLeave}
          />
        </svg>
        <div
          className={`chart-tooltip${hover ? ' visible' : ''}`}
          role="tooltip"
          style={tooltip ? { left: tooltip.left + 'px', top: tooltip.top + 'px' } : undefined}
        >
          {hover && (
            <>
              <div className="ct-row">
                <span className="ct-key">T</span>
                <span className="ct-val">{hover.T.toFixed(1)}</span>
                <span className="ct-unit">°C</span>
              </div>
              <div className="ct-row">
                <span className="ct-key">{meta.sym}</span>
                <span className="ct-val">{fmtTooltipVal(hover.v)}</span>
                <span className="ct-unit">{t(meta.ukey)}</span>
              </div>
              <div className={`ct-phase ${hover.phase}`}>{t(tooltip.phaseKey)}</div>
            </>
          )}
        </div>
      </div>

      <div className="chart-legend">
        <span className="cl-item"><span className="cl-sw cl-liq" /><span>{t('chart.legendLiquid')}</span></span>
        <span className="cl-item"><span className="cl-sw cl-ice" /><span>{t('chart.legendIce')}</span></span>
        <span className="cl-item"><span className="cl-sw cl-stm" /><span>{t('chart.legendSteam')}</span></span>
        <span className="cl-item"><span className="cl-sw cl-tsat" /><span>{t('chart.legendTsat')}</span></span>
        <span className="cl-item"><span className="cl-sw cl-cur" /><span>{t('chart.legendCurrent')}</span></span>
      </div>
    </div>
  );
}
