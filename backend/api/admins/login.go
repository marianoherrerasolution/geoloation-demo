package adminsapi

import (
	"encoding/json"
	"geonius/api"
	db "geonius/database"
	"geonius/model"
	"geonius/pkg/encrypt"
	"geonius/pkg/stringify"
	"net/mail"

	"github.com/valyala/fasthttp"
)

type AdminWithToken struct {
	model.Admin
	Token string `json:"token"`
}

// Login admin
// @summary Admin Login
// @id	login
// @tag admin
// @success 200 {object}
// @Router /admins/signin [post]
func Login(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params model.Admin
	json.Unmarshal(body, &params)

	params.Email = stringify.SafetySQL(stringify.LowerTrim(params.Email))
	_, err := mail.ParseAddress(params.Email)
	if params.Password == "" || err != nil {
		api.UnauthorizeError(ctx)
		return
	}

	var admin AdminWithToken
	tx := db.Where("email = ?", params.Email).First(&admin)
	if tx.Error != nil || (params.Password != "" && admin.Password != encrypt.Sha1(params.Password)) {
		api.UnauthorizeError(ctx)
	} else {
		admin.Password = ""
		admin.Token = encrypt.GenerateToken()
		api.SuccessJSON(ctx, admin)
	}
}
