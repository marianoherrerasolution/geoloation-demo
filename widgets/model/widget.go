package model

import (
	"github.com/lib/pq"
)

const (
	TableWidget = "widgets"
)

type Widget struct {
	BaseWARNING
	Name            string        `gorm:"column:name;index:idx_widget_name" json:"name"`
	Token           string        `gorm:"column:token;index:idx_widget_token;idx_widget_tokenactive,priority:1" json:"token"`
	Active          int16         `gorm:"column:active;index:idx_widget_active;idx_widget_tokenactive,priority:2" json:"active"`
	RestrictionType string        `gorm:"column:restriction_type;index:idx_widget_restriction_type" json:"restriction_type"`
	ClientID        uint          `gorm:"column:client_id;index:idx_widget_client_id" json:"client_id"`
	ProductIDs      pq.Int64Array `gorm:"column:product_ids;type:integer[];index:idx_widget_product_ids" json:"product_ids,omitempty"`
	RestrictionIDs  pq.Int64Array `gorm:"column:restriction_ids;type:integer[];index:idx_widget_restriction_ids" json:"restriction_ids,omitempty" `
	CreatorType     string        `gorm:"column:creator_type;index:idx_widget_creator_type,priority:1" json:"creator_type"`
	CreatorID       uint          `gorm:"column:creator_id;index:idx_widget_creator_id,priority:2" json:"creator_id"`
	RejectAction    string        `gorm:"column:reject_action" json:"reject_action"`
	RejectRedirect  string        `gorm:"column:reject_redirect" json:"reject_redirect"`
	RejectAlert     string        `gorm:"column:reject_alert" json:"reject_alert"`
	AcceptAction    string        `gorm:"column:allow_action" json:"allow_action"`
	AcceptRedirect  string        `gorm:"column:allow_redirect" json:"allow_redirect"`
	AcceptAlert     string        `gorm:"column:allow_alert" json:"allow_alert"`
}

func (u *Widget) TableName() string {
	return TableWidget
}

func (u *Widget) GetProductIDs() []int64 {
	return u.ProductIDs
}

func (u *Widget) GetRestrictionIDs() []int64 {
	return u.RestrictionIDs
}
