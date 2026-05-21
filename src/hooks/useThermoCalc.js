import { useCallback, useState } from "react";

export function useThermoCalc(thermo) {
  const [tempValue, setTempValue] = useState("");
  const [tempUnit, setTempUnit] = useState("C");

  const [pressureValue, setPressureValue] = useState("");
  const [pressureUnit, setPressureUnit] = useState("MPa");

  const [calcMode, setCalcMode] = useState("tp"); // 'tp' | 'satT'
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const calculate = useCallback(() => {
    setError("");

    const rawT = parseFloat(String(tempValue).replace(",", "."));
    if (isNaN(rawT)) {
      setError("Invalid temperature");
      return;
    }

    const T = thermo.toCelsius(rawT, tempUnit);

    let pMPa;
    let pRaw = pressureValue;

    if (calcMode === "satT") {
      pMPa = thermo.saturationPressureMPa(T);
      pRaw = pMPa;
    } else {
      const rawP = parseFloat(String(pressureValue).replace(",", "."));
      if (isNaN(rawP)) {
        setError("Invalid pressure");
        return;
      }
      pMPa = thermo.toMPa(rawP, pressureUnit);
    }

    setResult({
      T,
      raw: rawT,
      tempUnit,
      pMPa,
      pRaw,
      pUnit: pressureUnit,
      token: Date.now(),
    });
  }, [
    thermo,
    tempValue,
    tempUnit,
    pressureValue,
    pressureUnit,
    calcMode,
  ]);

  return {
    // state
    tempValue,
    tempUnit,
    pressureValue,
    pressureUnit,
    calcMode,
    error,
    result,

    // setters
    setTempValue,
    setTempUnit,
    setPressureValue,
    setPressureUnit,
    setCalcMode,

    // actions
    calculate,
  };
}