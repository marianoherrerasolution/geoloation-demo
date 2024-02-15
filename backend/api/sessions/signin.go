package sessionsapi

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

type SigninResponse struct {
	model.User
	Token 	string `json:"token"`
}

// Signin user
// @summary User signin
// @id	signin
// @tag sessions
// @success 200 {object}
// @Router /signin [post]
func Signin(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params model.User
	json.Unmarshal(body, &params)

	params.Email = stringify.SafetySQL(stringify.LowerTrim(params.Email))
	_, err := mail.ParseAddress(params.Email)
	if params.Password == "" || err != nil {
		api.UnauthorizeError(ctx)
		return
	}

	var user SigninResponse
	tx := db.Where("email = ?", params.Email).First(&user)
	if tx.Error != nil || (params.Password != "" && user.Password != encrypt.Sha1(params.Password)) {
		api.UnauthorizeError(ctx)
	} else {
		user.Password = ""
		user.Token = encrypt.GenerateToken()
		api.SuccessJSON(ctx, user)
	}
}
