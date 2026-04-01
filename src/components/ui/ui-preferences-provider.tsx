"use client";

import { ReactNode, useEffect } from "react";
import { useUiPreferencesStore } from "@/store/ui-preferences-store";

export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const theme = useUiPreferencesStore((state) => state.theme);
  const density = useUiPreferencesStore((state) => state.density);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = density;
  }, [theme, density]);

  return children;
}
