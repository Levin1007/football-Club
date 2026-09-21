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
curl http://localhost:8081/login  # Jenkins should return login page
```

## Notes

Keep the deployment simple, repeatable and documented. Do not commit real secrets.

Plugins are installed at image build time via `jenkins-plugin-cli`. To add new plugins, edit `jenkins/plugins.txt` and rebuild with `docker compose up -d --build`.
