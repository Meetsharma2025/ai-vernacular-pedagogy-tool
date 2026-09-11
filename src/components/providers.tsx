"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Global application state:
//  • AiModeProvider  — the manual ONLINE / OFFLINE radio switch (never auto).
//  • LanguageProvider — centralized teacher/student language state.
//  • UserProvider    — lightweight demo identity (role + name).
//  • AiStatusProvider — real server-side Nemotron status (polled only in
//                       online mode; the badge always reflects the truth).
// ─────────────────────────────────────────────────────────────────────────────
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LanguageCode } from "@/lib/languages";
import { isLanguageCode } from "@/lib/languages";
import type { AiMode } from "@/lib/api";
import { recordLanguage } from "@/lib/gamification";

// ── Mode ─────────────────────────────────────────────────────────────────────

interface ModeCtx {
  mode: AiMode;
  setMode: (m: AiMode) => void;
}
const ModeContext = createContext<ModeCtx>({ mode: "online", setMode: () => {} });

function readMode(): AiMode {
  if (typeof window === "undefined") return "online";
  const stored = window.localStorage.getItem("gyansetu-mode");
  return stored === "offline" ? "offline" : "online";
}

function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AiMode>("online");
  useEffect(() => setModeState(readMode()), []);
  const setMode = useCallback((m: AiMode) => {
    setModeState(m);
    try {
      window.localStorage.setItem("gyansetu-mode", m);
    } catch {
      /* ignore */
    }
  }, []);
  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export const useMode = () => useContext(ModeContext);

// ── Languages ────────────────────────────────────────────────────────────────

interface LangCtx {
  studentLanguage: LanguageCode;
  setStudentLanguage: (l: LanguageCode) => void;
  teacherLanguage: LanguageCode;
  setTeacherLanguage: (l: LanguageCode) => void;
}
const LangContext = createContext<LangCtx>({
  studentLanguage: "hi",
  setStudentLanguage: () => {},
  teacherLanguage: "hi",
  setTeacherLanguage: () => {},
});

function readLang(key: string, fallback: LanguageCode): LanguageCode {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(key);
  return isLanguageCode(stored) ? stored : fallback;
}

