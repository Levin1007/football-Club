# Deployment Notes

## Application

Football Club Manager

## Deployment command

```bash
docker compose up -d --build
```

## Verification

```bash
docker compose ps
docker compose logs backend
curl http://localhost:8080/api/health
```

## Notes

Keep the deployment simple, repeatable and documented. Do not commit real secrets.
