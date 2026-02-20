.DEFAULT_GOAL := default

.PHONY: default install install-dependencies develop down logs lint lint-fix audit build preview prod

default:
	@echo 'Hello, world!'

install:
	COMPOSE_BAKE=true docker compose build

install-dependencies: install
	docker compose run -it --rm app yarn install --check-files --non-interactive --audit

develop:
	COMPOSE_BAKE=true docker compose up app --build

down:
	docker compose down

logs:
	docker compose logs -f

lint:
	docker compose run -it --rm app yarn lint

lint-fix:
	docker compose run -it --rm app yarn lint:fix

audit:
	docker compose run -it --rm app yarn audit

build:
	docker compose run -it --rm app yarn build

preview: build
	docker compose up preview

# The 'prod' target intentionally depends on 'preview' and has no commands of its own.
prod: preview
