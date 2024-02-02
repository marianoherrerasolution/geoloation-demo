package database

import (
	"fmt"
	"geonius/model"
)

func Migrate() {
	fmt.Println("Create Table users")
	if err := Pg.Migrator().CreateTable(&model.User{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table accessed_locations")
	if err := Pg.Migrator().CreateTable(&model.AccessedLocation{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table admins.")
	if err := Pg.Migrator().CreateTable(&model.Admin{}); err != nil {
		panic(err)
	}

	fmt.Println("Create Table geoips.")
	if err := Pg.Migrator().CreateTable(&model.GeoIP{}); err != nil {
		panic(err)
	}

	fmt.Println("Done.")
}
