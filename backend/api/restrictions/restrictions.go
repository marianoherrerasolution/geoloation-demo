package restrictionsapi

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

// List restrictions
// @summary Restriction List
// @id list
// @tag restriction
// @success 200 {object}
// @Router /restrictions [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableRestriction}
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
		search.SQLSearch = search.SQLSearch.Where("lower(name) LIKE ?", keywordLike).
			Or("lower(networks) LIKE ?", keywordLike)
		search.SQLCount = search.SQLSearch
	}

	var restrictions []model.Restriction
	tx := search.Search(&restrictions, "id ASC")
	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		clientIDNames := getClientNames(restrictions)
		productIDNames := getProductNames(restrictions)

		results := []model.RestrictionClientProduct{}
		for _, restriction := range restrictions {
			results = append(results, model.RestrictionClientProduct{
				Restriction: restriction,
				ClientName:  clientIDNames[restriction.ClientID],
				ProductName: productIDNames[restriction.ProductID],
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

func getUniqIDs(restrictions []model.Restriction, idType string) []uint {
	uniqIDs := map[uint]bool{}
	ids := []uint{}
	for _, restriction := range restrictions {
		if idType == "product" && restriction.ProductID > 0 && !uniqIDs[restriction.ProductID] {
			uniqIDs[restriction.ProductID] = true
			ids = append(ids, restriction.ProductID)
		}
		if idType == "client" && restriction.ClientID > 0 && !uniqIDs[restriction.ClientID] {
			uniqIDs[restriction.ClientID] = true
			ids = append(ids, restriction.ClientID)
		}
	}
	return ids
}

func getClientNames(restrictions []model.Restriction) map[uint]string {
	var records []model.Client
	idNames := map[uint]string{}
	database.Pg.Select("id", "company").Where("id IN ?", getUniqIDs(restrictions, "client")).Find(&records)
	for _, client := range records {
		idNames[client.ID] = client.Company
	}

	return idNames
}

func getProductNames(restrictions []model.Restriction) map[uint]string {
	var records []model.Product
	idNames := map[uint]string{}
	database.Pg.Select("id", "name").Where("id IN ?", getUniqIDs(restrictions, "product")).Find(&records)
	for _, record := range records {
		idNames[record.ID] = record.Name
	}

	return idNames
}
