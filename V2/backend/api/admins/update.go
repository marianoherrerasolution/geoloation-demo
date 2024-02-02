package adminsapi

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

// Update admin data
// @summary Admin Update
// @id	update
// @tag admin
// @success 204 {object}
// @Router /admins/{id} [put]
func Update(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params model.Admin
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
	admin := FindByID(ctx.UserValue("id"), ctx)
	if admin.ID < 1 {
		return
	}

	// check if changed-email is exist or not
	if params.Email != "" && admin.Email != params.Email {
		var exist model.Admin
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

	if tx := db.Pg.Model(admin).Updates(params); tx.Error != nil {
		log.Fatalf("/admins/%v error: %v", admin.ID, tx.Error)
		api.InternalError(ctx)
	} else {
		admin.Password = ""
		api.SuccessJSON(ctx, admin)
	}
}
