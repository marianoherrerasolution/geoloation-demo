# 🌎 GEONIUS-WORKER
### Geonius microservice as Cron and Background Jobs to build analytic data

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

- [Distributed task queue](https://github.com/hibiken/asynq)


### Prerequisite
- Install dependencies: `go mod tidy`
- Server: `go run main.go --worker`
- Cron: `go run main.go --cron`


### Folder Structures
|-- `config`: configuration for local envrionment variables

|-- `database`: connection for postgresql and redis

|-- `model`: object relational mapping for tables

|-- `pkg`: library for helper modules

....|-- `cron`: handle scheduled or cron job
....|-- `queue`: handle worker to execute queue or task

|-- `main.go`: The start of everything