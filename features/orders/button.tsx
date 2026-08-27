type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  variant?: ButtonVariant;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "kp-primary-button",
  secondary: "kp-secondary-button",
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
      className={`disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      type={type}
      {...rest}
    />
  );
}
