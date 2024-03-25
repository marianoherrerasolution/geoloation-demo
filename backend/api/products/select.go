package productsapi

import (
	"fmt"
	"geonius/api"
	db "geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Select products
// @summary Product Select
// @id list
// @tag product
// @success 200 {object}
// @Router /products/select [get]
func Select(ctx *fasthttp.RequestCtx) {
	var records []struct {
		ID      uint   `json:"id"`
		Name    string `json:"name"`
		AppType string `json:"app_type"`
	}
	
	clientID, isMember, isAdmin := api.RequireAccessClientID(ctx)
	if !isMember && !isAdmin {
		fmt.Println(records)
		api.SuccessJSON(ctx, records)
		return
	}

	if isAdmin {
		clientID = uint(ctx.QueryArgs().GetUintOrZero("client_id"))
	}

	tx := db.Pg.Table(model.TableProduct).Select("id", "name", "app_type", "client_id")
	if clientID > 0 {
		tx = tx.Where("client_id = ?", clientID)
	}

	if tx := tx.Order("name ASC").Find(&records); tx.Error != nil {
		fmt.Printf("[error] selects products %v", tx.Error)
		api.InternalError(ctx)
	} else {
		api.SuccessJSON(ctx, records)
	}
}
