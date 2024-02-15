package usersapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List users
// @summary User List
// @id list
// @tag user
// @success 200 {object}
// @Router /users [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableUser}
	search.Build()

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(fname) LIKE ?", keywordLike).
			Or("lower(lname) LIKE ?", keywordLike).
			Or("lower(email) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var users []model.User
	search.Deliver(&users, "id ASC")
}
