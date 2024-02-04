package locationsapi

import (
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Show Accessed Location detail
// @summary Accessed Location Info
// @id	show
// @tag accessed_location
// @success 200 {object}
// @Router /locations/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	if location := FindByID(ctx.UserValue("id"), ctx); location.ValidID() {
		api.SuccessJSON(ctx, location)
	}
}

func FindByID(id interface{}, ctx *fasthttp.RequestCtx) *model.AccessedLocation {
	location := &model.AccessedLocation{}
	if tx := database.Pg.Where("gid = ?", ctx.UserValue("id")).First(location); tx.Error != nil {
		api.NotFoundError(ctx)
	}
	return location
}
