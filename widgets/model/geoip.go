package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

const (
	TableGeoIP = "geoips"
)

type GeoIP struct {
	Base
	IPAddress      string  `gorm:"column:ip_address;index:idx_geoip_ip;index:idx_geoip_keyword,priority:1" json:"ip_address"`
	Latitude       float64 `gorm:"column:latitude" json:"latitude"`
	Longitude      float64 `gorm:"column:longitude" json:"longitude"`
	City           string  `gorm:"column:city;index:idx_geoip_keyword,priority:4" json:"city"`
	State          string  `gorm:"column:state;index:idx_geoip_keyword,priority:3" json:"state"`
	Country        string  `gorm:"column:country;index:idx_geoip_keyword,priority:2" json:"country"`
	CountryCode    string  `gorm:"column:country_code" json:"country_code"`
	Zipcode        string  `gorm:"column:zipcode" json:"zipcode"`
	ISP            string  `gorm:"column:isp" json:"isp"`
	ConnectionType string  `gorm:"column:connection_type" json:"connection_type"`
	Organization   string  `gorm:"column:organization" json:"organization"`
	Timezone       string  `gorm:"column:timezone;index:idx_geoip_keyword,priority:5" json:"timezone"`
	TimezoneOffset int     `gorm:"column:timezone_offset" json:"timezone_offset"`
	Currency       string  `gorm:"column:currency" json:"currency"`
	CurrencySymbol string  `gorm:"column:currency_symbol" json:"currency_symbol"`
	Raw            JSONB   `gorm:"column:raw;type:jsonb" json:"-"`
}

type JSONB map[string]interface{}

// Value implements the driver.Valuer interface for JSONB type
func (j JSONB) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan implements the sql.Scanner interface for JSONB type
func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = make(JSONB)
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, j)
	case string:
		return json.Unmarshal([]byte(v), j)
	default:
		return fmt.Errorf("unsupported Scan, storing driver.Value type %T into type JSONB", value)
	}
}

func (u *GeoIP) TableName() string {
	return TableGeoIP
}

func (u *GeoIP) ValidID() bool {
	return u.ID > 0
}
