package aggregatestat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
)

func AggregateRestriction(startDate string, endDate string) error {
	sql := fmt.Sprintf(`
	SELECT 
		t1.date, 
		t1.restriction_id, 
		t1.total_uniq, 
		t2.total_hit 
	FROM  (
		SELECT restriction_id, date, count(*) as total_uniq  
		FROM uniq_restriction_points 
		WHERE date >= to_date('%s', 'YYYY-MM-DD') AND date < to_date('%s', 'YYYY-MM-DD')
		GROUP BY restriction_id, date
	) t1
	JOIN  (
		SELECT restriction_id, date, count(*) as total_hit  
		FROM widget_usages 
		WHERE created_at::date >= to_date('%s', 'YYYY-MM-DD') AND created_at::date < to_date('%s', 'YYYY-MM-DD')
		GROUP BY restriction_id, date
	) t2 ON t1.date = t2.date 
	AND t1.restriction_id = t2.restriction_id
	`, startDate, endDate, startDate, endDate)

	var results []model.TotalDailyRestriction
	db.Raw(sql).Find(&results)
	return nil
}
