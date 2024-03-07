package uniqstat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
)

// UniqWidgetPoint() to filter uniq user which access widget by its point location within 1 day
// the result will be uniqued by their geo point and widget id
func UniqWidgetPoint() error {
	var widgetIDs []int64
	db.Raw(getDistinctWidgetUsages("widget_id")).Find(&widgetIDs)

	var results []model.UniqWidgetPoint
	db.Raw(
		fmt.Sprintf(`
		SELECT widget_id, point, date 
			FROM (%s) as t1
			EXCEPT
				SELECT widget_id, point, date 
				FROM %s 
				WHERE widget_id IN (?) AND 
					date < CURRENT_DATE
				AND 
					date >= (CURRENT_DATE - 1)
		`,
			getDistinctWidgetUsages("widget_id, point, created_at::date as date"),
			model.TableUniqWidgetPoint,
		),
		widgetIDs,
	).
		Find(&results)

	db.Create(&results)

	return nil
}

func getDistinctWidgetUsages(fields string) string {
	return fmt.Sprintf(`
	SELECT DISTINCT %s 
	FROM %s 
	WHERE
		created_at::date < CURRENT_DATE
	AND 
		created_at::date >= (CURRENT_DATE - 1)`,
		fields, model.TableWidgetUsage,
	)
}
