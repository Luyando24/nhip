.PHONY: up down logs db reset

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f

db:
	docker exec -it znhip-db psql -U postgres -d znhip

reset:
	docker-compose down -v
	docker-compose up --build -d
