package model

import (
	"time"

	"gorm.io/gorm"
)

type Base struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt time.Time `gorm:"column:deleted_at;index" json:"deleted_at"`
}

func (b *Base) BeforeCreate(tx *gorm.DB) error {
	if b.CreatedAt.IsZero() {
		b.CreatedAt = time.Now().UTC()
		b.UpdatedAt = time.Now().UTC()
	}
	return nil
}

func (b *Base) BeforeUpdate(tx *gorm.DB) error {
	b.UpdatedAt = time.Now().UTC()
	return nil
}

func (b *Base) BeforeDelete(tx *gorm.DB) error {
	b.DeletedAt = time.Now().UTC()
	return nil
}
