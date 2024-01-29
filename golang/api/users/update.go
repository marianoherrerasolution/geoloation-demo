package usersapi

import (
	"encoding/json"
	"geonius/api"
	db "geonius/database"
	"geonius/model"
	"geonius/pkg/encrypt"
	"geonius/pkg/stringify"
	"log"
	"net/mail"

	"github.com/valyala/fasthttp"
)

// Update user data
// @summary User Update
// @id	update
// @tag user
// @success 204 {object}
// @Router /users/{id} [put]
func Update(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params model.User
	json.Unmarshal(body, &params)

	// check if email is valid format or not
	if params.Email != "" {
		params.Email = stringify.SafetySQL(stringify.LowerTrim(params.Email))
		if _, err := mail.ParseAddress(params.Email); err != nil {
			api.UnprocessibleError(ctx, api.ErrorConfig{
				Error: "invalid",
				Field: "email",
			})
			return
		}
	}

	// check if id exist or not
	user := FindByID(ctx.UserValue("id"), ctx)
	if user.ID < 1 {
		return
	}

	// check if changed-email is exist or not
	if params.Email != "" && user.Email != params.Email {
		var exist model.User
		tx := db.Where("email = ?", params.Email).First(&exist)
		if tx.Error == nil {
			api.UnprocessibleError(ctx, api.ErrorConfig{
				Error: "exist",
				Field: "email",
			})
			return
		}
	}

	if params.Password != "" {
		params.Password = encrypt.Sha1(params.Password)
	}

	if tx := db.Pg.Model(user).Updates(params); tx.Error != nil {
		log.Fatalf("/users/%v error: %v", user.ID, tx.Error)
		api.InternalError(ctx)
	} else {
		user.Password = ""
		api.SuccessJSON(ctx, user)
	}
}
