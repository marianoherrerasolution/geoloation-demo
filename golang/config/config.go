package config

import (
	"errors"
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type EnvVars struct {
	GEOAPI_KEY string
	PG_USER    string
	PG_DB      string
	PG_PASS    string
	PG_HOST    string
}

var Env EnvVars

func envFilename() string {
	if os.Getenv("TEST") != "" {
		return ".env.test"
	}
	if os.Getenv("PRODUCTION") != "" {
		return ".env.production"
	}
	return ".env"
}

func Init() {
	var err error
	if err := godotenv.Load(envFilename()); err != nil {
		panic(err)
	}

	if err != nil {
		panic(errors.New(fmt.Sprintf("loading env file error: %v", err)))
	}

}
