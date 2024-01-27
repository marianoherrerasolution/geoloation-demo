package geoapi

import (
	"fmt"
	"geonius/api"
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
		api.InternalError(ctx)
	} else {
		api.SuccessJSON(ctx, results)
	}
}
