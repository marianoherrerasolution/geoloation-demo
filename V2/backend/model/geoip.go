package model

const (
	TableGeoIP = "geoips"
)

type GeoIP struct {
	ID             uint    `gorm:"primaryKey;column:id" json:"id" body:"id" query:"id" form:"id"`
	IPAddress      string  `gorm:"column:ip_address" json:"ip_address" body:"ip_address" query:"ip_address" form:"ip_address"`
	Latitude       float64 `gorm:"column:latitude" json:"latitude" body:"latitude" query:"latitude" form:"latitude"`
	Longitude      float64 `gorm:"column:longitude" json:"longitude" body:"longitude" query:"longitude" form:"longitude"`
	City           string  `gorm:"column:city" json:"city" body:"city" query:"city" form:"city"`
	State          string  `gorm:"column:state" json:"state" body:"state" query:"state" form:"state"`
	Country        string  `gorm:"column:country" json:"country" body:"country" query:"country" form:"country"`
	CountryCode    string  `gorm:"column:country_code" json:"country_code" body:"country_code" query:"country_code" form:"country_code"`
	ISP            string  `gorm:"column:isp" json:"isp" body:"isp" query:"isp" form:"isp"`
	ConnectionType string  `gorm:"column:connection_type" json:"connection_type" body:"connection_type" query:"connection_type" form:"connection_type"`
	Organization   string  `gorm:"column:organization" json:"organization" body:"organization" query:"organization" form:"organization"`
	Timezone       string  `gorm:"column:timezone" json:"timezone" body:"timezone" query:"timezone" form:"timezone"`
	TimezoneOffset string  `gorm:"column:timezone_offset" json:"timezone_offset" body:"timezone_offset" query:"timezone_offset" form:"timezone_offset"`
	Currency       string  `gorm:"column:currency" json:"currency" body:"currency" query:"currency" form:"currency"`
	CurrencySymbol string  `gorm:"column:currency_symbol" json:"currency_symbol" body:"currency_symbol" query:"currency_symbol" form:"currency_symbol"`
}

func (u *GeoIP) TableName() string {
	return TableGeoIP
}

func (u *GeoIP) ValidID() bool {
	return u.ID > 0
}
