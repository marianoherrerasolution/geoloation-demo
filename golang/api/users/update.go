package usersapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/database"
	"geonius/model"
	"log"

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

	if user := FindByID(ctx.UserValue("id"), ctx); user.ID > 0 {
		params.ID = user.ID
		if tx := database.Pg.Model(user).Updates(params); tx.Error != nil {
			log.Fatalf("/users/%v error: %v", user.ID, tx.Error)
			api.InternalError(ctx)
		} else {
			api.SuccessJSON(ctx, user)
		}
	}
}
