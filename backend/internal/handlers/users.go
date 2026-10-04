package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/debugAyo/futminnaeats/backend/internal/database"
	"github.com/debugAyo/futminnaeats/backend/internal/middleware"
	"github.com/debugAyo/futminnaeats/backend/internal/models"
	"github.com/debugAyo/futminnaeats/backend/internal/services"
	"github.com/jackc/pgx/v5"
)

type UserHandler struct {
	db       *database.DB
	storage  *services.StorageService
}

func NewUserHandler(db *database.DB, storage *services.StorageService) *UserHandler {
	return &UserHandler{
		db:      db,
		storage: storage,
	}
}

func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var profile models.Profile
	err := h.db.Pool.QueryRow(r.Context(),
		`SELECT id, name, campus, course, level, avatar, avatar_url, created_at, updated_at
		 FROM profiles WHERE id = $1`, userID).Scan(
		&profile.ID, &profile.Name, &profile.Campus, &profile.Course, &profile.Level,
		&profile.Avatar, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)

	if err != nil {
		if err == pgx.ErrNoRows {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "profile not found"})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch profile"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]models.Profile{"data": profile})
}

func (h *UserHandler) CreateProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req models.CreateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	// Validate required fields
	if req.Name == "" || req.Campus == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "name and campus are required"})
		return
	}

	profile := models.Profile{
		ID:     userID,
		Name:   req.Name,
		Campus: req.Campus,
		Course: req.Course,
		Level:  req.Level,
		Avatar: req.Avatar,
	}

	_, err := h.db.Pool.Exec(r.Context(),
		`INSERT INTO profiles (id, name, campus, course, level, avatar)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		profile.ID, profile.Name, profile.Campus, profile.Course, profile.Level, profile.Avatar)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to create profile"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]models.Profile{"data": profile})
}

func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	var req models.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	// Build dynamic update query
	updates := []interface{}{}
	updateCols := ""
	paramCount := 1

	if req.Name != "" {
		updateCols += fmt.Sprintf("name = $%d, ", paramCount)
		updates = append(updates, req.Name)
		paramCount++
	}
	if req.Campus != "" {
		updateCols += fmt.Sprintf("campus = $%d, ", paramCount)
		updates = append(updates, req.Campus)
		paramCount++
	}
	if req.Course != "" {
		updateCols += fmt.Sprintf("course = $%d, ", paramCount)
		updates = append(updates, req.Course)
		paramCount++
	}
	if req.Level != "" {
		updateCols += fmt.Sprintf("level = $%d, ", paramCount)
		updates = append(updates, req.Level)
		paramCount++
	}
	if req.Avatar != "" {
		updateCols += fmt.Sprintf("avatar = $%d, ", paramCount)
		updates = append(updates, req.Avatar)
		paramCount++
	}

	if updateCols == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "no fields to update"})
		return
	}

	// Add updated_at
	updateCols += fmt.Sprintf("updated_at = NOW()")
	updates = append(updates, userID)

	query := fmt.Sprintf("UPDATE profiles SET %s WHERE id = $%d", updateCols, paramCount)

	_, err := h.db.Pool.Exec(r.Context(), query, updates...)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to update profile"})
		return
	}

	// Fetch updated profile
	var profile models.Profile
	err = h.db.Pool.QueryRow(r.Context(),
		`SELECT id, name, campus, course, level, avatar, avatar_url, created_at, updated_at
		 FROM profiles WHERE id = $1`, userID).Scan(
		&profile.ID, &profile.Name, &profile.Campus, &profile.Course, &profile.Level,
		&profile.Avatar, &profile.AvatarURL, &profile.CreatedAt, &profile.UpdatedAt)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch updated profile"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]models.Profile{"data": profile})
}

func (h *UserHandler) UploadAvatar(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	if err := r.ParseMultipartForm(2 * 1024 * 1024); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid form data"})
		return
	}

	file, fileHeader, err := r.FormFile("avatar")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "missing avatar field"})
		return
	}
	defer file.Close()

	avatarURL, err := h.storage.UploadAvatar(r.Context(), userID, file, fileHeader)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]map[string]string{"data": {"avatar_url": avatarURL}})
}

func (h *UserHandler) DeleteAvatar(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	if err := h.storage.DeleteAvatar(r.Context(), userID); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNoContent)
}

func (h *UserHandler) GetMyOrders(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)

	rows, err := h.db.Pool.Query(r.Context(),
		`SELECT id, user_id, restaurant_id, status, delivery_fee, total_amount,
		        delivery_address, notes, confirmation_code, created_at, updated_at
		 FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, userID)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to fetch orders"})
		return
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var order models.Order
		err := rows.Scan(&order.ID, &order.UserID, &order.RestaurantID, &order.Status,
			&order.DeliveryFee, &order.TotalAmount, &order.DeliveryAddress, &order.Notes,
			&order.ConfirmationCode, &order.CreatedAt, &order.UpdatedAt)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "failed to scan orders"})
			return
		}
		orders = append(orders, order)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data":  orders,
		"count": len(orders),
	})
}
