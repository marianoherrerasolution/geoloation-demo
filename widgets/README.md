# 🌎 GEONIUS-WIDGET
### Geonius microservice as API to handle widget request from any application

### Stacks

Please install the following stacks

| Name | Version |  Install |  Features |
| ------ | ------ | ------ | ------ |
| PostgreSQL | 12 | [Link](https://www.postgresql.org/download/)  | Main Database |
| PostGIS | 3.2 | [Link](https://trac.osgeo.org/postgis/wiki/UsersWikiPostGIS3UbuntuPGSQLApt) |
| Golang | 1.21 | [Link](https://go.dev/doc/install)  | API Backend |
| MMDBCTL | main | [Link](https://github.com/ipinfo/mmdbctl)  | Convert CSV to MMDB |
| GeoIPDB | main | [Link](https://github.com/sapics/ip-location-db/tree/main) | GeoIPLocation DB |


### Knowledge

Please learn from the following links about the features:

- [Fasthttp-router framework](https://github.com/fasthttp/router)


### Prerequisite
- Install dependencies: `go mod tidy`
- Restore data for development: `pg_restore -U db_user --host localhost -d geolocation < geolocation.sql`
- Migration: `make migrate-dev`
- Server: `make dev`
- Download from GeoIPDB github file `dbip-city-ipv4.csv.gz` and extract `gzip -d dbip-city-ipv4.csv.gz`
- Convert `mmdbctl import --in dbip-city-ipv4.csv --out dbip-city-ipv4.mmdb`


### Folder Structures
|-- `api`: all api handlers

|-- `config`: configuration for local envrionment variables, routers and databases

|-- `dal`: data access layer functions

|-- `model`: object relational mapping for tables

|-- `pkg`: library for helper modules

|-- `main.go`: The start of everything