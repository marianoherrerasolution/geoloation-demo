package database

import "geonius/model"

func Migrate() {
	if err := Pg.Migrator().CreateTable(&model.User{}); err != nil {
		panic(err)
	}

	if err := Pg.Migrator().CreateTable(&model.AccessedLocation{}); err != nil {
		panic(err)
	}
}
