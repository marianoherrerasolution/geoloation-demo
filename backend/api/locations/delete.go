package locationsapi

import (
	"geonius/api"
	db "geonius/database"

	"github.com/valyala/fasthttp"
)

// Delete location data
// @summary Accessed Location Delete
// @id	delete
// @tag location
// @success 204
// @Router /locations/{id} [delete]
func Delete(ctx *fasthttp.RequestCtx) {
	if location := FindByID(ctx.UserValue("id"), ctx); location.ValidID() {
		tx := db.Delete(location)
		api.SuccessJSON(ctx, map[string]interface{}{"success": (tx.Error == nil), "error": tx.Error})
	}
}
