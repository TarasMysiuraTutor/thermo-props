import React from "react";
import { useI18n } from "../i18n.jsx";

export default function Hero({ substance }) {
  const { t, lang } = useI18n();

  const name = substance.meta.name[lang] ?? substance.meta.name.en;
  const symbol = substance.meta.symbol;

  return (
    <section className="hero">
      <div className="container">
        <p className="hero-eyebrow">{t("hero.eyebrow")}</p>

        <h1 className="hero-title">
          <span className="hero-title-base">{t("hero.propertiesOf")}</span>
          <span className="hero-title-entity">
            {name} {symbol && `(${symbol})`}
          </span>
        </h1>

        <p className="hero-desc">{t("hero.genericDesc")}</p>
      </div>
    </section>
  );
}
