import type { GuideTourPersistenceAdapter, GuideTourStep } from "./types";
export declare const GUIDE_TOUR_TARGET_SEARCH_INTERVAL_MS = 120;
export declare const GUIDE_TOUR_TARGET_SEARCH_TIMEOUT_MS = 1500;
export interface GuideTourHostProps<TModule extends string = string> {
    getModuleLabel: (module: TModule) => string;
    persistence?: GuideTourPersistenceAdapter<TModule>;
    resolveSteps: (module: TModule) => GuideTourStep[];
    targetSearchIntervalMs?: number;
    targetSearchTimeoutMs?: number;
}
export declare function GuideTourHost<TModule extends string = string>({ getModuleLabel, persistence, resolveSteps, targetSearchIntervalMs, targetSearchTimeoutMs, }: GuideTourHostProps<TModule>): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=GuideTourHost.d.ts.map