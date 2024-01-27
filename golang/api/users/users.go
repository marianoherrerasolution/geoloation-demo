package usersapi

import (
	"encoding/json"
	"fmt"
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
	tx := database.Pg.Order("gid ASC").Find(&users)

	if tx.Error != nil {
		ctx.SetStatusCode(500)
		ctx.SetContentType("application/json")
		fmt.Printf("usersapi/List error %v\n", tx.Error)
		ctx.SetBody([]byte("{\"error\": \"internal server error\"}"))
	} else {
		respBytes, _ := json.Marshal(users)
		ctx.Success("application/json", respBytes)
	}
}
