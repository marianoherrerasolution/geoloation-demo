package clientsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Show client detail
// @summary Client Info
// @id	show
// @tag client
// @success 200 {object}
// @Router /clients/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	var client model.Client
	if ok := api.FindByID(ctx.UserValue("id"), &client, ctx); ok && client.ValidID() {
		api.SuccessJSON(ctx, client)
	}
}
