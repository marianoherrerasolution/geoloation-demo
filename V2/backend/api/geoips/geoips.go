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
	page := ctx.QueryArgs().GetUintOrZero("page")
	perPage := ctx.QueryArgs().GetUintOrZero("per_page")
	if perPage < 1 {
		perPage = 10
	}
	if perPage > 50 {
		perPage = 50
	}
	if page < 1 {
		page = 1
	}

	tx := database.Pg.Order("id ASC").
		Limit(perPage).
		Offset((page - 1) * perPage).
		Find(&geoips)

	var total int64
	database.Pg.Table(model.TableGeoIP).Count(&total)

	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		respBytes, _ := json.Marshal(map[string]interface{}{
			"data":    geoips,
			"total":   total,
			"page":    page,
			"perPage": perPage,
		})
		ctx.Success("application/json", respBytes)
	}
}
