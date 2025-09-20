# Guidelines for Codex Agents

This project is a Nuxt-powered static website built with Vue 3 and Yarn. Most content lives in the `pages/` and `content/` directories.

## Running checks
- Use **Node 22** with Yarn v1.
- After making changes, run `yarn lint` at the repository root and ensure it succeeds.
- Run `yarn build` and ensure it succeeds to confirm the project can be deployed.
- Use `yarn preview` to smoke-test the static build when you touch rendering logic.

## Nuxt commands
- `yarn dev` – start the local development server on port 3000.
- `yarn build` – generate the static site into `.output/public`.
- `yarn preview` – serve the production build from `.output/public`.

## Coding style
- Follow the existing Vue and JavaScript style. ESLint rules are defined in `eslint.config.mjs`.
- Use semicolons and avoid unused variables or components.

## Commit messages
- Write clear, concise commit messages describing what changed and why.
