package models

import (
	"time"

	"github.com/google/uuid"
)

type Profile struct {
	ID        uuid.UUID `db:"id" json:"id"`
	Name      string    `db:"name" json:"name"`
	Campus    string    `db:"campus" json:"campus"`
	Course    string    `db:"course" json:"course"`
	Level     string    `db:"level" json:"level"`
	Avatar    string    `db:"avatar" json:"avatar"`
	AvatarURL *string   `db:"avatar_url" json:"avatar_url"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
}

type CreateProfileRequest struct {
	Name   string `json:"name" binding:"required"`
	Campus string `json:"campus" binding:"required"`
	Course string `json:"course"`
	Level  string `json:"level"`
	Avatar string `json:"avatar"`
}

type UpdateProfileRequest struct {
	Name   string `json:"name"`
	Campus string `json:"campus"`
	Course string `json:"course"`
	Level  string `json:"level"`
	Avatar string `json:"avatar"`
}
