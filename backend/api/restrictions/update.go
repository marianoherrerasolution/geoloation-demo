package restrictionsapi

import (
	"fmt"
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Update restriction data
// @summary Restriction Update
// @id	update
// @tag restriction
// @success 204 {object}
// @Router /restrictions/{id} [put]
func Update(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	paramsID := ctx.UserValue("id")

	existWithCoords, ok := FindByID(ctx)
	if !ok {
		return
	}

	existWithoutCoords := existWithCoords.Restriction
	coords := params.PolygonCoordinates
	newParams := params.Restriction
	if coords != "" {
		newParams.Polygon = fmt.Sprintf("POLYGON%s", params.CoordinatesToGEOM())
	} else {
		newParams.Polygon = existWithCoords.PolygonCoordinates
	}

	api.UpdateRecord(model.TableRestriction, paramsID, &existWithoutCoords, newParams, ctx)
}
