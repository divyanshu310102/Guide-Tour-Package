import type { GuideTourModuleDefinition, GuideTourResolvedModule, GuideTourStep } from "./types";
export declare function buildGuideTourCurrentRoute(pathname: string, search?: string): string;
export declare function getGuideTourRouteLabel(step: Pick<GuideTourStep, "route" | "routeLabel" | "routePattern">, currentRoute: string): string;
export declare function doesGuideTourStepMatchRoute(step: GuideTourStep, pathname: string, search?: string): boolean;
export declare function getGuideTourStartStepIndex(steps: GuideTourStep[], pathname: string, search?: string): number;
export declare function getResolvedGuideTourModules<TModule extends string>(moduleDefinitions: GuideTourModuleDefinition<TModule>[], resolveSteps: (module: TModule) => GuideTourStep[]): GuideTourResolvedModule<TModule>[];
//# sourceMappingURL=routing.d.ts.map