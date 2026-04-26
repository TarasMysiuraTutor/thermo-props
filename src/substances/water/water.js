/**
 * water.js — Thermophysical properties of water and steam (ES module).
 * Liquid: 0–370 °C, 0.001–100 MPa.
 * Superheated steam: ideal-gas density + engineering correlations.
 * Ice Ih: ~ -100..0 °C.
 */

export const P_ATM_MPA = 0.101325;
const KAPPA_T = 4.5e-10; // 1/Pa, isothermal compressibility (avg.)

export function toCelsius(val, unit) {
  if (unit === 'K') return val - 273.15;
  if (unit === 'F') return ((val - 32) * 5) / 9;
  return val;
}

export function toMPa(val, unit) {
  switch (unit) {
    case 'kPa': return val / 1000;
    case 'bar': return val / 10;
    case 'atm': return val * P_ATM_MPA;
    default:    return val; // MPa
  }
}

export function saturationTemp(pMPa) {
  if (pMPa <= 0) return 0;
  const PmmHg = (pMPa * 1000) / 0.133322;
  const denom = 8.07131 - Math.log10(PmmHg);
  if (denom <= 0) return 374;
  return 1730.63 / denom - 233.426;
}

export function saturationPressureMPa(T) {
  return (Math.pow(10, 8.07131 - 1730.63 / (233.426 + T)) * 0.133322) / 1000;
}

export function phase(T, pMPa = P_ATM_MPA) {
  if (T < 0.01) return 'ice';
  const Tsat = saturationTemp(pMPa);
  if (T > Tsat) return 'steam';
  return 'water';
}

export function latentHeat(Tcels) {
  const Tc = 647.1;
  const Tk = Tcels + 273.15;
  if (Tk >= Tc) return 0;
  return 262.1 * Math.pow(Tc - Tk, 0.38);
}

export function computeSteam(T, pMPa) {
  const Tk = T + 273.15;
  const Pa = pMPa * 1e6;
  const R_s = 461.5;

  const rho = Pa / (R_s * Tk);
  const v = 1 / rho;

  const cp = 2073 - 0.86 * T + 3.4e-3 * T * T;
  const cv = cp - R_s;
  const gamma = cp / cv;
  const sound = Math.sqrt(gamma * R_s * Tk);

  const lambda = 0.0163 + 8.4e-5 * T;
  const mu = 7.9e-6 + 4.13e-8 * T;
  const nu = mu / rho;
  const a = lambda / (rho * cp);
  const Pr = (mu * cp) / lambda;
  const beta = 1 / Tk;

  const Tsat = saturationTemp(pMPa);
  const h_f = 4.1868 * Tsat * (1 + 0.00055 * Tsat);
  const h_fg = latentHeat(Tsat);
  const dT = Math.max(0, T - Tsat);
  const h = h_f + h_fg + (cp / 1000) * dT;

  return { rho, v, cp, gamma, sound, lambda, mu, nu, a, Pr, beta, h, h_fg };
}

export function compute(T, pMPa = P_ATM_MPA) {
  const t = T;
  const Tk = T + 273.15;

  const rho0 =
    (999.83952 +
      16.945176 * t -
      7.9870401e-3 * t ** 2 -
      46.170461e-6 * t ** 3 +
      105.56302e-9 * t ** 4 -
      280.54253e-12 * t ** 5) /
    (1 + 16.87985e-3 * t);

  const dP_Pa = (pMPa - P_ATM_MPA) * 1e6;
  const rho = rho0 * (1 + KAPPA_T * dP_Pa);

  const cp =
    4215.9 - 3.7254 * t + 1.4979e-2 * t ** 2 - 1.5421e-5 * t ** 3 + 5.926e-9 * t ** 4;

  const lambda = 0.565 + 1.796e-3 * t - 5.9e-6 * t ** 2;
  const mu = 2.414e-5 * Math.pow(10, 247.8 / (Tk - 140));
  const nu = mu / rho;
  const a = lambda / (rho * cp);
  const Pr = (mu * cp) / lambda;

  const Tc = 647.096;
  const tau = 1 - Tk / Tc;
  const sigma = tau > 0 ? 0.2358 * Math.pow(tau, 1.256) * (1 - 0.625 * tau) : 0;

  const beta = Math.max(
    0,
    -6.8e-5 + 9.109e-6 * t - 1.0e-7 * t ** 2 + 1.21e-9 * t ** 3
  );

  const Pv = saturationPressureMPa(t) * 1000;
  const h = 4.1868 * t * (1 + 0.00055 * t);

  const Tsat = saturationTemp(pMPa);
  const h_fg = latentHeat(Tsat);

  return { rho, cp, lambda, mu, nu, a, Pr, sigma, beta, Pv, h, h_fg };
}

