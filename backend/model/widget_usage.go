package model

import "gorm.io/datatypes"

const (
	TableWidgetUsage = "widget_usages"
)

type WidgetUsage struct {
	Base
	ClientID      uint  `gorm:"column:client_id;index:idx_wu_client_id" json:"client_id,omitempty"`
	ProductID     uint  `gorm:"column:product_id;index:idx_wu_product_id" json:"product_id,omitempty"`
	RestrictionID uint  `gorm:"column:restriction_id;index:idx_wu_restriction_id" json:"restriction_id,omitempty"`
  WidgetID      uint  `gorm:"column:widget_id;index:idx_wu_widget_id" json:"widget_id,omitempty"`
	Allow         int16 `gorm:"column:allow;index:idx_wu_allow" json:"allow,omitempty"`
	// point format is ST_point(longitude, latitude)
	Point          string         `gorm:"column:point;type:geometry;index:idx_wu_point" json:"point,omitempty"`
	Latitude       float64        `gorm:"column:latitude" json:"latitude,omitempty"`
	Longitude      float64        `gorm:"column:longitude" json:"longitude,omitempty"`
	Date           datatypes.Date `gorm:"column:date;index:idx_wu_date" json:"date,omitempty"`
	ParamsIP       string         `gorm:"column:ip;index:idx_wu_searcy;priority:1" json:"ip,omitempty"`
	VPN            int16          `gorm:"column:vpn" json:"vpn,omitempty"`
	RemoteIP       string         `gorm:"column:remote_ip;index:idx_wu_searcy;priority:2" json:"remote_ip,omitempty"`
	Referer        string         `gorm:"column:referer;index:idx_wu_searcy;priority:3" json:"referer,omitempty"`
	City           string         `gorm:"column:city;index:idx_wu_searcy;priority:4" json:"city,omitempty"`
	Country        string         `gorm:"column:country;index:idx_wu_searcy;priority:5" json:"country,omitempty"`
	TimezoneOffset int16          `gorm:"column:timezone_offset" json:"timezone_offset,omitempty"`
	Distance       float64        `gorm:"column:distance" json:"distance"`
}

func (u *WidgetUsage) TableName() string {
	return TableWidgetUsage
}
