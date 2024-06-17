package ipgeo

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"geonius/config"
	"geonius/database"
	"geonius/model"
	maxmind "geonius/pkg/maxwind"
	"strconv"
	"strings"
	"time"

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

// LookupV1() requests api through local database first
// if fail then request ipgeolocation.io
func LookupV1(ipaddress string) (GeoLocation, error) {
	var info GeoLocation

	if info, err := ReadMMDB(ipaddress); err == nil {
		return info, nil
	}

	resp, err := Request().
		SetQueryParams(map[string]string{
			"apiKey": config.Env.GEOAPI_KEY,
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

	return info, nil
}

func geoIPToGeoLocation(geoip model.GeoIP) GeoLocation {
	return GeoLocation{
		IP:                  geoip.IPAddress,
		CountryCode2:        geoip.CountryCode,
		CountryName:         geoip.Country,
		CountryNameOfficial: geoip.Country,
		StateProv:           geoip.State,
		City:                geoip.City,
		Zipcode:             geoip.Zipcode,
		Latitude:            fmt.Sprintf("%v", geoip.Latitude),
		Longitude:           fmt.Sprintf("%v", geoip.Longitude),
		ISP:                 geoip.ISP,
		ConnectionType:      geoip.ConnectionType,
		Organization:        geoip.Organization,
		Currency: GeoCurrency{
			Code:   geoip.Currency,
			Name:   geoip.Currency,
			Symbol: geoip.CurrencySymbol,
		},
		Timezone: GeoTimezone{
			Name:   geoip.Timezone,
			Offset: geoip.TimezoneOffset,
		},
	}
}

func createNewGeoIP(info GeoLocation) {
	lat, _ := strconv.ParseFloat(strings.TrimSpace(info.Latitude), 64)
	lon, _ := strconv.ParseFloat(strings.TrimSpace(info.Longitude), 64)
	database.Create(&model.GeoIP{
		IPAddress:      info.IP,
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

// LookupV2() with the following steps:
// 1. Check ip address from database to reduce limit usage, if found then return GeoLocation and error's nil
// 2. Check ip in maxmind webservice, if found then save in geoips table then return GeoLocation and error's nil
// 3. Check ip by scraping db-ip.com, if found then save in geoips table then return GeoLocation and error's nil
// 4. return empty geoLocation with error
func LookupV2(ipaddress string) (GeoLocation, error) {
	var geoip model.GeoIP
	var geoLocation GeoLocation
	isLocalIP := ipaddress == "127.0.0.1"
	if isLocalIP && ipaddress == "localhost" {
		return geoLocation, nil
	}

	tx := database.Where("ip_address = ?", ipaddress).First(&geoip)
	if tx.Error == nil {
		return geoIPToGeoLocation(geoip), nil
	}

	res, err := maxmind.City(ipaddress)

	if err != nil {
		geoLocation, err = ReadMMDB(ipaddress)
		if err != nil {
			geoLocation, err = Remote(ipaddress)
		}
		if err == nil {
			createNewGeoIP(geoLocation)
		}
		return geoLocation, err
	}

	subdivisionNames := []string{}
	subdivisionCodes := []string{}

	for _, subdiv := range res.Subdivisions {
		subdivisionNames = append(subdivisionNames, subdiv.Names.En)
		subdivisionCodes = append(subdivisionCodes, subdiv.IsoCode)
	}

	geoLocation = GeoLocation{
		IP:                  res.Traits.IPAddress,
		ContinentCode:       res.Continent.Code,
		ContinentName:       res.Continent.Names.En,
		CountryCode2:        res.Country.IsoCode,
		CountryName:         res.Country.Names.En,
		CountryNameOfficial: res.RegisteredCountry.Names.En,
		StateProv:           strings.Join(subdivisionNames, ", "),
		StateCode:           strings.Join(subdivisionCodes, ", "),
		City:                res.City.Names.En,
		Zipcode:             res.Postal.Code,
		Latitude:            fmt.Sprintf("%v", res.Location.Latitude),
		Longitude:           fmt.Sprintf("%v", res.Location.Longitude),
		IsEU:                res.Country.IsInEuropeanUnion,
		GeonameID:           fmt.Sprintf("%v", res.City.GeonameID),
		ISP:                 res.Traits.ISP,
		ConnectionType:      res.Traits.ConnectionType,
		Organization:        res.Traits.Organization,
		Timezone: GeoTimezone{
			Name:   res.Location.TimeZone,
			Offset: timezoneToOffset(res.Location.TimeZone),
		},
	}

	createNewGeoIP(geoLocation)
	return geoLocation, nil
}

func timezoneToOffset(timezone string) int {
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		return 0
	}
	_, tzOffset := time.Now().In(loc).Zone()
	return tzOffset
}
