import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useReducer, } from "react";
const initialState = {
    activeModule: null,
    isTourActive: false,
    currentStepIndex: 0,
};
export function startGuideTour(payload) {
    return {
        type: "guide-tour/start",
        payload,
    };
}
export function stopGuideTour() {
    return {
        type: "guide-tour/stop",
    };
}
export function nextGuideTourStep() {
    return {
        type: "guide-tour/next-step",
    };
}
export function previousGuideTourStep() {
    return {
        type: "guide-tour/previous-step",
    };
}
export function setGuideTourStepIndex(stepIndex) {
    return {
        type: "guide-tour/set-step-index",
        payload: stepIndex,
    };
}
export function guideTourReducer(state, action) {
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
const GuideTourContext = createContext(null);
export function GuideTourProvider({ children }) {
    const [state, dispatch] = useReducer((guideTourReducer), initialState);
    const nextStep = useCallback(() => {
        dispatch(nextGuideTourStep());
    }, []);
    const previousStep = useCallback(() => {
        dispatch(previousGuideTourStep());
    }, []);
    const setStepIndex = useCallback((stepIndex) => {
        dispatch(setGuideTourStepIndex(stepIndex));
    }, []);
    const startTour = useCallback(({ module, stepIndex }) => {
        dispatch(startGuideTour({ module, stepIndex }));
    }, []);
    const stopTour = useCallback(() => {
        dispatch(stopGuideTour());
    }, []);
    const value = useMemo(() => ({
        activeModule: state.activeModule,
        currentStepIndex: state.currentStepIndex,
        isTourActive: state.isTourActive,
        nextStep,
        previousStep,
        setStepIndex,
        startTour,
        stopTour,
    }), [
        nextStep,
        previousStep,
        setStepIndex,
        startTour,
        state.activeModule,
        state.currentStepIndex,
        state.isTourActive,
        stopTour,
    ]);
    return (_jsx(GuideTourContext.Provider, { value: value, children: children }));
}
export function useGuideTour() {
    const context = useContext(GuideTourContext);
    if (!context) {
        throw new Error("useGuideTour must be used within GuideTourProvider.");
    }
    return context;
}
