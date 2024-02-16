package geoapi

import (
	"encoding/json"
	"fmt"
	"geonius/api"
	"geonius/database"

	"github.com/valyala/fasthttp"
)

type IntersectionParams struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// Show user detail
// @summary User Info
// @id	show
// @tag user
// @params latitude decimal
// @params longitude decimal
// @success 200 {object}
// @Router /checkIntersection [post]
func Intersection(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params IntersectionParams
	json.Unmarshal(body, &params)

	var results []interface{}
	tx := database.Pg.Raw(
		fmt.Sprintf(
			"select * from geofence_pak where st_intersects(geom, ST_SetSRID(ST_MakePoint(%v, %v), 4326))",
			params.Longitude,
			params.Latitude,
		),
	).
		Find(&results)

	if tx.Error != nil {
		api.InternalError(ctx)
	} else {
		api.SuccessJSON(ctx, results)
	}
}
