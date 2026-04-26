import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n";

export default function SubstanceSelector({ substances, activeId, onChange }) {
  const { lang } = useI18n();

  const navigate = useNavigate();

  return (
    <div className="substance-selector">
      {Object.values(substances).map((s) => (
        <button
          key={s.id}
          className={s.id === activeId ? "active" : ""}
          onClick={() => navigate(`/${s.id}`)}
        >
          {s.meta.name[lang] ?? s.meta.name.en}
        </button>
      ))}
    </div>
  );
}
``;
