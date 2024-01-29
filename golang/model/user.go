package model

const (
	TableUser = "users"
)

type User struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id" body:"id" query:"id" form:"id"`
	FirstName string `gorm:"column:fname" json:"fName" body:"fName" query:"fName" form:"fName"`
	LastName  string `gorm:"column:lname" json:"lName" body:"lName" query:"lName" form:"lName"`
	Email     string `gorm:"column:email" json:"email" body:"email" query:"email" form:"email"`
	Password  string `gorm:"column:password" json:"password" body:"password" query:"password" form:"password"`
}

func (u *User) TableName() string {
	return TableUser
}

func (u *User) ValidID() bool {
	return u.ID > 0
}
