// Ambient declarations for side-effect CSS imports (Tailwind's
// globals.css, per-page stylesheets, etc.). Kept in its own file
// because ambient module declarations must live in a script (non-
// module) .d.ts — global.d.ts uses `export {}` so it can't host
// these.

declare module '*.css';
declare module '*.scss';
