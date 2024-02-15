package geoipsapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/database"
	"geonius/model"
	"geonius/pkg/stringify"

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
	keyword := string(ctx.QueryArgs().Peek("keyword"))
	if perPage < 1 {
		perPage = 10
	}
	if perPage > 50 {
		perPage = 50
	}
	if page < 1 {
		page = 1
	}
	tx := database.Pg
	txCount := database.Pg

	if keyword != "" {
		keyword = stringify.LowerTrim(stringify.SafetySQL(keyword))
		keywordQL := fmt.Sprintf("%%%s%%", keyword)
		tx = tx.Where("ip LIKE ?", keywordQL).
			Or("lower(country) LIKE ?", keywordQL).
			Or("lower(state) LIKE ?", keywordQL).
			Or("lower(city) LIKE ?", keywordQL).
			Or("lower(timezone) LIKE ?", keywordQL)
		txCount = tx
	}

	tx = tx.Order("id ASC").
		Limit(perPage).
		Offset((page - 1) * perPage).
		Find(&geoips)

	var total int64
	txCount.Table(model.TableGeoIP).Count(&total)

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
