package locationsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List locations
// @summary Accessed Location List
// @id list
// @tag user
// @success 200 {object}
// @Router /locations [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableAccessedLocation}
	search.Build()

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("ip LIKE ?", keywordLike).
			Or("lower(country) LIKE ?", keywordLike).
			Or("lower(city) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var locations []model.AccessedLocation
	search.Deliver(&locations, "gid ASC")
}
