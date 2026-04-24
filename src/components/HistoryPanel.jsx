import React from 'react';
import { useI18n } from '../i18n.jsx';

function unitSymbol(u) {
  return u === 'C' ? '°C' : u === 'K' ? 'K' : '°F';
}

export default function HistoryPanel({ entries, onPick, onClear }) {
  const { t, lang } = useI18n();
  if (!entries || entries.length === 0) return null;

  return (
    <section className="history-card">
      <div className="history-head">
        <span className="history-title">{t('history.title')}</span>
        <button className="history-clear" type="button" onClick={onClear}>
          {t('history.clear')}
        </button>
      </div>
      <div className="history-list">
        {entries.map((e) => (
          <button
            key={`${e.ts}-${e.raw}-${e.unit}-${e.pRaw}-${e.pUnit}`}
            className="history-chip"
            type="button"
            title={new Date(e.ts).toLocaleString(lang)}
            onClick={() => onPick(e)}
          >
            <span className="hc-val">{e.raw}</span>
            <span className="hc-unit">{unitSymbol(e.unit)}</span>
            {e.pRaw != null && e.pUnit && (
              <>
                <span className="hc-sep">·</span>
                <span className="hc-val">{e.pRaw}</span>
                <span className="hc-unit">{e.pUnit}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
