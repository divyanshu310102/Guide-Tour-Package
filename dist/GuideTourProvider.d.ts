import { type PropsWithChildren } from "react";
import type { GuideTourState } from "./types";
export type GuideTourAction<TModule extends string = string> = {
    type: "guide-tour/start";
    payload: {
        module: TModule;
        stepIndex?: number;
    };
} | {
    type: "guide-tour/stop";
} | {
    type: "guide-tour/next-step";
} | {
    type: "guide-tour/previous-step";
} | {
    type: "guide-tour/set-step-index";
    payload: number;
};
export declare function startGuideTour<TModule extends string>(payload: {
    module: TModule;
    stepIndex?: number;
}): GuideTourAction<TModule>;
export declare function stopGuideTour(): GuideTourAction;
export declare function nextGuideTourStep(): GuideTourAction;
export declare function previousGuideTourStep(): GuideTourAction;
export declare function setGuideTourStepIndex(stepIndex: number): GuideTourAction;
export declare function guideTourReducer<TModule extends string>(state: GuideTourState<TModule>, action: GuideTourAction<TModule>): GuideTourState<TModule>;
interface GuideTourContextValue {
    currentStepIndex: number;
    activeModule: string | null;
    isTourActive: boolean;
    nextStep: () => void;
    previousStep: () => void;
    setStepIndex: (stepIndex: number) => void;
    startTour: (options: {
        module: string;
        stepIndex?: number;
    }) => void;
    stopTour: () => void;
}
export declare function GuideTourProvider({ children }: PropsWithChildren): import("react/jsx-runtime").JSX.Element;
export declare function useGuideTour<TModule extends string = string>(): Omit<GuideTourContextValue, "activeModule" | "startTour"> & {
    activeModule: TModule | null;
    startTour: (options: {
        module: TModule;
        stepIndex?: number;
    }) => void;
};
export {};
//# sourceMappingURL=GuideTourProvider.d.ts.map