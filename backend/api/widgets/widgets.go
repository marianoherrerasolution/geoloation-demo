package widgetsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List widgets
// @summary Widget List
// @id list
// @tag widget
// @success 200 {object}
// @Router /widgets [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableWidget}
	search.Build()

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(name) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var widgets []model.Client
	search.Deliver(&widgets, "id ASC")
}
