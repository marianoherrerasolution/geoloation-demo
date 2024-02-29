package config

import (
	"strings"
	"widgetz/config/env"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func LogMode() logger.LogLevel {
	if env.Vars.PRODUCTION {
		return logger.Silent
	}
	return logger.Info
}

func InitPostgres() {
	var err error
	DB, err = gorm.Open(postgres.Open(buildPosgresDSN()), &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
		Logger:                 logger.Default.LogMode(LogMode()),
	})

	if err != nil {
		panic(err)
	}
}

func buildPosgresDSN() string {
	dsn := []string{
		"host=",
		env.Vars.DB_HOST,
		"user=",
		env.Vars.DB_USER,
		"password=",
		env.Vars.DB_PASS,
		"dbname=",
		env.Vars.DB_NAME,
		"port=",
		env.Vars.DB_PORT,
		"sslmode=disable",
	}

	return strings.Join(dsn, " ")
}
