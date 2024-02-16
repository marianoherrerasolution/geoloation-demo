package clientsapi

import (
	"geonius/api"
	"geonius/model"

	"github.com/valyala/fasthttp"
)

// Select clients
// @summary Client Select
// @id list
// @tag clients
// @success 200 {object}
// @Router /clients/select [get]
func Select(ctx *fasthttp.RequestCtx) {
	var records []struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	}
	api.RecordsForSelect(model.TableClient, []string{"id", "company"}, "company ASC", &records, ctx)
}
