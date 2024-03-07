package aggregatestat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
)

func AggregateWidget(startDate string, endDate string) error {
	sql := fmt.Sprintf(`
SELECT 
	t1.date, 
	t1.widget_id, 
	t1.total_uniq, 
	t2.total_hit 
FROM  (
	SELECT widget_id, date, count(*) as total_uniq  
	FROM uniq_widget_points 
	WHERE date >= to_date('%s', 'YYYY-MM-DD') AND date < to_date('%s', 'YYYY-MM-DD')
	GROUP BY widget_id, date
) t1
JOIN  (
	SELECT widget_id, date, count(*) as total_hit  
	FROM widget_usages 
	WHERE created_at::date >= to_date('%s', 'YYYY-MM-DD') AND created_at::date < to_date('%s', 'YYYY-MM-DD')
	GROUP BY widget_id, date
) t2 ON t1.date = t2.date 
AND t1.widget_id = t2.widget_id
`,
		startDate, endDate, startDate, endDate,
	)

	var results []model.TotalDailyWidget
	db.Raw(sql).Find(&results)
	return nil
}
