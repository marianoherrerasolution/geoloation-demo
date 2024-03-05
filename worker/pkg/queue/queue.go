package queue

import (
	"context"
	"geonius/worker/pkg/enums"
	"geonius/worker/pkg/queue/aggregatestat"
	"geonius/worker/pkg/queue/uniqstat"
	"strconv"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/hibiken/asynq"
)

func registerWorkers() *asynq.ServeMux {
	mux := asynq.NewServeMux()
	mux.HandleFunc(enums.TaskStatistic, statisticWorker)
	return mux
}

func statisticWorker(ctx context.Context, t *asynq.Task) error {
	var params string
	sonic.Unmarshal(t.Payload(), &params)
	switch params {
	case "uniq_widget_point":
		return uniqstat.UniqWidgetPoint()
	case "uniq_restriction_point":
		return uniqstat.UniqRestrictionPoint()
	case "aggregate":
		return aggregatestat.Run()
	}
	return nil
}

// opts=queueName@concurrency,queueName2@concurrency2
func Run(opts string) {
	workers := map[string]int{}
	workerConfs := strings.Split(opts, ",")
	for _, workerConf := range workerConfs {
		confs := strings.Split(strings.TrimSpace(workerConf), "@")
		concurrency, err := strconv.Atoi(confs[1])
		if err != nil {
			concurrency = 10
		}
		workers[confs[0]] = concurrency
	}

	server := asynq.NewServer(
		AsynqRedis(),
		asynq.Config{
			Concurrency:    50,
			Queues:         workers,
			StrictPriority: true,
		},
	)

	server.Run(registerWorkers())
}
