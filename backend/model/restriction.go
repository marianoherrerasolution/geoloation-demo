package model

import (
	"strings"
)

const (
	TableRestriction = "restrictions"
)

type Restriction struct {
	Base
	Name       string  `gorm:"column:name;index:idx_restr_keyword,priority:1" json:"name" body:"name" query:"name" form:"name"`
	Polygon    string  `json:"polygon"`
	Active     bool    `gorm:"column:active;index:idx_restr_active" json:"active" body:"active" query:"active" form:"active"`
	Allow      bool    `gorm:"column:allow;index:idx_restr_allow" json:"allow" body:"allow" query:"allow" form:"allow"`
	Networks   string  `gorm:"column:networks;index:idx_restr_keyword,priority:2" json:"networks" body:"networks" query:"networks" form:"networks"`
	ClientID   uint    `gorm:"column:client_id;index:idx_restr_client_id" json:"client_id" body:"client_id" query:"client_id" form:"client_id"`
	ProductID  uint    `gorm:"column:product_id;index:idx_restr_product_id" json:"product_id" body:"product_id" query:"product_id" form:"product_id"`
	Address    string  `gorm:"column:address;index:idx_restr_keyword,priority:3" json:"address" body:"address" query:"address" form:"address"`
	AddressLat float64 `gorm:"column:address_lat" json:"address_lat" body:"address_lat" query:"address_lat" form:"address_lat"`
	AddressLon float64 `gorm:"column:address_lat" json:"address_lon" body:"address_lon" query:"address_lon" form:"address_lon"`
}

type RestrictionClientProduct struct {
	Restriction
	ClientName  string `json:"client_name"`
	ProductName string `json:"product_name"`
}

func (u *Restriction) TableName() string {
	return TableRestriction
}

func (u *Restriction) ValidID() bool {
	return u.ID > 0
}

func (u *Restriction) ValidateEmptyField() string {
	if u.ClientID < 1 {
		return "client_id"
	}
	if u.ProductID < 1 || u.Networks == "" {
		return "product_id,networks"
	}
	if strings.TrimSpace(u.Name) == "" {
		return "name"
	}
	return ""
}
