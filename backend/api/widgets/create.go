package widgetsapi

import (
	"fmt"
	"geonius/api"
	"geonius/model"
	"geonius/pkg/encrypt"
	"strconv"

	"github.com/valyala/fasthttp"
)

// Create widget data
// @summary Widget Create
// @id	create
// @tag widget
// @success 204 {object}
// @Router /widgets/ [post]
func Create(ctx *fasthttp.RequestCtx) {
	params := PrepareParamsBody(ctx)
	if field := params.ValidateEmptyField(); field != "" {
		api.UnprocessibleError(ctx, api.ErrorConfig{
			Error: "empty",
			Field: field,
		})
		return
	}
	if params.Token == "" {
		params.Token = fmt.Sprintf("%s%s%s", encrypt.GenerateToken(), encrypt.GenerateToken(), encrypt.GenerateToken())
	}

	params.CreatorType = fmt.Sprintf("%v", ctx.UserValue("userType"))
	userID, _ := strconv.Atoi(fmt.Sprintf("%v", ctx.UserValue("userID")))
	params.CreatorID = uint(userID)

	api.CreateRecord(&params, model.TableWidget, ctx)
}
