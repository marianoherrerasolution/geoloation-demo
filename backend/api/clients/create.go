package clientsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Create client data
// @summary Client Create
// @id	create
// @tag client
// @success 204 {object}
// @Router /clients/ [post]
func Create(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	if field := params.ValidateEmptyField(); field != "" {
		api.UnprocessibleError(ctx, api.ErrorConfig{
			Error: "empty",
			Field: field,
		})
		return
	}

	if api.ExistRecord("company", params.Company, model.Client{}, ctx) {
		return
	}

	if api.ExistRecord("website", params.Website, model.Client{}, ctx) {
		return
	}

	api.CreateRecord(&params, model.TableClient, ctx)
}
