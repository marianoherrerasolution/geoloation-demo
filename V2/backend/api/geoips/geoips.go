package geoipsapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List geoips
// @summary GeoIP List
// @id list
// @tag geoip
// @success 200 {object}
// @Router /geoips [get]
func List(ctx *fasthttp.RequestCtx) {
	var geoips []model.GeoIP
	tx := database.Pg.Order("id ASC").Find(&geoips)

	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		respBytes, _ := json.Marshal(geoips)
		ctx.Success("application/json", respBytes)
	}
}
