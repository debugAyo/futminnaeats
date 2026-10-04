package router

import (
	"github.com/go-chi/chi/v5"
	"github.com/debugAyo/futminnaeats/backend/internal/database"
	"github.com/debugAyo/futminnaeats/backend/internal/handlers"
	"github.com/debugAyo/futminnaeats/backend/internal/middleware"
	"github.com/debugAyo/futminnaeats/backend/internal/services"
	"net/http"
)

func New(db *database.DB, jwtSecret, projectRef, serviceRoleKey, geminiKey, frontendURL string) *chi.Mux {
	router := chi.NewRouter()

	// Global middleware
	router.Use(middleware.CORS(frontendURL))
	router.Use(middleware.Logger)

	// Health check (public)
	router.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// API v1 routes
	router.Route("/api/v1", func(r chi.Router) {
		// Users/Profiles (protected)
		userHandler := handlers.NewUserHandler(db, services.NewStorageService(db, projectRef, serviceRoleKey))
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(jwtSecret))
			r.Get("/users/me", userHandler.GetProfile)
			r.Post("/users/me", userHandler.CreateProfile)
			r.Put("/users/me", userHandler.UpdateProfile)
			r.Post("/users/me/avatar", userHandler.UploadAvatar)
			r.Delete("/users/me/avatar", userHandler.DeleteAvatar)
			r.Get("/users/me/orders", userHandler.GetMyOrders)
		})

		// Restaurants (public)
		restaurantService := services.NewRestaurantService(db)
		restaurantHandler := handlers.NewRestaurantHandler(db, restaurantService)
		r.Get("/restaurants", restaurantHandler.ListRestaurants)
		r.Get("/restaurants/{id}", restaurantHandler.GetRestaurant)
		r.Get("/restaurants/{id}/menu", restaurantHandler.GetMenu)

		// Orders (protected)
		orderService := services.NewOrderService(db)
		orderHandler := handlers.NewOrderHandler(db, orderService)
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(jwtSecret))
			r.Post("/orders", orderHandler.CreateOrder)
			r.Get("/orders/{id}", orderHandler.GetOrder)
			r.Patch("/orders/{id}/status", orderHandler.UpdateOrderStatus)
		})

		// Reviews (mixed)
		reviewHandler := handlers.NewReviewHandler(db)
		r.Get("/restaurants/{id}/reviews", reviewHandler.ListReviews)
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(jwtSecret))
			r.Post("/restaurants/{id}/reviews", reviewHandler.SubmitReview)
		})

		// AI (protected)
		aiHandler := handlers.NewAIHandler(db, services.NewGeminiService(geminiKey))
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(jwtSecret))
			r.Post("/ai/recommend", aiHandler.Recommend)
		})
	})

	return router
}
