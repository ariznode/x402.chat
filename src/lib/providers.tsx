"use client";

import { ThirdwebProvider } from "thirdweb/react";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThirdwebProvider>{children}</ThirdwebProvider>
    </ThemeProvider>
  );
}
