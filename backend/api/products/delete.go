package productsapi

import (
	"geonius/api"
	db "geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Delete product data
// @summary Product Delete
// @id	delete
// @tag product
// @success 204
// @Router /products/{id} [delete]
func Delete(ctx *fasthttp.RequestCtx) {
	var product model.Product
	if ok := api.FindByID(ctx.UserValue("id"), &product, ctx); ok && product.ValidID() {
		if deleteable := api.CompareClientID(ctx, product.ClientID, "unprocessible"); deleteable {
			tx := db.Delete(&product)
			api.SuccessJSON(ctx, map[string]interface{}{"success": (tx.Error == nil), "error": tx.Error})
		}
	}
}
