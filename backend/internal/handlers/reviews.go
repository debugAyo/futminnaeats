package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/debugAyo/futminnaeats/backend/internal/database"
	"github.com/debugAyo/futminnaeats/backend/internal/middleware"
	"github.com/debugAyo/futminnaeats/backend/internal/models"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type ReviewHandler struct {
	db *database.DB
}

func NewReviewHandler(db *database.DB) *ReviewHandler {
	return &ReviewHandler{db: db}
}

func (h *ReviewHandler) ListReviews(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	restaurantID, err := uuid.Parse(idStr)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid restaurant id"})
		return
	}

	rows, err := h.db.Pool.Query(r.Context(),
		`SELECT id, user_id, restaurant_id, rating, comment, created_at
		 FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC`, restaurantID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch reviews"})
		return
	}
	defer rows.Close()

	var reviews []models.Review
	for rows.Next() {
		var review models.Review
		err := rows.Scan(&review.ID, &review.UserID, &review.RestaurantID, &review.Rating,
			&review.Comment, &review.CreatedAt)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "failed to scan reviews"})
			return
		}
		reviews = append(reviews, review)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data":  reviews,
		"count": len(reviews),
	})
}

func (h *ReviewHandler) SubmitReview(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	idStr := chi.URLParam(r, "id")
	restaurantID, err := uuid.Parse(idStr)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid restaurant id"})
		return
	}

	var req models.CreateReviewRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	if req.Rating < 1 || req.Rating > 5 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "rating must be between 1 and 5"})
		return
	}

	review := models.Review{
		ID:           uuid.New(),
		UserID:       userID,
		RestaurantID: restaurantID,
		Rating:       req.Rating,
	}

	if req.Comment != "" {
		review.Comment = &req.Comment
	}

	_, err = h.db.Pool.Exec(r.Context(),
		`INSERT INTO reviews (id, user_id, restaurant_id, rating, comment)
		 VALUES ($1, $2, $3, $4, $5)`,
		review.ID, review.UserID, review.RestaurantID, review.Rating, review.Comment)

	if err != nil {
		// Check if it's a unique constraint violation (user already reviewed this restaurant)
		if err.Error() == "ERROR: duplicate key value violates unique constraint \"reviews_user_id_restaurant_id_key\" (SQLSTATE 23505)" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusConflict)
			json.NewEncoder(w).Encode(map[string]string{"error": "you have already reviewed this restaurant"})
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to submit review"})
		return
	}

	// Fetch created_at
	err = h.db.Pool.QueryRow(r.Context(),
		`SELECT created_at FROM reviews WHERE id = $1`, review.ID).Scan(&review.CreatedAt)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch review"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"data": review})
}
