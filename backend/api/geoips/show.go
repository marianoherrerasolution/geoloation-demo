package geoipsapi

import (
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Show geoip detail
// @summary GeoIP Info
// @id	show
// @tag geoip
// @success 200 {object}
// @Router /geoips/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	if geoip := FindByID(ctx.UserValue("id"), ctx); geoip.ValidID() {
		api.SuccessJSON(ctx, geoip)
	}
}

func FindByID(id interface{}, ctx *fasthttp.RequestCtx) *model.GeoIP {
	geoip := &model.GeoIP{}
	if tx := database.Pg.Where("id = ?", ctx.UserValue("id")).First(geoip); tx.Error != nil {
		api.NotFoundError(ctx)
	}
	return geoip
}
