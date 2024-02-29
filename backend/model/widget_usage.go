package model

const (
  TableWidgetUsage = "widget_usages"
)

type WidgetUsage struct {
  Base
  ClientID      uint  `gorm:"column:client_id;index:idx_wu_client_id" json:"client_id"`
  ProductID     uint  `gorm:"column:product_id;index:idx_wu_product_id" json:"product_id"`
  RestrictionID uint  `gorm:"column:restriction_id;index:idx_wu_restriction_id" json:"restriction_id"`
  Allow         int16 `gorm:"column:allow;index:idx_restr_allow" json:"allow"`
  // point format is ST_point(longitude, latitude)
  Point     string  `gorm:"column:point;type:geometry;index:idx_wu_point" json:"point"`
  Latitude  float64 `gorm:"column:latitude" json:"latitude"`
  Longitude float64 `gorm:"column:longitude" json:"longitude"`
}

func (u *WidgetUsage) TableName() string {
  return TableWidgetUsage
}
