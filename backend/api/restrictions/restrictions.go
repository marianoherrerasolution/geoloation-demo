package restrictionsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List restrictions
// @summary Restriction List
// @id list
// @tag restriction
// @success 200 {object}
// @Router /restrictions [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableRestriction}
	search.Build()

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(name) LIKE ?", keywordLike).
			Or("lower(networks) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var restrictions []model.Client
	search.Deliver(&restrictions, "id ASC")
}
