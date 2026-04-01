"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { adConfig } from "@/lib/ads/config";

type SlotKey = "inline" | "sidebar1" | "sidebar2";

type BreakpointSize = [number, number];
interface ResponsiveMap {
  viewport: [number, number];
  sizes: BreakpointSize[];
}

interface AdSlotProps {
  slotKey: SlotKey;
  label: string;
  className?: string;
  placeholderCopy: string;
  minHeight?: number;
  responsiveMap?: ResponsiveMap[];
}

declare global {
  interface GoogletagApi {
    cmd: Array<() => void>;
    pubads: () => {
      enableSingleRequest: () => void;
      collapseEmptyDivs: () => void;
    };
    defineSlot: (
      adUnitPath: string,
      sizes: Array<[number, number]>,
      divId: string,
    ) => {
      defineSizeMapping: (mapping: unknown) => unknown;
      addService: (service: unknown) => unknown;
    } | null;
    sizeMapping: () => {
      addSize: (viewport: [number, number], sizes: Array<[number, number]>) => unknown;
      build: () => unknown;
    };
    enableServices: () => void;
    display: (divId: string) => void;
  }

  interface Window {
    adsbygoogle?: unknown[];
    googletag?: GoogletagApi;
    __clogtvAdSenseLoaded?: boolean;
    __clogtvGamLoaded?: boolean;
    __clogtvGamEnabled?: boolean;
  }
}

function loadScriptOnce(src: string, marker: "__clogtvAdSenseLoaded" | "__clogtvGamLoaded") {
  if (typeof window === "undefined") return;
  if (window[marker]) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  script.crossOrigin = "anonymous";
  script.onload = () => {
    window[marker] = true;
  };
  document.head.appendChild(script);
}

export function AdSlot({
  slotKey,
  label,
  className,
  placeholderCopy,
  minHeight = 250,
  responsiveMap = [
    { viewport: [1200, 0], sizes: [[300, 250], [300, 600]] },
    { viewport: [768, 0], sizes: [[300, 250]] },
    { viewport: [0, 0], sizes: [[320, 100], [300, 250]] },
  ],
}: AdSlotProps) {
  const [failed, setFailed] = useState(false);
  const slotSuffix = useMemo(() => crypto.randomUUID().slice(0, 8), []);
  const containerId = `ad-slot-${slotKey}-${slotSuffix}`;
  const renderedRef = useRef(false);

  const adSenseSlot = adConfig.adSense.slots[slotKey];
  const gamSlot = adConfig.gam.slots[slotKey];

  const canRenderAdSense =
    adConfig.provider === "adsense" && Boolean(adConfig.adSense.clientId && adSenseSlot);
  const canRenderGam = adConfig.provider === "gam" && Boolean(gamSlot);
  const canRender = canRenderAdSense || canRenderGam;

  useEffect(() => {
    if (!canRender || renderedRef.current) {
      return;
    }

    const timeout = window.setTimeout(() => setFailed(true), 3500);

    if (canRenderAdSense) {
      loadScriptOnce(
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.adSense.clientId}`,
        "__clogtvAdSenseLoaded",
      );

      window.setTimeout(() => {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          renderedRef.current = true;
          clearTimeout(timeout);
        } catch {
          setFailed(true);
        }
      }, 250);
    }

    if (canRenderGam) {
      loadScriptOnce("https://securepubads.g.doubleclick.net/tag/js/gpt.js", "__clogtvGamLoaded");

      window.googletag = window.googletag ?? ({ cmd: [] } as unknown as GoogletagApi);
      window.googletag.cmd.push(() => {
        const gptAny = window.googletag as unknown as {
          sizeMapping: () => {
            addSize: (viewport: [number, number], sizes: Array<[number, number]>) => void;
            build: () => unknown;
          };
          defineSlot: (
            adUnitPath: string,
            sizes: Array<[number, number]>,
            divId: string,
          ) => {
            defineSizeMapping: (mapping: unknown) => void;
            addService: (service: unknown) => void;
          } | null;
          pubads: () => {
            enableSingleRequest: () => void;
            collapseEmptyDivs: () => void;
          };
          enableServices: () => void;
          display: (divId: string) => void;
        };

        const mappingBuilder = gptAny.sizeMapping();
        responsiveMap.forEach((entry) => {
          mappingBuilder.addSize(entry.viewport, entry.sizes);
        });

        const slot = gptAny.defineSlot(
          gamSlot,
          responsiveMap.flatMap((entry) => entry.sizes),
          containerId,
        );
        if (slot) {
          slot.defineSizeMapping(mappingBuilder.build());
          slot.addService(gptAny.pubads());
        }

        if (!slot) {
          setFailed(true);
          return;
        }

        if (!window.__clogtvGamEnabled) {
          gptAny.pubads().enableSingleRequest();
          gptAny.pubads().collapseEmptyDivs();
          gptAny.enableServices();
          window.__clogtvGamEnabled = true;
        }

        gptAny.display(containerId);
        renderedRef.current = true;
        clearTimeout(timeout);
      });
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [canRender, canRenderAdSense, canRenderGam, containerId, gamSlot, responsiveMap]);

  const showFallback = !canRender || failed;

  if (showFallback) {
    return (
      <article className={className}>
        <p className="text-[11px] uppercase tracking-[0.22em] text-red-300">{label}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{placeholderCopy}</p>
        <p className="ui-muted mt-2 text-xs uppercase tracking-widest">Fallback placeholder</p>
      </article>
    );
  }

  if (canRenderAdSense) {
    return (
      <div className={className}>
        <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-red-300">{label}</p>
        <ins
          className="adsbygoogle block w-full"
          style={{ minHeight }}
          data-ad-client={adConfig.adSense.clientId}
          data-ad-slot={adSenseSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-red-300">{label}</p>
      <div id={containerId} style={{ minHeight }} />
    </div>
  );
}
