"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Represents a parsed CSV/Excel dataset
 */
export interface CsvData {
  fileName: string;
  headers: string[];
  rows: Record<string, string | number | null>[];
  columnTypes: Record<string, "string" | "number" | "date">;
  totalRows: number;
}

/**
 * Context value for sharing CSV data across the app
 */
interface CsvContextValue {
  data: CsvData | null;
  setData: (data: CsvData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  clearData: () => void;
}

const CsvContext = createContext<CsvContextValue | null>(null);

/**
 * Module-level reference to CSV data so tools can access it
 * without needing React context (tools run outside component tree)
 */
let _csvDataRef: CsvData | null = null;

export function getCsvDataRef(): CsvData | null {
  return _csvDataRef;
}

export function setCsvDataRef(data: CsvData | null) {
  _csvDataRef = data;
}

/**
 * Provider component that wraps the app to share CSV data
 */
export function CsvDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<CsvData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setData = useCallback((newData: CsvData | null) => {
    setDataState(newData);
    setCsvDataRef(newData); // keep module-level ref in sync for tools
  }, []);

  const clearData = useCallback(() => {
    setDataState(null);
    setCsvDataRef(null);
  }, []);

  return (
    <CsvContext.Provider
      value={{ data, setData, isLoading, setIsLoading, clearData }}
    >
      {children}
    </CsvContext.Provider>
  );
}

/**
 * Hook to access CSV data context
 */
export function useCsvData(): CsvContextValue {
  const context = useContext(CsvContext);
  if (!context) {
    throw new Error("useCsvData must be used within a CsvDataProvider");
  }
  return context;
}

/**
 * Infer column types from data rows
 */
export function inferColumnTypes(
  headers: string[],
  rows: Record<string, string | number | null>[]
): Record<string, "string" | "number" | "date"> {
  const types: Record<string, "string" | "number" | "date"> = {};
  const sampleSize = Math.min(rows.length, 100);

  for (const header of headers) {
    let numericCount = 0;
    let dateCount = 0;
    let totalNonNull = 0;

    for (let i = 0; i < sampleSize; i++) {
      const val = rows[i][header];
      if (val === null || val === undefined || val === "") continue;
      totalNonNull++;

      const strVal = String(val).trim();

      // Check if numeric
      if (!isNaN(Number(strVal)) && strVal !== "") {
        numericCount++;
        continue;
      }

      // Check if date-like
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}/, // ISO date
        /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // US date
        /^\d{1,2}-\d{1,2}-\d{2,4}/, // Dash date
      ];
      if (datePatterns.some((p) => p.test(strVal))) {
        dateCount++;
      }
    }

    if (totalNonNull === 0) {
      types[header] = "string";
    } else if (numericCount / totalNonNull > 0.8) {
      types[header] = "number";
    } else if (dateCount / totalNonNull > 0.8) {
      types[header] = "date";
    } else {
      types[header] = "string";
    }
  }

  return types;
}
