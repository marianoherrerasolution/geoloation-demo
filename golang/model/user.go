package model

const (
	TableUser = "tbl_user"
)

type User struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id" body:"id" query:"id" form:"id"`
	FirstName string `gorm:"column:fName" json:"fName" body:"fName" query:"fName" form:"fName"`
	LastName  string `gorm:"column:lName" json:"lName" body:"lName" query:"lName" form:"lName"`
	Email     string `gorm:"column:email" json:"email" body:"email" query:"email" form:"email"`
	Password  string `gorm:"column:password" json:"password" body:"password" query:"password" form:"password"`
}

func (u *User) TableName() string {
	return TableUser
}

func (u *User) ValidID() bool {
	return u.ID > 0
}
