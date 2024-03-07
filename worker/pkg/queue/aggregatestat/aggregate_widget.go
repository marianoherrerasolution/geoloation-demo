package aggregatestat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
	"time"
)

func AggregateWidget() error {
	now := time.Now().UTC()
	endhour := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	starthour := endhour.Add(-24 * time.Hour)

	sql := fmt.Sprintf(`
		SELECT 
			t1.date, 
			t1.widget_id, 
			t1.total_hit, 
			t2.total_uniq 
		FROM %s
		JOIN %s ON t1.date = t2.date 
		AND t1.widget_id = t2.widget_id
		`,
		buildQueryAggr(starthour.Unix(), endhour.Unix(), "t1", "widget_id ,total as total_hit", ""),
		buildQueryAggr(starthour.Unix(), endhour.Unix(), "t2", "widget_id, count(total) as total_uniq", ", point"),
	)

	var results []model.TotalDailyWidget
	db.Raw(sql).Find(&results)
	return nil
}

func buildQueryAggr(starthour int64, endhour int64, aliastable string, morefields string, moresubfields string) string {
	return fmt.Sprintf(`
		(
			SELECT 
				date, %s 
			FROM 
				(
					SELECT 
						COUNT(*) AS total_count,
						DATE_TRUNC('day', created_at) AS date%s
					FROM 
						widget_usages 
					WHERE 
						EXTRACT(EPOCH FROM created_at)::int >= %d
					AND 
						EXTRACT(EPOCH FROM created_at)::int < %d
					GROUP BY 
						date, %s
				) as a1 
			GROUP BY 
				date, %s
		) as %s
	`, morefields, moresubfields, starthour, endhour, moresubfields, moresubfields, aliastable)
}
