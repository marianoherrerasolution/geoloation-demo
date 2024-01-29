package geoapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/database"
	"geonius/model"
	"time"

	"github.com/valyala/fasthttp"
)

// Add accessed location
// @summary Add location
// @id	add_location
// @tag location
// @params city string
// @params country string
// @params zip_code string
// @params lon float
// @params lat float
// @params ip string
// @success 201 {object}
// @Router /addLocation [post]
func AddLocation(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params model.AccessedLocation
	json.Unmarshal(body, &params)

	now := time.Now()
	params.Datetime = now.Format("2006-01-02 15:04:05")

	if tx := database.Pg.Table("accessed_locations").Create(&params); tx.Error != nil {
		api.InternalError(ctx)
	} else {
		ctx.Success("text/plain", []byte(fmt.Sprintf("Location added with ID: %d", params.GID)))
	}
}
