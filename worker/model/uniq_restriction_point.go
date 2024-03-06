package model

const (
	TableUniqRestrictionPoint = "uniq_restriction_points"
)

type UniqRestrictionPoint struct {
	Base
	WidgetID uint   `gorm:"column:widget_id;index:idx_urp_widget_id" json:"widget_id"`
	Point    string `gorm:"column:point;type:geometry;index:idx_urp_point" json:"point"`
}

func (u *UniqRestrictionPoint) TableName() string {
	return TableUniqRestrictionPoint
}
