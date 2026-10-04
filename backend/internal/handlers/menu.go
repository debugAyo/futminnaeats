package handlers

import (
	"github.com/debugAyo/futminnaeats/backend/internal/database"
)

type MenuHandler struct {
	db *database.DB
}

func NewMenuHandler(db *database.DB) *MenuHandler {
	return &MenuHandler{db: db}
}

// Menu endpoints use RestaurantHandler's GetMenu method
// This handler is included for structural completeness
