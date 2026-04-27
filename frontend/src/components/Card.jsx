import React from "react";

export default function Card({ children, className, ...props }) {
  return (
    <div
      {...props}
      className={["card", className].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
