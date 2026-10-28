"use client";

import Image from "@/components/ui/SiteImage";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CinematicSlide {
  src: string;
  alt?: string;
  /** Short label shown on the current frame, e.g. the project or the room. */
  caption?: string;
}

/**
 * Cinematic backdrop for the two hero sections.
 *
 * Three or four related photographs crossfade behind the headline with a slow
 * Ken Burns push, so the cover reads as a sequence rather than a single still.
 *
 * Accessibility and performance:
 *   · every frame is a plain <img> stack — no video download, no layout shift
 *   · `prefers-reduced-motion` stops both the push and the auto-advance
 *   · the pause control is always reachable, and the frame counter is decorative
 */
export function CinematicBackdrop({
  slides,
  interval = 7000,
  className,
  /** Tint strength over the photographs. Lower = brighter, more photographic. */
  scrim = "light",
  /** 0–100 override for the flat legibility layer (from the page settings). */
  tint,
  priority,
}: {
  slides: CinematicSlide[];
  interval?: number;
  className?: string;
  scrim?: "light" | "heavy";
  tint?: number;
  priority?: boolean;
}) {
  const frames = slides.filter((slide) => slide.src);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const go = useCallback(
    (next: number) => {
      if (!frames.length) return;
      setIndex(((next % frames.length) + frames.length) % frames.length);
    },
    [frames.length],
  );

  useEffect(() => {
    if (frames.length < 2 || !playing || reduced) {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = null;
      return;
    }
    timer.current = window.setTimeout(() => go(index + 1), interval);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [frames.length, go, index, interval, playing, reduced]);

  if (!frames.length) return null;

  const current = frames[index];

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {frames.map((frame, frameIndex) => (
        <div
          key={frame.src}
          aria-hidden={frameIndex !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
            frameIndex === index ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={frame.src}
            alt=""
            fill
            priority={priority && frameIndex === 0}
            sizes="100vw"
            className={cn(
              "object-cover object-center",
              /* The push runs once per frame and is skipped for reduced motion. */
              !reduced && "hero-kenburns",
            )}
          />
        </div>
      ))}

      {/* Legibility scrim: heavier on the type side, feathering to the photograph. */}
      {scrim === "light" ? (
        <>
          {/* Denser on small screens, where the copy sits over the whole frame. */}
          <div
            className="absolute inset-0 bg-[#0d1512]/60 md:bg-[#0d1512]/40"
            style={
              typeof tint === "number"
                ? { backgroundColor: `rgba(13, 21, 18, ${(Math.min(90, Math.max(0, tint)) / 100).toFixed(2)})` }
                : undefined
            }
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d1512]/92 via-[#0d1512]/62 to-[#0d1512]/25 rtl:bg-gradient-to-l" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1512] via-[#0d1512]/30 to-[#0d1512]/40 md:via-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[#0a1210]/62" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1210] via-[#0a1210]/45 to-[#0a1210]/70" />
        </>
      )}

      <div aria-hidden className="hero-grain absolute inset-0" />

      {/* Aperture marks — four ticks that also read as the slide counter. */}
      {frames.length > 1 && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0">
          <div className="container-x flex items-end justify-between gap-4 pb-3">
            <ol className="flex items-center gap-1.5" aria-label={current.caption ?? "Slides"}>
              {frames.map((frame, frameIndex) => (
                <li key={frame.src}>
                  <button
                    type="button"
                    onClick={() => go(frameIndex)}
                    aria-label={frame.caption ?? frame.alt ?? `Frame ${frameIndex + 1}`}
                    aria-current={frameIndex === index}
                    className="group flex h-6 items-center"
                  >
                    <span
                      className={cn(
                        "block h-px transition-all duration-500",
                        frameIndex === index
                          ? "w-10 bg-[#e4cba4] sm:w-14"
                          : "w-5 bg-white/30 group-hover:bg-white/60 sm:w-7",
                      )}
                    />
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex items-center gap-3">
              <span className="hidden text-[10px] tabular-nums tracking-[0.28em] text-white/40 sm:block" dir="ltr">
                {String(index + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? "Pause the sequence" : "Play the sequence"}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 text-white/60 transition-colors hover:border-white/50 hover:text-white"
              >
                {playing ? <Pause className="h-3 w-3" /> : <Play className="ms-0.5 h-3 w-3 fill-current" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
