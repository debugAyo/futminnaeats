package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/debugAyo/futminnaeats/backend/internal/database"
	"github.com/debugAyo/futminnaeats/backend/internal/services"
)

type RestaurantHandler struct {
	db       *database.DB
	service  *services.RestaurantService
}

func NewRestaurantHandler(db *database.DB, service *services.RestaurantService) *RestaurantHandler {
	return &RestaurantHandler{
		db:      db,
		service: service,
	}
}

func (h *RestaurantHandler) ListRestaurants(w http.ResponseWriter, r *http.Request) {
	campus := r.URL.Query().Get("campus")
	search := r.URL.Query().Get("search")

	restaurants, err := h.service.ListRestaurants(r.Context(), campus, search)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch restaurants"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data":  restaurants,
		"count": len(restaurants),
	})
}

func (h *RestaurantHandler) GetRestaurant(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	restaurantID, err := uuid.Parse(idStr)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid restaurant id"})
		return
	}

	restaurant, err := h.service.GetRestaurant(r.Context(), restaurantID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "restaurant not found"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"data": restaurant})
}

func (h *RestaurantHandler) GetMenu(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	restaurantID, err := uuid.Parse(idStr)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid restaurant id"})
		return
	}

	menu, err := h.service.GetRestaurantMenu(r.Context(), restaurantID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch menu"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data":  menu,
		"count": len(menu),
	})
}
