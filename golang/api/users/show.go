package usersapi

import (
	"encoding/json"
	"fmt"
	"geonius/database"

	"github.com/valyala/fasthttp"
)

// Show user detail
// @summary User Info
// @id	show
// @tag user
// @success 200 {object}
// @Router /users/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	var user map[string]interface{}
	tx := database.Pg.Table("tbl_user").Where("gid = ?", ctx.UserValue("id")).First(&user)

	if tx.Error != nil {
		ctx.SetStatusCode(404)
		ctx.SetContentType("application/json")
		fmt.Printf("usersapi/List error %v\n", tx.Error)
		ctx.SetBody([]byte("{\"error\": \"user id is not found\"}"))
	} else {
		respBytes, _ := json.Marshal(user)
		ctx.Success("application/json", respBytes)
	}
}
