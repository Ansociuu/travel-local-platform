"use client";
import { useState, useEffect } from "react";

export default function HydrationHandler({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ visibility: "hidden" }} suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
