package widgetsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Update widget data
// @summary Widget Update
// @id	update
// @tag widget
// @success 204 {object}
// @Router /widgets/{id} [put]
func Update(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	paramsID := ctx.UserValue("id")

	// check if id exist or not
	var widget model.Widget
	if ok := api.FindByID(paramsID, &widget, ctx); !ok || !widget.ValidID() {
		return
	}

	if updateable := api.CompareClientID(ctx, widget.ClientID, "not_found"); updateable {
		api.UpdateRecord(model.TableWidget, paramsID, &widget, params, ctx)
	}
}
