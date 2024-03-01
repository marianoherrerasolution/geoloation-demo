package api

import (
	// "widgetz/config"
	"encoding/json"
	"fmt"
	"widgetz/dal"
	"widgetz/model"
	"widgetz/pkg/ipgeo"

	"github.com/valyala/fasthttp"
)

type Payload struct {
	Token     string
	Offset    int16
	Latitude  float64
	Longitude float64
	IpAddress string
	Ctx       *fasthttp.RequestCtx
	Geo       ipgeo.GeoLocation
	Widget    model.Widget
}

func Scan(ctx *fasthttp.RequestCtx) {
	payload := &Payload{Ctx: ctx}
	if ok := payload.Validate(); !ok {
		return
	}

	if ok := payload.GetCoordinate(); !ok {
		return
	}

	tx := dal.RestrictionQueryByWidget(payload.Widget, payload.Geo.Latitude, payload.Geo.Longitude)

	var restrictions []model.Restriction
	tx.Select("id, networks, allow, client_id, product_id, vpn").Find(&restrictions)

	respReject := map[string]interface{}{
		"access":   "deny",
		"action":   payload.Widget.RejectAction,
		"message":  payload.Widget.RejectAlert,
		"redirect": payload.Widget.RejectRedirect,
	}
	rejectBytes, _ := json.Marshal(respReject)

	widgetUsage := &model.WidgetUsage{
		ClientID:      0,
		RestrictionID: 0,
		ProductID:     0,
		Allow:         2,
		ParamsIP:      payload.IpAddress,
		Referer:       string(ctx.Request.Header.Peek("Referer")),
		RemoteIP:      ctx.RemoteIP().String(),
		Point:         fmt.Sprintf("POINT(%g %g)", payload.Longitude, payload.Latitude),
		Latitude:      payload.Latitude,
		Longitude:     payload.Longitude,
	}

	ctx.SetContentType("application/json")
	if len(restrictions) < 1 {
		ctx.SetStatusCode(403)
		dal.Create(widgetUsage)
		ctx.SetBody(rejectBytes)
		return
	}

	respAccept := map[string]interface{}{
		"access":   "allow",
		"action":   payload.Widget.AcceptAction,
		"message":  payload.Widget.AcceptAlert,
		"redirect": payload.Widget.AcceptRedirect,
	}
	acceptBytes, _ := json.Marshal(respAccept)

	disallow := false
	for _, restriction := range restrictions {
		allow := 1
		if restriction.IsDisllowed() {
			disallow = true
			allow = 2
		}
		widgetUsage.ClientID = restriction.ClientID
		widgetUsage.RestrictionID = restriction.ID
		widgetUsage.ProductID = restriction.ProductID
		widgetUsage.Allow = int16(allow)
		dal.Create(widgetUsage)
	}

	ctx.SetStatusCode(200)
	if disallow {
		ctx.SetBody(rejectBytes)
	} else {
		ctx.SetBody(acceptBytes)
	}
}

func (p *Payload) Validate() bool {
	token := string(p.Ctx.QueryArgs().Peek("token"))
	p.IpAddress = string(p.Ctx.QueryArgs().Peek("ip"))
	json.Unmarshal(p.Ctx.QueryArgs().Peek("offset"), &p.Offset)
	json.Unmarshal(p.Ctx.QueryArgs().Peek("latitude"), &p.Latitude)
	json.Unmarshal(p.Ctx.QueryArgs().Peek("longitude"), &p.Longitude)

	if token == "" {
		return p.Unauthorized()
	}

	if tx := dal.Where("token = ? AND active = 1", token).First(&p.Widget); tx.Error != nil {
		return p.Unauthorized()
	}

	return true
}

func (p *Payload) ValidLatitude() bool {
	if p.Latitude == 0 || p.Latitude > 90 || p.Latitude < -90 {
		return false
	}
	return true
}

func (p *Payload) ValidLongitude() bool {
	if p.Latitude == 0 || p.Longitude > 180 || p.Longitude < -180 {
		return false
	}
	return true
}

func (p *Payload) GetCoordinate() bool {
	// if user provides latitude and longitude then continue
	if p.ValidLatitude() && p.ValidLongitude() {
		return true
	}

	// if user provides ip address then get geolocation by its parameter
	ip := p.Ctx.RemoteIP().String()
	if p.IpAddress != "" {
		ip = p.IpAddress
	}

	geo, err := ipgeo.Lookup(ip)
	if err != nil {
		return p.BadRequest()
	}

	p.Geo = geo
	// convert string to decimal
	json.Unmarshal([]byte(geo.Latitude), &p.Latitude)
	json.Unmarshal([]byte(geo.Longitude), &p.Longitude)
	return true
}

func (p *Payload) Unauthorized() bool {
	p.Ctx.SetStatusCode(401)
	p.Ctx.SetContentType("application/json")
	p.Ctx.SetBody([]byte("{\"error\": \"unauthorize\"}"))
	return false
}

func (p *Payload) BadRequest() bool {
	p.Ctx.SetStatusCode(400)
	p.Ctx.SetContentType("application/json")
	p.Ctx.SetBody([]byte("{\"error\": \"bad_ip_address\"}"))
	return false
}
