package clientsapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/model"
	"geonius/pkg/stringify"

	"github.com/valyala/fasthttp"
)

func PrepareParamsBody(ctx *fasthttp.RequestCtx) model.Client {
	body := ctx.PostBody()
	var params model.Client
	json.Unmarshal(body, &params)
	params.Company = stringify.LowerTrim(params.Company)
	params.Website = stringify.LowerTrim(params.Website)
	return params
}

// Update client data
// @summary Client Update
// @id	update
// @tag client
// @success 204 {object}
// @Router /clients/{id} [put]
func Update(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	paramsID := ctx.UserValue("id")

	// check if id exist or not
	var client model.Client
	if ok := api.FindByID(paramsID, &client, ctx); !ok || !client.ValidID() {
		return
	}

	// check if changed-company is exist or not
	if params.Company != "" && client.Company != params.Company {
		if api.ExistRecord("company", params.Company, model.Client{}, ctx) {
			return
		}
	}

	if params.Website != "" && client.Website != params.Website {
		if api.ExistRecord("website", params.Website, model.Client{}, ctx) {
			return
		}
	}

	api.UpdateRecord(model.TableClient, paramsID, &client, params, ctx)
}
