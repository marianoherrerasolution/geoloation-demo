package api

import (
	"encoding/json"
	"fmt"
	db "geonius/database"
	"geonius/model"
	"geonius/pkg/stringify"
	"log"
	"strconv"
	"strings"

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

type SelectTag struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

func (sp *SearchPagination) Respond(results interface{}, total interface{}) {
	respBytes, _ := json.Marshal(map[string]interface{}{
		"data":    results,
		"total":   total,
		"page":    sp.Page,
		"perPage": sp.PerPage,
	})
	sp.Ctx.Success("application/json", respBytes)
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

	sp.SQLSearch = db.Pg.Table(sp.Tablename)
	sp.SQLCount = db.Pg.Table(sp.Tablename)
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
		Find(dest)
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

func ExistRecord(field string, value interface{}, dest interface{}, ctx *fasthttp.RequestCtx) bool {
	statement := fmt.Sprintf("%s = ?", field)
	if tx := db.Where(statement, value).First(&dest); tx.Error == nil {
		UnprocessibleError(ctx, ErrorConfig{
			Error: "exist",
			Field: field,
		})
		return true
	}
	return false
}

func CreateRecord(entity interface{}, tableName string, ctx *fasthttp.RequestCtx) {
	if tx := db.Create(entity); tx.Error != nil {
		fmt.Printf("[error] create %s %v", tableName, tx.Error)
		InternalError(ctx)
	} else {
		SuccessJSON(ctx, entity)
	}
}

func RecordsForSelect(tableName string, fields []string, orderBy string, records interface{}, ctx *fasthttp.RequestCtx) {
	if tx := db.Pg.Table(tableName).Select(fields).Order(orderBy).Find(records); tx.Error != nil {
		fmt.Printf("[error] selects %s %v", tableName, tx.Error)
		InternalError(ctx)
	} else {
		SuccessJSON(ctx, records)
	}
}

func UpdateRecord(tableName string, ID interface{}, original interface{}, updateParams interface{}, ctx *fasthttp.RequestCtx) {
	if tx := db.Pg.Model(original).Updates(updateParams); tx.Error != nil {
		log.Fatalf("/%s/%v error: %v", tableName, ID, tx.Error)
		InternalError(ctx)
	} else {
		SuccessJSON(ctx, original)
	}
}

func FindByID(id interface{}, record interface{}, ctx *fasthttp.RequestCtx) bool {
	if tx := db.Pg.Where("id = ?", id).First(record); tx.Error != nil {
		NotFoundError(ctx)
		return false
	}
	return true
}

func RequireAccessClientID(ctx *fasthttp.RequestCtx) (clientID uint, isMember bool, isAdmin bool) {
	if strings.Contains(string(ctx.Path()), "/u/") {
		clientID, ok := GetCurrentClientID(ctx)
		return clientID, ok, false
	}
	return clientID, false, true
}

func GetCurrentUserID(ctx *fasthttp.RequestCtx) uint {
	userID, _ := strconv.Atoi(fmt.Sprintf("%v", ctx.UserValue("userID")))
	return uint(userID)
}

func GetCurrentClientID(ctx *fasthttp.RequestCtx) (uint, bool) {
	userID := GetCurrentUserID(ctx)
	if userID < 1 {
		return 0, false
	}

	var member model.User
	tx := db.Pg.Where("id = ?", userID).First(&member)
	if tx.Error != nil || member.ClientID < 1 {
		return 0, false
	}

	return member.ClientID, true
}

func CompareClientID(ctx *fasthttp.RequestCtx, requiredClientID uint, errorAction string) bool {
	clientID, isMember, isAdmin := RequireAccessClientID(ctx)
	acceptable := isAdmin || (isMember && clientID == requiredClientID)

	if !acceptable {
		if errorAction == "unprocessible" {
			UnprocessibleError(ctx, ErrorConfig{
				Error: "invalid",
				Field: "client_id",
			})
		}

		if errorAction == "not_found" {
			NotFoundError(ctx)
		}
	}
	return acceptable
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
