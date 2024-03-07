package database

import (
	"fmt"
	"geonius/model"
)

func Migrate() {
	fmt.Println("Create Table users")
	if err := Pg.AutoMigrate(&model.User{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table accessed_locations")
	if err := Pg.AutoMigrate(&model.AccessedLocation{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table admins.")
	if err := Pg.AutoMigrate(&model.Admin{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table geoips.")
	if err := Pg.AutoMigrate(&model.GeoIP{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table clients.")
	if err := Pg.AutoMigrate(&model.Client{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table products.")
	if err := Pg.AutoMigrate(&model.Product{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table widgets.")
	if err := Pg.AutoMigrate(&model.Widget{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table restrictions.")
	if err := Pg.AutoMigrate(&model.Restriction{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table widget_usages.")
	if err := Pg.AutoMigrate(&model.WidgetUsage{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table widget_total_hit.")
	if err := Pg.AutoMigrate(&model.WidgetTotalHit{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table uniq_restriction_point.")
	if err := Pg.AutoMigrate(&model.UniqRestrictionPoint{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table uniq_widget_point.")
	if err := Pg.AutoMigrate(&model.UniqWidgetPoint{}); err != nil {
		panic(err)
	}

	fmt.Println("Done.")
}
