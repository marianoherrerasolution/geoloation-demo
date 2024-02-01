package database

import (
	"fmt"
	"geonius/model"
)

func Migrate() {
	fmt.Println("Create Table User.")
	if err := Pg.Migrator().CreateTable(&model.User{}); err != nil {
		panic(err)
	}
	fmt.Println("Create Table Access Location.")
	if err := Pg.Migrator().CreateTable(&model.AccessedLocation{}); err != nil {
		panic(err)
	}

	fmt.Println("Done.")
}
