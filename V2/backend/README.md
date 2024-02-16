# 🌎 GEONIUS
### Stacks

Please install the following stacks

| Name | Version |  Install |  Features |
| ------ | ------ | ------ | ------ |
| PostgreSQL | 12 | [Link](https://www.postgresql.org/download/)  | Main Database |
| PostGIS | 3.2 | [Link](https://trac.osgeo.org/postgis/wiki/UsersWikiPostGIS3UbuntuPGSQLApt) |
| Golang | 1.21 | [Link](https://go.dev/doc/install)  | API Backend |

### Knowledge

Please learn from the following links about the features:

- [Fasthttp-router framework](https://github.com/fasthttp/router)


### Prerequisite
- Install dependencies: `go mod tidy`
- Restore data for development: `pg_restore -U db_user --host localhost -d geolocation < geolocation.sql`
- Migration: `make migrate-dev`
- Server: `make dev`