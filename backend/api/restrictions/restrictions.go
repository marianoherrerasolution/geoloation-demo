package restrictionsapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/model"
	"geonius/pkg/stringify"
	"strconv"
	"strings"

	"github.com/valyala/fasthttp"
)

func PrepareParamsBody(ctx *fasthttp.RequestCtx) model.RestrictionWithCoordinates {
	body := ctx.PostBody()
	var params model.RestrictionWithCoordinates
	json.Unmarshal(body, &params)
	params.Name = stringify.LowerTrim(params.Name)
	params.Networks = stringify.LowerTrim(params.Networks)
	return params
}

// List restrictions
// @summary Restriction List
// @id list
// @tag restriction
// @success 200 {object}
// @Router /restrictions [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableRestriction}
	search.Build()

	clientIDs := []int{}
	clientID, isMember, isAdmin := api.RequireAccessClientID(ctx)
	if !isMember && !isAdmin {
		search.Respond([]map[string]interface{}{}, 0)
		return
	}

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

	selectFields := []string{
		"restrictions.id", "restrictions.name", "restrictions.active", "restrictions.allow",
		"restrictions.networks", "restrictions.client_id", "restrictions.product_id",
		"restrictions.address", "restrictions.address_lon", "restrictions.address_lat",
		"clients.company as client_name", "products.name as product_name",
	}

	search.SQLSearch = search.SQLSearch.Select(strings.Join(selectFields, ",")).
		Joins("left join clients on clients.id = restrictions.client_id").
		Joins("left join products on products.id = restrictions.product_id")

	if len(clientIDs) > 0 {
		search.SQLSearch = search.SQLSearch.Where("restrictions.client_id IN ?", clientIDs)
		search.SQLCount = search.SQLCount.Where("client_id IN ?", clientIDs)
	}

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLCount = search.SQLCount.Where("lower(name) LIKE ?", keywordLike).
			Or("lower(networks) LIKE ?", keywordLike)
		search.SQLSearch = search.SQLSearch.Where("lower(restrictions.name) LIKE ?", keywordLike).
			Or("lower(restrictions.networks) LIKE ?", keywordLike)
	}

	var results []model.RestrictionClientProduct
	tx := search.Search(&results, "restrictions.id ASC")
	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		search.Respond(results, search.Total())
	}
}
