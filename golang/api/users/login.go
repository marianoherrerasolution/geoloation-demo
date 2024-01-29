package usersapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Login user
// @summary User Login
// @id	login
// @tag user
// @success 200 {object}
// @Router /users/{email} [post]
func Login(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params model.User
	json.Unmarshal(body, &params)
	params.Email = ctx.UserValue("email").(string)

	var user model.User
	tx := database.Pg.Where("email = ? AND password = ?", params.Email, params.Password).First(&user)
	fmt.Println(tx.Error)
	if tx.Error != nil {
		api.UnauthorizeError(ctx)
	} else {
		api.SuccessJSON(ctx, user)
	}
}
