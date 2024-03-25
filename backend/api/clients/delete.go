package clientsapi

import (
	"geonius/api"
	db "geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Delete client data
// @summary Client Delete
// @id	delete
// @tag client
// @success 204
// @Router /clients/{id} [delete]
func Delete(ctx *fasthttp.RequestCtx) {
	var client model.Client
	if ok := api.FindByID(ctx.UserValue("id"), &client, ctx); ok && client.ValidID() {
		tx := db.Delete(&client)
		api.SuccessJSON(ctx, map[string]interface{}{"success": (tx.Error == nil), "error": tx.Error})
	}
}
