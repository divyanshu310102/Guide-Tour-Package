import { matchPath } from "react-router-dom";

import type {
  GuideTourModuleDefinition,
  GuideTourResolvedModule,
  GuideTourStep,
} from "./types";

export function buildGuideTourCurrentRoute(pathname: string, search = "") {
  return search ? `${pathname}${search}` : pathname;
}

export function getGuideTourRouteLabel(
  step: Pick<GuideTourStep, "route" | "routeLabel" | "routePattern">,
  currentRoute: string,
) {
  return step.routeLabel ?? step.routePattern ?? step.route ?? currentRoute;
}

export function doesGuideTourStepMatchRoute(
  step: GuideTourStep,
  pathname: string,
  search = "",
): boolean {
  const currentRoute = buildGuideTourCurrentRoute(pathname, search);

  if (step.route && step.route === currentRoute) {
    return true;
  }

  if (!step.routePattern) {
    return false;
  }

  return Boolean(matchPath({ path: step.routePattern, end: true }, pathname));
}

export function getGuideTourStartStepIndex(
  steps: GuideTourStep[],
  pathname: string,
  search = "",
) {
  const currentStepIndex = steps.findIndex((step) =>
    doesGuideTourStepMatchRoute(step, pathname, search),
  );

  return currentStepIndex >= 0 ? currentStepIndex : 0;
}

export function getResolvedGuideTourModules<TModule extends string>(
  moduleDefinitions: GuideTourModuleDefinition<TModule>[],
  resolveSteps: (module: TModule) => GuideTourStep[],
): GuideTourResolvedModule<TModule>[] {
  return moduleDefinitions.flatMap((moduleDefinition) => {
    const steps = resolveSteps(moduleDefinition.key);

    if (steps.length === 0) {
      return [];
    }

    return [
      {
        ...moduleDefinition,
        steps,
      },
    ];
  });
}
