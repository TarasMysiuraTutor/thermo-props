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

import { useThermoCalc } from "./hooks/useThermoCalc";

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

  const calc = useThermoCalc(thermo);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (_) {}
  }, [history]);

  const onPickTemperatureC = useCallback(
    (tC) => {
      let val = tC;
      if (calc.tempUnit === "K") val = tC + 273.15;
      else if (calc.tempUnit === "F") val = (tC * 9) / 5 + 32;

      calc.setTempValue(val.toFixed(2));
      calc.calculate();
    },
    [calc],
  );



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
            tempValue={calc.tempValue}
            onTempChange={calc.setTempValue}
            tempUnit={calc.tempUnit}
            onTempUnitChange={calc.setTempUnit}
            pressureValue={calc.pressureValue}
            onPressureChange={calc.setPressureValue}
            pressureUnit={calc.pressureUnit}
            onPressureUnitChange={calc.setPressureUnit}
            calcMode={calc.calcMode}
            onCalcModeChange={calc.setCalcMode}
            onCalculate={calc.calculate}
            error={calc.error}
          />

          {/* <HistoryPanel
            entries={history}
            onPick={onHistoryPick}
            onClear={onClearHistory}
          /> */}

          {calc.result && (
            <>
              <Results
                result={calc.result}
                thermo={thermo}
                onPickTemperatureC={onPickTemperatureC}
              />
              <Chart result={calc.result} thermo={thermo} />
              <ExportBar result={calc.result} />
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
