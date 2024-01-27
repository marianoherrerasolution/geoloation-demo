package model

const (
	TableAccessedLocation = "accessed_locations"
)

type AccessedLocation struct {
	ID        uint    `gorm:"primaryKey;column:id" json:"id" body:"id" form:"id"`
	City      string  `json:"city" body:"city" form:"city" gorm:"column:city"`
	Country   string  `json:"country" body:"country" form:"country" gorm:"column:country"`
	ZipCode   string  `json:"zip_code" body:"zip_code" form:"zip_code" gorm:"column:zipcode"`
	Latitude  float64 `json:"lat" body:"lat" form:"lat" gorm:"column:lat"`
	Longitude float64 `json:"lon" body:"lon" form:"lon" gorm:"column:lon"`
	Ipaddress float64 `json:"ip" body:"ip" form:"ip" gorm:"column:ip"`
	Datetime  string  `gorm:"column:datetime"`
}

func (u *AccessedLocation) TableName() string {
	return TableAccessedLocation
}

func (u *AccessedLocation) ValidID() bool {
	return u.ID > 0
}
