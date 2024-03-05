package uniqstat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
	"time"
)

// UniqRestrictionPoint() to filter uniq user which access Restriction by its point location within 1 hour range
// if now is 2.05pm then all restriction usages from 1.00pm to 2.00pm will be uniqued by their geo point and restriction id
func UniqRestrictionPoint() error {
	now := time.Now().UTC()
	endhour := time.Date(now.Year(), now.Month(), now.Day(), now.Hour(), 0, 0, 0, time.UTC)
	starthour := endhour.Add(-1 * time.Hour)
	var restrictionIDs []int64
	db.Raw(getDistinctRestrictionUsages("restriction_id", starthour.Unix(), endhour.Unix())).Find(&restrictionIDs)

	var results []model.UniqRestrictionPoint
	db.Raw(
		fmt.Sprintf(`
			SELECT restriction_id, point FROM (%s) as widgetpoints
			EXCEPT
			SELECT restriction_id, point FROM %s WHERE restriction_id IN (?)
		`,
			getDistinctRestrictionUsages("restriction_id, point", starthour.Unix(), endhour.Unix()),
			model.TableUniqRestrictionPoint,
		),
		restrictionIDs,
	).
		Find(&results)
	db.Create(&results)
	return nil
}

func getDistinctRestrictionUsages(fields string, starthour int64, endhour int64) string {
	return fmt.Sprintf(`SELECT DISTINCT %s 
	FROM %s 
	WHERE restriction_id > 0 
	AND
	EXTRACT(EPOCH FROM created_at)::bigint >= %d
	AND 
	EXTRACT(EPOCH FROM created_at)::bigint < %d`,
		model.TableWidgetUsage, fields, starthour, endhour,
	)
}
