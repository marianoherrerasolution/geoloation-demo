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
	Name            string        `gorm:"column:name;index:idx_widget_name" json:"name"`
	Token           string        `gorm:"column:token;index:idx_widget_token" json:"token"`
	Active          int16         `gorm:"column:active;index:idx_widget_active" json:"active"`
	RestrictionType string        `gorm:"column:restriction_type;index:idx_widget_restriction_type" json:"restriction_type"`
	ClientID        uint          `gorm:"column:client_id;index:idx_widget_client_id" json:"client_id"`
	ProductIDs      pq.Int64Array `gorm:"column:product_ids;type:integer[];index:idx_widget_product_ids" json:"product_ids,omitempty"`
	RestrictionIDs  pq.Int64Array `gorm:"column:restriction_ids;type:integer[];index:idx_widget_restriction_ids" json:"restriction_ids,omitempty" `
	CreatorType     string        `gorm:"column:creator_type;index:idx_widget_creator_type,priority:1" json:"creator_type"`
	CreatorID       uint          `gorm:"column:creator_id;index:idx_widget_creator_id,priority:2" json:"creator_id"`
}

type WidgetClientName struct {
	Widget
	ClientName string `json:"client_name"`
}

func (u *Widget) TableName() string {
	return TableWidget
}

func (u *Widget) ValidID() bool {
	return u.ID > 0
}

func (u *Widget) GetProductIDs() []int64 {
	return u.ProductIDs
}

func (u *Widget) GetRestrictionIDs() []int64 {
	return u.RestrictionIDs
}

func (u *Widget) ValidateEmptyField() string {
	if u.ClientID < 1 {
		return "client_id"
	}

	if strings.TrimSpace(u.Name) == "" {
		return "name"
	}

	if u.RestrictionType == "" {
		return "restriction_type"
	}

	if u.RestrictionType == "product_base" && len(u.GetProductIDs()) < 1 {
		return "product_ids"
	}

	if u.RestrictionType == "custom" && len(u.GetRestrictionIDs()) < 1 {
		return "restriction_ids"
	}

	return ""
}
