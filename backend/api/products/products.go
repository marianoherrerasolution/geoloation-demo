package productsapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/database"
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

	textIDs := strings.Split(string(ctx.QueryArgs().Peek("client_ids")), ",")
	clientIDs := []int{}
	for _, textID := range textIDs {
		clientID, e := strconv.Atoi(textID)
		fmt.Println(e)
		if clientID > 0 {
			clientIDs = append(clientIDs, clientID)
		}
	}

	if len(clientIDs) > 0 {
		search.SQLSearch = search.SQLSearch.Where("client_id IN ?", clientIDs)
	}

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(name) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var products []model.Product
	tx := search.Search(&products, "id ASC")
	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		uniqClientIDs := map[uint]bool{}
		clientIDs := []uint{}
		for _, product := range products {
			if product.ClientID > 0 && !uniqClientIDs[product.ClientID] {
				uniqClientIDs[product.ClientID] = true
				clientIDs = append(clientIDs, product.ClientID)
			}
		}

		var clients []model.Client
		clientIDNames := map[uint]string{}
		database.Pg.Select("id", "company").Where("id IN ?", clientIDs).Find(&clients)
		for _, client := range clients {
			clientIDNames[client.ID] = client.Company
		}

		results := []model.ProductClientName{}
		for _, product := range products {
			results = append(results, model.ProductClientName{
				Product:    product,
				ClientName: clientIDNames[product.ClientID],
			})
		}

		respBytes, _ := json.Marshal(map[string]interface{}{
			"data":    results,
			"total":   search.Total(),
			"page":    search.Page,
			"perPage": search.PerPage,
		})
		ctx.Success("application/json", respBytes)
	}
}
