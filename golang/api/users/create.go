package usersapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	db "geonius/database"
	"geonius/model"
	"geonius/pkg/encrypt"
	"geonius/pkg/stringify"
	"net/mail"

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

	if field := params.ValidateEmptyField(); field != "" {
		api.UnprocessibleError(ctx, api.ErrorConfig{
			Error: "empty",
			Field: field,
		})
		return
	}

	email := stringify.SafetySQL(stringify.LowerTrim(params.Email))
	if _, err := mail.ParseAddress(email); err != nil {
		api.UnprocessibleError(ctx, api.ErrorConfig{
			Error: "invalid",
			Field: "email",
		})
		return
	}

	var existUser model.User
	if tx := db.Where("email = ?", email).First(&existUser); tx.Error == nil {
		api.UnprocessibleError(ctx, api.ErrorConfig{
			Error: "exist",
			Field: "email",
		})
		return
	}

	params.Password = encrypt.Sha1(params.Password)
	if tx := db.Create(&params); tx.Error != nil {
		fmt.Printf("[error] create user %v", tx.Error)
		api.InternalError(ctx)
	} else {
		params.Password = ""
		api.SuccessJSON(ctx, params)
	}
}
