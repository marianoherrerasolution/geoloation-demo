package restrictionsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Show restriction detail
// @summary Restriction Info
// @id	show
// @tag restriction
// @success 200 {object}
// @Router /restrictions/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	var restriction model.Restriction
	if ok := api.FindByID(ctx.UserValue("id"), &restriction, ctx); ok && restriction.ValidID() {
		api.SuccessJSON(ctx, restriction)
	}
}