export function meltingTemp(pMPa = P_ATM_MPA) {
  if (pMPa <= 611.657e-6) return 0.01;
  const pn = 611.657e-6;
  const Tn = 273.16;
  const pi = pMPa / pn;
  let theta = 1.0;
  for (let i = 0; i < 80; i++) {
    const t_neg3 = Math.pow(theta, -3);
    const t_21 = Math.pow(theta, 21.2);
    const F = 1 - 0.626e6 * (1 - t_neg3) + 0.197135e6 * (1 - t_21) - pi;
    const Fp =
      -0.626e6 * (3 * Math.pow(theta, -4)) +
      0.197135e6 * (-21.2 * Math.pow(theta, 20.2));
    const dx = F / Fp;
    theta -= dx;
    if (!isFinite(theta) || theta <= 0) {
      theta = 1;
      break;
    }
    if (Math.abs(dx) < 1e-12) break;
  }
  return theta * Tn - 273.15;
}

export function computeIce(T, pMPa = P_ATM_MPA) {
  const Tc = T;
  const Tk = T + 273.15;

  const rho = 916.7 - 0.1403 * Tc;
  const cp = 2096.6 + 6.49 * Tc;
  const lambda = 632 / Tk + 0.38 - 0.00197 * Tk;
  const a = lambda / (rho * cp);
  const beta = 3 * (53e-6 + 0.36e-6 * Tc);
  const h_sf = 333.55;
  const h = -h_sf + (2.0966 * Tc + ((6.49 / 2) * Tc * Tc) / 1000);
  const sound = 3840 + 4 * Tc;

  return { T: Tc, pMPa, rho, cp, lambda, a, beta, h_sf, h, sound };
}

export function fmt(val, digits = 4) {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const abs = Math.abs(val);
  if (abs === 0) return '0';
  if (abs < 1e-4 || abs >= 1e6) return val.toExponential(3);
  return val.toFixed(digits);
}

/**
 * Return a list of property descriptors for the current phase.
 * Names/units are translated by the supplied `t(key)` function.
 */
