package dal

import (
	"widgetz/model"
	"widgetz/pkg/enum"

	"gorm.io/gorm"
)

func RestrictionQueryByWidget(widget model.Widget, latitude interface{}, longitude interface{}) *gorm.DB {
	tx := Db().Where("active = 1").Where(
		"(ST_Contains(restrictions.polygon, ST_MakePoint(@long, @lat)) OR ST_Intersects(restrictions.polygon, ST_MakePoint(@long, @lat)))",
		map[string]interface{}{"long": longitude, "lat": latitude},
	)

	if widget.RestrictionType == enum.RestrictProductBase {
		tx = tx.Where("product_id IN ?", widget.GetProductIDs())
	} else {
		tx = tx.Where("id IN ?", widget.GetRestrictionIDs())
	}
	return tx
}
