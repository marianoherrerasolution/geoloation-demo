package geoapi

import (
	"encoding/json"
	"fmt"
	"geonius/database"

	"github.com/valyala/fasthttp"
)

// Show user detail
// @summary User Info
// @id	show
// @tag user
// @params latitude decimal
// @params longitude decimal
// @success 200 {object}
// @Router /checkIntersection [post]
func Intersection(ctx *fasthttp.RequestCtx) {
	latitude := ctx.PostArgs().GetUfloatOrZero("latitude")
	longitude := ctx.PostArgs().GetUfloatOrZero("longitude")
	var results []interface{}
	tx := database.Pg.Raw(
		fmt.Sprintf(
			"select * from geofence_pak where st_intersects(geom, ST_SetSRID(ST_MakePoint(%v, %v), 4326))",
			longitude,
			latitude,
		),
	).
		Find(&results)

	if tx.Error != nil {
		ctx.SetStatusCode(500)
		ctx.SetContentType("application/json")
		fmt.Printf("checkIntersection error %v\n", tx.Error)
		ctx.SetBody([]byte("{\"error\": \"internal server error\"}"))
	} else {
		respBytes, _ := json.Marshal(results)
		ctx.Success("application/json", respBytes)
	}
}
