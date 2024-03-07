package model

import "gorm.io/datatypes"

const (
	TableTotalDailyWidget = "total_daily_widgets"
)

type TotalDailyWidget struct {
	Base
	Date      datatypes.Date `gorm:"column:date;index:idx_tdw_date" json:"date"`
	WidgetID  uint           `gorm:"column:widget_id;index:idx_tdw_widget_id" json:"widget_id"`
	TotalUniq int64          `gorm:"column:total_uniq" json:"total_uniq"`
	TotalHit  int64          `gorm:"column:total_hit" json:"total_hit"`
}

func (u *TotalDailyWidget) TableName() string {
	return TableTotalDailyWidget
}
