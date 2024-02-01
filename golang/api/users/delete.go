package usersapi

import (
	"geonius/api"
	db "geonius/database"

	"github.com/valyala/fasthttp"
)

// Delete user data
// @summary User Delete
// @id	delete
// @tag user
// @success 204
// @Router /users/{id} [delete]
func Delete(ctx *fasthttp.RequestCtx) {
	if user := FindByID(ctx.UserValue("id"), ctx); user.ValidID() {
		tx := db.Delete(user)
		api.SuccessJSON(ctx, map[string]interface{}{"success": (tx.Error == nil), "error": tx.Error})
	}
}
