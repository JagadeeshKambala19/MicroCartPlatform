import React from "react";

export default function Field({ label, hint, ...props }) {
  const className = ["input", props.className].filter(Boolean).join(" ");
  const { className: _ignored, ...rest } = props;

  return (
    <label className="field">
      <div className="fieldTop">
        <span className="fieldLabel">{label}</span>
        {hint ? <span className="fieldHint">{hint}</span> : null}
      </div>
      <input
        {...rest}
        className={className}
      />
    </label>
  );
}
