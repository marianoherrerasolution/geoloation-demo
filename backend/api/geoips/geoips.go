package geoipsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// List geoips
// @summary GeoIP List
// @id list
// @tag geoip
// @success 200 {object}
// @Router /geoips [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableGeoIP}
	search.Build()

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("ip LIKE ?", keywordLike).
			Or("lower(country) LIKE ?", keywordLike).
			Or("lower(state) LIKE ?", keywordLike).
			Or("lower(city) LIKE ?", keywordLike).
			Or("lower(timezone) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var geoips []model.GeoIP
	search.Deliver(&geoips, "id ASC")
}
