package model

import "gorm.io/datatypes"

const (
	TableUniqRestrictionPoint = "uniq_restriction_points"
)

type UniqRestrictionPoint struct {
	Base
	RestrictionID uint           `gorm:"column:restriction_id;index:idx_urp_restriction_id" json:"restriction_id"`
	Point         string         `gorm:"column:point;type:geometry;index:idx_urp_point" json:"point"`
	Date          datatypes.Date `gorm:"column:date;index:idx_urp_date" json:"date"`
	Allow         int16          `gorm:"column:allow;index" json:"allow"`
}

func (u *UniqRestrictionPoint) TableName() string {
	return TableUniqRestrictionPoint
}
