package productsapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/model"
	"strconv"
	"strings"

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

	clientID, isMember, isAdmin := api.RequireAccessClientID(ctx)
	if !isMember && !isAdmin {
		search.Respond(map[string]interface{}{}, 0)
		return
	}

	clientIDs := []int{}
	if isAdmin {
		textIDs := strings.Split(string(ctx.QueryArgs().Peek("client_ids")), ",")
		for _, textID := range textIDs {
			clientID, e := strconv.Atoi(textID)
			fmt.Println(e)
			if clientID > 0 {
				clientIDs = append(clientIDs, clientID)
			}
		}
	} else {
		clientIDs = append(clientIDs, int(clientID))
	}

	search.SQLSearch = search.SQLSearch.Select("products.*, clients.company as client_name").
		Joins("left join clients on clients.id = products.client_id")

	if len(clientIDs) > 0 {
		search.SQLSearch = search.SQLSearch.Where("products.client_id IN ?", clientIDs)
		search.SQLCount = search.SQLCount.Where("client_id IN ?", clientIDs)
	}

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(products.name) LIKE ?", keywordLike)
		search.SQLCount = search.SQLCount.Where("lower(name) LIKE ?", keywordLike)
	}

	var results []model.ProductClientName
	tx := search.Search(&results, "products.id ASC")
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
