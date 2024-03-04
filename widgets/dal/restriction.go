package dal

import (
	"fmt"
	"widgetz/model"
	"widgetz/pkg/enum"

	"gorm.io/gorm"
)

func RestrictionQueryByWidget(widget model.Widget, latitude interface{}, longitude interface{}) *gorm.DB {
	tx := Db().Table(model.TableRestriction).
		Select("id, client_id, product_id, allow, active, vpn, offsets").
		Where("active = 1").
		Where(
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

func RestrictionsByRadiusWidget(radius int64, widget model.Widget, latitude interface{}, longitude interface{}) *gorm.DB {
	geomSRIDs := fmt.Sprintf("ST_GeomFromText('POINT(%v %v)', 4326)::geography, ST_SetSRID(polygon, 4326)::geography", longitude, latitude)
	tx := Db().Table(model.TableRestriction).
		Select(fmt.Sprintf("id, client_id, product_id, allow, active, offsets, vpn, offsets, (SELECT ST_Distance(%s)) as distance", geomSRIDs)).
		Where("active = 1").
		Where(fmt.Sprintf("ST_DWithin(%s, %d)", geomSRIDs, radius))
	if widget.RestrictionType == enum.RestrictProductBase {
		tx = tx.Where("product_id IN ?", widget.GetProductIDs())
	} else {
		tx = tx.Where("id IN ?", widget.GetRestrictionIDs())
	}
	return tx
}
