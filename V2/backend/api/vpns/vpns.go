package vpnsapi

import (
	"encoding/json"
	"errors"
	"geonius/api"
	"geonius/database"
	"geonius/model"
	"geonius/pkg/ipgeo"
	"strconv"
	"strings"

	"github.com/valyala/fasthttp"
	"gorm.io/gorm"
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

	info, err := ipgeo.Lookup(params.IP)
	if err != nil {
		api.InternalError(ctx)
		return
	}

	if params.IP != "127.0.0.1" {
		var geoip model.GeoIP
		tx := database.Pg.Where("ip_address = ?", params.IP).First(&geoip)
		if tx.Error != nil && errors.Is(tx.Error, gorm.ErrRecordNotFound) {
			lat, _ := strconv.ParseFloat(strings.TrimSpace(info.Latitude), 64)
			lon, _ := strconv.ParseFloat(strings.TrimSpace(info.Longitude), 64)
			database.Pg.Create(&model.GeoIP{
				IPAddress:      params.IP,
				City:           info.City,
				Country:        info.CountryName,
				CountryCode:    info.CountryCode2,
				Zipcode:        info.Zipcode,
				State:          info.StateProv,
				Latitude:       lat,
				Longitude:      lon,
				ISP:            info.ISP,
				Organization:   info.Organization,
				ConnectionType: info.ConnectionType,
				Timezone:       info.Timezone.Name,
				TimezoneOffset: info.Timezone.Offset,
				Currency:       info.Currency.Name,
				CurrencySymbol: info.Currency.Symbol,
			})
		}
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