export function getProperties(T, pMPa, t) {
  if (pMPa == null) pMPa = P_ATM_MPA;
  const ph = phase(T, pMPa);

  if (ph === 'ice') {
    const p = computeIce(T, pMPa);
    return [
      { id: '01', symbol: 'ρ',    name: t('prop.density'), value: fmt(p.rho, 2),    unit: t('unit.density'), raw: p.rho },
      { id: '02', symbol: 'cₚ',  name: t('prop.cp'),      value: fmt(p.cp, 1),     unit: t('unit.cp'),      raw: p.cp },
      { id: '03', symbol: 'λ',    name: t('prop.lambda'),  value: fmt(p.lambda, 3), unit: t('unit.lambda'),  raw: p.lambda },
      { id: '04', symbol: 'a',    name: t('prop.a'),       value: fmt(p.a, 4),      unit: t('unit.a'),       raw: p.a },
      { id: '05', symbol: 'β',    name: t('prop.beta'),    value: fmt(p.beta, 6),   unit: t('unit.beta'),    raw: p.beta },
      { id: '06', symbol: 'c',    name: t('prop.sound'),   value: fmt(p.sound, 1),  unit: t('unit.sound'),   raw: p.sound },
      { id: '07', symbol: 'h',    name: t('prop.h'),       value: fmt(p.h, 2),      unit: t('unit.h'),       raw: p.h },
      { id: '08', symbol: 'L_sf', name: t('prop.hsf'),     value: fmt(p.h_sf, 2),   unit: t('unit.hsf'),     raw: p.h_sf },
    ];
  }

  if (ph === 'steam') {
    const p = computeSteam(T, pMPa);
    return [
      { id: '01', symbol: 'ρ',  name: t('prop.density'), value: fmt(p.rho, 4),    unit: t('unit.density'), raw: p.rho },
      { id: '02', symbol: 'v',  name: t('prop.v'),       value: fmt(p.v, 4),      unit: t('unit.v'),       raw: p.v },
      { id: '03', symbol: 'cₚ', name: t('prop.cp'),      value: fmt(p.cp, 1),     unit: t('unit.cp'),      raw: p.cp },
      { id: '04', symbol: 'γ',  name: t('prop.gamma'),   value: fmt(p.gamma, 3),  unit: t('unit.gamma'),   raw: p.gamma },
      { id: '05', symbol: 'λ',  name: t('prop.lambda'),  value: fmt(p.lambda, 4), unit: t('unit.lambda'),  raw: p.lambda },
      { id: '06', symbol: 'a',  name: t('prop.a'),       value: fmt(p.a, 4),      unit: t('unit.a'),       raw: p.a },
      { id: '07', symbol: 'μ',  name: t('prop.mu'),      value: fmt(p.mu, 5),     unit: t('unit.mu'),      raw: p.mu },
      { id: '08', symbol: 'ν',  name: t('prop.nu'),      value: fmt(p.nu, 5),     unit: t('unit.nu'),      raw: p.nu },
      { id: '09', symbol: 'Pr', name: t('prop.Pr'),      value: fmt(p.Pr, 3),     unit: t('unit.Pr'),      raw: p.Pr },
      { id: '10', symbol: 'β',  name: t('prop.beta'),    value: fmt(p.beta, 5),   unit: t('unit.beta'),    raw: p.beta },
      { id: '11', symbol: 'c',  name: t('prop.sound'),   value: fmt(p.sound, 1),  unit: t('unit.sound'),   raw: p.sound },
      { id: '12', symbol: 'h',  name: t('prop.h'),       value: fmt(p.h, 2),      unit: t('unit.h'),       raw: p.h },
      { id: '13', symbol: 'r',  name: t('prop.hfg'),     value: fmt(p.h_fg, 2),   unit: t('unit.hfg'),     raw: p.h_fg },
    ];
  }

  const p = compute(T, pMPa);
  return [
    { id: '01', symbol: 'ρ',  name: t('prop.density'), value: fmt(p.rho, 3),    unit: t('unit.density'), raw: p.rho },
    { id: '02', symbol: 'cₚ', name: t('prop.cp'),      value: fmt(p.cp, 1),     unit: t('unit.cp'),      raw: p.cp },
    { id: '03', symbol: 'λ',  name: t('prop.lambda'),  value: fmt(p.lambda, 4), unit: t('unit.lambda'),  raw: p.lambda },
    { id: '04', symbol: 'a',  name: t('prop.a'),       value: fmt(p.a, 4),      unit: t('unit.a'),       raw: p.a },
    { id: '05', symbol: 'μ',  name: t('prop.mu'),      value: fmt(p.mu, 5),     unit: t('unit.mu'),      raw: p.mu },
    { id: '06', symbol: 'ν',  name: t('prop.nu'),      value: fmt(p.nu, 4),     unit: t('unit.nu'),      raw: p.nu },
    { id: '07', symbol: 'Pr', name: t('prop.Pr'),      value: fmt(p.Pr, 3),     unit: t('unit.Pr'),      raw: p.Pr },
    { id: '08', symbol: 'σ',  name: t('prop.sigma'),   value: fmt(p.sigma, 5),  unit: t('unit.sigma'),   raw: p.sigma },
    { id: '09', symbol: 'β',  name: t('prop.beta'),    value: fmt(p.beta, 5),   unit: t('unit.beta'),    raw: p.beta },
    { id: '10', symbol: 'Pₛ', name: t('prop.Pv'),      value: fmt(p.Pv, 4),     unit: t('unit.Pv'),      raw: p.Pv },
    { id: '11', symbol: 'h',  name: t('prop.h'),       value: fmt(p.h, 2),      unit: t('unit.h'),       raw: p.h },
    { id: '12', symbol: 'r',  name: t('prop.hfg'),     value: fmt(p.h_fg, 2),   unit: t('unit.hfg'),     raw: p.h_fg },
  ];
}
