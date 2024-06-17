package config

import (
	"os"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	GEOAPI_KEY string
	DB_USER    string
	DB_NAME    string
	DB_PASS    string
	DB_HOST    string
	DB_PORT    string
	MAXMIND_ACCOUNT_ID string
	MAXMIND_LICENSE_KEY string
}

var Env EnvVars

// getEnvFilename() to populate .env filename
func getEnvFilename() string {
	if os.Getenv("TEST") != "" {
		return ".env.test"
	}
	if os.Getenv("PRODUCTION") != "" {
		return ".env.production"
	}
	return ".env"
}

// Init() to load environment variable and store in config.Env
func Init() {
	if err := godotenv.Load(getEnvFilename()); err != nil {
		panic(err)
	}

	Env = EnvVars{
		GEOAPI_KEY: os.Getenv("GEOAPI_KEY"),
		DB_USER:    os.Getenv("DB_USER"),
		DB_NAME:    os.Getenv("DB_NAME"),
		DB_PASS:    os.Getenv("DB_PASS"),
		DB_HOST:    os.Getenv("DB_HOST"),
		DB_PORT:    os.Getenv("DB_PORT"),
		MAXMIND_ACCOUNT_ID: os.Getenv("MAXMIND_ACCOUNT_ID"),
		MAXMIND_LICENSE_KEY: os.Getenv("MAXMIND_LICENSE_KEY"),
	}
}
