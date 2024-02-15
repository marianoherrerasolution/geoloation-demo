package widgetsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Show widget detail
// @summary Widget Info
// @id	show
// @tag widget
// @success 200 {object}
// @Router /widgets/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	var widget model.Widget
	if ok := api.FindByID(ctx.UserValue("id"), &widget, ctx); ok && widget.ValidID() {
		api.SuccessJSON(ctx, widget)
	}
}
