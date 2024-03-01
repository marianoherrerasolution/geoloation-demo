package ipgeo

import (
	"crypto/tls"
	"encoding/json"
	"strconv"
	"widgetz/config/env"

	"github.com/imroc/req/v3"
)

const (
	GEOURL = "https://api.ipgeolocation.io/ipgeo"
)

type GeoCurrency struct {
	Code   string `json:"code"`
	Name   string `json:"name"`
	Symbol string `json:"symbol"`
}

type GeoTimezone struct {
	Name            string  `json:"name"`
	Offset          int     `json:"offset"`
	OffsetDST       int     `json:"offset_with_dst"`
	CurrentTime     string  `json:"current_time"`
	CurrentTimeUnix float64 `json:"current_time_unix"`
	IsDST           bool    `json:"is_dst"`
	DSTSaving       int     `json:"dst_savings"`
}

type GeoLocation struct {
	IP                  string      `json:"ip"`
	ContinentCode       string      `json:"continent_code"`
	ContinentName       string      `json:"continent_name"`
	CountryCode2        string      `json:"country_code2"`
	CountryCode3        string      `json:"country_code3"`
	CountryName         string      `json:"country_name"`
	CountryNameOfficial string      `json:"country_name_official"`
	CountryCapital      string      `json:"country_capital"`
	StateProv           string      `json:"state_prov"`
	StateCode           string      `json:"state_code"`
	District            string      `json:"district"`
	City                string      `json:"city"`
	Zipcode             string      `json:"zipcode"`
	Latitude            string      `json:"latitude"`
	Longitude           string      `json:"longitude"`
	IsEU                bool        `json:"is_eu"`
	CallingCode         string      `json:"calling_code"`
	CountryTLD          string      `json:"country_tld"`
	Languages           string      `json:"languages"`
	CountryFlag         string      `json:"country_flag"`
	GeonameID           string      `json:"geoname_id"`
	ISP                 string      `json:"isp"`
	ConnectionType      string      `json:"connection_type"`
	Organization        string      `json:"organization"`
	Currency            GeoCurrency `json:"currency"`
	Timezone            GeoTimezone `json:"time_zone"`
}

func (p GeoLocation) LatFloat() float64 {
	lat, _ := strconv.ParseFloat(p.Latitude, 64)
	return lat
}

func (p GeoLocation) LonFloat() float64 {
	lon, _ := strconv.ParseFloat(p.Longitude, 64)
	return lon
}

// Request() to initialize new request
func Request() *req.Request {
	client := req.C().SetTLSClientConfig(&tls.Config{InsecureSkipVerify: true})
	return client.R().DisableAutoReadResponse().DisableTrace()
}

// Lookup() requests api to detail information by ip-address
func Lookup(ipaddress string) (GeoLocation, error) {
	var info GeoLocation

	if info, err := ReadLocal(ipaddress); err == nil {
		return info, nil
	}

	resp, err := Request().
		SetQueryParams(map[string]string{
			"apiKey": env.Vars.GEOAPI_KEY,
			"ip":     ipaddress,
		}).
		Get(GEOURL)

	if err != nil || resp.IsErrorState() {
		return info, err
	}

	body, err := resp.ToString()
	if err != nil {
		return info, err
	}

	jsonByte := json.RawMessage(body)
	if err := json.Unmarshal(jsonByte, &info); err != nil {
		return info, err
	}

	// convert timezone into minute
	info.Timezone.Offset = info.Timezone.Offset * 60

	return info, nil
}
