default:
    echo 'Hello, world!'
up:
    docker compose up
down:
    docker compose down
up-d:
    docker compose up
logs:
    docker compose logs -f
lint:
    docker compose run -it --rm app yarn lint
lint-fix:
    docker compose run -it --rm app yarn lint-fix
