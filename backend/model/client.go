package model

import "gorm.io/gorm"

const (
	TableClient = "clients"
)

type Client struct {
	gorm.Model
	Company string `gorm:"column:company;index:idx_client_keyword,priority:1" json:"company" body:"company" query:"company" form:"company"`
	Website string `gorm:"column:website;index:idx_client_keyword,priority:2" json:"website" body:"website" query:"website" form:"website"`
}

func (u *Client) TableName() string {
	return TableClient
}

func (u *Client) ValidID() bool {
	return u.ID > 0
}
