import {
  doesGuideTourStepMatchRoute,
  getGuideTourRouteLabel,
  getGuideTourStartStepIndex,
} from "../index";

describe("@ksm/guide-tour routing helpers", () => {
  it("matches either an exact route or a route pattern", () => {
    const exactStep = {
      id: "exact",
      route: "/purchase-orders?view=tracker",
      target: '[data-tour-id="po-tracker"]',
      title: "Tracker",
      content: "Tracker step",
    };
    const patternedStep = {
      id: "pattern",
      routePattern: "/vendors/:id/edit",
      target: '[data-tour-id="vendor-edit"]',
      title: "Vendor edit",
      content: "Vendor edit step",
    };

    expect(
      doesGuideTourStepMatchRoute(
        exactStep,
        "/purchase-orders",
        "?view=tracker",
      ),
    ).toBe(true);
    expect(
      doesGuideTourStepMatchRoute(patternedStep, "/vendors/vendor-001/edit"),
    ).toBe(true);
    expect(doesGuideTourStepMatchRoute(patternedStep, "/vendors")).toBe(false);
  });

  it("finds the start step and prefers the friendly route label", () => {
    const steps = [
      {
        id: "register",
        route: "/vendors",
        target: '[data-tour-id="vendors-page"]',
        title: "Vendors",
        content: "Vendor register",
      },
      {
        id: "edit",
        routePattern: "/vendors/:id/edit",
        routeLabel: "Edit Vendor",
        target: '[data-tour-id="vendors-edit-page"]',
        title: "Edit",
        content: "Edit vendor",
      },
    ];

    expect(getGuideTourStartStepIndex(steps, "/vendors/vendor-001/edit")).toBe(1);
    expect(
      getGuideTourRouteLabel(steps[1], "/vendors/vendor-001/edit"),
    ).toBe("Edit Vendor");
  });
});
