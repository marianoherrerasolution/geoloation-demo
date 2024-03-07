package uniqstat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
)

// UniqRestrictionPoint() to filter uniq user which access Restriction by its point location within 1 hour range
// if now is 2.05pm then all restriction usages from 1.00pm to 2.00pm will be uniqued by their geo point and restriction id
func UniqRestrictionPoint() error {
	var restrictionIDs []int64
	db.Raw(getDistinctRestrictionUsages("restriction_id")).Find(&restrictionIDs)

	var results []model.UniqRestrictionPoint
	db.Raw(
		fmt.Sprintf(`
		SELECT restriction_id, point, date 
			FROM (%s) as t1
			EXCEPT
				SELECT restriction_id, point, date 
				FROM %s 
				WHERE restriction_id IN (?) AND 
					date < CURRENT_DATE
				AND 
					date >= (CURRENT_DATE - 1)
		`,
			getDistinctRestrictionUsages("restriction_id, point, created_at::date as date"),
			model.TableUniqRestrictionPoint,
		),
		restrictionIDs,
	).
		Find(&results)
	db.Create(&results)
	return nil
}

func getDistinctRestrictionUsages(fields string) string {
	return fmt.Sprintf(`SELECT DISTINCT %s 
	FROM %s 
	WHERE restriction_id > 0 
	AND
	created_at::date < CURRENT_DATE
	AND 
	created_at::date >= (CURRENT_DATE - 1)`,
		fields,
		model.TableWidgetUsage,
	)
}
