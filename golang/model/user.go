package model

const (
	TableUser = "tbl_user"
)

type User struct {
	ID        uint   `gorm:"primaryKey;column:id" json:"id" body:"id" query:"id" form:"id"`
	FirstName string `gorm:"column:fName" json:"fname" body:"fname" query:"fname" form:"fname"`
	LastName  string `gorm:"column:lName" json:"lname" body:"lname" query:"lname" form:"lname"`
	Password  string `gorm:"column:password" json:"password" body:"password" query:"password" form:"password"`
	Email     string `gorm:"column:email" json:"email" body:"email" query:"email" form:"email"`
}

func (u *User) TableName() string {
	return TableUser
}

func (u *User) ValidID() bool {
	return u.ID > 0
}
