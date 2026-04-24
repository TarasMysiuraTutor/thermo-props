import React from 'react';
import { useI18n } from '../i18n.jsx';
import { APP_VERSION } from '../version.js';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-note" dangerouslySetInnerHTML={{ __html: t('footer.note') }} />
        <p className="footer-note">
          <span>{t('footer.copy')}</span>
          &ensp;·&ensp;
          <span className="footer-version">
            <span>{t('footer.version')}</span> <span>{APP_VERSION}</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
