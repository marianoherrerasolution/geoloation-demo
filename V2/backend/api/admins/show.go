package adminsapi

import (
	"geonius/api"
	"geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Show admin detail
// @summary Admin Info
// @id	show
// @tag admin
// @success 200 {object}
// @Router /admins/{id} [get]
func Show(ctx *fasthttp.RequestCtx) {
	if admin := FindByID(ctx.UserValue("id"), ctx); admin.ValidID() {
		api.SuccessJSON(ctx, admin)
	}
}

func FindByID(id interface{}, ctx *fasthttp.RequestCtx) *model.Admin {
	admin := &model.Admin{}
	if tx := database.Pg.Where("id = ?", ctx.UserValue("id")).First(admin); tx.Error != nil {
		api.NotFoundError(ctx)
	}

	admin.Password = ""
	return admin
}
