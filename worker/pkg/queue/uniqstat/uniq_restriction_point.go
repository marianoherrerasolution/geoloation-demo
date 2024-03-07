package uniqstat

import (
	"fmt"
	"geonius/worker/config"
	db "geonius/worker/database"
	"geonius/worker/model"
	"geonius/worker/pkg/enums"

	"github.com/hibiken/asynq"
)

// UniqRestrictionPoint() to filter uniq user which access Restriction by its point location
// by daily and will be uniqued by their geo point and restriction id
func UniqRestrictionPoint(startDate string, endDate string, aggregate bool) error {
	var restrictionIDs []int64
	db.Raw(getDistinctRestrictionUsages("restriction_id", startDate, endDate)).Find(&restrictionIDs)

	var results []model.UniqRestrictionPoint
	db.Raw(
		fmt.Sprintf(`
		SELECT restriction_id, point, date, allow
			FROM (%s) as t1
			EXCEPT
				SELECT restriction_id, point, date, allow
				FROM %s 
				WHERE restriction_id IN (?)
				 	AND 
						date >= TO_DATE('%s', 'YYYY-MM-DD')
					AND 
						date < TO_DATE('%s', 'YYYY-MM-DD')
		`,
			getDistinctRestrictionUsages("restriction_id, point, created_at::date as date, allow", startDate, endDate),
			model.TableUniqRestrictionPoint, startDate, endDate,
		),
		restrictionIDs,
	).
		Find(&results)
	db.Create(&results)

	if aggregate {
		task := asynq.NewTask(enums.TaskStatisticAggregate, []byte("aggregate_restriction"))
		AsynqClient().Enqueue(task, asynq.MaxRetry(0), asynq.Queue(enums.TaskStatisticAggregate))
	}
	return nil
}

func getDistinctRestrictionUsages(fields string, startDate string, endDate string) string {
	return fmt.Sprintf(`SELECT DISTINCT %s 
	FROM %s 
	WHERE restriction_id > 0 
	AND
		date >= TO_DATE('%s', 'YYYY-MM-DD')
	AND 
		date < TO_DATE('%s', 'YYYY-MM-DD')`,
		fields, model.TableWidgetUsage, startDate, endDate,
	)
}

// AsynqRedis() to initiate asynq's connection option for redis
func AsynqRedis() asynq.RedisConnOpt {
	redisoptions, _ := asynq.ParseRedisURI(config.Env.REDIS_URL)
	return redisoptions
}

// AsynqClient() to initiate asynq.Client by redis
func AsynqClient() *asynq.Client {
	return asynq.NewClient(AsynqRedis())
}
