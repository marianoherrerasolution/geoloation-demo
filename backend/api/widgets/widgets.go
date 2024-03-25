package widgetsapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/model"
	"geonius/pkg/stringify"
	"strconv"
	"strings"

	"github.com/valyala/fasthttp"
)

func PrepareParamsBody(ctx *fasthttp.RequestCtx) model.Widget {
	body := ctx.PostBody()
	var params model.Widget
	json.Unmarshal(body, &params)
	params.Name = stringify.LowerTrim(params.Name)
	params.RestrictionType = stringify.LowerTrim(params.RestrictionType)

	return params
}

// List widgets
// @summary Widget List
// @id list
// @tag widget
// @success 200 {object}
// @Router /widgets [get]
func List(ctx *fasthttp.RequestCtx) {
	search := &api.SearchPagination{Ctx: ctx, Tablename: model.TableWidget}
	search.Build()

	clientIDs := []uint{}
	clientID, isMember, isAdmin := api.RequireAccessClientID(ctx)
	if !isMember && !isAdmin {
		search.Respond([]map[string]interface{}{}, 0)
		return
	}

	if isAdmin {
		textIDs := strings.Split(string(ctx.QueryArgs().Peek("client_ids")), ",")
		for _, textID := range textIDs {
			if textID != "" {
				selectedClientID, _ := strconv.Atoi(textID)
				if clientID > 0 {
					clientIDs = append(clientIDs, uint(selectedClientID))
				}
			}
		}
	} else {
		clientIDs = append(clientIDs, clientID)
	}

	search.SQLSearch = search.SQLSearch.Select("widgets.*, clients.company as client_name").
		Joins("left join clients on clients.id = widgets.client_id")

	if len(clientIDs) > 0 {
		search.SQLSearch = search.SQLSearch.Where("widgets.client_id IN ?", clientIDs)
		search.SQLCount = search.SQLCount.Where("client_id IN ?", clientIDs)
	}

	if search.HasKeyword() {
		keywordLike := search.CaseSensitiveKeyword()
		search.SQLSearch = search.SQLSearch.Where("lower(widgets.name) LIKE ?", keywordLike).
			Or("lower(widgets.token) = LIKE ?", keywordLike)
		search.SQLCount = search.SQLCount.Where("lower(name) LIKE ?", keywordLike).
			Or("lower(token) = LIKE ?", keywordLike)
	}

	var results []model.WidgetClientName
	tx := search.Search(&results, "widgets.id ASC")
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
