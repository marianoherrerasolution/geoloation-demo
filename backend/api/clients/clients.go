package clientsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List clients
// @summary Client List
// @id list
// @tag client
// @success 200 {object}
// @Router /clients [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableClient}
	search.Build()

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(company) LIKE ?", keywordLike).
			Or("lower(website) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var clients []model.Client
	search.Deliver(&clients, "id ASC")
}
