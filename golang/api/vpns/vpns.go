package vpnsapi

import (
	"encoding/json"
	"geonius/api"
	"geonius/pkg/ipgeo"
	"strings"

	"github.com/valyala/fasthttp"
)

type Validation struct {
	Result    bool   `json:"result"`
	Real      string `json:"real"`
	Simulated string `json:"simulated"`
}

type DetectResp struct {
	IP      string            `json:"ip"`
	Address ipgeo.GeoLocation `json:"address"`
	Result  Validation        `json:"res"`
}

// Detect VPN
// @summary VPN Detection
// @id detection
// @tag vpn
// @param ip string ip address
// @param tz string timezone
// @success 200 {object}
// @Router /vpn [get]
func Detect(ctx *fasthttp.RequestCtx) {
	timezone := string(ctx.QueryArgs().Peek("tz"))
	ip := string(ctx.QueryArgs().Peek("ip"))
	info, err := ipgeo.Lookup(ip)

	if err != nil {
		api.InternalError(ctx)
	} else {
		resp := DetectResp{
			IP:      ip,
			Address: info,
			Result: Validation{
				Real:      timezone,
				Simulated: info.Timezone.Name,
				Result:    strings.EqualFold(timezone, info.Timezone.Name),
			},
		}
		respBytes, _ := json.Marshal(resp)
		ctx.Success("application/json", respBytes)
	}

}
