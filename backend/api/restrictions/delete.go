package restrictionsapi

import (
	"geonius/api"
	db "geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Delete restriction data
// @summary Restriction Delete
// @id	delete
// @tag restriction
// @success 204
// @Router /restrictions/{id} [delete]
func Delete(ctx *fasthttp.RequestCtx) {
	var restriction model.Restriction
	if ok := api.FindByID(ctx.UserValue("id"), &restriction, ctx); ok && restriction.ValidID() {
		if deletable := api.CompareClientID(ctx, restriction.ClientID, "unprocessible"); deletable {
			tx := db.Delete(&restriction)
			api.SuccessJSON(ctx, map[string]interface{}{"success": (tx.Error == nil), "error": tx.Error})
		}
	}
}
