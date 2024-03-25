package usersapi

import (
	"geonius/api"
	"geonius/model"
	"strings"
	"strconv"
	"fmt"
	"encoding/json"
	"github.com/valyala/fasthttp"
)

// List users
// @summary User List
// @id list
// @tag user
// @success 200 {object}
// @Router /users [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableUser}
	search.Build()

	textIDs := strings.Split(string(ctx.QueryArgs().Peek("client_ids")), ",")
	clientIDs := []int{}
	for _, textID := range textIDs {
		clientID, e := strconv.Atoi(textID)
		fmt.Println(e)
		if clientID > 0 {
			clientIDs = append(clientIDs, clientID)
		}
	}

	search.SQLSearch = search.SQLSearch.Select("users.*, clients.company as client_name").
		Joins("left join clients on clients.id = users.client_id")

	if len(clientIDs) > 0 {
		search.SQLSearch = search.SQLSearch.Where("users.client_id IN ?", clientIDs)
		search.SQLCount = search.SQLCount.Where("client_id IN ?", clientIDs)
	}

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(users.fname) LIKE ?", keywordLike).
			Or("lower(users.lname) LIKE ?", keywordLike).
			Or("lower(users.email) LIKE ?", keywordLike)
		search.SQLCount = search.SQLCount.Where("lower(fname) LIKE ?", keywordLike).
			Or("lower(lname) LIKE ?", keywordLike).
			Or("lower(email) LIKE ?", keywordLike)
	}

	var results []model.UserClientName
	tx := search.Search(&results, "users.id ASC")
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
