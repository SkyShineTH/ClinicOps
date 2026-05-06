"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toYmdLocal } from "@/lib/dashboard-demo-data";

export type DateRangePreset = "today" | "7d" | "30d" | "custom";

export type DashboardFiltersState = {
  datePreset: DateRangePreset;
  customFrom: string;
  customTo: string;
  region: string;
  category: string;
};

const defaultFilters: DashboardFiltersState = {
  datePreset: "today",
  customFrom: "",
  customTo: "",
  region: "all",
  category: "all",
};

function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfLocalDay(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function computeDateRange(filters: DashboardFiltersState): { start: Date; end: Date } {
  return computeDateRangeFrom(filters, new Date());
}

export function computeDateRangeFrom(
  filters: DashboardFiltersState,
  now: Date,
): { start: Date; end: Date } {
  if (
    filters.datePreset === "custom" &&
    filters.customFrom.trim() &&
    filters.customTo.trim()
  ) {
    const a = new Date(filters.customFrom);
    const b = new Date(filters.customTo);
    if (!Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime())) {
      const start = startOfLocalDay(a <= b ? a : b);
      const end = endOfLocalDay(a <= b ? b : a);
      return { start, end };
    }
  }
  if (filters.datePreset === "7d") {
    const end = endOfLocalDay(now);
    const start = startOfLocalDay(addDays(now, -6));
    return { start, end };
  }
  if (filters.datePreset === "30d") {
    const end = endOfLocalDay(now);
    const start = startOfLocalDay(addDays(now, -29));
    return { start, end };
  }
  const day = startOfLocalDay(now);
  return { start: day, end: endOfLocalDay(now) };
}

export function ymdInRange(ymd: string, start: Date, end: Date): boolean {
  if (!ymd) return false;
  const lo = toYmdLocal(start);
  const hi = toYmdLocal(end);
  return ymd >= lo && ymd <= hi;
}

type DashboardFiltersContextValue = {
  filters: DashboardFiltersState;
  setDatePreset: (v: DateRangePreset) => void;
  setCustomFrom: (v: string) => void;
  setCustomTo: (v: string) => void;
  setRegion: (v: string) => void;
  setCategory: (v: string) => void;
  resetFilters: () => void;
  dateRange: { start: Date; end: Date };
};

const DashboardFiltersContext = createContext<DashboardFiltersContextValue | null>(null);

export function DashboardFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<DashboardFiltersState>(defaultFilters);
  const [rangeNow, setRangeNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setRangeNow(new Date()), 0);
    return () => window.clearTimeout(id);
  }, []);

  const dateRange = useMemo(
    () => computeDateRangeFrom(filters, rangeNow ?? new Date("2026-01-01T00:00:00.000Z")),
    [filters, rangeNow],
  );

  const setDatePreset = useCallback((v: DateRangePreset) => {
    setFilters((f) => ({ ...f, datePreset: v }));
  }, []);

  const setCustomFrom = useCallback((v: string) => {
    setFilters((f) => ({ ...f, customFrom: v }));
  }, []);

  const setCustomTo = useCallback((v: string) => {
    setFilters((f) => ({ ...f, customTo: v }));
  }, []);

  const setRegion = useCallback((v: string) => {
    setFilters((f) => ({ ...f, region: v }));
  }, []);

  const setCategory = useCallback((v: string) => {
    setFilters((f) => ({ ...f, category: v }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const value = useMemo(
    () => ({
      filters,
      setDatePreset,
      setCustomFrom,
      setCustomTo,
      setRegion,
      setCategory,
      resetFilters,
      dateRange,
    }),
    [
      filters,
      dateRange,
      setDatePreset,
      setCustomFrom,
      setCustomTo,
      setRegion,
      setCategory,
      resetFilters,
    ],
  );

  return (
    <DashboardFiltersContext.Provider value={value}>{children}</DashboardFiltersContext.Provider>
  );
}

export function useDashboardFilters() {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) {
    throw new Error("useDashboardFilters must be used within DashboardFiltersProvider");
  }
  return ctx;
}
