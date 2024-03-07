package restrictionsapi

import (
	"fmt"
	"geonius/api"
	db "geonius/database"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Show restriction analyitc
// @summary Restriction Analytic
// @id	analytic
// @tag restriction
// @success 200 {object}
// @Router /restrictions/{id}/analytic [get]
func Analytic(ctx *fasthttp.RequestCtx) {
	var restriction model.RestrictionWithCoordinates
	tx := db.Pg.Select("*, ST_AsText(polygon) as polygon_coordinates").Where("id = ?", ctx.UserValue("id")).First(&restriction)
	if tx.Error != nil {
		api.NotFoundError(ctx)
	}

	restrictionid := ctx.UserValue("id")

	api.SuccessJSON(ctx, map[string]interface{}{
		"daily":    TotalDaily(restrictionid),
		"markers":  Marker30Days(restrictionid),
		"overview": Overview30Day(restrictionid),
	})
}

type MarkerAnalytic struct {
	Lat   float64 `gorm:"column:lat" json:"lat"`
	Lon   float64 `gorm:"column:lon" json:"lon"`
	Allow float64 `gorm:"column:allow" json:"allow"`
}

func Marker30Days(id interface{}) []MarkerAnalytic {
	statement := fmt.Sprintf(`
SELECT ST_X(t1.point) AS lon, 
ST_Y(t1.point) AS lat, allow
FROM (
	select distinct point, allow
	FROM widget_usages
	WHERE date >= CURRENT_DATE - 30 AND date < CURRENT_DATE
	AND restriction_id = %v
	LIMIT 1000
) t1
`, id)

	var results []MarkerAnalytic
	db.Raw(statement).Find(&results)
	return results
}

type TotalAnalytic struct {
	Date       string `gorm:"column:date" json:"date"`
	TotalHit   int64  `gorm:"column:total_hit" json:"total_hit"`
	TotalUniq  int64  `gorm:"column:total_uniq" json:"total_uniq"`
	TotalDeny  int64  `gorm:"column:total_deny" json:"total_deny"`
	TotalAllow int64  `gorm:"column:total_allow" json:"total_allow"`
}

func TotalDaily(id interface{}) []TotalAnalytic {
	statement := fmt.Sprintf(`
	SELECT to_char(date, 'DD-MM-YYYY') as date, total_hit, total_uniq, total_deny, total_allow
	FROM total_daily_restrictions
	WHERE restriction_id = %v
	AND date >= (CURRENT_DATE - 30)
	AND date < CURRENT_DATE
	`, id)

	var results []TotalAnalytic
	db.Raw(statement).Find(&results)
	return results
}

type OverviewAnalytic struct {
	TotalHit   int64 `gorm:"column:total_hit" json:"total_hit"`
	TotalUniq  int64 `gorm:"column:total_uniq" json:"total_uniq"`
	TotalDeny  int64 `gorm:"column:total_deny" json:"total_deny"`
	TotalAllow int64 `gorm:"column:total_allow" json:"total_allow"`
}

func Overview30Day(id interface{}) OverviewAnalytic {
	statement := fmt.Sprintf(`
	SELECT sum(total_hit) as total_hit, sum(total_uniq) as total_uniq, sum(total_deny) as total_deny, sum(total_allow) as total_allow
	FROM total_daily_restrictions
	WHERE restriction_id = %v
	AND date >= (CURRENT_DATE - 30)
	AND date < CURRENT_DATE
	`, id)

	var result OverviewAnalytic
	db.Raw(statement).First(&result)
	return result
}
