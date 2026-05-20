import {
  createLocalStorageGuideTourPersistence,
  type GuideTourStep,
} from "../index";

describe("@ksm/guide-tour persistence helpers", () => {
  const steps: GuideTourStep[] = [
    {
      id: "step-1",
      route: "/dashboard",
      target: '[data-tour-id="dashboard"]',
      title: "Dashboard",
      content: "Dashboard overview",
    },
    {
      id: "step-2",
      route: "/reports",
      target: '[data-tour-id="reports"]',
      title: "Reports",
      content: "Reports overview",
    },
  ];

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("restores an in-progress step by saved step id", () => {
    const persistence = createLocalStorageGuideTourPersistence<"ops">({
      namespace: "test-guide-tour",
      version: "v1",
      storage: window.localStorage,
      getStorageKey: (module) => `user-001:${module}`,
    });

    persistence.save({
      module: "ops",
      status: "in_progress",
      stepIndex: 1,
      steps,
    });

    expect(persistence.load("ops", steps)).toEqual({
      status: "in_progress",
      stepIndex: 1,
    });
  });

  it("returns a terminal status without forcing a step index", () => {
    const persistence = createLocalStorageGuideTourPersistence<"ops">({
      namespace: "test-guide-tour",
      version: "v1",
      storage: window.localStorage,
      getStorageKey: (module) => `user-001:${module}`,
    });

    persistence.save({
      module: "ops",
      status: "completed",
      stepIndex: 1,
      steps,
    });

    expect(persistence.load("ops", steps)).toEqual({
      status: "completed",
      stepIndex: 0,
    });
  });
});
