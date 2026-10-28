"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StickyCtaAction {
  label: string;
  href: string;
  /** Renders a plain anchor (mailto:, tel:, external) instead of a Next link. */
  external?: boolean;
}

const DISMISS_KEY = "ra-sticky-cta-dismissed";

/**
 * Slim call-to-action that slides in once the visitor has scrolled past the
 * first screen, so the two public pages always end with a clear next step.
 * It remembers a dismissal for the current tab session only.
 */
export function StickyCta({
  primary,
  secondary,
  revealAfter = 620,
  watchId,
  label,
}: {
  primary: StickyCtaAction;
  secondary?: StickyCtaAction;
  revealAfter?: number;
  /** Optional element id: the bar hides again once that section is in view. */
  watchId?: string;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.sessionStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const past = window.scrollY > revealAfter;
      const target = watchId ? document.getElementById(watchId) : null;
      const targetVisible = target ? target.getBoundingClientRect().top < window.innerHeight * 0.9 : false;
      setVisible(past && !targetVisible);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [revealAfter, watchId]);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* storage may be blocked; the bar simply returns on the next page */
    }
  };

  const shown = visible && !dismissed;

  const Action = ({ action, tone }: { action: StickyCtaAction; tone: "primary" | "ghost" }) => {
    const classes = cn(
      "inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-5 text-sm font-semibold transition-transform duration-200 active:scale-[0.98]",
      tone === "primary"
        ? "bg-accent text-white hover:bg-accent/90"
        : "border border-border bg-surface text-foreground hover:border-foreground",
    );
    return action.external ? (
      <a href={action.href} className={classes}>
        {action.label}
        <ArrowUpRight className="h-4 w-4 rtl-flip" />
      </a>
    ) : (
      <Link href={action.href} className={classes}>
        {action.label}
        <ArrowUpRight className="h-4 w-4 rtl-flip" />
      </Link>
    );
  };

  return (
    <div
      aria-hidden={!shown}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[55] transition-[opacity,transform] duration-300",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <div className="container-x pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/95 p-2.5 shadow-medium backdrop-blur-md sm:ps-5">
          {label && <p className="hidden min-w-0 flex-1 truncate text-sm text-foreground-secondary sm:block">{label}</p>}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
            <Action action={primary} tone="primary" />
            {secondary && <span className="hidden sm:inline-flex"><Action action={secondary} tone="ghost" /></span>}
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label={label ? `${label} — بستن` : "بستن"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-background-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
