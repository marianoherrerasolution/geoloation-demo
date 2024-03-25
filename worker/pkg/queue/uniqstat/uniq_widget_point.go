package uniqstat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
	"geonius/worker/pkg/enums"

	"github.com/hibiken/asynq"
)

// UniqWidgetPoint() to filter uniq user which access widget by its point location within 1 day
// the result will be uniqued by their geo point and widget id
func UniqWidgetPoint(startDate string, endDate string, aggregate bool) error {
	var widgetIDs []int64
	db.Raw(getDistinctWidgetUsages("widget_id", startDate, endDate)).Find(&widgetIDs)

	var results []model.UniqWidgetPoint
	db.Raw(
		fmt.Sprintf(`
		SELECT widget_id, point, date
			FROM (%s) as t1
			EXCEPT
				SELECT widget_id, point, date
				FROM %s 
				WHERE widget_id IN (?) AND 
					date >= TO_DATE('%s', 'YYYY-MM-DD')
				AND 
					date < TO_DATE('%s', 'YYYY-MM-DD')
		`,
			getDistinctWidgetUsages("widget_id, point, created_at::date as date", startDate, endDate),
			model.TableUniqWidgetPoint, startDate, endDate,
		),
		widgetIDs,
	).
		Find(&results)

	db.Create(&results)

	if aggregate {
		task := asynq.NewTask(enums.TaskStatisticAggregate, []byte("aggregate_widget"))
		AsynqClient().Enqueue(task, asynq.MaxRetry(0), asynq.Queue(enums.TaskStatisticAggregate))
	}

	return nil
}

func getDistinctWidgetUsages(fields string, startDate string, endDate string) string {
	return fmt.Sprintf(`
	SELECT DISTINCT %s 
	FROM %s 
	WHERE
		date >= TO_DATE('%s', 'YYYY-MM-DD')
	AND 
		date < TO_DATE('%s', 'YYYY-MM-DD')`,
		fields, model.TableWidgetUsage, startDate, endDate,
	)
}
