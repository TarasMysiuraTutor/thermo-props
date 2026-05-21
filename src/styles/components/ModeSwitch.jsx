export default function ModeSwitch({ value, onChange, t }) {
  return (
    <div className="mode-switch">
      <label>
        <input
          type="radio"
          checked={value === "tp"}
          onChange={() => onChange("tp")}
        />
        T, p
      </label>
      <label>
        <input
          type="radio"
          checked={value === "satT"}
          onChange={() => onChange("satT")}
        />
        {t("input.mode.satT")}
      </label>
    </div>
  );
}