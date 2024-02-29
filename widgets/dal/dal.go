package dal

import (
	db "widgetz/config/database"

	"gorm.io/gorm"
)

func Db() *gorm.DB {
	if db.DB == nil {
		db.InitPostgres()
	}
	return db.DB
}

func Create(value interface{}) *gorm.DB {
	return Db().Create(value)
}

func Select(query interface{}, args ...interface{}) *gorm.DB {
	return Db().Select(query, args...)
}

func Where(query interface{}, args ...interface{}) *gorm.DB {
	return Db().Where(query, args...)
}

func Raw(sql string, values ...interface{}) *gorm.DB {
	return Db().Raw(sql, values...)
}

func Delete(value interface{}, conds ...interface{}) *gorm.DB {
	return Db().Delete(value, conds...)
}

func Table(name string, args ...interface{}) (tx *gorm.DB) {
	return Db().Table(name, args...)
}

func Model(value interface{}) (tx *gorm.DB) {
	return Db().Model(value)
}
