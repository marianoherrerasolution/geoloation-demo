package usersapi

import (
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Show user detail
// @summary User Info
// @id	show
// @tag user
// @success 200 {object}
// @Router /users/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	if user := FindByID(ctx.UserValue("id"), ctx); user.ValidID() {
		api.SuccessJSON(ctx, user)
	}
}

func FindByID(id interface{}, ctx *fasthttp.RequestCtx) *model.User {
	user := &model.User{}
	if tx := database.Pg.Where("id = ?", ctx.UserValue("id")).First(user); tx.Error != nil {
		api.NotFoundError(ctx)
	}

	user.Password = ""
	return user
}
