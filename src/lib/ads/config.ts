export type AdProvider = "none" | "adsense" | "gam";

const provider = (process.env.NEXT_PUBLIC_AD_PROVIDER ?? "none").toLowerCase() as AdProvider;

export const adConfig = {
  provider,
  adSense: {
    clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "",
    slots: {
      inline: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE ?? "",
      sidebar1: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_1 ?? "",
      sidebar2: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_2 ?? "",
    },
  },
  gam: {
    slots: {
      inline: process.env.NEXT_PUBLIC_GAM_SLOT_INLINE ?? "",
      sidebar1: process.env.NEXT_PUBLIC_GAM_SLOT_SIDEBAR_1 ?? "",
      sidebar2: process.env.NEXT_PUBLIC_GAM_SLOT_SIDEBAR_2 ?? "",
    },
  },
} as const;
