package model

import (
	"time"
)

type Base struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id" body:"id" query:"id" form:"id"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at" body:"created_at" query:"created_at" form:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at" body:"updated_at" query:"updated_at" form:"updated_at"`
	DeletedAt time.Time `gorm:"column:deleted_at;index" json:"deleted_at" body:"deleted_at" query:"deleted_at" form:"deleted_at"`
}

func (b *Base) BeforeCreate() {
	b.CreatedAt = time.Now()
	b.UpdatedAt = time.Now()
}

func (b *Base) BeforeUpdate() {
	b.UpdatedAt = time.Now()
}

func (b *Base) BeforeDelete() {
	b.DeletedAt = time.Now()
}
