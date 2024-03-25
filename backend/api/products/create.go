package productsapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/model"
	"geonius/pkg/stringify"

	"github.com/valyala/fasthttp"
)

func PrepareParamsBody(ctx *fasthttp.RequestCtx) model.Product {
	body := ctx.PostBody()
	var params model.Product
	json.Unmarshal(body, &params)
	params.Name = stringify.LowerTrim(params.Name)
	params.AppType = stringify.LowerTrim(params.AppType)
	return params
}

// Create product data
// @summary Product Create
// @id	create
// @tag product
// @success 204 {object}
// @Router /products/ [post]
func Create(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	clientID, _, isAdmin := api.RequireAccessClientID(ctx)
	if !isAdmin {
		params.ClientID = clientID
	}

	if field := params.ValidateEmptyField(); field != "" {
		api.UnprocessibleError(ctx, api.ErrorConfig{
			Error: "empty",
			Field: field,
		})
		return
	}

	statement := fmt.Sprintf("company = '%s' AND client_id = %d AND app_type", params.Name, params.ClientID)
	if api.ExistRecord(statement, params.AppType, model.Product{}, ctx) {
		return
	}

	api.CreateRecord(&params, model.TableProduct, ctx)
}
