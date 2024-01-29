package usersapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List users
// @summary User List
// @id list
// @tag user
// @success 200 {object}
// @Router /users [get]
func List(ctx *fasthttp.RequestCtx) {
	var users []model.User
	tx := database.Pg.Order("id ASC").Find(&users)

	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		respBytes, _ := json.Marshal(users)
		ctx.Success("application/json", respBytes)
	}
}
