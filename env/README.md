# Docker env files

Create these files before running Docker Compose:

- `env/VibeSpace.env`
- `env/vibeinbackend.env`
- `env/ChatLoop.env`
- `env/Worker.env`

Copy values from your local `.env` files and replace hostnames:

- MongoDB host: `mongo`
- Redis host: `redis`
- RabbitMQ host: `rabbitmq`

For local web URL behind Nginx reverse proxy use:

- `NEXTAUTH_URL=http://localhost`
- `NEXT_PUBLIC_SOCKET_URL=http://localhost`

## Backend load balancing

`docker-compose.yml` runs two backend instances:

- `vibeinbackend_1`
- `vibeinbackend_2`

Nginx upstream `api_upstream` load balances requests across both instances using `least_conn`.

Then run:

```bash
docker compose up --build -d
```
