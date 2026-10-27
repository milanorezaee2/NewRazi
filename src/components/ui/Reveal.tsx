"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article" | "li" | "span";
  variant?: "fade" | "blur";
  delay?: number;
  once?: boolean;
}

/**
 * Scroll-driven reveal. One IntersectionObserver per element; unobserves after reveal.
 *
 * The markup is visible by default and the hidden start state is only applied
 * from the client, once the element is known to be below the first screen. A
 * blocked script, a failed observer or a restored scroll position therefore
 * shows the content instead of an empty page.
 */
export function Reveal({ as = "div", variant = "fade", delay = 0, once = true, className, style, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      el.classList.add("is-visible");
      return;
    }
    /* Anything already on screen renders at once — no fade on first paint. */
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      el.classList.add("is-visible");
      return;
    }
    el.setAttribute("data-reveal-hidden", "");
    /* Belt and braces: whatever happens to the observer, content appears. */
    const failSafe = window.setTimeout(() => el.classList.add("is-visible"), 2500);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            window.clearTimeout(failSafe);
            el.classList.add("is-visible");
            if (once) io.unobserve(el);
          } else if (!once) el.classList.remove("is-visible");
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => {
      window.clearTimeout(failSafe);
      io.disconnect();
    };
  }, [once]);
  const Tag = as as React.ElementType;
  return (
    <Tag
      ref={ref}
      data-reveal={variant}
      className={cn(className)}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
