package productsapi

import (
	"fmt"
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Update product data
// @summary Product Update
// @id	update
// @tag product
// @success 204 {object}
// @Router /products/{id} [put]
func Update(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	paramsID := ctx.UserValue("id")

	// check if id exist or not
	var product model.Product
	if ok := api.FindByID(paramsID, &product, ctx); !ok || !product.ValidID() {
		return
	}

	changedName := (params.Name != "" && product.Name != params.Name)
	changedClient := (params.ClientID > 0 && product.ClientID != params.ClientID)
	changedAppType := (params.AppType != "" && product.AppType != params.AppType)

	// check if changed name or client id or app type
	if changedName || changedClient || changedAppType {
		statement := fmt.Sprintf("company = '%s' AND client_id = %d AND app_type", params.Name, params.ClientID)
		if api.ExistRecord(statement, params.AppType, model.Product{}, ctx) {
			return
		}
	}

	api.UpdateRecord(model.TableProduct, paramsID, &product, params, ctx)
}
