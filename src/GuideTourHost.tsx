import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useGuideTour } from "./GuideTourProvider";
import type {
  GuideTourPersistenceAdapter,
  GuideTourStep,
} from "./types";
import {
  buildGuideTourCurrentRoute,
  doesGuideTourStepMatchRoute,
  getGuideTourRouteLabel,
} from "./routing";

const GUIDE_TOUR_CARD_WIDTH_PX = 320;
const GUIDE_TOUR_CARD_FALLBACK_HEIGHT_PX = 232;
const GUIDE_TOUR_TARGET_PADDING_PX = 8;
const GUIDE_TOUR_VIEWPORT_MARGIN_PX = 16;
export const GUIDE_TOUR_TARGET_SEARCH_INTERVAL_MS = 120;
export const GUIDE_TOUR_TARGET_SEARCH_TIMEOUT_MS = 1500;

type GuideTourTargetRect = ReturnType<HTMLElement["getBoundingClientRect"]>;

interface GuideTourCardSize {
  height: number;
  width: number;
}

function getTooltipPosition(
  targetRect: GuideTourTargetRect,
  tooltipSize: GuideTourCardSize,
) {
  const clampedWidth = Math.min(
    tooltipSize.width,
    Math.max(0, window.innerWidth - GUIDE_TOUR_VIEWPORT_MARGIN_PX * 2),
  );
  const clampedHeight = Math.min(
    tooltipSize.height,
    Math.max(0, window.innerHeight - GUIDE_TOUR_VIEWPORT_MARGIN_PX * 2),
  );
  const maxLeft = Math.max(
    GUIDE_TOUR_VIEWPORT_MARGIN_PX,
    window.innerWidth - clampedWidth - GUIDE_TOUR_VIEWPORT_MARGIN_PX,
  );
  const left = Math.min(
    Math.max(GUIDE_TOUR_VIEWPORT_MARGIN_PX, targetRect.left),
    maxLeft,
  );
  const spaceBelow = window.innerHeight - targetRect.bottom;

  if (spaceBelow >= clampedHeight + GUIDE_TOUR_VIEWPORT_MARGIN_PX) {
    return {
      left,
      top: Math.max(
        GUIDE_TOUR_VIEWPORT_MARGIN_PX,
        targetRect.bottom + GUIDE_TOUR_VIEWPORT_MARGIN_PX,
      ),
    };
  }

  const topAbove = targetRect.top - clampedHeight - GUIDE_TOUR_VIEWPORT_MARGIN_PX;
  if (topAbove >= GUIDE_TOUR_VIEWPORT_MARGIN_PX) {
    return {
      left,
      top: topAbove,
    };
  }

  return {
    left,
    top: Math.max(
      GUIDE_TOUR_VIEWPORT_MARGIN_PX,
      window.innerHeight - clampedHeight - GUIDE_TOUR_VIEWPORT_MARGIN_PX,
    ),
  };
}

export interface GuideTourHostProps<TModule extends string = string> {
  getModuleLabel: (module: TModule) => string;
  persistence?: GuideTourPersistenceAdapter<TModule>;
  resolveSteps: (module: TModule) => GuideTourStep[];
  targetSearchIntervalMs?: number;
  targetSearchTimeoutMs?: number;
}

