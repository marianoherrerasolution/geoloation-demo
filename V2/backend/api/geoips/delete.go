package geoipsapi

import (
	"geonius/api"
	db "geonius/database"

	"github.com/valyala/fasthttp"
)

// Delete geoip data
// @summary GeoIP Delete
// @id	delete
// @tag geoip
// @success 204
// @Router /geoips/{id} [delete]
func Delete(ctx *fasthttp.RequestCtx) {
	if geoip := FindByID(ctx.UserValue("id"), ctx); geoip.ValidID() {
		tx := db.Delete(geoip)
		api.SuccessJSON(ctx, map[string]interface{}{"success": (tx.Error == nil), "error": tx.Error})
	}
}
