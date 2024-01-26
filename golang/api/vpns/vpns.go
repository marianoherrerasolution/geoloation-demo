package vpnsapi

import (
	"encoding/json"
	"fmt"
	"geonius/pkg/ipgeo"
	"time"

	"github.com/valyala/fasthttp"
)

type ResultResp struct {
	Result    bool   `json:"result"`
	Real      string `json:"real"`
	Simulated string `json:"simulated"`
}

type DetectResp struct {
	IP      string            `json:"ip"`
	Address ipgeo.GeoLocation `json:"address"`
	Result  ResultResp        `json:"res"`
}

// Detect VPN
// @summary VPN Detection
// @id detection
// @tag vpn
// @success 200 {object}
// @Router /vpn [get]
func Detect(ctx *fasthttp.RequestCtx) {
	remoteIP := ctx.RemoteIP().String()
	info, err := ipgeo.Lookup(remoteIP)
	if err != nil {
		ctx.SetStatusCode(500)
		ctx.SetContentType("application/json")
		ctx.SetBody([]byte(fmt.Sprintf("{\"error\": %s}", err.Error())))
	} else {
		serverTimezone := time.Now().Location().String()
		resp := DetectResp{
			IP:      remoteIP,
			Address: info,
			Result: ResultResp{
				Real:      serverTimezone,
				Simulated: info.Timezone.Name,
				Result:    serverTimezone == info.Timezone.Name,
			},
		}
		respBytes, _ := json.Marshal(resp)
		ctx.Success("application/json", respBytes)
	}
}
