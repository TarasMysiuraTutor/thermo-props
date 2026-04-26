// src/substances/air/air.js

export const P_ATM_MPA = 0.101325;

// --------------------
// Units helpers
// --------------------
export function toCelsius(T, unit) {
  if (unit === 'K') return T - 273.15;
  if (unit === 'F') return (T - 32) * 5 / 9;
  return T;
}

export function toMPa(p, unit) {
  if (unit === 'kPa') return p / 1000;
  if (unit === 'bar') return p / 10;
  if (unit === 'atm') return p * 0.101325;
  return p;
}

// --------------------
// Phase logic (AIR = GAS)
// --------------------
export function phase() {
  return 'gas'; // використовуємо gas як "газ"
}

// --------------------
// Saturation / melting (not applicable)
// --------------------
export function saturationTemp() {
  return NaN;
}

export function meltingTemp() {
  return NaN;
}

// --------------------
// Thermophysical properties
// --------------------
export function getProperties(T, pMPa, t) {
  const rho = density(T, pMPa);

  return [
    { id: 'rho',  symbol: 'ρ',  name: t('prop.density'), value: rho.toFixed(3), unit: t('unit.density') },
    { id: 'cp',   symbol: 'cₚ', name: t('prop.cp'),      value: '1005',         unit: t('unit.cp') },
    { id: 'lambda', symbol: 'λ', name: t('prop.lambda'), value: '0.026',        unit: t('unit.lambda') },
    { id: 'mu',   symbol: 'μ',  name: t('prop.mu'),      value: '1.8e‑5',        unit: t('unit.mu') },
  ];
}

// --------------------
// Simple ideal‑gas models
// --------------------
export function density(T, pMPa) {
  const R = 287.05; // J/(kg·K)
  const T_K = T + 273.15;
  const p_Pa = pMPa * 1e6;
  return p_Pa / (R * T_K);
}