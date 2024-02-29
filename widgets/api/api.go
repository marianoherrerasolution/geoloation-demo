package api

import (
	// "widgetz/config"
	"fmt"
	"widgetz/dal"
	"widgetz/model"
	"widgetz/pkg/ipgeo"

	"github.com/valyala/fasthttp"
)

type Payload struct {
	Token  string
	Ctx    *fasthttp.RequestCtx
	Geo    ipgeo.GeoLocation
	Widget model.Widget
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
	tx.Select("id, networks, allow, client_id, product_id").Find(&restrictions)

	ctx.SetContentType("application/json")
	if len(restrictions) < 1 {
		ctx.SetStatusCode(403)
		ctx.SetBody([]byte("{\"allow\": false}"))
		return
	}

	disallow := false
	for _, restriction := range restrictions {
		allow := 1
		if restriction.IsDisllowed() {
			disallow = true
			allow = 2
		}

		dal.Create(&model.WidgetUsage{
			ClientID:      restriction.ClientID,
			RestrictionID: restriction.ID,
			ProductID:     restriction.ProductID,
			Allow:         int16(allow),
			Point:         fmt.Sprintf("POINT(%s %s)", payload.Geo.Longitude, payload.Geo.Latitude),
			Latitude:      payload.Geo.LatFloat(),
			Longitude:     payload.Geo.LonFloat(),
		})
	}

	if disallow {
		ctx.SetStatusCode(403)
		ctx.SetBody([]byte("{\"allow\": false}"))
	} else {
		ctx.SetStatusCode(200)
		ctx.SetBody([]byte("{\"allow\": true}"))
	}
}

func (p *Payload) Validate() bool {
	token := string(p.Ctx.QueryArgs().Peek("token"))
	if token == "" {
		return p.Unauthorized()
	}

	if tx := dal.Where("token = ? AND active = 1", token).First(&p.Widget); tx.Error != nil {
		return p.Unauthorized()
	}

	return true
}

func (p *Payload) GetCoordinate() bool {
	geo, err := ipgeo.Lookup(p.Ctx.RemoteIP().String())
	if err != nil {
		return p.BadRequest()
	}
	p.Geo = geo
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
