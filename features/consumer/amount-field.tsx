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

const toneClasses = {
  coral: "focus-within:ring-coral/35",
  aqua: "focus-within:ring-aqua/35",
} as const;

export function AmountField({ id, label, currency, tone, value, placeholder, onChange }: AmountFieldProps): React.ReactElement {
  return (
    <div className={`rounded-[22px] bg-paper-recess/75 p-4 ring-2 ring-transparent transition-[background-color,box-shadow] focus-within:bg-white ${toneClasses[tone]}`}>
      <label className="block text-sm font-semibold text-ink-2" htmlFor={id}>{label}</label>
      <div className="mt-2 flex items-center gap-3">
        <input
          aria-label={`${label} in ${currency}`}
          className="tnum min-w-0 flex-1 bg-transparent text-3xl font-bold tracking-[-0.06em] text-ink outline-none placeholder:text-ink-3/40 sm:text-4xl"
          id={id}
          inputMode={currency === "IDR" ? "numeric" : "decimal"}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
        <span className="rounded-xl bg-white/75 px-3 py-2 text-sm font-bold text-ink-2">{currency}</span>
      </div>
    </div>
  );
}
