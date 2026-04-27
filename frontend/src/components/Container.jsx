import React from "react";

export default function Container({ children }) {
  return (
    <div style={{ width: "min(1120px, calc(100% - 44px))", margin: "0 auto" }}>
      {children}
    </div>
  );
}

