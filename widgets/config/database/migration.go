package config

import (
	"fmt"
	"widgetz/model"
)

func Migrate() {

	fmt.Println("Create Table geoips.")
	if err := DB.AutoMigrate(&model.GeoIP{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table widgets.")
	if err := DB.AutoMigrate(&model.Widget{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table restrictions.")
	if err := DB.AutoMigrate(&model.Restriction{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table widget_usages.")
	if err := DB.AutoMigrate(&model.WidgetUsage{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table widget_total_hit.")
	if err := DB.AutoMigrate(&model.WidgetTotalHit{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table uniq_restriction_point.")
	if err := DB.AutoMigrate(&model.UniqRestrictionPoint{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table uniq_widget_point.")
	if err := DB.AutoMigrate(&model.UniqWidgetPoint{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table total_daily_restriction.")
	if err := DB.AutoMigrate(&model.TotalDailyRestriction{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table total_daily_widgets.")
	if err := DB.AutoMigrate(&model.TotalDailyWidget{}); err != nil {
		panic(err)
	}

	fmt.Println("Done.")
}
