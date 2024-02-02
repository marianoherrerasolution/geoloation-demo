package locationsapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List locations
// @summary Accessed Location List
// @id list
// @tag user
// @success 200 {object}
// @Router /locations [get]
func List(ctx *fasthttp.RequestCtx) {
	var locations []model.AccessedLocation
	tx := database.Pg.Order("id ASC").Find(&locations)

	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		respBytes, _ := json.Marshal(locations)
		ctx.Success("application/json", respBytes)
	}
}
