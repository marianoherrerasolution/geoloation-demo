package model

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

const (
	TableWidgetUsage = "widget_usages"
)

type WidgetUsage struct {
	Base
	ClientID      uint  `gorm:"column:client_id;index:idx_wu_client_id" json:"client_id"`
	ProductID     uint  `gorm:"column:product_id;index:idx_wu_product_id" json:"product_id"`
	RestrictionID uint  `gorm:"column:restriction_id;index:idx_wu_restriction_id" json:"restriction_id"`
	WidgetID      uint  `gorm:"column:widget_id;index:idx_wu_widget_id" json:"widget_id"`
	Allow         int16 `gorm:"column:allow;index:idx_restr_allow" json:"allow"`
	// point format is ST_point(longitude, latitude)
	Point          string         `gorm:"column:point;type:geometry;index:idx_wu_point" json:"point"`
	Latitude       float64        `gorm:"column:latitude" json:"latitude"`
	Longitude      float64        `gorm:"column:longitude" json:"longitude"`
	Date           datatypes.Date `gorm:"column:date;index:idx_wu_date" json:"date"`
	ParamsIP       string         `gorm:"column:ip" json:"ip"`
	VPN            int16          `gorm:"column:vpn" json:"vpn"`
	RemoteIP       string         `gorm:"column:remote_ip" json:"remote_ip"`
	Referer        string         `gorm:"column:referer" json:"referer"`
	City           string         `gorm:"column:city" json:"city"`
	Country        string         `gorm:"column:country" json:"country"`
	TimezoneOffset int16          `gorm:"column:timezone_offset" json:"timezone_offset"`
	Distance       float64        `gorm:"column:distance" json:"distance"`
}

func (u *WidgetUsage) TableName() string {
	return TableWidgetUsage
}

func (b *WidgetUsage) BeforeCreate(tx *gorm.DB) error {
	b.Date = datatypes.Date(time.Now())
	return nil
}
