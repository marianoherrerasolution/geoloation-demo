package restrictionsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Update restriction data
// @summary Restriction Update
// @id	update
// @tag restriction
// @success 204 {object}
// @Router /restrictions/{id} [put]
func Update(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	paramsID := ctx.UserValue("id")

	// check if id exist or not
	var restriction model.Restriction
	if ok := api.FindByID(paramsID, &restriction, ctx); !ok || !restriction.ValidID() {
		return
	}

	api.UpdateRecord(model.TableRestriction, paramsID, &restriction, params, ctx)
}
