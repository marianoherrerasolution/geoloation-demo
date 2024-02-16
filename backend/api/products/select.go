package productsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Select products
// @summary Product Select
// @id list
// @tag product
// @success 200 {object}
// @Router /products/select [get]
func Select(ctx *fasthttp.RequestCtx) {
	var records []struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	}
	api.RecordsForSelect(model.TableProduct, []string{"id", "name"}, "name ASC", &records, ctx)
}
