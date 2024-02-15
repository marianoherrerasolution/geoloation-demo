package api

import (
	"encoding/json"
	"fmt"
	"geonius/database"
	"geonius/pkg/stringify"

	"github.com/valyala/fasthttp"
	"gorm.io/gorm"
)

type SearchPagination struct {
	Page      int
	PerPage   int
	Keyword   string
	Tablename string
	Ctx       *fasthttp.RequestCtx
	SQLCount  *gorm.DB
	SQLSearch *gorm.DB
}

func (sp *SearchPagination) Build() {
	sp.Page = sp.Ctx.QueryArgs().GetUintOrZero("page")
	sp.PerPage = sp.Ctx.QueryArgs().GetUintOrZero("per_page")
	sp.Keyword = string(sp.Ctx.QueryArgs().Peek("keyword"))

	if sp.PerPage < 1 {
		sp.PerPage = 10
	}
	if sp.PerPage > 50 {
		sp.PerPage = 50
	}
	if sp.Page < 1 {
		sp.Page = 1
	}

	sp.SQLSearch = database.Pg.Table(sp.Tablename)
	sp.SQLCount = database.Pg.Table(sp.Tablename)
}

func (sp *SearchPagination) CaseSensitiveKeyword() string {
	return fmt.Sprintf("%%%s%%", stringify.LowerTrim(stringify.SafetySQL(sp.Keyword)))
}

func (sp *SearchPagination) HasKeyword() bool {
	return sp.Keyword != ""
}

func (sp *SearchPagination) Search(dest interface{}, orderBy string) (tx *gorm.DB) {
	return sp.SQLSearch.
		Order(orderBy).
		Limit(sp.PerPage).
		Offset((sp.Page - 1) * sp.PerPage).
		Find(&dest)
}

func (sp *SearchPagination) Total() int64 {
	var total int64
	sp.SQLCount.Count(&total)
	return total
}

func (sp *SearchPagination) Deliver(dest interface{}, orderBy string) {
	tx := sp.Search(dest, orderBy)
	if tx.Error != nil {
		InternalError(sp.Ctx)
	} else {
		respBytes, _ := json.Marshal(map[string]interface{}{
			"data":    dest,
			"total":   sp.Total(),
			"page":    sp.Page,
			"perPage": sp.PerPage,
		})
		sp.Ctx.Success("application/json", respBytes)
	}
}

type ErrorConfig struct {
	Error string `json:"error"`
	Field string `json:"field,omitempty"`
}

func NotFoundError(ctx *fasthttp.RequestCtx) {
	ctx.SetStatusCode(404)
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte("{\"error\": \"not_found\"}"))
}

func InternalError(ctx *fasthttp.RequestCtx) {
	ctx.SetStatusCode(500)
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte("{\"error\": \"internal_server\"}"))
}

func UnprocessibleError(ctx *fasthttp.RequestCtx, errConf ErrorConfig) {
	ctx.SetStatusCode(422)
	ctx.SetContentType("application/json")
	bodyByte, _ := json.Marshal(errConf)
	ctx.SetBody(bodyByte)
}

func UnauthorizeError(ctx *fasthttp.RequestCtx) {
	ctx.SetStatusCode(401)
	ctx.SetContentType("application/json")
	ctx.SetBody([]byte("{\"error\": \"unauthorize\"}"))
}

func SuccessJSON(ctx *fasthttp.RequestCtx, data interface{}) {
	jsonByte, _ := json.Marshal(data)
	ctx.Success("application/json", jsonByte)
}
