package productsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Show product detail
// @summary Product Info
// @id	show
// @tag product
// @success 200 {object}
// @Router /products/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	var product model.Product
	if ok := api.FindByID(ctx.UserValue("id"), &product, ctx); ok && product.ValidID() {
		api.SuccessJSON(ctx, product)
	}
}
