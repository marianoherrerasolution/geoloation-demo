package usersapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Create user data
// @summary User Create
// @id	create
// @tag user
// @success 204 {object}
// @Router /users/ [post]
func Create(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params model.User
	json.Unmarshal(body, &params)
	fmt.Println(params)
	if tx := database.Pg.Create(&params); tx.Error != nil {
		fmt.Println(tx.Error)
		api.InternalError(ctx)
	} else {
		api.SuccessJSON(ctx, params)
	}
}
