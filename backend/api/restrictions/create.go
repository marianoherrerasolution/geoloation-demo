package restrictionsapi

import (
	"fmt"
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Create restriction data
// @summary Restriction Create
// @id	create
// @tag restriction
// @success 204 {object}
// @Router /restrictions/ [post]
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

	restriction := params.Restriction
	restriction.Polygon = fmt.Sprintf("POLYGON%s", params.CoordinatesToGEOM())
	api.CreateRecord(&restriction, model.TableRestriction, ctx)
}
