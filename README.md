# BridgeRights

BridgeRights is a mobile application built with Expo and React Native to help tenants in Santa Clara County understand their rights, track housing-related cases, and explore housing options.

## Features

### Tenant Rights Checker
- Evaluates user-provided case details against California and applicable Santa Clara County city-specific tenant-rights rules.
- Distinguishes potentially applicable rules, conditional results, and situations with insufficient information.
- Flags court-related situations for professional review instead of presenting automated results as definitive legal advice.

### Case Tracking
- Organizes case facts, notice details, task checklists, and creation and update timestamps.
- Saves case data locally so records and checklist updates persist after the app closes.
- Requests confirmation before deleting a case.

### Housing Listings
- Provides a housing-discovery interface to help renters explore available housing options.
- Complements tenant-rights resources with a way to look for potential next housing options.

## Technology Stack

| Technology | Purpose |
|---|---|
| Expo + React Native | Cross-platform mobile application |
| TypeScript | Application logic and type definitions |
| Zustand | Application state management |
| MMKV | Persistent on-device storage |
| HeroUI Native | Reusable native-feeling UI components |
| Uniwind | Tailwind CSS v4 styling for React Native |

## Data and Privacy

Case tracking uses a local-first architecture. Zustand manages application state, while MMKV persists case data on the device. Case records are not uploaded to a remote server or synchronized between devices.

The Rights Checker evaluates case information locally using application rules. Automated results are informational and do not replace advice from a qualified legal professional.

## Getting Started

### Prerequisites
- Bun
- Node.js, as required by the project environment
- Xcode for iOS development on macOS, or an Android development environment for Android

### Installation

```bash
bun install
```

### Run the Application

```bash
bun run ios
bun run android
bun run web
```

Run the command for your target platform.

## Project Structure

```text
src/
├── app/              # Expo Router screens and navigation
├── components/       # Reusable UI components
├── features/         # Feature-specific components, logic, and state
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── store/
│       ├── utils/
│       └── types/
├── hooks/            # Shared React hooks
├── lib/              # Shared utilities and storage helpers
└── constants/        # Theme and fallback palette

design/               # Design documentation and design tokens
rules/                # Project coding and design-system rules
```

## Development Checks

Run the project's available checks before submitting changes:

```bash
bun run typecheck
bun run lint:slop
```

- `typecheck` checks for TypeScript errors.
- `lint:slop` checks compliance with the project's design-system conventions.

## Design System

The application's visual styling is based on shared design tokens and configuration. Refer to `src/global.css`, `design/dials.json`, and `design/DESIGN.md` when making visual changes.

`AGENTS.md` documents the project-specific development instructions and links to relevant design and coding rules.
