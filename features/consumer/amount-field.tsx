"use client";

type AmountFieldProps = {
  id: string;
  label: string;
  currency: "IDR" | "XLM";
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

export function AmountField({ id, label, currency, value, placeholder, onChange }: AmountFieldProps): React.ReactElement {
  return (
    <div className="rounded-2xl border border-line-strong bg-white p-4 transition-colors focus-within:border-ink">
      <label className="block text-sm font-semibold text-ink-2" htmlFor={id}>{label}</label>
      <div className="mt-2 flex items-center gap-3">
        <input
          aria-label={`${label} in ${currency}`}
          className="min-w-0 flex-1 bg-transparent text-3xl font-bold tracking-[-0.05em] text-ink outline-none placeholder:text-ink-3/45 sm:text-4xl"
          id={id}
          inputMode={currency === "IDR" ? "numeric" : "decimal"}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <span className="rounded-xl bg-paper-recess px-3 py-2 text-sm font-bold text-ink-2">{currency}</span>
      </div>
    </div>
  );
}
