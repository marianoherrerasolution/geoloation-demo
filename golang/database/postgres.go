package database

import (
	"geonius/config"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var Pg *gorm.DB

func buildPosgresDSN() string {
	dsn := []string{
		"host=",
		config.Env.DB_HOST,
		"user=",
		config.Env.DB_USER,
		"password=",
		config.Env.DB_PASS,
		"dbname=",
		config.Env.DB_NAME,
		"port=",
		config.Env.DB_PORT,
		"sslmode=disable",
	}

	return strings.Join(dsn, " ")
}

func InitPostgres() {
	var err error
	Pg, err = gorm.Open(postgres.New(postgres.Config{}))
	if err != nil {
		panic(err)
	}
}
