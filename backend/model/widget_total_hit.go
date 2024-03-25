package model

import "gorm.io/datatypes"

const (
  TableWidgetTotalHit = "widget_total_hits"
)

type WidgetTotalHit struct {
  Base
  Date  datatypes.Date `gorm:"column:date;index:idx_total_hit" json:"date"`
  Total int64          `gorm:"column:total;index:idx_total_hit" json:"total"`
}

func (u *WidgetTotalHit) TableName() string {
  return TableWidgetTotalHit
}
