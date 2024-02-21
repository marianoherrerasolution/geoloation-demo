package model

import (
	"strings"
)

const (
	TableUser = "users"
)

type User struct {
	Base
	FirstName string `gorm:"column:fname;index:idx_user_keyword,priority:1" json:"fName"`
	LastName  string `gorm:"column:lname;index:idx_user_keyword,priority:2" json:"lName"`
	Email     string `gorm:"column:email;index:idx_user_keyword,priority:3" json:"email"`
	Password  string `gorm:"column:password" json:"password,omitempty"`
}

func (u *User) TableName() string {
	return TableUser
}

func (u *User) ValidID() bool {
	return u.ID > 0
}

func (u *User) ValidateEmptyField() string {
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
