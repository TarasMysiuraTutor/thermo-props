import React from 'react';
import { useI18n } from '../i18n.jsx';

const TEMP_UNITS = [
  { code: 'C', label: '°C' },
  { code: 'K', label: 'K' },
  { code: 'F', label: '°F' },
];
const PRESSURE_UNITS = ['MPa', 'kPa', 'bar', 'atm'];

function unitSymbol(u) {
  return u === 'C' ? '°C' : u === 'K' ? 'K' : '°F';
}

export default function InputCard({
  tempValue, onTempChange,
  tempUnit, onTempUnitChange,
  pressureValue, onPressureChange,
  pressureUnit, onPressureUnitChange,
  onCalculate,
  error,
}) {
  const { t } = useI18n();

  const onKey = (e) => {
    if (e.key === 'Enter') onCalculate();
  };

  return (
    <div className="card input-card">
      <div className="input-card-title">{t('input.cardTitle')}</div>

      <div className="input-row">
        <div>
          <label className="field-label" htmlFor="tempInput">{t('input.tempLabel')}</label>
          <div className="input-group">
            <input
              type="number"
              id="tempInput"
              className="temp-input"
              placeholder="20"
              step="0.1"
              autoComplete="off"
              value={tempValue}
              onChange={(e) => onTempChange(e.target.value)}
              onKeyDown={onKey}
              autoFocus
            />
            <span className="input-unit">{unitSymbol(tempUnit)}</span>
          </div>
        </div>

        <div>
          <label className="field-label">{t('input.unitsLabel')}</label>
          <div className="unit-toggle">
            {TEMP_UNITS.map(({ code, label }) => (
              <button
                key={code}
                className={`unit-btn${tempUnit === code ? ' active' : ''}`}
                onClick={() => onTempUnitChange(code)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="input-row">
        <div>
          <label className="field-label" htmlFor="pressureInput">{t('input.pressureLabel')}</label>
          <div className="input-group">
            <input
              type="number"
              id="pressureInput"
              className="temp-input"
              placeholder="0.101325"
              step="0.001"
              autoComplete="off"
              value={pressureValue}
              onChange={(e) => onPressureChange(e.target.value)}
              onKeyDown={onKey}
            />
            <span className="input-unit">{pressureUnit}</span>
          </div>
        </div>

        <div>
          <label className="field-label">&nbsp;</label>
          <div className="unit-toggle">
            {PRESSURE_UNITS.map((u) => (
              <button
                key={u}
                className={`punit-btn${pressureUnit === u ? ' active' : ''}`}
                onClick={() => onPressureUnitChange(u)}
                type="button"
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">&nbsp;</label>
          <button className="btn-calc" onClick={onCalculate} type="button">
            {t('input.calcBtn')}
          </button>
        </div>
      </div>

      <p
        className="range-note"
        dangerouslySetInnerHTML={{ __html: t('input.rangeNote') }}
      />
      {error && <div className="error-banner" style={{ display: 'block' }}>{error}</div>}
    </div>
  );
}
