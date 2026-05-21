# MultiSkill - Project Instructions

MultiSkill is a comprehensive learning tracker designed for multi-talented individuals to track progress, build roadmaps, document notes, and showcase portfolios.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend/Auth:** Firebase (Firestore, Auth)
- **State Management:** React Context API 

## Project Structure
- `app/`: Contains all routes and page components.
  - `api/`: Backend routes (Next.js Route Handlers).
  - `(auth)`: Logical grouping for login/register (if applicable).
  - `dashboard/`, `projects/`, `skills/`, etc.: Feature-based routing.
- `components/`: Reusable UI components.
- `lib/`: Shared utilities, contexts, and Firebase configuration.
  - `firebase.ts`: Firebase initialization and exported instances.
  - `AuthContext.tsx`: User session management.
- `public/`: Static assets.

## Coding Standards & Conventions
- **Components:** Use Functional Components with TypeScript.
- **Naming:** 
  - Components: `PascalCase.tsx`
  - Hooks/Utils/Contexts: `camelCase.ts`
  - Styles: Tailwind utility classes (prefer inline).
- **Client vs. Server Components:** 
  - Use `"use client"` only when necessary (interactivity, hooks).
  - Keep data fetching in Server Components where possible.
- **Types:** Define interfaces/types for Firestore documents (User, Skill, Project, Roadmap) in a dedicated `lib/types.ts` or within relevant contexts.

## Firebase Workflow
- **Firestore:** Collections should follow this hierarchy:
  - `users/{userId}`: User profiles.
  - `users/{userId}/skills/{skillId}`: Tracked skills.
  - `users/{userId}/projects/{projectId}`: Portfolio items.
  - `roadmaps/`: Global or community-shared learning paths.
- **Rules:** Update `firestore.rules` for security and test changes before deploying.

## Specific Workflows
- **Adding a New Skill:** Implementation should involve updating the `skills` subcollection and refreshing the dashboard view.
- **Community Paths:** When fetching community roadmaps, use the `lib/firebase.ts` utility to query the global `roadmaps` collection.
- **Internationalization:** Use `LanguageContext` for all UI text to support multi-language capabilities.

## Aesthetic Guidelines
- Follow the "Modern & Clean" aesthetic:
  - High contrast for readability.
  - Rounded corners (`rounded-xl` or `rounded-2xl`).
  - Subtle transitions and hover effects.
  - Consistent spacing using Tailwind's spacing scale.
