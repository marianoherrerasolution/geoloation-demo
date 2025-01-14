package config

import (
	"os"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	GEOAPI_KEY string
	REDIS_URL  string
	DB_USER    string
	DB_NAME    string
	DB_PASS    string
	DB_HOST    string
	DB_PORT    string
}

var Env EnvVars

// Init() to load environment variable and store in config.Env
func Init(filenames ...string) {
	if err := godotenv.Load(filenames...); err != nil {
		panic(err)
	}

	Env = EnvVars{
		GEOAPI_KEY: os.Getenv("GEOAPI_KEY"),
		REDIS_URL:  os.Getenv("REDIS_URL"),
		DB_USER:    os.Getenv("DB_USER"),
		DB_NAME:    os.Getenv("DB_NAME"),
		DB_PASS:    os.Getenv("DB_PASS"),
		DB_HOST:    os.Getenv("DB_HOST"),
		DB_PORT:    os.Getenv("DB_PORT"),
	}
}
