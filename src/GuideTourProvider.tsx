import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";

import type { GuideTourState } from "./types";

export type GuideTourAction<TModule extends string = string> =
  | {
      type: "guide-tour/start";
      payload: {
        module: TModule;
        stepIndex?: number;
      };
    }
  | { type: "guide-tour/stop" }
  | { type: "guide-tour/next-step" }
  | { type: "guide-tour/previous-step" }
  | {
      type: "guide-tour/set-step-index";
      payload: number;
    };

const initialState: GuideTourState<string> = {
  activeModule: null,
  isTourActive: false,
  currentStepIndex: 0,
};

export function startGuideTour<TModule extends string>(payload: {
  module: TModule;
  stepIndex?: number;
}): GuideTourAction<TModule> {
  return {
    type: "guide-tour/start",
    payload,
  };
}

export function stopGuideTour(): GuideTourAction {
  return {
    type: "guide-tour/stop",
  };
}

export function nextGuideTourStep(): GuideTourAction {
  return {
    type: "guide-tour/next-step",
  };
}

export function previousGuideTourStep(): GuideTourAction {
  return {
    type: "guide-tour/previous-step",
  };
}

export function setGuideTourStepIndex(stepIndex: number): GuideTourAction {
  return {
    type: "guide-tour/set-step-index",
    payload: stepIndex,
  };
}

export function guideTourReducer<TModule extends string>(
  state: GuideTourState<TModule>,
  action: GuideTourAction<TModule>,
): GuideTourState<TModule> {
  switch (action.type) {
    case "guide-tour/start":
      return {
        activeModule: action.payload.module,
        isTourActive: true,
        currentStepIndex: Math.max(0, action.payload.stepIndex ?? 0),
      };
    case "guide-tour/stop":
      return {
        activeModule: null,
        isTourActive: false,
        currentStepIndex: 0,
      };
    case "guide-tour/next-step":
      return {
        ...state,
        currentStepIndex: state.currentStepIndex + 1,
      };
    case "guide-tour/previous-step":
      return {
        ...state,
        currentStepIndex: Math.max(0, state.currentStepIndex - 1),
      };
    case "guide-tour/set-step-index":
      return {
        ...state,
        currentStepIndex: Math.max(0, action.payload),
      };
    default:
      return state;
  }
}

interface GuideTourContextValue {
  currentStepIndex: number;
  activeModule: string | null;
  isTourActive: boolean;
  nextStep: () => void;
  previousStep: () => void;
  setStepIndex: (stepIndex: number) => void;
  startTour: (options: { module: string; stepIndex?: number }) => void;
  stopTour: () => void;
}

const GuideTourContext = createContext<GuideTourContextValue | null>(null);

export function GuideTourProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(guideTourReducer<string>, initialState);
  const nextStep = useCallback(() => {
    dispatch(nextGuideTourStep());
  }, []);
  const previousStep = useCallback(() => {
    dispatch(previousGuideTourStep());
  }, []);
  const setStepIndex = useCallback((stepIndex: number) => {
    dispatch(setGuideTourStepIndex(stepIndex));
  }, []);
  const startTour = useCallback(
    ({ module, stepIndex }: { module: string; stepIndex?: number }) => {
      dispatch(startGuideTour({ module, stepIndex }));
    },
    [],
  );
  const stopTour = useCallback(() => {
    dispatch(stopGuideTour());
  }, []);
  const value = useMemo(
    () => ({
      activeModule: state.activeModule,
      currentStepIndex: state.currentStepIndex,
      isTourActive: state.isTourActive,
      nextStep,
      previousStep,
      setStepIndex,
      startTour,
      stopTour,
    }),
    [
      nextStep,
      previousStep,
      setStepIndex,
      startTour,
      state.activeModule,
      state.currentStepIndex,
      state.isTourActive,
      stopTour,
    ],
  );

  return (
    <GuideTourContext.Provider value={value}>
      {children}
    </GuideTourContext.Provider>
  );
}

export function useGuideTour<TModule extends string = string>() {
  const context = useContext(GuideTourContext);

  if (!context) {
    throw new Error("useGuideTour must be used within GuideTourProvider.");
  }

  return context as Omit<GuideTourContextValue, "activeModule" | "startTour"> & {
    activeModule: TModule | null;
    startTour: (options: { module: TModule; stepIndex?: number }) => void;
  };
}
