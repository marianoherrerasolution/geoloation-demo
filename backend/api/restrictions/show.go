package restrictionsapi

import (
	"geonius/api"
	db "geonius/database"
	"geonius/model"
	"strings"

	"github.com/valyala/fasthttp"
)

func FindByID(ctx *fasthttp.RequestCtx) (model.RestrictionWithCoordinates, bool) {
	var restriction model.RestrictionWithCoordinates
	tx := db.Pg.Select("*, ST_AsText(polygon) as polygon_coordinates").Where("id = ?", ctx.UserValue("id")).First(&restriction)
	if tx.Error != nil {
		api.NotFoundError(ctx)
	}
	return restriction, tx.Error == nil
}

// Show restriction detail
// @summary Restriction Info
// @id	show
// @tag restriction
// @success 200 {object}
// @Router /restrictions/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	restriction, ok := FindByID(ctx)
	if !ok {
		return
	}

	if showable := api.CompareClientID(ctx, restriction.ClientID, "not_found"); !showable {
		return
	}

	restriction.Polygon = ""
	txt := "[]"
	if restriction.PolygonCoordinates != "" {
		txt = strings.ReplaceAll(restriction.PolygonCoordinates, "POLYGON", "")
		txt = strings.ReplaceAll(txt, "((", "[[")
		txt = strings.ReplaceAll(txt, "))", "]]")
		txt = strings.ReplaceAll(txt, ",", "],[")
		txt = strings.ReplaceAll(txt, " ", ",")
		if txt == "[[]]" {
			txt = "[]"
		}
	}
	restriction.PolygonCoordinates = txt
	api.SuccessJSON(ctx, restriction)
}
