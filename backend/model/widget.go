package model

import (
	"strings"

	"github.com/lib/pq"
)

const (
	TableWidget = "widgets"
)

type Widget struct {
	Base
	Name            string         `gorm:"column:name;index:idx_widget_name" json:"name" body:"name" query:"name" form:"name"`
	Token           string         `gorm:"column:token;index:idx_widget_token" json:"token" body:"token" query:"token" form:"token"`
	Active          bool           `gorm:"column:active;index:idx_widget_active" json:"active" body:"active" query:"active" form:"active"`
	RestrictionType string         `gorm:"column:restriction_type;index:idx_widget_restriction_type" json:"restriction_type" body:"restriction_type" query:"restriction_type" form:"restriction_type"`
	ClientID        uint           `gorm:"column:client_id;index:idx_widget_client_id" json:"client_id" body:"client_id" query:"client_id" form:"client_id"`
	ProductID       uint           `gorm:"column:product_id;index:idx_widget_product_id" json:"product_id" body:"product_id" query:"product_id" form:"product_id"`
	RestrictionIDs  pq.StringArray `gorm:"column:restriction_ids;type:text[];index:idx_widget_restriction_ids" json:"-" `
	CreatorType     string         `gorm:"column:creator_type;index:idx_widget_creator_type,priority:1" json:"creator_type" body:"creator_type" query:"creator_type" form:"creator_type"`
	CreatorID       uint           `gorm:"column:creator_id;index:idx_widget_creator_id,priority:2" json:"creator_id" body:"creator_id" query:"creator_id" form:"creator_id"`
}

func (u *Widget) TableName() string {
	return TableWidget
}

func (u *Widget) ValidID() bool {
	return u.ID > 0
}

func (u *Widget) ValidateEmptyField() string {
	if u.ClientID < 1 {
		return "client_id"
	}
	if u.ProductID < 1 {
		return "product_id"
	}
	if u.RestrictionType == "" {
		return "restriction_type"
	}
	if u.RestrictionType == "product" && u.ProductID < 1 {
		return "production_id"
	}
	if strings.TrimSpace(u.Name) == "" {
		return "name"
	}
	return ""
}
