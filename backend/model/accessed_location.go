package model

const (
	TableAccessedLocation = "accessed_locations"
)

type AccessedLocation struct {
	GID       int     `gorm:"primaryKey;column:gid" json:"gid"`
	City      string  `json:"city" gorm:"column:city;index:idx_accloc_keyword,priority:3"`
	Country   string  `json:"country" gorm:"column:country;index:idx_accloc_keyword,priority:2"`
	ZipCode   string  `json:"zip_code" gorm:"column:zipcode"`
	Latitude  float64 `json:"lat" gorm:"column:lat"`
	Longitude float64 `json:"lon" gorm:"column:lon"`
	Ipaddress string  `json:"ip" gorm:"column:ip;index:idx_accloc_ip;index:idx_accloc_keyword,priority:1"`
	Datetime  string  `json:"datetime" form:"datetime" gorm:"column:datetime"`
}

func (u *AccessedLocation) TableName() string {
	return TableAccessedLocation
}

func (u *AccessedLocation) ValidID() bool {
	return u.GID > 0
}
