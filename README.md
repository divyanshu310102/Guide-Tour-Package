# `@divyanshu310102/guide-tour`

Reusable guide-tour state, route helpers, persistence helpers, and a guided-tour host for React Router applications.

## What This Package Includes

- `GuideTourProvider` and `useGuideTour()` for in-app guide-tour state
- `GuideTourHost` for target highlighting, route-following, and step progression
- Route helpers:
  - `doesGuideTourStepMatchRoute`
  - `getGuideTourStartStepIndex`
  - `getResolvedGuideTourModules`
- Local-storage persistence via `createLocalStorageGuideTourPersistence`

## Install

```bash
npm install @divyanshu310102/guide-tour
```

Peer dependencies:

- `react@18.3.1`
- `react-dom@18.3.1`
- `react-router-dom@6.26.2`

## Basic Usage

```tsx
import {
  GuideTourHost,
  GuideTourProvider,
  createLocalStorageGuideTourPersistence,
  getGuideTourStartStepIndex,
  useGuideTour,
  type GuideTourModuleDefinition,
  type GuideTourStep,
} from "@divyanshu310102/guide-tour";

type TourModule = "dashboard" | "reports";

const TOUR_MODULES: GuideTourModuleDefinition<TourModule>[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "reports", label: "Reports" },
];

const TOUR_STEPS: Record<TourModule, GuideTourStep[]> = {
  dashboard: [
    {
      id: "dashboard-shell",
      route: "/dashboard",
      target: '[data-tour-id="dashboard-shell"]',
      title: "Dashboard overview",
      content: "Start here to review the main workspace.",
    },
  ],
  reports: [
    {
      id: "reports-shell",
      route: "/reports",
      target: '[data-tour-id="reports-shell"]',
      title: "Reports overview",
      content: "Open saved and scheduled reports here.",
    },
  ],
};

const persistence = createLocalStorageGuideTourPersistence<TourModule>({
  namespace: "example-app:guide-tour",
  version: "v1",
  getStorageKey: (module) => `demo-user:${module}`,
});

function GuideTourLauncher() {
  const { startTour } = useGuideTour<TourModule>();

  return (
    <button
      onClick={() => {
        startTour({
          module: "dashboard",
          stepIndex: getGuideTourStartStepIndex(
            TOUR_STEPS.dashboard,
            window.location.pathname,
            window.location.search,
          ),
        });
      }}
      type="button"
    >
      Start dashboard tour
    </button>
  );
}

export function App() {
  return (
    <GuideTourProvider>
      <GuideTourLauncher />
      <GuideTourHost
        getModuleLabel={(module) =>
          TOUR_MODULES.find((entry) => entry.key === module)?.label ?? module
        }
        persistence={persistence}
        resolveSteps={(module) => TOUR_STEPS[module]}
      />
    </GuideTourProvider>
  );
}
```

## Integration Model

This package intentionally does not know anything about your app's:

- auth user shape
- role or permission model
- navigation menu layout
- business-specific tour module filtering

Keep those rules in your application and pass resolved steps into the package.

## Styling

`GuideTourHost` ships with Tailwind-style utility classes because this repo already uses Tailwind. If another project does not use Tailwind, either:

- keep Tailwind available, or
- wrap/fork the host styling layer while reusing the package state, persistence, and route helpers

## Publishing

If colleagues need to install this in separate repositories, the package must be reachable from somewhere:

1. Publish to a private npm registry or GitHub Packages for normal `npm install`.
2. Push this package to a Git repository and install from a Git URL.
3. Keep it only inside this repo if consumers will copy or vendor it manually.

For team reuse, option 1 is the cleanest.

## GitHub Packages Setup

This package is configured to publish to GitHub Packages for:

- scope: `@divyanshu310102`
- repository: `https://github.com/divyanshu310102/Guide-Tour-Package.git`

Example auth and publish flow:

```bash
npm login --scope=@divyanshu310102 --auth-type=legacy --registry=https://npm.pkg.github.com
npm publish
```
