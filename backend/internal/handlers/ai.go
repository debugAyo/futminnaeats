package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/debugAyo/futminnaeats/backend/internal/database"
	"github.com/debugAyo/futminnaeats/backend/internal/middleware"
	"github.com/debugAyo/futminnaeats/backend/internal/services"
)

type AIHandler struct {
	db       *database.DB
	gemini   *services.GeminiService
}

func NewAIHandler(db *database.DB, gemini *services.GeminiService) *AIHandler {
	return &AIHandler{
		db:     db,
		gemini: gemini,
	}
}

func (h *AIHandler) Recommend(w http.ResponseWriter, r *http.Request) {
	_ = middleware.GetUserID(r) // Verify user is authenticated

	var req struct {
		Query  string `json:"query"`
		Campus string `json:"campus"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request body"})
		return
	}

	if req.Query == "" || req.Campus == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "query and campus are required"})
		return
	}

	recommendation, err := h.gemini.Recommend(r.Context(), req.Query, req.Campus)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to generate recommendation"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": map[string]string{
			"recommendation": recommendation,
		},
	})
}
