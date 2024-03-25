package model

import (
	"errors"
	"time"

	"gorm.io/gorm"
)

type BaseWARNING struct {
	ID        uint      `gorm:"primaryKey;column:id" json:"id"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt time.Time `gorm:"column:deleted_at;index" json:"deleted_at"`
}

func (b *BaseWARNING) BeforeCreate(tx *gorm.DB) error {
	return errors.New("create is not allowed")
}

func (b *BaseWARNING) BeforeUpdate(tx *gorm.DB) error {
	return errors.New("update is not allowed")
}

func (b *BaseWARNING) BeforeDelete(tx *gorm.DB) error {
	return errors.New("delete is not allowed")
}
