import Link from "next/link";

/**
 * Premium button — use className for extra layout only.
 * variant: primary | teal | coral | grace | outline | ghost
 */
export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  type = "button",
  disabled = false,
  onClick,
  ...rest
}) {
  const classes = [
    "gg-btn",
    `gg-btn-${variant}`,
    size === "lg" ? "gg-btn-lg" : "",
    block ? "gg-btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
