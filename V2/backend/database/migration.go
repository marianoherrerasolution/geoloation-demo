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

	fmt.Println("Done.")
}
