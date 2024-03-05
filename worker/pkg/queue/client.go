package queue

import (
	"geonius/worker/config"

	"github.com/hibiken/asynq"
)

// AsynqRedis() to initiate asynq's connection option for redis
func AsynqRedis() asynq.RedisConnOpt {
	redisoptions, _ := asynq.ParseRedisURI(config.Env.REDIS_URL)
	return redisoptions
}

// AsynqClient() to initiate asynq.Client by redis
func AsynqClient() *asynq.Client {
	return asynq.NewClient(AsynqRedis())
}
