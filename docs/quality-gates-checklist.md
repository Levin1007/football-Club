# Quality Gates Checklist

- [ ] The project starts with Docker Compose.
- [ ] The README contains setup and verification steps.
- [ ] Lint or static checks pass.
- [ ] Tests pass locally and in Jenkins.
- [ ] A build artifact is created and archived.
- [ ] No real secrets are committed.
- [ ] Load testing stays at or below 10 simultaneous users.
- [ ] Deployment is verified with logs or a health check.
