package aggregatestat

import (
	"fmt"
	db "geonius/worker/database"
	"geonius/worker/model"
	"time"
)

func AggregateRestriction() error {
	now := time.Now().UTC()
	endhour := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	starthour := endhour.Add(-24 * time.Hour)

	sql := fmt.Sprintf(`
		SELECT 
			t1.date, 
			t1.restriction_id, 
			t1.total_hit, 
			t2.total_uniq 
		FROM %s
		JOIN %s ON t1.date = t2.date 
		AND t1.restriction_id = t2.restriction_id
		`,
		buildQueryAggr(starthour.Unix(), endhour.Unix(), "t1", "restriction_id, total as total_hit", ""),
		buildQueryAggr(starthour.Unix(), endhour.Unix(), "t2", "restriction_id, count(total) as total_uniq", ", point"),
	)

	var results []model.TotalDailyRestriction
	db.Raw(sql).Find(&results)
	return nil
}
