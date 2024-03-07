package main

import (
	"flag"
	"geonius/worker/config"
	"geonius/worker/database"
	"geonius/worker/pkg/cron"
	"geonius/worker/pkg/enums"
	"geonius/worker/pkg/queue"
	"geonius/worker/pkg/queue/uniqstat"
	"strings"
)

// main() to initialize and run application server
func main() {
	fileENV := flag.String("env-file", ".env", "file location which contains variable environment")
	isCron := flag.Bool("cron", false, "run app as cron")
	isUniq := flag.Bool("uniq", false, "run app as uniq")
	crons := flag.String("crons", "", "run custom crons, ex: queque/timeframe/params/task,statistic/1h/uniq/uniqAudience")
	workers := flag.String("workers", "", "run custom workers, ex: worker@size,critical@10")

	flag.Parse()
	flag.Usage()

	Init(*fileENV)

	if *isUniq {
		uniqstat.UniqRestrictionPoint()
		return
	}

	if *isCron {
		cronsetting := strings.Join([]string{
			strings.Join([]string{
				enums.TaskStatistic,
				"1h",
				"uniq",
				enums.TaskStatisticUniq,
			}, "/"),
			strings.Join([]string{
				enums.TaskStatistic,
				"1d",
				"aggregate",
				enums.TaskStatistic,
			}, "/"),
		}, ",")
		cron.Run(cronsetting)
		return
	}

	if *crons != "" {
		cron.Run(*crons)
		return
	}

	if *workers != "" {
		queue.Run(*workers)
		return
	}

}

func Init(envPath string) {
	config.Init(envPath)
	database.InitDB()
	database.InitRedis()
}
