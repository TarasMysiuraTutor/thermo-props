import React from 'react';
import { useI18n } from '../i18n.jsx';

export default function Hero() {
  const { t } = useI18n();
  return (
    <div className="hero">
      <div className="container">
        <div className="hero-eyebrow">{t('hero.eyebrow')}</div>
        <h1>
          <span>{t('hero.title1')}</span>
          <br />
          <em>{t('hero.title2')}</em>
        </h1>
        <p className="hero-desc">{t('hero.desc')}</p>
      </div>
    </div>
  );
}
