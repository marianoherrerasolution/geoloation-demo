package aggregatestat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
)

func AggregateWidget(startDate string, endDate string) error {
	sql := fmt.Sprintf(`
SELECT 
	to_date(t1.datetext, 'YYYY-MM-DD') as date,
	t1.widget_id, 
	t1.total_uniq, 
	t2.total_hit 
FROM  (
	SELECT widget_id, to_char(date, 'YYYY-MM-DD') as datetext, count(*) as total_uniq  
	FROM uniq_widget_points 
	WHERE to_char(date, 'YYYY-MM-DD') = '%s'
	GROUP BY widget_id, datetext
) t1
JOIN  (
	SELECT widget_id, to_char(date, 'YYYY-MM-DD') as datetext, count(*) as total_hit  
	FROM widget_usages 
	WHERE to_char(date, 'YYYY-MM-DD') = '%s'
	GROUP BY widget_id, date
) t2 ON t1.datetext = t2.datetext 
AND t1.widget_id = t2.widget_id
`,
		startDate, endDate,
	)

	var results []model.TotalDailyWidget
	db.Raw(sql).Find(&results)
	db.Create(&results)
	return nil
}
