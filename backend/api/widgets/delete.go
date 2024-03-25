package widgetsapi

import (
	"geonius/api"
	db "geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Delete widget data
// @summary Widget Delete
// @id	delete
// @tag widget
// @success 204
// @Router /widgets/{id} [delete]
func Delete(ctx *fasthttp.RequestCtx) {
	var widget model.Widget
	if ok := api.FindByID(ctx.UserValue("id"), &widget, ctx); ok && widget.ValidID() {
		if deletable := api.CompareClientID(ctx, widget.ClientID, "unprocessible"); deletable {
			tx := db.Delete(&widget)
			api.SuccessJSON(ctx, map[string]interface{}{"success": (tx.Error == nil), "error": tx.Error})
		}
	}
}
