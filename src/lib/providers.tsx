"use client";

import { Toaster } from "sonner";
import { ThirdwebProvider } from "thirdweb/react";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <ThirdwebProvider>
        {children}
        <Toaster position="top-center" richColors />
      </ThirdwebProvider>
    </ThemeProvider>
  );
}
