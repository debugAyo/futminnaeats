package models

import (
	"time"

	"github.com/google/uuid"
)

type MenuItem struct {
	ID           uuid.UUID `db:"id" json:"id"`
	RestaurantID uuid.UUID `db:"restaurant_id" json:"restaurant_id"`
	Name         string    `db:"name" json:"name"`
	Description  *string   `db:"description" json:"description"`
	Price        string    `db:"price" json:"price"`
	Category     *string   `db:"category" json:"category"`
	ImageURL     *string   `db:"image_url" json:"image_url"`
	IsAvailable  bool      `db:"is_available" json:"is_available"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type CreateMenuItemRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Price       string `json:"price" binding:"required"`
	Category    string `json:"category"`
	ImageURL    string `json:"image_url"`
}
