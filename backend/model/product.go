package model

import (
	"strings"

	"gorm.io/gorm"
)

const (
	TableProduct = "products"
)

type Product struct {
	gorm.Model
	Name     string `gorm:"column:name;index:idx_product_uniq,priority:1" json:"name" body:"name" query:"name" form:"name"`
	ClientID uint   `gorm:"column:client_id;index:idx_product_client_id;index:idx_product_uniq,priority:2" json:"client_id" body:"client_id" query:"client_id" form:"client_id"`
	AppType  string `gorm:"column:app_type;index:idx_product_app_type;index:idx_product_uniq,priority:3" json:"app_type" body:"app_type" query:"app_type" form:"app_type"`
}

func (u *Product) TableName() string {
	return TableProduct
}

func (u *Product) ValidID() bool {
	return u.ID > 0
}

func (u *Product) ValidateEmptyField() string {
	if strings.Trim(u.Name, " ") == "" {
		return "name"
	}

	if u.ClientID < 1 {
		return "client_id"
	}

	return ""
}
