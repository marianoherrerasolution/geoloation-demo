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
	tx := database.Pg.Order("id ASC").Find(&admins)

	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		respBytes, _ := json.Marshal(admins)
		ctx.Success("application/json", respBytes)
	}
}
