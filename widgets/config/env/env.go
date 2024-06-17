package env

import (
	"os"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	PRODUCTION          bool
	GEOAPI_KEY          string
	DB_USER             string
	DB_NAME             string
	DB_PASS             string
	DB_HOST             string
	DB_PORT             string
	MAXMIND_ACCOUNT_ID  string
	MAXMIND_LICENSE_KEY string
}

var Vars EnvVars

// Init() to load environment variable and store in config.Env
func Init(isProduction bool, filepaths ...string) {
	if err := godotenv.Load(filepaths...); err != nil {
		panic(err)
	}

	production := (os.Getenv("PRODUCTION") != "")
	if !production {
		production = isProduction
	}
	Vars = EnvVars{
		PRODUCTION:          production,
		GEOAPI_KEY:          os.Getenv("GEOAPI_KEY"),
		DB_USER:             os.Getenv("DB_USER"),
		DB_NAME:             os.Getenv("DB_NAME"),
		DB_PASS:             os.Getenv("DB_PASS"),
		DB_HOST:             os.Getenv("DB_HOST"),
		DB_PORT:             os.Getenv("DB_PORT"),
		MAXMIND_ACCOUNT_ID:  os.Getenv("MAXMIND_ACCOUNT_ID"),
		MAXMIND_LICENSE_KEY: os.Getenv("MAXMIND_LICENSE_KEY"),
	}
}
