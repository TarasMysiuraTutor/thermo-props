import React, { useEffect, useRef } from "react";
import { useI18n } from "../i18n.jsx";
// import * as Water from '../substances/water/water.js';

const PHASE_INFO = {
  water: { cls: "phase-water", key: "phase.water" },
  steam: { cls: "phase-steam", key: "phase.steam" },
  ice: { cls: "phase-ice", key: "phase.ice" },
  gas: { cls: "phase-gas", key: "phase.gas" },
};

export default function Results({ result, onPickTemperatureC, thermo }) {
  const { t } = useI18n();
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    sectionRef.current.classList.remove("animate-in");
    void sectionRef.current.offsetWidth;
    sectionRef.current.classList.add("animate-in");
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, [result.token]);

  const { T, raw, pMPa, pRaw, pUnit, tempUnit } = result;
  const ph = thermo.phase(T, pMPa);
  const phaseInfo = PHASE_INFO[ph] || PHASE_INFO.water;
  const tsat = thermo.saturationTemp(pMPa);
  const tmelt = thermo.meltingTemp(pMPa);
  const props = thermo.getProperties(T, pMPa, t);

  return (
    <section
      ref={sectionRef}
      className="results-section"
      style={{ display: "block" }}
    >
      <div className="results-meta">
        <div className="results-temp">
          {tempUnit === "C" && <b>{T.toFixed(2)} °C</b>}
          {tempUnit === "K" && (
            <>
              <b>{raw.toFixed(2)} K</b>{" "}
              <span style={{ color: "var(--ink-3)", fontSize: 18 }}>
                ({T.toFixed(2)} °C)
              </span>
            </>
          )}
          {tempUnit === "F" && (
            <>
              <b>{raw.toFixed(2)} °F</b>{" "}
              <span style={{ color: "var(--ink-3)", fontSize: 18 }}>
                ({T.toFixed(2)} °C)
              </span>
            </>
          )}
        </div>

        <div className="results-pressure">
          <span className="rp-label">{t("results.pressureLabel")}:</span>{" "}
          <b>
            {pRaw} {pUnit}
          </b>
          {pUnit !== "MPa" && (
            <span className="rp-aux"> ({pMPa.toFixed(4)} MPa)</span>
          )}
        </div>

        <div className="results-tsat">
          {Number.isFinite(tsat) && (
            <>
              <span className="rp-label">{t("results.tsatLabel")}:</span>
              <b
                className="tsat-value"
                title={t("results.tsatHint")}
                onClick={() => onPickTemperatureC(tsat)}
              >
                {tsat.toFixed(2)} °C
              </b>
            </>
          )}
        </div>

        <div className="results-tmelt">
          {Number.isFinite(tmelt) && (
            <>
              <span className="rp-label">{t("results.tmeltLabel")}:</span>
              <b
                className="tmelt-value"
                title={t("results.tmeltHint")}
                onClick={() => onPickTemperatureC(tmelt)}
              >
                {tmelt.toFixed(2)} °C
              </b>{" "}
            </>
          )}
        </div>

        <div className={`phase-tag ${phaseInfo.cls}`}>{t(phaseInfo.key)}</div>
      </div>

      <div className="props-grid">
        {props.map((p, i) => (
          <div
            key={p.id}
            className="prop-cell"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <div className="prop-cell-top">
              <span className="prop-num">{p.id}</span>
              <span className="prop-symbol">{p.symbol}</span>
            </div>
            <div className="prop-name">{p.name}</div>
            <div className="prop-value-wrap">
              <div className="prop-value">{p.value}</div>
              <div className="prop-unit">{p.unit}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
