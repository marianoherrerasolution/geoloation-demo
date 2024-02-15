package profileapi

import (
	"geonius/api"
	"geonius/database"
	"geonius/model"
	"strconv"
	"strings"

	"github.com/valyala/fasthttp"
)

// Show geoip detail
// @summary GeoIP Info
// @id	show
// @tag geoip
// @success 200 {object}
// @Router /profile [get]
func Show(ctx *fasthttp.RequestCtx) {
	if profile := FindByID(ctx); profile.ValidID() {
		api.SuccessJSON(ctx, profile)
	}
}

func FindByID(ctx *fasthttp.RequestCtx) *model.User {
	authTxt := string(ctx.Request.Header.Peek("Authorization"))
	bearer := strings.Replace(authTxt, "Bearer ", "", -1)
	tokens := strings.Split(bearer, ".")
	userID, _ := strconv.Atoi(tokens[2])

	user := &model.User{}
	if tx := database.Pg.Where("id = ?", userID).First(user); tx.Error != nil {
		api.NotFoundError(ctx)
	}
	return user
}
