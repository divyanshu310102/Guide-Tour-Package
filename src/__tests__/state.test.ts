import {
  guideTourReducer,
  nextGuideTourStep,
  previousGuideTourStep,
  startGuideTour,
  stopGuideTour,
} from "../index";

describe("@ksm/guide-tour state helpers", () => {
  it("starts, advances, rewinds, and stops a guide tour", () => {
    const activeState = guideTourReducer(
      {
        activeModule: null,
        isTourActive: false,
        currentStepIndex: 0,
      },
      startGuideTour({ module: "purchase-orders", stepIndex: 2 }),
    );
    const advancedState = guideTourReducer(activeState, nextGuideTourStep());
    const rewoundState = guideTourReducer(advancedState, previousGuideTourStep());
    const stoppedState = guideTourReducer(rewoundState, stopGuideTour());

    expect(activeState).toEqual({
      activeModule: "purchase-orders",
      isTourActive: true,
      currentStepIndex: 2,
    });
    expect(advancedState.currentStepIndex).toBe(3);
    expect(rewoundState.currentStepIndex).toBe(2);
    expect(stoppedState).toEqual({
      activeModule: null,
      isTourActive: false,
      currentStepIndex: 0,
    });
  });
});
