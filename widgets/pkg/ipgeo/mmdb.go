package ipgeo

import (
	"fmt"
	"net"

	"github.com/oschwald/geoip2-golang"
)

// ReadMMDB file from db-ip.com
func ReadMMDB(ip string) (GeoLocation, *geoip2.City, error) {
	var result GeoLocation
	var city *geoip2.City
	db, err := geoip2.Open("dbip-city.mmdb")
	if err != nil {
		return result, city, err
	}
	defer db.Close()

	ipaddress := net.ParseIP(ip)
	record, err := db.City(ipaddress)
	if err != nil {
		return result, record, err
	}

	return GeoLocation{
		CountryName: record.Country.Names["en"],
		City:        record.City.Names["en"],
		Zipcode:     record.Postal.Code,
		Latitude:    fmt.Sprintf("%v", record.Location.Latitude),
		Longitude:   fmt.Sprintf("%v", record.Location.Longitude),
	}, record, nil
}
