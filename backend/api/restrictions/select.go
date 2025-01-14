package restrictionsapi

import (
	"fmt"
	"geonius/api"
	db "geonius/database"
	"geonius/model"
	"strings"

	"github.com/valyala/fasthttp"
)

// Select restriction
// @summary Restriction Select
// @id list
// @tag product
// @success 200 {object}
// @Router /restriction/select [get]
func Select(ctx *fasthttp.RequestCtx) {
	var records []struct {
		ID        uint   `json:"id"`
		Name      string `json:"name"`
		ClientID  uint   `json:"client_id"`
		ProductID uint   `json:"product_id"`
	}

	clientID, isMember, isAdmin := api.RequireAccessClientID(ctx)
	if !isMember && !isAdmin {
		api.SuccessJSON(ctx, records)
		return
	}

	if isAdmin {
		clientID = uint(ctx.QueryArgs().GetUintOrZero("client_id"))
	}

	productID := ctx.QueryArgs().GetUintOrZero("product_id")
	tx := db.Pg.Table(model.TableRestriction).Select([]string{"id", "name", "client_id", "product_id"})
	statements := []string{}
	if clientID > 0 {
		statements = append(statements, fmt.Sprintf("client_id = %d", clientID))
	}
	if productID > 0 {
		statements = append(statements, fmt.Sprintf("product_id = %d", productID))
	}

	if len(statements) > 0 {
		tx = tx.Where(strings.Join(statements, " AND "))
	}

	if tx = tx.Order("name ASC").Find(&records); tx.Error != nil {
		fmt.Printf("[error] selects restrictions %v", tx.Error)
		api.InternalError(ctx)
	} else {
		api.SuccessJSON(ctx, records)
	}
}
