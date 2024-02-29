package dal

import (
	"widgetz/model"
)

func WidgetByToken(token string) (model.Widget, error) {
	var widget model.Widget
	tx := Select("token, active, product_ids, restriction_ids, restriction_type").
		Where("token = ? AND active = 1").
		First(&widget)
	return widget, tx.Error
}
