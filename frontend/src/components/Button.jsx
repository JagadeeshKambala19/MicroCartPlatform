import React from "react";

export default function Button({ variant = "primary", loading, children, ...props }) {
  const v = String(variant || "primary");
  const variantClass =
    v === "danger" ? "btnDanger" : v === "ghost" ? "btnGhost" : "btnPrimary";
  const className = ["btn", variantClass, props.className].filter(Boolean).join(" ");
  const { className: _ignored, ...rest } = props;

  return (
    <button
      {...rest}
      className={className}
      disabled={rest.disabled || loading}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}
