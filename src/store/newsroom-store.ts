"use client";

import { create } from "zustand";
import { NewsItem } from "@/types/news";

interface NewsroomState {
  activeCategory: string;
  selectedStory: NewsItem | null;
  setActiveCategory: (category: string) => void;
  setSelectedStory: (story: NewsItem | null) => void;
}

export const useNewsroomStore = create<NewsroomState>((set) => ({
  activeCategory: "World",
  selectedStory: null,
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSelectedStory: (selectedStory) => set({ selectedStory }),
}));
