package usersapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/database"
	"geonius/model"
	"geonius/pkg/stringify"

	"github.com/valyala/fasthttp"
)

// List users
// @summary User List
// @id list
// @tag user
// @success 200 {object}
// @Router /users [get]
func List(ctx *fasthttp.RequestCtx) {
	page := ctx.QueryArgs().GetUintOrZero("page")
	perPage := ctx.QueryArgs().GetUintOrZero("per_page")
	keyword := string(ctx.QueryArgs().Peek("keyword"))
	if perPage < 1 {
		perPage = 10
	}
	if perPage > 50 {
		perPage = 50
	}
	if page < 1 {
		page = 1
	}
	var users []model.User
	tx := database.Pg
	txCount := database.Pg

	if keyword != "" {
		keyword = stringify.LowerTrim(stringify.SafetySQL(keyword))
		keywordQL := fmt.Sprintf("%%%s%%", keyword)
		tx = tx.Where("lower(fname) LIKE ?", keywordQL).Or("lower(lname) LIKE ?", keywordQL).Or("lower(email) LIKE ?", keywordQL)
		txCount = tx
	}

	tx = tx.Order("id ASC").
		Limit(perPage).
		Offset((page - 1) * perPage).
		Find(&users)

	var total int64
	txCount.Table(model.TableUser).Count(&total)

	if tx.Error != nil {
		fmt.Println(tx.Error)
		api.InternalError(ctx)
	} else {
		respBytes, _ := json.Marshal(map[string]interface{}{
			"data":    users,
			"total":   total,
			"page":    page,
			"perPage": perPage,
		})
		ctx.Success("application/json", respBytes)
	}
}
