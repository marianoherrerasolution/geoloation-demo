package widgetsapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
	"gorm.io/gorm"
)

// Widget Usages by widget id
// @summary Widget Usage List
// @id list
// @tag widget usages
// @success 200 {object}
// @Router /widgets/:id/usages [get]
func Usages(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableWidgetUsage}
	search.Build()
	search.SQLSearch = search.SQLSearch.Where("widget_id = ?", ctx.UserValue("id"))
	search.SQLCount = search.SQLCount.Where("widget_id = ?", ctx.UserValue("id"))
	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = buildSearchQuery(search.SQLSearch, keywordLike)
		search.SQLCount = buildSearchQuery(search.SQLCount, keywordLike)
	}

	var results []model.WidgetUsage
	tx := search.Search(&results, "id DESC")
	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		respBytes, _ := json.Marshal(map[string]interface{}{
			"data":    results,
			"total":   search.Total(),
			"page":    search.Page,
			"perPage": search.PerPage,
		})
		ctx.Success("application/json", respBytes)
	}
}

func buildSearchQuery(query *gorm.DB, keyword string) *gorm.DB {
	return query.Where("(ip LIKE @keyword OR remote_ip LIKE @keyword OR referer LIKE @keyword OR city LIKE @keyword OR country LIKE @keyword)",
		map[string]interface{}{"keyword": keyword},
	)
}
