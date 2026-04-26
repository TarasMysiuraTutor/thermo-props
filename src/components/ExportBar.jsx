import React from 'react';
import { useI18n } from '../i18n.jsx';
import * as Water from '../substances/water/water.js';
import { APP_VERSION } from '../version.js';

function csvEscape(v) {
  const s = String(v);
  if (/[",\n;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function buildContext(result, t) {
  const { T, raw, pMPa, pRaw, pUnit, tempUnit } = result;
  const props = Water.getProperties(T, pMPa, t);
  const ph = Water.phase(T, pMPa);
  const phaseTxt =
    ph === 'steam' ? t('phase.steam') :
    ph === 'ice'   ? t('phase.ice') :
                     t('phase.water');
  const unitSym = tempUnit === 'C' ? '°C' : tempUnit === 'K' ? 'K' : '°F';
  const tempStr =
    raw.toFixed(2) + ' ' + unitSym +
    (tempUnit !== 'C' ? ' (' + T.toFixed(2) + ' °C)' : '');
  const pressStr =
    pRaw + ' ' + pUnit +
    (pUnit !== 'MPa' ? ' (' + pMPa.toFixed(4) + ' MPa)' : '');
  const tsatStr  = Water.saturationTemp(pMPa).toFixed(2) + ' °C';
  const tmeltStr = Water.meltingTemp(pMPa).toFixed(2) + ' °C';
  return { props, phaseTxt, tempStr, pressStr, tsatStr, tmeltStr };
}

export default function ExportBar({ result }) {
  const { t, lang } = useI18n();

  function exportCsv() {
    const ctx = buildContext(result, t);
    const sep = ',';
    const lines = [];
    lines.push([t('export.tempLabel'), ctx.tempStr].map(csvEscape).join(sep));
    lines.push([t('results.pressureLabel'), ctx.pressStr].map(csvEscape).join(sep));
    lines.push([t('results.tsatLabel'),  ctx.tsatStr ].map(csvEscape).join(sep));
    lines.push([t('results.tmeltLabel'), ctx.tmeltStr].map(csvEscape).join(sep));
    lines.push([t('export.phaseLabel'),  ctx.phaseTxt].map(csvEscape).join(sep));
    lines.push([t('export.generated'), new Date().toISOString()].map(csvEscape).join(sep));
    lines.push('');
    lines.push([
      t('export.headerProp'),
      t('export.headerSymbol'),
      t('export.headerValue'),
      t('export.headerUnit'),
    ].map(csvEscape).join(sep));
    ctx.props.forEach((p) => {
      lines.push([p.name, p.symbol, p.value, p.unit].map(csvEscape).join(sep));
    });
    const csv = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const unitSym = result.tempUnit;
    a.download = 'h2o-properties_' + result.raw.toFixed(2) + unitSym + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportPdf() {
    const ctx = buildContext(result, t);
    const rows = ctx.props.map((p) => `
      <tr>
        <td>${p.name}</td>
        <td class="sym">${p.symbol}</td>
        <td class="val">${p.value}</td>
        <td class="u">${p.unit}</td>
      </tr>`).join('');
    const html = `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8">
<title>${t('meta.title')}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Arial, sans-serif; color:#111; padding: 32px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color:#555; font-size: 13px; margin-bottom: 18px; }
  .meta { margin: 14px 0 18px; font-size: 14px; }
  .meta b { display:inline-block; min-width: 110px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border-bottom: 1px solid #ddd; padding: 8px 10px; text-align: left; }
  th { background:#f4f5f8; font-weight:600; }
  td.val { font-family: "DM Mono", Menlo, monospace; text-align: right; }
  td.sym { font-family: "DM Mono", Menlo, monospace; color:#2563eb; }
  td.u { color:#666; }
  footer { margin-top: 24px; font-size: 11px; color:#888; }
</style></head><body>
<h1>${t('hero.title1')} ${t('hero.title2')}</h1>
<div class="sub">IAPWS-IF97 · 101.325 kPa</div>
<div class="meta">
  <div><b>${t('export.tempLabel')}:</b> ${ctx.tempStr}</div>
  <div><b>${t('results.pressureLabel')}:</b> ${ctx.pressStr}</div>
  <div><b>${t('results.tsatLabel')}:</b> ${ctx.tsatStr}</div>
  <div><b>${t('results.tmeltLabel')}:</b> ${ctx.tmeltStr}</div>
  <div><b>${t('export.phaseLabel')}:</b> ${ctx.phaseTxt}</div>
  <div><b>${t('export.generated')}:</b> ${new Date().toLocaleString(lang)}</div>
</div>
<table>
  <thead><tr>
    <th>${t('export.headerProp')}</th>
    <th>${t('export.headerSymbol')}</th>
    <th style="text-align:right">${t('export.headerValue')}</th>
    <th>${t('export.headerUnit')}</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<footer>H₂O Thermo Calc · ${t('footer.version')} ${APP_VERSION}</footer>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 150); };<\/script>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="export-bar no-print">
      <span className="export-title">{t('export.title')}</span>
      <div className="export-actions">
        <button className="btn-export" type="button" onClick={exportCsv}>
          {t('export.csv')}
        </button>
        <button className="btn-export" type="button" onClick={exportPdf}>
          {t('export.pdf')}
        </button>
      </div>
    </div>
  );
}
