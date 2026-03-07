package models

import (
	"time"

	"github.com/google/uuid"
)

type Restaurant struct {
	ID             uuid.UUID `db:"id" json:"id"`
	Name           string    `db:"name" json:"name"`
	Description    *string   `db:"description" json:"description"`
	Campus         string    `db:"campus" json:"campus"`
	Address        *string   `db:"address" json:"address"`
	Latitude       *float64  `db:"latitude" json:"latitude"`
	Longitude      *float64  `db:"longitude" json:"longitude"`
	WhatsappNumber *string   `db:"whatsapp_number" json:"whatsapp_number"`
	Email          *string   `db:"email" json:"email"`
	ImageURL       *string   `db:"image_url" json:"image_url"`
	IsOpen         bool      `db:"is_open" json:"is_open"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	AvgRating      *float64  `json:"avg_rating,omitempty"`
	ReviewCount    int       `json:"review_count,omitempty"`
}

type RestaurantWithMenu struct {
	*Restaurant
	MenuItems []MenuItem `json:"menu_items,omitempty"`
}
