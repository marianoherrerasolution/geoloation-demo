# 🌎 GEONIUS
### Geolocation Platform to handle restriction request by ip address, coordinate or polygon area

### Stacks

Please install the following stacks

| Name | Version |  Install |  Features |
| ------ | ------ | ------ | ------ |
| PostgreSQL | 12 | [Link](https://www.postgresql.org/download/)  | Main Database |
| PostGIS | 3.2 | [Link](https://trac.osgeo.org/postgis/wiki/UsersWikiPostGIS3UbuntuPGSQLApt) |
| Golang | 1.21 | [Link](https://go.dev/doc/install)  | API Backend |
| ReactJS | 1.24.0 | [Link](https://github.com/arifszn/reforge)  | Frontend |
| MMDBCTL | main | [Link](https://github.com/ipinfo/mmdbctl)  | Convert CSV to MMDB |
| GeoIPDB | main | [Link](https://github.com/sapics/ip-location-db/tree/main) | GeoIPLocation DB |


### Folder Structures
|-- `backend`: microservice as API for handling all logics of Admin and Client websites

|-- `frontend`: reactjs application for admin and client pages

|-- `widgets`: microservice as API for handling all logics of widget integration

|-- `worker`: microserviec as cron and background jobs specially for analytics