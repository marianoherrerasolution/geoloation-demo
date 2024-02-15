package restrictionsapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/model"
	"geonius/pkg/stringify"

	"github.com/valyala/fasthttp"
)

func PrepareParamsBody(ctx *fasthttp.RequestCtx) model.Restriction {
	body := ctx.PostBody()
	var params model.Restriction
	json.Unmarshal(body, &params)
	params.Name = stringify.LowerTrim(params.Name)
	params.Networks = stringify.LowerTrim(params.Networks)
	return params
}

// Create restriction data
// @summary Restriction Create
// @id	create
// @tag restriction
// @success 204 {object}
// @Router /restrictions/ [post]
func Create(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	if field := params.ValidateEmptyField(); field != "" {
		api.UnprocessibleError(ctx, api.ErrorConfig{
			Error: "empty",
			Field: field,
		})
		return
	}

	api.CreateRecord(&params, model.TableRestriction, ctx)
}
