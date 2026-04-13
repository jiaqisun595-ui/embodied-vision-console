// ConnectionStatus — lightweight context that lets each data-source component
// report its connection status so the footer can aggregate them.

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type SourceStatus = "mock" | "live" | "connecting" | "offline";
export type SourceName = "RGB" | "DEPTH" | "BRAIN" | "WORLD";

interface ConnectionStatusCtx {
  statuses: Record<SourceName, SourceStatus>;
  report: (source: SourceName, status: SourceStatus) => void;
}

const defaultStatuses: Record<SourceName, SourceStatus> = {
  RGB: "mock",
  DEPTH: "mock",
  BRAIN: "mock",
  WORLD: "mock",
};

const Ctx = createContext<ConnectionStatusCtx>({
  statuses: defaultStatuses,
  report: () => {},
});

export const ConnectionStatusProvider = ({ children }: { children: ReactNode }) => {
  const [statuses, setStatuses] = useState<Record<SourceName, SourceStatus>>(defaultStatuses);

  const report = useCallback((source: SourceName, status: SourceStatus) => {
    setStatuses((prev) => (prev[source] === status ? prev : { ...prev, [source]: status }));
  }, []);

  return <Ctx.Provider value={{ statuses, report }}>{children}</Ctx.Provider>;
};

export const useConnectionStatus = () => useContext(Ctx).statuses;
export const useReportConnection = () => useContext(Ctx).report;
