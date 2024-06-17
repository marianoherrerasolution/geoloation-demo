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

type DetectParam struct {
	IP       string `json:"ip" body:"ip" query:"ip"`
	Timezone string `json:"tz" body:"tz" query:"tz"`
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
	body := ctx.PostBody()
	var params DetectParam
	json.Unmarshal(body, &params)

	if params.IP == "" {
		params.IP = ctx.RemoteIP().String()
	}

	info, err := ipgeo.LookupV2(params.IP)
	if err != nil {
		api.InternalError(ctx)
		return
	}

	resp := DetectResp{
		IP:      params.IP,
		Address: info,
		Result: Validation{
			Real:      params.Timezone,
			Simulated: info.Timezone.Name,
			Result:    strings.EqualFold(params.Timezone, info.Timezone.Name),
		},
	}
	respBytes, _ := json.Marshal(resp)
	ctx.Success("application/json", respBytes)
}
