package adminsapi

import (
	"geonius/api"
	db "geonius/database"

	"github.com/valyala/fasthttp"
)

// Delete admin data
// @summary Admin Delete
// @id	delete
// @tag admin
// @success 204
// @Router /admins/{id} [delete]
func Delete(ctx *fasthttp.RequestCtx) {
	if admin := FindByID(ctx.UserValue("id"), ctx); admin.ValidID() {
		tx := db.Delete(admin)
		api.SuccessJSON(ctx, map[string]interface{}{"success": (tx.Error == nil), "error": tx.Error})
	}
}