export function GuideTourHost<TModule extends string = string>({
  getModuleLabel,
  persistence,
  resolveSteps,
  targetSearchIntervalMs = GUIDE_TOUR_TARGET_SEARCH_INTERVAL_MS,
  targetSearchTimeoutMs = GUIDE_TOUR_TARGET_SEARCH_TIMEOUT_MS,
}: GuideTourHostProps<TModule>) {
  const {
    activeModule,
    currentStepIndex,
    isTourActive,
    nextStep,
    previousStep,
    stopTour,
  } = useGuideTour<TModule>();
  const location = useLocation();
  const navigate = useNavigate();
  const [targetRect, setTargetRect] = useState<GuideTourTargetRect | null>(null);
  const [isPreparingStep, setIsPreparingStep] = useState(false);
  const [tooltipSize, setTooltipSize] = useState<GuideTourCardSize>({
    height: GUIDE_TOUR_CARD_FALLBACK_HEIGHT_PX,
    width: GUIDE_TOUR_CARD_WIDTH_PX,
  });
  const tooltipRef = useRef<globalThis.HTMLDivElement | null>(null);

  const steps = useMemo(
    () => (activeModule ? resolveSteps(activeModule) : []),
    [activeModule, resolveSteps],
  );
  const currentStep = isTourActive ? steps[currentStepIndex] ?? null : null;
  const currentRoute = buildGuideTourCurrentRoute(
    location.pathname,
    location.search,
  );
  const isLastStep = currentStepIndex >= steps.length - 1;
  const currentModuleLabel = activeModule ? getModuleLabel(activeModule) : null;
  const tooltipPosition = useMemo(
    () => (targetRect ? getTooltipPosition(targetRect, tooltipSize) : null),
    [targetRect, tooltipSize],
  );
  const currentRouteLabel = currentStep
    ? getGuideTourRouteLabel(currentStep, currentRoute)
    : currentRoute;

  useEffect(() => {
    if (!isTourActive) {
      setTooltipSize({
        height: GUIDE_TOUR_CARD_FALLBACK_HEIGHT_PX,
        width: GUIDE_TOUR_CARD_WIDTH_PX,
      });
      return;
    }

    const updateTooltipSize = () => {
      const nextRect = tooltipRef.current?.getBoundingClientRect();
      if (!nextRect || nextRect.width === 0 || nextRect.height === 0) {
        return;
      }

      setTooltipSize((currentSize) => {
        if (
          currentSize.width === nextRect.width &&
          currentSize.height === nextRect.height
        ) {
          return currentSize;
        }

        return {
          height: nextRect.height,
          width: nextRect.width,
        };
      });
    };

    updateTooltipSize();
    window.addEventListener("resize", updateTooltipSize);

    return () => {
      window.removeEventListener("resize", updateTooltipSize);
    };
  }, [
    currentRouteLabel,
    currentStep?.content,
    currentStep?.title,
    currentStepIndex,
    isPreparingStep,
    isTourActive,
  ]);

  useEffect(() => {
    if (!isTourActive) {
      setTargetRect(null);
      setIsPreparingStep(false);
      return;
    }

    if (!activeModule || steps.length === 0 || !currentStep) {
      if (activeModule) {
        persistence?.clear(activeModule);
      }
      stopTour();
    }
  }, [
    activeModule,
    currentStep,
    isTourActive,
    persistence,
    steps.length,
    stopTour,
  ]);

  useEffect(() => {
    if (!isTourActive || !activeModule || !currentStep) {
      return;
    }

    persistence?.save({
      module: activeModule,
      status: "in_progress",
      stepIndex: currentStepIndex,
      steps,
    });
  }, [
    activeModule,
    currentStep,
    currentStepIndex,
    isTourActive,
    persistence,
    steps,
  ]);

  const currentRouteMatchesStep = currentStep
    ? doesGuideTourStepMatchRoute(currentStep, location.pathname, location.search)
    : false;

  useEffect(() => {
    if (!isTourActive || !currentStep?.route) {
      return;
    }

    if (currentRouteMatchesStep) {
      return;
    }

    setTargetRect(null);
    setIsPreparingStep(true);
    navigate(currentStep.route, { replace: true });
  }, [currentRouteMatchesStep, currentStep?.route, isTourActive, navigate]);

  useEffect(() => {
    if (!isTourActive || !currentStep) {
      return;
    }

    let isCancelled = false;
    let timeoutId: number | null = null;
    let removeTrackingListeners = () => {};
    let attemptsRemaining = Math.ceil(
      targetSearchTimeoutMs / targetSearchIntervalMs,
    );

    const finishTour = () => {
      if (activeModule) {
        persistence?.save({
          module: activeModule,
          status: "completed",
          stepIndex: currentStepIndex,
          steps,
        });
      }
      stopTour();
    };

    const skipStep = () => {
      if (isCancelled) {
        return;
      }

      setTargetRect(null);
      setIsPreparingStep(false);
      if (isLastStep) {
        finishTour();
        return;
      }
      nextStep();
    };

    if (currentStep.route) {
      if (!currentRouteMatchesStep) {
        return;
      }
    } else if (currentStep.routePattern && !currentRouteMatchesStep) {
      skipStep();
      return;
    }

    const resolveTarget = () => {
      if (isCancelled) {
        return;
      }

      const targetElement = document.querySelector(currentStep.target);
      if (targetElement instanceof HTMLElement) {
        const syncTargetRect = () => {
          const nextRect = targetElement.getBoundingClientRect();
          if (nextRect.width === 0 && nextRect.height === 0) {
            return;
          }
          setTargetRect(nextRect);
        };

        targetElement.scrollIntoView?.({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });

        syncTargetRect();
        setIsPreparingStep(false);

        const handleViewportChange = () => {
          syncTargetRect();
        };

        window.addEventListener("resize", handleViewportChange);
        window.addEventListener("scroll", handleViewportChange, true);
        removeTrackingListeners = () => {
          window.removeEventListener("resize", handleViewportChange);
          window.removeEventListener("scroll", handleViewportChange, true);
        };
        return;
      }

      if (attemptsRemaining <= 0) {
        skipStep();
        return;
      }

      attemptsRemaining -= 1;
      timeoutId = window.setTimeout(resolveTarget, targetSearchIntervalMs);
    };

    setIsPreparingStep(true);
    setTargetRect(null);
    resolveTarget();

    return () => {
      isCancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      removeTrackingListeners();
    };
  }, [
    activeModule,
    currentRouteMatchesStep,
    currentStep,
    currentStepIndex,
    isLastStep,
    isTourActive,
    nextStep,
    persistence,
    steps,
    stopTour,
    targetSearchIntervalMs,
    targetSearchTimeoutMs,
  ]);

  if (!isTourActive || !activeModule || !currentStep) {
    return null;
  }

  const finishTour = () => {
    persistence?.save({
      module: activeModule,
      status: "completed",
      stepIndex: currentStepIndex,
      steps,
    });
    stopTour();
  };

  return (
    <>
      {targetRect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-40 rounded-xl border-2 border-blue-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.58)] transition-all duration-200"
          style={{
            height: targetRect.height + GUIDE_TOUR_TARGET_PADDING_PX * 2,
            left: targetRect.left - GUIDE_TOUR_TARGET_PADDING_PX,
            top: targetRect.top - GUIDE_TOUR_TARGET_PADDING_PX,
            width: targetRect.width + GUIDE_TOUR_TARGET_PADDING_PX * 2,
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 z-40 bg-slate-950/55" />
      )}

      <div
        aria-labelledby="guide-tour-title"
        aria-modal="true"
        className="fixed z-50 max-h-[calc(100vh-2rem)] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
        ref={tooltipRef}
        role="dialog"
        style={
          tooltipPosition
            ? {
                left: tooltipPosition.left,
                top: tooltipPosition.top,
              }
            : {
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              {currentModuleLabel} Guide Tour
            </p>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="guide-tour-title" className="text-lg font-semibold text-slate-900">
                  {currentStep.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {isPreparingStep
                    ? "Preparing the next guided step..."
                    : currentStep.content}
                </p>
              </div>
              <button
                className="rounded-md px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={() => {
                  persistence?.save({
                    module: activeModule,
                    status: "dismissed",
                    stepIndex: currentStepIndex,
                    steps,
                  });
                  stopTour();
                }}
                type="button"
              >
                End
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            <span>{`Step ${Math.min(currentStepIndex + 1, steps.length)} of ${steps.length}`}</span>
            <span>{currentRouteLabel}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentStepIndex === 0 || isPreparingStep}
              onClick={() => {
                previousStep();
              }}
              type="button"
            >
              Back
            </button>
            <button
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              onClick={() => {
                if (isLastStep) {
                  finishTour();
                  return;
                }

                nextStep();
              }}
              type="button"
            >
              {isLastStep ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
