"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UiTheme = "dark" | "light";
export type UiDensity = "comfortable" | "compact";

interface UiPreferencesState {
  theme: UiTheme;
  density: UiDensity;
  setTheme: (theme: UiTheme) => void;
  setDensity: (density: UiDensity) => void;
}

export const useUiPreferencesStore = create<UiPreferencesState>()(
  persist(
    (set) => ({
      theme: "light",
      density: "comfortable",
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
    }),
    {
      name: "clogtv-ui-preferences",
    },
  ),
);
