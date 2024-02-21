package restrictionsapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/model"
	"geonius/pkg/stringify"

	"github.com/valyala/fasthttp"
)

func PrepareParamsBody(ctx *fasthttp.RequestCtx) model.RestrictionWithCoordinates {
	body := ctx.PostBody()
	var params model.RestrictionWithCoordinates
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

	restriction := params.Restriction
	restriction.Polygon = fmt.Sprintf("POLYGON%s", params.CoordinatesToGEOM())
	api.CreateRecord(&restriction, model.TableRestriction, ctx)
}
