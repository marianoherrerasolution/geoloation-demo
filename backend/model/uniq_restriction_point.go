package model

const (
	TableUniqRestrictionPoint = "uniq_restriction_points"
)

type UniqWidgetPoint struct {
	Base
	WidgetID  uint  `gorm:"column:widget_id;index:idx_uwp_widget_id" json:"widget_id"`
	Point     string  `gorm:"column:point;type:geometry;index:idx_uwp_point" json:"point"`
}

func (u *UniqWidgetPoint) TableName() string {
	return TableUniqWidgetPoint
}
