import type { GuideTourPersistenceAdapter } from "./types";
export declare function createLocalStorageGuideTourPersistence<TModule extends string>({ getStorageKey, namespace, storage, version, }: {
    getStorageKey: (module: TModule) => string | null;
    namespace: string;
    storage?: Storage | null;
    version: string;
}): GuideTourPersistenceAdapter<TModule>;
//# sourceMappingURL=persistence.d.ts.map