package database

import (
	"geonius/config"
	"os"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var Pg *gorm.DB

func Create(value interface{}) *gorm.DB {
	return Pg.Create(value)
}

func Where(query interface{}, args ...interface{}) *gorm.DB {
	return Pg.Where(query, args...)
}

func Raw(sql string, values ...interface{}) *gorm.DB {
	return Pg.Raw(sql, values...)
}

func Delete(value interface{}, conds ...interface{}) *gorm.DB {
	return Pg.Delete(value, conds...)
}

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

func LogMode() logger.LogLevel {
	if os.Getenv("PRODUCTION") != "" {
		return logger.Silent
	}
	return logger.Info
}

func InitPostgres() {
	var err error
	Pg, err = gorm.Open(postgres.Open(buildPosgresDSN()), &gorm.Config{
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
		Logger:                 logger.Default.LogMode(LogMode()),
	})

	if err != nil {
		panic(err)
	}
}
