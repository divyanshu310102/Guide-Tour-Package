import { matchPath } from "react-router-dom";
export function buildGuideTourCurrentRoute(pathname, search = "") {
    return search ? `${pathname}${search}` : pathname;
}
export function getGuideTourRouteLabel(step, currentRoute) {
    return step.routeLabel ?? step.routePattern ?? step.route ?? currentRoute;
}
export function doesGuideTourStepMatchRoute(step, pathname, search = "") {
    const currentRoute = buildGuideTourCurrentRoute(pathname, search);
    if (step.route && step.route === currentRoute) {
        return true;
    }
    if (!step.routePattern) {
        return false;
    }
    return Boolean(matchPath({ path: step.routePattern, end: true }, pathname));
}
export function getGuideTourStartStepIndex(steps, pathname, search = "") {
    const currentStepIndex = steps.findIndex((step) => doesGuideTourStepMatchRoute(step, pathname, search));
    return currentStepIndex >= 0 ? currentStepIndex : 0;
}
export function getResolvedGuideTourModules(moduleDefinitions, resolveSteps) {
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
