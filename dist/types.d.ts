export type GuideTourProgressStatus = "in_progress" | "dismissed" | "completed";
export interface GuideTourStep {
    id: string;
    target: string;
    title: string;
    content: string;
    route?: string;
    routePattern?: string;
    routeLabel?: string;
}
export interface GuideTourModuleDefinition<TModule extends string = string> {
    key: TModule;
    label: string;
}
export interface GuideTourResolvedModule<TModule extends string = string> extends GuideTourModuleDefinition<TModule> {
    steps: GuideTourStep[];
}
export interface GuideTourState<TModule extends string = string> {
    activeModule: TModule | null;
    isTourActive: boolean;
    currentStepIndex: number;
}
export interface GuideTourPersistenceSnapshot {
    status: GuideTourProgressStatus | null;
    stepIndex: number;
}
export interface GuideTourProgressRecord {
    status: GuideTourProgressStatus;
    stepId: string | null;
    updatedAt: string;
}
export interface GuideTourPersistenceAdapter<TModule extends string = string> {
    clear: (module: TModule) => void;
    load: (module: TModule, steps: GuideTourStep[]) => GuideTourPersistenceSnapshot;
    save: (options: {
        module: TModule;
        status: GuideTourProgressStatus;
        stepIndex: number;
        steps: GuideTourStep[];
    }) => void;
}
//# sourceMappingURL=types.d.ts.map