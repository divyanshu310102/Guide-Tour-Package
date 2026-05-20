import type {
  GuideTourPersistenceAdapter,
  GuideTourPersistenceSnapshot,
  GuideTourProgressRecord,
  GuideTourProgressStatus,
  GuideTourStep,
} from "./types";

function getGuideTourStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isGuideTourProgressRecord(
  value: unknown,
): value is GuideTourProgressRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GuideTourProgressRecord>;

  return (
    (candidate.status === "in_progress" ||
      candidate.status === "dismissed" ||
      candidate.status === "completed") &&
    ("stepId" in candidate) &&
    typeof candidate.updatedAt === "string"
  );
}

export function createLocalStorageGuideTourPersistence<TModule extends string>({
  getStorageKey,
  namespace,
  storage,
  version,
}: {
  getStorageKey: (module: TModule) => string | null;
  namespace: string;
  storage?: Storage | null;
  version: string;
}): GuideTourPersistenceAdapter<TModule> {
  const resolveStorage = () =>
    storage === undefined ? getGuideTourStorage() : storage;

  const readStoredProgress = (module: TModule) => {
    const resolvedStorage = resolveStorage();
    const scopedStorageKey = getStorageKey(module);

    if (!resolvedStorage || !scopedStorageKey) {
      return null;
    }

    const rawValue = resolvedStorage.getItem(
      [namespace, version, scopedStorageKey].join(":"),
    );
    if (!rawValue) {
      return null;
    }

    try {
      const parsedValue = JSON.parse(rawValue) as unknown;
      return isGuideTourProgressRecord(parsedValue) ? parsedValue : null;
    } catch {
      return null;
    }
  };

  const writeStoredProgress = (
    module: TModule,
    value: GuideTourProgressRecord,
  ) => {
    const resolvedStorage = resolveStorage();
    const scopedStorageKey = getStorageKey(module);

    if (!resolvedStorage || !scopedStorageKey) {
      return;
    }

    resolvedStorage.setItem(
      [namespace, version, scopedStorageKey].join(":"),
      JSON.stringify(value),
    );
  };

  const clearStoredProgress = (module: TModule) => {
    const resolvedStorage = resolveStorage();
    const scopedStorageKey = getStorageKey(module);

    if (!resolvedStorage || !scopedStorageKey) {
      return;
    }

    resolvedStorage.removeItem([namespace, version, scopedStorageKey].join(":"));
  };

  return {
    clear(module) {
      clearStoredProgress(module);
    },
    load(module, steps): GuideTourPersistenceSnapshot {
      const storedProgress = readStoredProgress(module);

      if (!storedProgress || steps.length === 0) {
        return {
          status: null,
          stepIndex: 0,
        };
      }

      if (storedProgress.status !== "in_progress") {
        return {
          status: storedProgress.status,
          stepIndex: 0,
        };
      }

      const stepIndex = storedProgress.stepId
        ? steps.findIndex((step) => step.id === storedProgress.stepId)
        : 0;

      return {
        status: "in_progress",
        stepIndex: stepIndex >= 0 ? stepIndex : 0,
      };
    },
    save({
      module,
      status,
      stepIndex,
      steps,
    }: {
      module: TModule;
      status: GuideTourProgressStatus;
      stepIndex: number;
      steps: GuideTourStep[];
    }) {
      const normalizedStepIndex =
        steps.length > 0
          ? Math.min(Math.max(stepIndex, 0), steps.length - 1)
          : 0;
      const stepId =
        status === "in_progress"
          ? steps[normalizedStepIndex]?.id ?? null
          : null;

      writeStoredProgress(module, {
        status,
        stepId,
        updatedAt: new Date().toISOString(),
      });
    },
  };
}
