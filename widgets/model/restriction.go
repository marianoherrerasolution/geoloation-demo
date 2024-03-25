package model

const (
	TableRestriction = "restrictions"
)

type Restriction struct {
	BaseWARNING
	Name       string  `gorm:"column:name;index:idx_restr_keyword,priority:1" json:"name"`
	Polygon    string  `gorm:"column:polygon;type:geometry;index:idx_restr_polygon" json:"polygon,omitempty"`
	Active     int16   `gorm:"column:active;index:idx_restr_active" json:"active"`
	Allow      int16   `gorm:"column:allow;index:idx_restr_allow" json:"allow"`
	VPN        int16   `gorm:"column:vpn;index:idx_restr_vpn" json:"vpn"`
	Networks   string  `gorm:"column:networks;index:idx_restr_keyword,priority:2" json:"networks"`
	ClientID   uint    `gorm:"column:client_id;index:idx_restr_client_id" json:"client_id"`
	ProductID  uint    `gorm:"column:product_id;index:idx_restr_product_id" json:"product_id"`
	Address    string  `gorm:"column:address;index:idx_restr_keyword,priority:3" json:"address"`
	AddressLat float64 `gorm:"column:address_lat" json:"address_lat"`
	AddressLon float64 `gorm:"column:address_lon" json:"address_lon"`
	Offsets    string  `gorm:"column:offsets" json:"offsets"`
}

type RestrictionV2 struct {
	BaseWARNING
	Active    int16  `gorm:"column:active" json:"active"`
	Allow     int16  `gorm:"column:allow" json:"allow"`
	VPN       int16  `gorm:"column:vpn" json:"vpn"`
	Networks  string `gorm:"column:networks" json:"networks"`
	ClientID  uint   `gorm:"column:client_id" json:"client_id"`
	ProductID uint   `gorm:"column:product_id" json:"product_id"`
	Offsets   string `gorm:"column:offsets" json:"offsets"`
}

type RestrictionV3 struct {
	BaseWARNING
	Active    int16   `gorm:"column:active" json:"active"`
	Allow     int16   `gorm:"column:allow" json:"allow"`
	VPN       int16   `gorm:"column:vpn" json:"vpn"`
	Networks  string  `gorm:"column:networks" json:"networks"`
	ClientID  uint    `gorm:"column:client_id" json:"client_id"`
	ProductID uint    `gorm:"column:product_id" json:"product_id"`
	Offsets   string  `gorm:"column:offsets" json:"offsets"`
	Distance  float64 `gorm:"column:distance" json:"distance"`
}

type RestrictionWithCoordinates struct {
	Restriction
	PolygonCoordinates string `json:"polygon_coordinates,omitempty"`
}

type RestrictionClientProduct struct {
	Restriction
	ClientName  string `json:"client_name"`
	ProductName string `json:"product_name"`
}

func (u *Restriction) TableName() string {
	return TableRestriction
}

func (u *RestrictionV2) IsAllowed() bool {
	return u.Allow == 1
}

func (u *RestrictionV2) IsDisllowed() bool {
	return u.Allow != 1
}
