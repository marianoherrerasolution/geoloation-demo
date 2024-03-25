package cron

import (
	"fmt"
	"geonius/worker/pkg/queue"
	"strings"

	"github.com/bytedance/sonic"
	"github.com/hibiken/asynq"
)

const (
	CronEvery1h = "0 */1 * * *"
	CronEvery4h = "0 */4 * * *"
	CronEvery1d = "0 0 * * *"
)

var mapCron = map[string]string{
	"1h": CronEvery1h,
	"4h": CronEvery4h,
	"1d": CronEvery1d,
}

type CronPayload struct {
	QueueName string
	Timeframe string
	Params    interface{}
	TaskName  string
	Scheduler *asynq.Scheduler
}

// opts=quequeName/timeframe/params/taskName,quequeName2/timeframe2/params2/taskName2
func Run(opts string) {
	scheduler := asynq.NewScheduler(queue.AsynqRedis(), nil)

	crons := strings.Split(opts, ",")
	for _, cron := range crons {
		cronConfs := strings.Split(strings.TrimSpace(cron), "/")
		payload := CronPayload{
			QueueName: cronConfs[0],
			Timeframe: cronConfs[1],
			Params:    cronConfs[2],
			TaskName:  cronConfs[3],
			Scheduler: scheduler,
		}
		payload.Register()
	}

	if err := scheduler.Run(); err != nil {
		panic(err)
	}
}

func (p CronPayload) NewTask() *asynq.Task {
	if p.Params == "" {
		return asynq.NewTask(p.TaskName, nil)
	}

	bytes, err := sonic.Marshal(p.Params)
	if err != nil {
		fmt.Printf("[cron] new task %s error %v \n", p.TaskName, p.Params)
		panic(err)
	}

	return asynq.NewTask(p.TaskName, bytes)
}

func (p CronPayload) Register() {
	p.Scheduler.Register(mapCron[p.Timeframe], p.NewTask(), asynq.MaxRetry(0), asynq.Queue(p.QueueName))
}
