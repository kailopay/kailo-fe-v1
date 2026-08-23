type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-deep",
  secondary: "border border-line-strong bg-surface text-ink-2 hover:border-ink hover:text-ink",
};

/** One button shape for the order flow surfaces. */
export function Button({
  variant = "secondary",
  className = "",
  type = "button",
  ...rest
}: ButtonProps): React.ReactElement {
  return (
    <button
      className={`card-rise inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-55 ${VARIANT_CLASSES[variant]} ${className}`}
      type={type}
      {...rest}
    />
  );
}
