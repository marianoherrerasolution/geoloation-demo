package model

const (
	TableAccessedLocation = "accessed_locations"
)

type AccessedLocation struct {
	GID       int     `gorm:"primaryKey;column:gid" json:"id" body:"gid" form:"gid"`
	City      string  `json:"city" body:"city" form:"city" gorm:"column:city"`
	Country   string  `json:"country" body:"country" form:"country" gorm:"column:country"`
	ZipCode   string  `json:"zip_code" body:"zip_code" form:"zip_code" gorm:"column:zipcode"`
	Latitude  float64 `json:"lat" body:"lat" form:"lat" gorm:"column:lat"`
	Longitude float64 `json:"lon" body:"lon" form:"lon" gorm:"column:lon"`
	Ipaddress string  `json:"ip" body:"ip" form:"ip" gorm:"column:ip;index:idx_accloc_ip"`
	Datetime  string  `json:"datetime" body:"datetime" form:"datetime" gorm:"column:datetime"`
}

func (u *AccessedLocation) TableName() string {
	return TableAccessedLocation
}

func (u *AccessedLocation) ValidID() bool {
	return u.GID > 0
}
