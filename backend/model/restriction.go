package model

import (
	"strings"
)

const (
	TableRestriction = "restrictions"
)

type Restriction struct {
	Base
	Name       string  `gorm:"column:name;index:idx_restr_keyword,priority:1" json:"name"`
	Polygon    string  `gorm:"column:polygon;type:geometry;index:idx_restr_polygon" json:"polygon,omitempty"`
	Active     int16   `gorm:"column:active;index:idx_restr_active" json:"active"`
	Allow      int16   `gorm:"column:allow;index:idx_restr_allow" json:"allow"`
	Networks   string  `gorm:"column:networks;index:idx_restr_keyword,priority:2" json:"networks"`
	ClientID   uint    `gorm:"column:client_id;index:idx_restr_client_id" json:"client_id"`
	ProductID  uint    `gorm:"column:product_id;index:idx_restr_product_id" json:"product_id"`
	Address    string  `gorm:"column:address;index:idx_restr_keyword,priority:3" json:"address"`
	AddressLat float64 `gorm:"column:address_lat" json:"address_lat"`
	AddressLon float64 `gorm:"column:address_lon" json:"address_lon"`
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

func (u *Restriction) ValidID() bool {
	return u.ID > 0
}

func (u *Restriction) GEOMToCoordinates() string {
	if u.Polygon == "" {
		return ""
	}
	return ""
}

func (u *RestrictionWithCoordinates) ValidateEmptyField() string {
	if u.ClientID < 1 {
		return "client_id"
	}
	if u.ProductID < 1 && u.Networks == "" {
		return "product_id,networks"
	}
	if strings.TrimSpace(u.Name) == "" {
		return "name"
	}
	if strings.TrimSpace(u.PolygonCoordinates) == "" {
		return "polygon"
	}
	return ""
}

// CoordinatesToGEOM to convert [[lon,lat], [lon2,lat2]] to be ((lon lat), (lon2 lat2))
func (u *RestrictionWithCoordinates) CoordinatesToGEOM() string {
	txt := strings.ReplaceAll(u.PolygonCoordinates, ",", " ")
	txt = strings.ReplaceAll(txt, "] [", ",")
	txt = strings.ReplaceAll(txt, "]]", "))")
	txt = strings.ReplaceAll(txt, "[[", "((")
	return txt
}
