# Contributing

1. `npm install && npm test` (builds, then runs the suite).
2. New tools must make a real Google API call. No stubs or "coming soon" tools.
3. Any tool that changes state must say so in its description, and must resolve its property
   through `resolveSiteUrl` so the allowlist applies.
4. Log with the shared logger only; never write to stdout.
5. Try your change end to end with `npm run call -- <tool> '<json>'`.
