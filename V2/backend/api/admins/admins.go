package adminsapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List admins
// @summary User List
// @id list
// @tag admin
// @success 200 {object}
// @Router /admins [get]
func List(ctx *fasthttp.RequestCtx) {
	var admins []model.User
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
		Find(&admins)

	var total int64
	database.Pg.Table(model.TableAdmin).Count(&total)

	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		respBytes, _ := json.Marshal(map[string]interface{}{
			"data":    admins,
			"total":   total,
			"page":    page,
			"perPage": perPage,
		})
		ctx.Success("application/json", respBytes)
	}
}
