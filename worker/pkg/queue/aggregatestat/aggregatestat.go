package aggregatestat

import "time"

func Recalculate() {
	now := time.Now().UTC()
	endDate := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	// Calculate the end date (30 days from now)
	startDate := endDate.AddDate(0, 0, -30)

	// Loop through the dates
	for currentDate := startDate; currentDate.Before(endDate); currentDate = currentDate.AddDate(0, 0, 1) {
		beginDate := currentDate.Format("2006-01-02")
		finishDate := currentDate.AddDate(0, 0, 1).Format("2006-01-02")
		AggregateWidget(beginDate, finishDate)
		AggregateRestriction(beginDate, finishDate)
	}
}
