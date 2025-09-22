# Newcastle LGBT Website

This repository contains the source for the **Newcastle LGBT** site. It is built with [Nuxt](https://nuxt.com/) and Vue 3, with most content written in Markdown under the `content/` directory and served through Nuxt Content.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/458c411819a6488fb55ce082d7cc5d3b)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

## Requirements
- Node.js 22
- Yarn v1 (Corepack recommended)

Install dependencies with:

```bash
yarn install
```

## Nuxt commands
- `yarn dev` – start the development server at `http://localhost:3000`
- `yarn build` – generate the static site into `.output/public`
- `yarn preview` – serve the latest build from `.output/public`

## Local development
Run the dev server locally:

```bash
yarn dev
```

If you are developing inside Docker or a remote environment, expose the server by setting the host:

```bash
HOST=0.0.0.0 yarn dev
```

## Static build & deployment
Create a production build and serve it locally:

```bash
yarn build
yarn preview
```

After `yarn build`, all deployable assets live under `.output/public`. Deploy by copying that directory to your hosting provider. For example, to publish over SSH:

```bash
yarn build
rsync -avz .output/public/ user@server:/var/www/newcastle-lgbt
```

`yarn preview` runs the same Nitro server used in production so you can verify the build before publishing.

## Validation
Run linting and a production build before committing changes:

```bash
yarn lint
yarn build
```

`yarn lint` enforces code style, while `yarn build` verifies the site builds successfully for deployment. To automatically fix lint issues when possible:

```bash
yarn lint:fix
```

## Docker workflow
The project includes a `Dockerfile`, `docker-compose.yml`, and [just](https://just.systems) recipes for containerised development:

- `docker compose up app` or `just develop` – run `yarn dev` on port `3000`
- `docker compose up preview` or `just preview` – serve the static build after running `yarn build`

Use `just install-dependencies` to install packages inside the container and `just build` to run `yarn build` in the same environment.

## Content sources
- `content/news` – Markdown files for news posts
- `content/events` – Upcoming events
- `content/council` – Council information
- `content/features.json` – Homepage feature cards consumed by Nuxt Content

## License
This project is released under the MIT License. See [LICENSE](LICENSE) for details.
