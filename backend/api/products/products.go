package productsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List products
// @summary Product List
// @id list
// @tag product
// @success 200 {object}
// @Router /products [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableProduct}
	search.Build()

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(name) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var products []model.Client
	search.Deliver(products, "id ASC")
}
