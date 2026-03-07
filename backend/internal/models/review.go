package models

import (
	"time"

	"github.com/google/uuid"
)

type Review struct {
	ID           uuid.UUID `db:"id" json:"id"`
	UserID       uuid.UUID `db:"user_id" json:"user_id"`
	RestaurantID uuid.UUID `db:"restaurant_id" json:"restaurant_id"`
	Rating       int       `db:"rating" json:"rating"`
	Comment      *string   `db:"comment" json:"comment"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type CreateReviewRequest struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment"`
}