function LanguageProvider({ children }: { children: ReactNode }) {
  // GyanSetu's default learner language is SANTHALI (संथाली) — the flagship
  // mother tongue of the PALASH MTB-MLE programme. Teacher stays Hindi-medium.
  const [studentLanguage, setStudentLang] = useState<LanguageCode>("sat");
  const [teacherLanguage, setTeacherLang] = useState<LanguageCode>("hi");
  useEffect(() => {
    setStudentLang(readLang("gyansetu-student-lang", "sat"));
    setTeacherLang(readLang("gyansetu-teacher-lang", "hi"));
  }, []);
  const setStudentLanguage = useCallback((l: LanguageCode) => {
    setStudentLang(l);
    try {
      window.localStorage.setItem("gyansetu-student-lang", l);
    } catch {
      /* ignore */
    }
    recordLanguage(l); // 🌍 polyglot achievement tracking
  }, []);
  const setTeacherLanguage = useCallback((l: LanguageCode) => {
    setTeacherLang(l);
    try {
      window.localStorage.setItem("gyansetu-teacher-lang", l);
    } catch {
      /* ignore */
    }
  }, []);
  const value = useMemo(
    () => ({ studentLanguage, setStudentLanguage, teacherLanguage, setTeacherLanguage }),
    [studentLanguage, setStudentLanguage, teacherLanguage, setTeacherLanguage],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLangs = () => useContext(LangContext);

// ── User ─────────────────────────────────────────────────────────────────────

export type Role = "teacher" | "student";
interface UserCtx {
  role: Role;
  name: string;
  setUser: (name: string, role: Role) => void;
  logout: () => void;
  studentKey: string;
}
const UserContext = createContext<UserCtx>({
  role: "student",
  name: "",
  setUser: () => {},
  logout: () => {},
  studentKey: "guest-student",
});

function readUser(): { name: string; role: Role } {
  if (typeof window === "undefined") return { name: "", role: "student" };
  try {
    const raw = window.localStorage.getItem("gyansetu-user");
    if (raw) {
      const parsed = JSON.parse(raw) as { name?: string; role?: string };
      return {
        name: typeof parsed.name === "string" ? parsed.name : "",
        role: parsed.role === "teacher" ? "teacher" : "student",
      };
    }
  } catch {
    /* ignore */
  }
  return { name: "", role: "student" };
}

function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<{ name: string; role: Role }>({ name: "", role: "student" });
  useEffect(() => setUserState(readUser()), []);
  const setUser = useCallback((name: string, role: Role) => {
    setUserState({ name: name.trim() || (role === "teacher" ? "शिक्षक" : "विद्यार्थी"), role });
    try {
      window.localStorage.setItem("gyansetu-user", JSON.stringify({ name, role }));
    } catch {
      /* ignore */
    }
  }, []);
  const logout = useCallback(() => {
    setUserState({ name: "", role: "student" });
    try {
      window.localStorage.removeItem("gyansetu-user");
    } catch {
      /* ignore */
    }
  }, []);
  const studentKey = useMemo(
    () => (user.name ? `${user.role}:${user.name}`.toLowerCase() : "guest-student"),
    [user],
  );
  const value = useMemo(
    () => ({ role: user.role, name: user.name, setUser, logout, studentKey }),
    [user, setUser, logout, studentKey],
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);

// ── AI status (truthful, polled from the server) ─────────────────────────────

export interface AiStatus {
  configured: boolean;
  verified: boolean;
  provider: "openrouter" | "nvidia" | "none";
  model: string;
  latencyMs: number;
  checked: boolean;
}

interface AiStatusCtx {
  status: AiStatus;
  refresh: () => void;
}
const AiStatusContext = createContext<AiStatusCtx>({
  status: { configured: false, verified: false, provider: "none", model: "", latencyMs: 0, checked: false },
  refresh: () => {},
});

function AiStatusProvider({ children }: { children: ReactNode }) {
  const { mode } = useMode();
  const [status, setStatus] = useState<AiStatus>({
    configured: false,
    verified: false,
    provider: "none",
    model: "",
    latencyMs: 0,
    checked: false,
  });

  const refresh = useCallback(async () => {
    if (mode !== "online") {
      setStatus({ configured: false, verified: false, provider: "none", model: "", latencyMs: 0, checked: false });
      return;
    }
    try {
      const res = await fetch("/api/ai", { method: "GET", cache: "no-store" });
      const json = (await res.json()) as {
        ok: boolean;
        data?: { configured: boolean; verified: boolean; provider: AiStatus["provider"]; model: string; latencyMs: number };
      };
      if (json.ok && json.data) {
        setStatus({ ...json.data, checked: true });
      } else {
        setStatus({ configured: false, verified: false, provider: "none", model: "", latencyMs: 0, checked: true });
      }
    } catch {
      setStatus({ configured: false, verified: false, provider: "none", model: "", latencyMs: 0, checked: true });
    }
  }, [mode]);

  useEffect(() => {
    void refresh();
    if (mode !== "online") return;
    const t = setInterval(() => void refresh(), 30_000);
    return () => clearInterval(t);
  }, [refresh, mode]);

  const value = useMemo(() => ({ status, refresh }), [status, refresh]);
  return <AiStatusContext.Provider value={value}>{children}</AiStatusContext.Provider>;
}

export const useAiStatus = () => useContext(AiStatusContext);

// ── Root provider + PWA registration ────────────────────────────────────────

export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline support optional */
      });
    }
  }, []);
  return (
    <ModeProvider>
      <LanguageProvider>
        <UserProvider>
          <AiStatusProvider>{children}</AiStatusProvider>
        </UserProvider>
      </LanguageProvider>
    </ModeProvider>
  );
}
