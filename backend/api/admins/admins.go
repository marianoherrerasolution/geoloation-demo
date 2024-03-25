package adminsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List admins
// @summary Admin List
// @id list
// @tag admin
// @success 200 {object}
// @Router /admins [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableAdmin}
	search.Build()

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(fname) LIKE ?", keywordLike).
			Or("lower(lname) LIKE ?", keywordLike).
			Or("lower(email) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var admins []model.Admin
	search.Deliver(&admins, "id ASC")
}
