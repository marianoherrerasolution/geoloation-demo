package model

import "gorm.io/datatypes"

const (
	TableTotalDailyRestriction = "total_daily_restrictions"
)

type TotalDailyRestriction struct {
	Base
	Date          datatypes.Date `gorm:"column:date;index:idx_tdr_date" json:"date"`
	RestrictionID uint           `gorm:"column:restriction_id;index:idx_tdr_restriction_id" json:"restriction_id"`
	TotalUniq     int64          `gorm:"column:total_uniq;index:idx_tdr_total_uniq" json:"total_uniq"`
	TotalHit      int64          `gorm:"column:total_hit;index:idx_tdr_total_hit" json:"total_hit"`
	TotalAccepted int64          `gorm:"column:total_accepted;index:idx_tdr_total_accepted" json:"total_accepted"`
}

func (u *TotalDailyRestriction) TableName() string {
	return TableTotalDailyRestriction
}
