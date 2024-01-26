package geoapi

import (
	"encoding/json"
	"fmt"
	"geonius/database"
	"time"

	"github.com/valyala/fasthttp"
)

type AddLocationParams struct {
	Id        interface{} `json:"id" body:"id" form:"id" gorm:"column:id"`
	City      string      `json:"city" body:"city" form:"city" gorm:"column:city"`
	Country   string      `json:"country" body:"country" form:"country" gorm:"column:country"`
	ZipCode   string      `json:"zip_code" body:"zip_code" form:"zip_code" gorm:"column:zipcode"`
	Latitude  float64     `json:"lat" body:"lat" form:"lat" gorm:"column:lat"`
	Longitude float64     `json:"lon" body:"lon" form:"lon" gorm:"column:lon"`
	Ipaddress float64     `json:"ip" body:"ip" form:"ip" gorm:"column:ip"`
	Datetime  string      `gorm:"column:datetime"`
}

// Add accessed location
// @summary Add location
// @id	add_location
// @tag location
// @params city string
// @params country string
// @params zip_code string
// @params lon float
// @params lat float
// @params ip string
// @success 201 {object}
// @Router /addLocation [post]
func AddLocation(ctx *fasthttp.RequestCtx) {
	body := ctx.PostBody()
	var params AddLocationParams
	json.Unmarshal(body, &params)
	now := time.Now()
	params.Datetime = now.Format("2006-01-02 15:04:05")
	tx := database.Pg.Table("accessed_locations").Create(&params)

	if tx.Error != nil {
		ctx.SetStatusCode(500)
		ctx.SetContentType("application/json")
		fmt.Printf("AddLocation error %v\n", tx.Error)
		ctx.SetBody([]byte("{\"error\": \"internal server error\"}"))
	} else {
		ctx.SetStatusCode(201)
		ctx.Success("text/plain", []byte(fmt.Sprintf("Location added with ID: %v", params.Id)))
	}
}
