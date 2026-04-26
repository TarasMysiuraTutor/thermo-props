import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n.jsx";

import logoDark from "../assets/logoDark.svg";
import logoLight from "../assets/logoLight.svg";

const SunIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
const AutoIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
  </svg>
);
const MoonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const THEME_BTNS = [
  { value: "light", icon: SunIcon, titleKey: "theme.light", label: "Light" },
  { value: "auto", icon: AutoIcon, titleKey: "theme.auto", label: "Auto" },
  { value: "dark", icon: MoonIcon, titleKey: "theme.dark", label: "Dark" },
];

function getStoredTheme() {
  try {
    const v = localStorage.getItem("theme");
    if (v === "light" || v === "dark" || v === "auto") return v;
  } catch (_) {}
  return "auto";
}

export default function Header() {
  const { t, lang, setLang, supported } = useI18n();
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (_) {}
  }, [theme]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="logo">
          {theme === "dark" ? (
            <img src={logoDark} alt="" style={{ width: "100px" }} />
          ) : (
            <img src={logoLight} alt="" style={{ width: "100px" }} />
          )}
        </div>

        <div className="header-right">
          <span className="header-badge">{t("header.badge")}</span>
          <div className="theme-switch" role="group">
            {THEME_BTNS.map(({ value, icon: Icon, titleKey, label }) => (
              <button
                key={value}
                className={`theme-btn${theme === value ? " active" : ""}`}
                aria-label={label}
                title={t(titleKey)}
                onClick={() => setTheme(value)}
              >
                <Icon />
              </button>
            ))}
          </div>
          <div className="lang-switch">
            {supported.map((code) => (
              <button
                key={code}
                className={`lang-btn${lang === code ? " active" : ""}`}
                onClick={() => setLang(code)}
              >
                {code === "uk" ? "UA" : code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
