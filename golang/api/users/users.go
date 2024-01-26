package usersapi

import (
	"encoding/json"
	"fmt"
	"geonius/database"

	"github.com/valyala/fasthttp"
)

// List users
// @summary User List
// @id list
// @tag user
// @success 200 {object}
// @Router /users [get]
func List(ctx *fasthttp.RequestCtx) {
	var users []map[string]interface{}
	tx := database.Pg.Table("tbl_user").Order("gid ASC").Find(&users)

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
