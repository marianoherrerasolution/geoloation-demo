package widgetsapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/model"
	"geonius/pkg/stringify"

	"github.com/valyala/fasthttp"
)

func PrepareParamsBody(ctx *fasthttp.RequestCtx) model.Widget {
	body := ctx.PostBody()
	var params model.Widget
	json.Unmarshal(body, &params)
	params.Name = stringify.LowerTrim(params.Name)
	params.RestrictionType = stringify.LowerTrim(params.RestrictionType)
	return params
}

// Create widget data
// @summary Widget Create
// @id	create
// @tag widget
// @success 204 {object}
// @Router /widgets/ [post]
func Create(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	if field := params.ValidateEmptyField(); field != "" {
		api.UnprocessibleError(ctx, api.ErrorConfig{
			Error: "empty",
			Field: field,
		})
		return
	}

	api.CreateRecord(&params, model.TableWidget, ctx)
}
