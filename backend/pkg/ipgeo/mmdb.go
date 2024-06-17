package ipgeo

import (
	"fmt"
	"net"

	"github.com/oschwald/geoip2-golang"
)

// ReadMMDB file from db-ip.com
func ReadMMDB(ip string) (GeoLocation, error) {
	var result GeoLocation
	db, err := geoip2.Open("dbip-city.mmdb")
	if err != nil {
		return result, err
	}
	defer db.Close()

	ipaddress := net.ParseIP(ip)
	record, err := db.City(ipaddress)
	if err != nil {
		return result, nil
	}

	return GeoLocation{
		CountryName: record.Country.Names["en"],
		City:        record.City.Names["en"],
		Zipcode:     record.Postal.Code,
		Latitude:    fmt.Sprintf("%v", record.Location.Latitude),
		Longitude:   fmt.Sprintf("%v", record.Location.Longitude),
	}, nil
}
