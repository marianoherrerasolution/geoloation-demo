package model

import (
	"strings"
)

const (
	TableAdmin = "admins"
)

type Admin struct {
	User
	Role string `gorm:"column:role" json:"role" body:"role" query:"role" form:"role"`
}

func (u *Admin) TableName() string {
	return TableAdmin
}

func (u *Admin) ValidID() bool {
	return u.ID > 0
}

func (u *Admin) ValidateEmptyField() string {
	if strings.Trim(u.FirstName, " ") == "" {
		return "fname"
	}

	if strings.Trim(u.LastName, " ") == "" {
		return "lname"
	}

	if strings.Trim(u.Email, " ") == "" {
		return "email"
	}

	if strings.Trim(u.Password, " ") == "" {
		return "password"
	}

	return ""
}
