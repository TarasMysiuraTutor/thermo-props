import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const dict = {
  uk: {
    "hero.propertiesOf": "Теплофізичні властивості",
    "hero.genericDesc":
      "Введіть температуру та тиск, щоб отримати базові теплофізичні властивості вибраної речовини.",
    "meta.title": "Теплофізичні властивості води · H₂O Calc",
    "header.sub": "Thermo Calc",
    "header.badge": "IAPWS-IF97 · 101.325 кПа",
    "hero.eyebrow": "Термодинамічний калькулятор",
    "hero.title1": "Теплофізичні",
    "hero.title2": "властивості води",
    "hero.desc":
      "Введіть температуру — отримайте густину, теплоємність, теплопровідність, в'язкість та інші властивості рідкої води.",
    "input.cardTitle": "Параметри розрахунку",
    "input.tempLabel": "Температура",
    "input.pressureLabel": "Тиск",
    "input.unitsLabel": "Одиниці",
    "input.calcBtn": "Розрахувати",
    "input.range.water":
      "Допустимі діапазони: <b>-100 — 800 °C</b> &ensp;·&ensp; <b>0.001 — 100 МПа</b> &ensp;·&ensp; авто: лід / рідина / пара",
    "input.range.air":
      "Допустимі діапазони: <b>0 – 800 °C</b>&ensp;·&ensp; <b>0.001 – 100 МПа</b>",
    "err.outOfPressure":
      "Тиск {val} виходить за межі допустимого діапазону (0.001 — 100 МПа).",
    "results.pressureLabel": "Тиск",
    "results.tsatLabel": "T насичення",
    "results.tsatHint": "Натисніть, щоб підставити в поле температури",
    "results.tmeltLabel": "T замерзання",
    "results.tmeltHint":
      "Температура плавлення льоду при поточному тиску. Натисніть, щоб підставити",
    "footer.note":
      'Розраховано за апроксимаційними формулами стандарту <a href="https://www.iapws.org" target="_blank" rel="noopener">IAPWS-IF97</a>. Похибка < 1% у робочому діапазоні.',
    "footer.copy": "H₂O Thermo Calc © 2026",
    "footer.version": "Версія",
    "theme.light": "Світла тема",
    "theme.auto": "Авто (за системою)",
    "theme.dark": "Темна тема",
    "chart.title": "Графік властивості від температури",
    "chart.propLabel": "Властивість:",
    "chart.legendLiquid": "рідка вода",
    "chart.legendSteam": "перегріта пара",
    "chart.legendTsat": "T насичення",
    "chart.legendTmelt": "T замерзання",
    "chart.legendCurrent": "поточна T",
    "chart.exportPng": "Завантажити PNG",
    "chart.legendIce": "лід",
    "chart.singlePhaseNote":
      "Графік фазових залежностей не будується для однофазних газів у поточній моделі.",
    "phase.water": "Рідка вода",
    "phase.steam": "Перегріта пара",
    "phase.ice": "Лід",
    "phase.gas": "Газ",
    "err.notNumber": "Будь ласка, введіть числове значення температури.",
    "err.outOfRange":
      "Значення {val} виходить за межі допустимого діапазону ({range}).",
    "export.title": "Експорт результатів",
    "export.csv": "Завантажити CSV",
    "export.pdf": "Зберегти як PDF",
    "export.headerProp": "Властивість",
    "export.headerSymbol": "Символ",
    "export.headerValue": "Значення",
    "export.headerUnit": "Одиниці",
    "export.tempLabel": "Температура",
    "export.phaseLabel": "Фаза",
    "export.generated": "Згенеровано",
    "history.title": "Історія розрахунків",
    "history.clear": "Очистити",
    "history.empty": "Поки що немає збережених розрахунків.",
    "prop.density": "Густина",
    "prop.cp": "Питома теплоємність",
    "prop.lambda": "Теплопровідність",
    "prop.a": "Температуропровідність",
    "prop.mu": "Динамічна в'язкість",
    "prop.nu": "Кінематична в'язкість",
    "prop.Pr": "Число Прандтля",
    "prop.sigma": "Поверхневий натяг",
    "prop.beta": "Коеф. об'ємного розширення",
    "prop.Pv": "Тиск насиченої пари",
    "prop.h": "Ентальпія",
    "prop.hfg": "Теплота пароутворення",
    "prop.hsf": "Теплота плавлення",
    "prop.v": "Питомий об'єм",
    "prop.gamma": "Показник адіабати",
    "prop.sound": "Швидкість звуку",
    "unit.hfg": "кДж/кг",
    "unit.hsf": "кДж/кг",
    "unit.v": "м³/кг",
    "unit.gamma": "—",
    "unit.sound": "м/с",
    "unit.density": "кг/м³",
    "unit.cp": "Дж/(кг·К)",
    "unit.lambda": "Вт/(м·К)",
    "unit.a": "м²/с",
    "unit.mu": "Па·с",
    "unit.nu": "м²/с",
    "unit.Pr": "безрозмірне",
    "unit.sigma": "Н/м",
    "unit.beta": "1/К",
    "unit.Pv": "кПа",
    "unit.h": "кДж/кг",
  },
  en: {
    "hero.propertiesOf": "Thermophysical properties",
    "hero.genericDesc":
      "Enter temperature and pressure to get the basic thermophysical properties of the selected substance.",
    "meta.title": "Thermophysical properties of water · H₂O Calc",
    "header.sub": "Thermo Calc",
    "header.badge": "IAPWS-IF97 · 101.325 kPa",
    "hero.eyebrow": "Thermodynamic calculator",
    "hero.title1": "Thermophysical",
    "hero.title2": "properties of water",
    "hero.desc":
      "Enter a temperature to get density, specific heat, thermal conductivity, viscosity and other properties of liquid water.",
    "input.cardTitle": "Calculation parameters",
    "input.tempLabel": "Temperature",
    "input.pressureLabel": "Pressure",
    "input.unitsLabel": "Units",
    "input.calcBtn": "Calculate",
    "input.range.water":
      "Valid ranges: <b>-100 — 800 °C</b> &ensp;·&ensp; <b>0.001 — 100 MPa</b> &ensp;·&ensp; auto: ice / liquid / steam",
    "input.range.air":
      "Valid ranges: <b>0 – 800 °C</b>&ensp;·&ensp; <b>0.001 – 100 MPa</b>",

    "err.outOfPressure":
      "Pressure {val} is outside the allowed range (0.001 — 100 MPa).",
    "results.pressureLabel": "Pressure",
    "results.tsatLabel": "Saturation T",
    "results.tsatHint": "Click to use this value as temperature",
    "results.tmeltLabel": "Melting T",
    "results.tmeltHint":
      "Ice melting temperature at the current pressure. Click to use as temperature",
    "footer.note":
      'Computed using approximation formulas of the <a href="https://www.iapws.org" target="_blank" rel="noopener">IAPWS-IF97</a> standard. Error < 1% within the working range.',
    "footer.copy": "H₂O Thermo Calc © 2026",
    "footer.version": "Version",
    "theme.light": "Light theme",
    "theme.auto": "Auto (system)",
    "theme.dark": "Dark theme",
    "chart.title": "Property vs. temperature",
    "chart.propLabel": "Property:",
    "chart.legendLiquid": "liquid water",
    "chart.legendSteam": "superheated steam",
    "chart.legendTsat": "saturation T",
    "chart.legendTmelt": "melting T",
    "chart.legendCurrent": "current T",
    "chart.exportPng": "Download PNG",
    "chart.legendIce": "ice",
    "chart.singlePhaseNote":
      "Phase-dependent charts are not displayed for single-phase gases in the current model.",
    "phase.water": "Liquid water",
    "phase.steam": "Superheated steam",
    "phase.ice": "Ice",
    "phase.gas": "Gas",
    "err.notNumber": "Please enter a numeric temperature value.",
    "err.outOfRange": "Value {val} is outside the allowed range ({range}).",
    "export.title": "Export results",
    "export.csv": "Download CSV",
    "export.pdf": "Save as PDF",
    "export.headerProp": "Property",
    "export.headerSymbol": "Symbol",
    "export.headerValue": "Value",
    "export.headerUnit": "Unit",
    "export.tempLabel": "Temperature",
    "export.phaseLabel": "Phase",
    "export.generated": "Generated",
    "history.title": "Calculation history",
    "history.clear": "Clear",
    "history.empty": "No saved calculations yet.",
    "prop.density": "Density",
    "prop.cp": "Specific heat capacity",
    "prop.lambda": "Thermal conductivity",
    "prop.a": "Thermal diffusivity",
    "prop.mu": "Dynamic viscosity",
    "prop.nu": "Kinematic viscosity",
    "prop.Pr": "Prandtl number",
    "prop.sigma": "Surface tension",
    "prop.beta": "Volumetric expansion coeff.",
    "prop.Pv": "Saturation vapor pressure",
    "prop.h": "Enthalpy",
    "prop.hfg": "Latent heat of vaporization",
    "prop.hsf": "Latent heat of fusion",
    "prop.v": "Specific volume",
    "prop.gamma": "Adiabatic index",
    "prop.sound": "Speed of sound",
    "unit.hfg": "kJ/kg",
    "unit.hsf": "kJ/kg",
    "unit.v": "m³/kg",
    "unit.gamma": "—",
    "unit.sound": "m/s",
    "unit.density": "kg/m³",
    "unit.cp": "J/(kg·K)",
    "unit.lambda": "W/(m·K)",
    "unit.a": "m²/s",
    "unit.mu": "Pa·s",
    "unit.nu": "m²/s",
    "unit.Pr": "dimensionless",
    "unit.sigma": "N/m",
    "unit.beta": "1/K",
    "unit.Pv": "kPa",
    "unit.h": "kJ/kg",
  },
  pl: {
    "hero.propertiesOf": "Właściwości termofizyczne",
    "hero.genericDesc":
      "Wprowadź temperaturę i ciśnienie, aby uzyskać podstawowe właściwości termofizyczne wybranej substancji.",
    "meta.title": "Właściwości termofizyczne wody · H₂O Calc",
    "header.sub": "Thermo Calc",
    "header.badge": "IAPWS-IF97 · 101,325 kPa",
    "hero.eyebrow": "Kalkulator termodynamiczny",
    "hero.title1": "Właściwości termofizyczne",
    "hero.title2": "wody",
    "hero.desc":
      "Wprowadź temperaturę, aby uzyskać gęstość, ciepło właściwe, przewodność cieplną, lepkość i inne właściwości wody w stanie ciekłym.",
    "input.cardTitle": "Parametry obliczeń",
    "input.tempLabel": "Temperatura",
    "input.pressureLabel": "Ciśnienie",
    "input.unitsLabel": "Jednostki",
    "input.calcBtn": "Oblicz",
    "input.range.water":
      "Dopuszczalne zakresy: <b>-100 — 800 °C</b> &ensp;·&ensp; <b>0.001 — 100 MPa</b> &ensp;·&ensp; авто: Lód / ciecz / para",
    "input.range.air":
      "Dopuszczalne zakresy: <b>0 – 800 °C</b>&ensp;·&ensp; <b>0,001 – 100 MPa</b>",
    "err.outOfPressure":
      "Ciśnienie {val} wykracza poza dopuszczalny zakres (0,001 — 100 MPa).",
    "results.pressureLabel": "Ciśnienie",
    "results.tsatLabel": "T nasycenia",
    "results.tsatHint": "Kliknij, aby wstawić jako temperaturę",
    "results.tmeltLabel": "T topnienia",
    "results.tmeltHint":
      "Temperatura topnienia lodu przy bieżącym ciśnieniu. Kliknij, aby wstawić",
    "footer.note":
      'Obliczone według wzorów aproksymacyjnych standardu <a href="https://www.iapws.org" target="_blank" rel="noopener">IAPWS-IF97</a>. Błąd < 1% w zakresie roboczym.',
    "footer.copy": "H₂O Thermo Calc © 2026",
    "footer.version": "Wersja",
    "theme.light": "Motyw jasny",
    "theme.auto": "Auto (systemowy)",
    "theme.dark": "Motyw ciemny",
    "chart.title": "Wykres właściwości od temperatury",
    "chart.propLabel": "Właściwość:",
    "chart.legendLiquid": "woda ciekła",
    "chart.legendSteam": "para przegrzana",
    "chart.legendTsat": "T nasycenia",
    "chart.legendTmelt": "T topnienia",
    "chart.legendCurrent": "aktualna T",
    "chart.exportPng": "Pobierz PNG",
    "chart.legendIce": "lód",
    "chart.singlePhaseNote":
      "Wykres fazy nie jest wyświetlany dla jednofazowych gazów w obecnym modelu.",
    "phase.water": "Woda ciekła",
    "phase.steam": "Para przegrzana",
    "phase.ice": "Lód",
    "phase.gas": "Gaz",
    "err.notNumber": "Proszę podać liczbową wartość temperatury.",
    "err.outOfRange":
      "Wartość {val} wykracza poza dopuszczalny zakres ({range}).",
    "export.title": "Eksport wyników",
    "export.csv": "Pobierz CSV",
    "export.pdf": "Zapisz jako PDF",
    "export.headerProp": "Właściwość",
    "export.headerSymbol": "Symbol",
    "export.headerValue": "Wartość",
    "export.headerUnit": "Jednostka",
    "export.tempLabel": "Temperatura",
    "export.phaseLabel": "Faza",
    "export.generated": "Wygenerowano",
    "history.title": "Historia obliczeń",
    "history.clear": "Wyczyść",
    "history.empty": "Brak zapisanych obliczeń.",
    "prop.density": "Gęstość",
    "prop.cp": "Ciepło właściwe",
    "prop.lambda": "Przewodność cieplna",
    "prop.a": "Dyfuzyjność cieplna",
    "prop.mu": "Lepkość dynamiczna",
    "prop.nu": "Lepkość kinematyczna",
    "prop.Pr": "Liczba Prandtla",
    "prop.sigma": "Napięcie powierzchniowe",
    "prop.beta": "Wsp. rozszerzalności obj.",
    "prop.Pv": "Ciśnienie pary nasyconej",
    "prop.h": "Entalpia",
    "prop.hfg": "Ciepło parowania",
    "prop.hsf": "Ciepło topnienia",
    "prop.v": "Objętość właściwa",
    "prop.gamma": "Wykładnik adiabaty",
    "prop.sound": "Prędkość dźwięku",
    "unit.hfg": "kJ/kg",
    "unit.hsf": "kJ/kg",
    "unit.v": "m³/kg",
    "unit.gamma": "—",
    "unit.sound": "m/s",
    "unit.density": "kg/m³",
    "unit.cp": "J/(kg·K)",
    "unit.lambda": "W/(m·K)",
    "unit.a": "m²/s",
    "unit.mu": "Pa·s",
    "unit.nu": "m²/s",
    "unit.Pr": "bezwymiarowa",
    "unit.sigma": "N/m",
    "unit.beta": "1/K",
    "unit.Pv": "kPa",
    "unit.h": "kJ/kg",
  },
  de: {
    "hero.propertiesOf": "Thermophysikalische Eigenschaften",
    "hero.genericDesc":
      "Geben Sie eine Temperatur und einen Druck ein, um die grundlegenden thermophysikalischen Eigenschaften der ausgewählten Substanz zu erhalten.",
    "meta.title": "Thermophysikalische Eigenschaften von Wasser · H₂O Calc",
    "header.sub": "Thermo Calc",
    "header.badge": "IAPWS-IF97 · 101,325 kPa",
    "hero.eyebrow": "Thermodynamischer Rechner",
    "hero.title1": "Thermophysikalische",
    "hero.title2": "Eigenschaften des Wassers",
    "hero.desc":
      "Geben Sie eine Temperatur ein, um Dichte, spezifische Wärmekapazität, Wärmeleitfähigkeit, Viskosität und weitere Eigenschaften flüssigen Wassers zu erhalten.",
    "input.cardTitle": "Berechnungsparameter",
    "input.tempLabel": "Temperatur",
    "input.pressureLabel": "Druck",
    "input.unitsLabel": "Einheiten",
    "input.calcBtn": "Berechnen",
    "input.range.water":
      "Zulässige Bereiche: <b>-100 — 800 °C</b> &ensp;·&ensp; <b>0.001 — 100 MPa</b> &ensp;·&ensp; авто: Eis / Flüssigkeit / Dampf",
    "input.range.air":
      "Zulässige Bereiche: <b>0 – 800 °C</b>&ensp;·&ensp; <b>0,001 – 100 MPa</b>",
    "err.outOfPressure":
      "Druck {val} liegt außerhalb des zulässigen Bereichs (0,001 — 100 MPa).",
    "results.pressureLabel": "Druck",
    "results.tsatLabel": "Sättigungstemperatur",
    "results.tsatHint": "Klicken, um als Temperatur zu übernehmen",
    "results.tmeltLabel": "Schmelztemperatur",
    "results.tmeltHint":
      "Schmelztemperatur von Eis beim aktuellen Druck. Klicken, um zu übernehmen",
    "footer.note":
      'Berechnet nach Näherungsformeln des Standards <a href="https://www.iapws.org" target="_blank" rel="noopener">IAPWS-IF97</a>. Fehler < 1% im Arbeitsbereich.',
    "footer.copy": "H₂O Thermo Calc © 2026",
    "footer.version": "Version",
    "theme.light": "Helles Design",
    "theme.auto": "Auto (System)",
    "theme.dark": "Dunkles Design",
    "chart.title": "Eigenschaft über Temperatur",
    "chart.propLabel": "Eigenschaft:",
    "chart.legendLiquid": "flüssiges Wasser",
    "chart.legendSteam": "überhitzter Dampf",
    "chart.legendTsat": "Sättigungs-T",
    "chart.legendTmelt": "Schmelz-T",
    "chart.legendCurrent": "aktuelle T",
    "chart.exportPng": "PNG herunterladen",
    "chart.legendIce": "Eis",
    "chart.singlePhaseNote":
      "Phasenabhängige Diagramme werden für einphasige Gase im aktuellen Modell nicht angezeigt.",
    "phase.water": "Flüssiges Wasser",
    "phase.steam": "Überhitzter Dampf",
    "phase.ice": "Eis",
    "phase.gas": "Gaz",
    "err.notNumber": "Bitte geben Sie einen numerischen Temperaturwert ein.",
    "err.outOfRange":
      "Wert {val} liegt außerhalb des zulässigen Bereichs ({range}).",
    "export.title": "Ergebnisse exportieren",
    "export.csv": "CSV herunterladen",
    "export.pdf": "Als PDF speichern",
    "export.headerProp": "Eigenschaft",
    "export.headerSymbol": "Symbol",
    "export.headerValue": "Wert",
    "export.headerUnit": "Einheit",
    "export.tempLabel": "Temperatur",
    "export.phaseLabel": "Phase",
    "export.generated": "Erstellt",
    "history.title": "Berechnungsverlauf",
    "history.clear": "Löschen",
    "history.empty": "Noch keine gespeicherten Berechnungen.",
    "prop.density": "Dichte",
    "prop.cp": "Spezifische Wärmekapazität",
    "prop.lambda": "Wärmeleitfähigkeit",
    "prop.a": "Temperaturleitfähigkeit",
    "prop.mu": "Dynamische Viskosität",
    "prop.nu": "Kinematische Viskosität",
    "prop.Pr": "Prandtl-Zahl",
    "prop.sigma": "Oberflächenspannung",
    "prop.beta": "Volum. Ausdehnungskoeff.",
    "prop.Pv": "Sättigungsdampfdruck",
    "prop.h": "Enthalpie",
    "prop.hfg": "Verdampfungsenthalpie",
    "prop.hsf": "Schmelzenthalpie",
    "prop.v": "Spezifisches Volumen",
    "prop.gamma": "Adiabatenexponent",
    "prop.sound": "Schallgeschwindigkeit",
    "unit.hfg": "kJ/kg",
    "unit.hsf": "kJ/kg",
    "unit.v": "m³/kg",
    "unit.gamma": "—",
    "unit.sound": "m/s",
    "unit.density": "kg/m³",
    "unit.cp": "J/(kg·K)",
    "unit.lambda": "W/(m·K)",
    "unit.a": "m²/s",
    "unit.mu": "Pa·s",
    "unit.nu": "m²/s",
    "unit.Pr": "dimensionslos",
    "unit.sigma": "N/m",
    "unit.beta": "1/K",
    "unit.Pv": "kPa",
    "unit.h": "kJ/kg",
  },
};

const SUPPORTED = ["uk", "en", "pl", "de"];
const STORAGE_KEY = "h2o.lang";

function detectInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.includes(saved)) return saved;
  } catch (_) {}
  const nav = (typeof navigator !== "undefined" ? navigator.language : "uk")
    .slice(0, 2)
    .toLowerCase();
  return SUPPORTED.includes(nav) ? nav : "uk";
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitial);

  const setLang = useCallback((next) => {
    if (!SUPPORTED.includes(next)) return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {}
  }, []);

  const t = useCallback(
    (key, vars) => {
      const tbl = dict[lang] || dict.uk;
      let s =
        tbl[key] != null ? tbl[key] : dict.uk[key] != null ? dict.uk[key] : key;
      if (vars) {
        for (const k in vars) s = s.replace("{" + k + "}", vars[k]);
      }
      return s;
    },
    [lang],
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t("meta.title");
  }, [lang, t]);

  const value = useMemo(
    () => ({ lang, setLang, t, supported: SUPPORTED }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
