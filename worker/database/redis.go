package database

import (
	"geonius/worker/config"

	"github.com/redis/go-redis/v9"
)

var Redis *redis.Client

// Init() to initiate connection of redis
func InitRedis() {
	opts, err := redis.ParseURL(config.Env.REDIS_URL)
	if err != nil {
		panic(err)
	}
	Redis = redis.NewClient(opts)
}
