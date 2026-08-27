"use client";

type AmountFieldProps = {
  id: string;
  label: string;
  currency: "IDR" | "XLM";
  tone: "coral" | "aqua";
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export function AmountField({ id, label, currency, tone, value, placeholder, onChange }: AmountFieldProps): React.ReactElement {
  return (
    <div className="kp-field-shell" data-tone={tone === "aqua" ? "sell" : "buy"}>
      <label className="kp-field-label" htmlFor={id}>{label}</label>
      <div className="kp-field-row">
        <input
          aria-label={`${label} in ${currency}`}
          className="kp-field-input tnum"
          id={id}
          inputMode={currency === "IDR" ? "numeric" : "decimal"}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <span className="kp-currency">{currency}</span>
      </div>
    </div>
  );
}
