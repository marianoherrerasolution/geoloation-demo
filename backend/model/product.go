package model

import (
	"strings"
)

const (
	TableProduct = "products"
)

type Product struct {
	Base
	Name     string `gorm:"column:name;index:idx_product_uniq,priority:1" json:"name"`
	ClientID uint   `gorm:"column:client_id;index:idx_product_client_id;index:idx_product_uniq,priority:2" json:"client_id"`
	AppType  string `gorm:"column:app_type;index:idx_product_app_type;index:idx_product_uniq,priority:3" json:"app_type"`
}

type ProductClientName struct {
	Product
	ClientName string `json:"client_name"`
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
