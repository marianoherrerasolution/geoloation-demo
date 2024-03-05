package uniqstat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
	"time"
)

// UniqWidgetPoint() to filter uniq user which access widget by its point location within 1 hour range
// if now is 2.05pm then all widget usages from 1.00pm to 2.00pm will be uniqued by their geo point and widget id
func UniqWidgetPoint() error {
	now := time.Now().UTC()
	endhour := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), 0, 0, 0, time.UTC)
	starthour := endhour.Add(-1 * time.Hour)
	var widgetIDs []int64
	db.Raw(getDistinctWidgetUsages("widget_id", starthour.Unix(), endhour.Unix())).Find(&widgetIDs)

	var results []model.UniqWidgetPoint
	db.Raw(
		fmt.Sprintf(`
			SELECT restriction_id, point FROM (%s) as widgetpoints
			EXCEPT
			SELECT restriction_id, point FROM %s WHERE restriction_id IN (?)
		`,
			getDistinctWidgetUsages("restriction_id, point", starthour.Unix(), endhour.Unix()),
			model.TableUniqWidgetPoint,
		),
		widgetIDs,
	).
		Find(&results)
	db.Create(&results)

	return nil
}

func getDistinctWidgetUsages(fields string, starthour int64, endhour int64) string {
	return fmt.Sprintf(`SELECT DISTINCT %s 
	FROM %s 
	WHERE EXTRACT(EPOCH FROM created_at)::bigint >= %d
	AND 
	EXTRACT(EPOCH FROM created_at)::bigint < %d`,
		model.TableWidgetUsage, fields, starthour, endhour,
	)
}
