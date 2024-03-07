package aggregatestat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
)

func AggregateRestriction(startDate string, endDate string) error {
	sql := fmt.Sprintf(`
	SELECT 
		t1.restriction_id, 
		to_date(t1.datetext, 'YYYY-MM-DD') as date,
		t1.total_hit, 
		t2.total_uniq,
		t3.total_allow,
		t4.total_deny
	FROM  (
		SELECT restriction_id, to_char(date, 'YYYY-MM-DD') as datetext, count(*) as total_hit  
		FROM widget_usages w1
		WHERE to_char(date, 'YYYY-MM-DD') = '%s'
		GROUP BY restriction_id, date
	) t1
	JOIN  (
		SELECT restriction_id, to_char(date, 'YYYY-MM-DD') as datetext, count(*) as total_uniq
		FROM uniq_restriction_points 
		WHERE to_char(date, 'YYYY-MM-DD') = '%s'
		GROUP BY restriction_id, datetext
	) t2 ON t1.datetext = t2.datetext 
	AND t1.restriction_id = t2.restriction_id
	JOIN  (
		SELECT restriction_id, to_char(date, 'YYYY-MM-DD') as datetext, count(*) as total_allow 
		FROM uniq_restriction_points 
		WHERE to_char(date, 'YYYY-MM-DD') = '%s' AND allow = 1
		GROUP BY restriction_id, datetext
	) t3 ON t1.datetext = t3.datetext 
	AND t1.restriction_id = t3.restriction_id
	JOIN  (
		SELECT restriction_id, to_char(date, 'YYYY-MM-DD') as datetext, count(*) as total_deny 
		FROM uniq_restriction_points 
		WHERE to_char(date, 'YYYY-MM-DD') = '%s' AND allow != 1
		GROUP BY restriction_id, datetext
	) t4 ON t1.datetext = t4.datetext 
	AND t1.restriction_id = t4.restriction_id
	`, startDate, startDate, startDate, startDate)

	var results []model.TotalDailyRestriction
	db.Raw(sql).Find(&results)

	db.Create(&results)
	return nil
}
