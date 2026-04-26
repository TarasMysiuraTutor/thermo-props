import React, { useCallback, useEffect, useState } from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";

import { useI18n } from "./i18n.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import InputCard from "./components/InputCard.jsx";
import HistoryPanel from "./components/HistoryPanel.jsx";
import Results from "./components/Results.jsx";
import Chart from "./components/Chart.jsx";
import ExportBar from "./components/ExportBar.jsx";
import Footer from "./components/Footer.jsx";
import SubstanceSelector from "./components/SubstanceSelector.jsx";

import MarkdownContent from "./components/MarkdownContent";
import enWater from "./content/en/water.md?raw";
import ukWater from "./content/uk/water.md?raw";
import plWater from "./content/pl/water.md?raw";
import deWater from "./content/de/water.md?raw";
import enAir from "./content/en/air.md?raw";
import ukAir from "./content/uk/air.md?raw";
import plAir from "./content/pl/air.md?raw";
import deAir from "./content/de/air.md?raw";

import { substances, DEFAULT_SUBSTANCE_ID } from "./substances";

const HISTORY_KEY = "h2o.history";
const HISTORY_LIMIT = 10;

function SubstancePage({ substances }) {
  const { substanceId } = useParams();
  const id = substances[substanceId] ? substanceId : DEFAULT_SUBSTANCE_ID;

  return <AppContent substanceId={id} />;
}

function AppContent({ substanceId }) {
  const { t, lang } = useI18n();

  const substance = substances[substanceId];
  const thermo = substance.api;

  const contentBySubstance = {
    water: {
      en: enWater,
      uk: ukWater,
      pl: plWater,
      de: deWater,
    },

    air: {
      en: enAir,
      uk: ukAir,
      pl: plAir,
      de: deAir,
    },
  };

  const substanceContent =
    contentBySubstance[substanceId]?.[lang] ??
    contentBySubstance[substanceId]?.en;

  const [tempValue, setTempValue] = useState("");
  const [tempUnit, setTempUnit] = useState("C");
  const [pressureValue, setPressureValue] = useState("");
  const [pressureUnit, setPressureUnit] = useState("MPa");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => loadHistory());

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (_) {}
  }, [history]);

  const calculate = useCallback(() => {
    setError("");
    const raw = parseFloat(String(tempValue).replace(",", "."));
    if (isNaN(raw)) {
      setError(t("err.notNumber"));
      return;
    }

    let pRawStr = String(pressureValue).trim().replace(",", ".");
    let pRaw = pRawStr === "" ? null : parseFloat(pRawStr);
    let pMPa;
    if (pRaw === null) {
      pMPa = thermo.P_ATM_MPA;
      pRaw = pMPa;
    } else {
      if (isNaN(pRaw)) {
        setError(t("err.notNumber"));
        return;
      }
      pMPa = thermo.toMPa(pRaw, pressureUnit);
      if (pMPa < 0.001 || pMPa > 100) {
        setError(t("err.outOfPressure", { val: pRaw + " " + pressureUnit }));
        return;
      }
    }

    const T = thermo.toCelsius(raw, tempUnit);
    if (T < -100 || T > 800) {
      const range =
        tempUnit === "C"
          ? "−100 – 800 °C"
          : tempUnit === "K"
            ? "173.15 – 1073.15 K"
            : "−148 – 1472 °F";
      setError(t("err.outOfRange", { val: raw, range }));
      return;
    }

    const next = {
      T,
      raw,
      pMPa,
      pRaw,
      pUnit: pressureUnit,
      tempUnit,
      token: Date.now(),
    };
    setResult(next);

    setHistory((prev) => {
      const filtered = prev.filter(
        (e) =>
          !(
            e.raw === raw &&
            e.unit === tempUnit &&
            e.pRaw === pRaw &&
            e.pUnit === pressureUnit
          ),
      );
      const updated = [
        {
          raw,
          unit: tempUnit,
          T,
          pRaw,
          pUnit: pressureUnit,
          pMPa,
          ts: Date.now(),
        },
        ...filtered,
      ];
      return updated.slice(0, HISTORY_LIMIT);
    });
  }, [tempValue, tempUnit, pressureValue, pressureUnit, t, thermo]);

  const onPickTemperatureC = useCallback(
    (tC) => {
      let val = tC;
      if (tempUnit === "K") val = tC + 273.15;
      else if (tempUnit === "F") val = (tC * 9) / 5 + 32;
      setTempValue(val.toFixed(2));
      // Defer calculation so the state update is applied first.
      setTimeout(() => {
        // We can't call calculate() here directly because closures capture
        // the previous tempValue — instead, push directly using the new value.
        const raw = val;
        const T = thermo.toCelsius(raw, tempUnit);
        let pRawStr = String(pressureValue).trim().replace(",", ".");
        let pRaw = pRawStr === "" ? null : parseFloat(pRawStr);
        let pMPa;
        if (pRaw === null) {
          pMPa = thermo.P_ATM_MPA;
          pRaw = pMPa;
        } else {
          pMPa = thermo.toMPa(pRaw, pressureUnit);
        }
        if (T < -100 || T > 800) return;
        if (pMPa < 0.001 || pMPa > 100) return;
        setResult({
          T,
          raw,
          pMPa,
          pRaw,
          pUnit: pressureUnit,
          tempUnit,
          token: Date.now(),
        });
      }, 0);
    },
    [tempUnit, pressureUnit, pressureValue, thermo],
  );

  const onHistoryPick = useCallback((entry) => {
    setTempUnit(entry.unit);
    setTempValue(String(entry.raw));
    if (entry.pRaw != null && entry.pUnit) {
      setPressureUnit(entry.pUnit);
      setPressureValue(String(entry.pRaw));
    }
    // Rebuild result directly using the entry's stored values.
    const T = entry.T;
    setResult({
      T,
      raw: entry.raw,
      pMPa: entry.pMPa,
      pRaw: entry.pRaw,
      pUnit: entry.pUnit,
      tempUnit: entry.unit,
      token: Date.now(),
    });
  }, []);

  const onClearHistory = useCallback(() => setHistory([]), []);

  return (
    <div className="page-wrap">
      <Header />
      <Hero substance={substance} />

      <main className="main-content">
        <div className="container">
          {/* <h2 className="section-title">{t("section.theory")}</h2> */}
          <SubstanceSelector substances={substances} activeId={substanceId} />

          {substanceContent && <MarkdownContent content={substanceContent} />}

          <InputCard
            tempValue={tempValue}
            onTempChange={setTempValue}
            tempUnit={tempUnit}
            onTempUnitChange={setTempUnit}
            pressureValue={pressureValue}
            onPressureChange={setPressureValue}
            pressureUnit={pressureUnit}
            onPressureUnitChange={setPressureUnit}
            onCalculate={calculate}
            error={error}
          />

          <HistoryPanel
            entries={history}
            onPick={onHistoryPick}
            onClear={onClearHistory}
          />

          {result && (
            <>
              <Results
                result={result}
                onPickTemperatureC={onPickTemperatureC}
                thermo={thermo}
              />
              <Chart result={result} thermo={thermo} />

              <ExportBar result={result} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (_) {
    return [];
  }
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/:substanceId"
        element={<SubstancePage substances={substances} />}
      />
      <Route path="/" element={<Navigate to="/water" replace />} />
    </Routes>
  );
}
