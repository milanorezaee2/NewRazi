"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/types";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionary";
import { SESSION_FETCH } from "@/lib/http";
import { withCsrf } from "@/lib/security/csrf-client";

/* ------------------------------------------------------------------ */
/* Locale                                                               */
/* ------------------------------------------------------------------ */
interface LocaleCtx {
  locale: Locale;
  dir: "rtl" | "ltr";
  dict: Dictionary;
}
const LocaleContext = createContext<LocaleCtx | null>(null);
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale outside provider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Theme                                                                */
/* ------------------------------------------------------------------ */
type Theme = "light" | "dark";
interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}
const ThemeContext = createContext<ThemeCtx>({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

/* ------------------------------------------------------------------ */
/* Auth                                                                  */
/* ------------------------------------------------------------------ */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "artist" | "admin";
  artistId?: string;
}
interface AuthCtx {
  user: User | null;
  /** false until the server session has been checked */
  ready: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; user?: User }>;
  signup: (
    name: string,
    email: string,
    password: string,
    role?: "user" | "artist",
    extra?: {
      /* seller registration — ignored for buyer accounts */
      phone?: string;
      city?: string;
      specialty?: string;
      instagram?: string;
      portfolioUrl?: string;
      studioName?: string;
      experience?: string;
      bio?: string;
      planId?: "starter" | "pro" | "studio";
      formats?: string[];
      families?: string[];
      terms?: boolean;
    },
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}
const AuthContext = createContext<AuthCtx | null>(null);
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}

export function AppProviders({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  // Keep <html lang/dir> in sync with the active locale (the root layout
  // cannot see the [locale] param; middleware forwards it per request, and
  // this guards any statically prerendered shell).
  useEffect(() => {
    const el = document.documentElement;
    const dir = locale === "fa" ? "rtl" : "ltr";
    if (el.lang !== locale) el.lang = locale;
    if (el.dir !== dir) el.dir = dir;
  }, [locale]);

  const localeValue = useMemo<LocaleCtx>(
    () => ({ locale, dir: locale === "fa" ? "rtl" : "ltr", dict: dictionaries[locale] }),
    [locale],
  );

  /* theme */
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const saved = (document.documentElement.getAttribute("data-theme") as Theme) || "light";
    setTheme(saved);
  }, []);
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("ra-theme", next);
      } catch {}
      return next;
    });
  }, []);

  /* auth — fully server-side session via HttpOnly cookie */
  const [serverUser, setServerUser] = useState<User | null | undefined>(undefined);
  /**
   * Session version counter prevents a stale /api/auth/me response from overwriting a
   * fresh login/signup result that arrived later.
   */
  const sessionVersionRef = useRef(0);
  const commitServerUser = useCallback((next: User | null) => {
    sessionVersionRef.current += 1;
    setServerUser(next);
  }, []);

  useEffect(() => {
    const version = sessionVersionRef.current;
    let active = true;
    const isAdminArea = window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/");
    const sessionEndpoint = isAdminArea ? "/api/admin/session" : "/api/auth/me";
    fetch(sessionEndpoint, { ...SESSION_FETCH })
      .then((r) => (r.ok ? (r.json() as Promise<{ user: User | null }>) : Promise.reject()))
      .then((d) => {
        if (!active || sessionVersionRef.current !== version) return;
        setServerUser(d.user ?? null);
      })
      .catch(() => {
        if (!active || sessionVersionRef.current !== version) return;
        setServerUser(null);
      });
    return () => { active = false; };
  }, []);

  const user = serverUser === undefined ? null : serverUser;
  const authValue = useMemo<AuthCtx>(
    () => ({
      user,
      ready: serverUser !== undefined,
      login: async (email, password) => {
        if (!email.includes("@") || password.length < 4) return { ok: false, error: "invalid" };
        try {
          const r = await fetch("/api/auth/login", withCsrf({
            ...SESSION_FETCH,
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password }),
          }));
          const d = (await r.json()) as { ok: boolean; user?: User; error?: string };
          if (r.ok && d.ok && d.user) {
            commitServerUser(d.user);
            return { ok: true, user: d.user };
          }
          return { ok: false, error: d.error ?? "invalid" };
        } catch {
          return { ok: false, error: "network" };
        }
      },
      signup: async (name, email, password, role = "user", extra) => {
        if (!name || !email.includes("@") || password.length < 6) return { ok: false, error: "invalid" };
        try {
          const r = await fetch("/api/auth/signup", withCsrf({
            ...SESSION_FETCH,
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name, email, password, role, ...extra }),
          }));
          const d = (await r.json()) as { ok: boolean; user?: User; error?: string };
          if (r.ok && d.ok && d.user) {
            commitServerUser(d.user);
            return { ok: true };
          }
          return { ok: false, error: d.error ?? "invalid" };
        } catch {
          return { ok: false, error: "network" };
        }
      },
      logout: () => {
        commitServerUser(null);
        fetch("/api/auth/logout", withCsrf({ ...SESSION_FETCH, method: "POST" })).catch(() => undefined);
      },
    }),
    [user, serverUser, commitServerUser],
  );

  return (
    <LocaleContext.Provider value={localeValue}>
      <ThemeContext.Provider value={{ theme, toggle: toggleTheme }}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </ThemeContext.Provider>
    </LocaleContext.Provider>
  );
}
