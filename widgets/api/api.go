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
	Token       string
	Offset      int16
	Latitude    float64
	Longitude   float64
	IpAddress   string
	Ctx         *fasthttp.RequestCtx
	Geo         ipgeo.GeoLocation
	Widget      model.Widget
	RejectBytes []byte
	AcceptBytes []byte
}

func Scan(ctx *fasthttp.RequestCtx) {
	payload := &Payload{Ctx: ctx}
	if ok := payload.Validate(); !ok {
		return
	}

	if ok := payload.GetCoordinate(); !ok {
		return
	}
	payload.PrepareResponseBytes()
	var restrictions []model.RestrictionV2
	dal.RestrictionQueryByWidget(payload.Widget, payload.Latitude, payload.Longitude).Find(&restrictions)
	if len(restrictions) < 1 {
		payload.ScanNearby()
		return
	}

	disallow := false
	for _, restriction := range restrictions {
		allow := 1
		if restriction.IsDisllowed() {
			disallow = true
			allow = 2
		}
		widgetUsage := &model.WidgetUsage{
			ClientID:       payload.Widget.ClientID,
			RestrictionID:  0,
			ProductID:      0,
			WidgetID:       payload.Widget.ID,
			Allow:          2,
			ParamsIP:       payload.IpAddress,
			Referer:        string(ctx.Request.Header.Peek("Referer")),
			RemoteIP:       ctx.RemoteIP().String(),
			Point:          fmt.Sprintf("POINT(%g %g)", payload.Longitude, payload.Latitude),
			Latitude:       payload.Latitude,
			Longitude:      payload.Longitude,
			City:           payload.Geo.City,
			TimezoneOffset: payload.Offset,
			Country:        payload.Geo.CountryName,
			Distance:       0,
		}

		widgetUsage.ClientID = restriction.ClientID
		widgetUsage.RestrictionID = restriction.ID
		widgetUsage.ProductID = restriction.ProductID
		widgetUsage.Allow = int16(allow)
		dal.Create(widgetUsage)
	}

	payload.Respond(disallow)
}

func (p *Payload) Respond(isReject bool) {
	p.Ctx.SetStatusCode(200)
	if isReject {
		p.Ctx.SetBody(p.RejectBytes)
	} else {
		p.Ctx.SetBody(p.AcceptBytes)
	}
}

func (p *Payload) PrepareResponseBytes() {
	respReject := map[string]interface{}{
		"access":   "deny",
		"action":   p.Widget.RejectAction,
		"message":  p.Widget.RejectAlert,
		"redirect": p.Widget.RejectRedirect,
	}
	rejectBytes, _ := json.Marshal(respReject)
	p.RejectBytes = rejectBytes

	respAccept := map[string]interface{}{
		"access":   "allow",
		"action":   p.Widget.AcceptAction,
		"message":  p.Widget.AcceptAlert,
		"redirect": p.Widget.AcceptRedirect,
	}
	acceptBytes, _ := json.Marshal(respAccept)
	p.AcceptBytes = acceptBytes

	p.Ctx.SetContentType("application/json")

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

func (p *Payload) ScanNearby() {
	var restrictions []model.RestrictionV3
	referer := string(p.Ctx.Request.Header.Peek("Referer"))
	remoteIP := p.Ctx.RemoteIP().String()

	allowedRestrictionIDs := []uint{}
	tx := dal.RestrictionsByRadiusWidget(50000, p.Widget, p.Latitude, p.Longitude)
	tx.Find(&restrictions)

	for _, restriction := range restrictions {
		allow := 2
		if restriction.Allow != 1 {
			allow = 1
			allowedRestrictionIDs = append(allowedRestrictionIDs, restriction.ID)
		}

		usage := &model.WidgetUsage{
			ClientID:       restriction.ClientID,
			RestrictionID:  restriction.ID,
			ProductID:      restriction.ProductID,
			WidgetID:       p.Widget.ID,
			Allow:          int16(allow),
			ParamsIP:       p.IpAddress,
			Referer:        referer,
			RemoteIP:       remoteIP,
			Point:          fmt.Sprintf("POINT(%g %g)", p.Longitude, p.Latitude),
			Latitude:       p.Latitude,
			Longitude:      p.Longitude,
			City:           p.Geo.City,
			TimezoneOffset: p.Offset,
			Country:        p.Geo.CountryName,
			Distance:       restriction.Distance,
		}

		dal.Create(usage)
	}

	p.Respond(len(allowedRestrictionIDs) < 1)

}
