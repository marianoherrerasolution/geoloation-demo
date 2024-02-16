package adminsapi

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

// Create admin data
// @summary Admin Create
// @id	create
// @tag admin
// @success 204 {object}
// @Router /admins/ [post]
func Create(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params model.Admin
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

	var existAdmin model.Admin
	if tx := db.Where("email = ?", email).First(&existAdmin); tx.Error == nil {
		api.UnprocessibleError(ctx, api.ErrorConfig{
			Error: "exist",
			Field: "email",
		})
		return
	}

	params.Password = encrypt.Sha1(params.Password)
	if tx := db.Create(&params); tx.Error != nil {
		fmt.Printf("[error] create admin %v", tx.Error)
		api.InternalError(ctx)
	} else {
		params.Password = ""
		api.SuccessJSON(ctx, params)
	}
}
