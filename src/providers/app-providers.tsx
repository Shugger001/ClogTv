"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { PwaRegister } from "@/components/pwa-register";
import { makeQueryClient } from "@/lib/query-client";
import { UiPreferencesProvider } from "@/components/ui/ui-preferences-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <UiPreferencesProvider>
        <PwaRegister />
        {children}
      </UiPreferencesProvider>
    </QueryClientProvider>
  );
}
