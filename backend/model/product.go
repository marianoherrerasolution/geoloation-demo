package model

import (
	"gorm.io/gorm"
)

const (
	TableProduct = "products"
)

type Product struct {
	gorm.Model
	Name     string `gorm:"column:name;index:idx_product_name" json:"name" body:"name" query:"name" form:"name"`
	ClientID uint   `gorm:"column:client_id;index:idx_product_client_id" json:"client_id" body:"client_id" query:"client_id" form:"client_id"`
}

func (u *Product) TableName() string {
	return TableProduct
}

func (u *Product) ValidID() bool {
	return u.ID > 0
}
