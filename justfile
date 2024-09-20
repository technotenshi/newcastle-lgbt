default:
    echo 'Hello, world!'
develop:
    docker compose up app --build
down:
    docker compose down
up-d:
    docker compose up app --build -d
logs:
    docker compose logs -f
lint:
    docker compose run -it --rm app yarn lint
lint-fix:
    docker compose run -it --rm app yarn lint-fix
build: lint-fix
    docker compose run -it --rm app yarn build
prod: build
    docker compose up prod