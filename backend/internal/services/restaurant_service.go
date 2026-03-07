package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/debugAyo/futminnaeats/backend/internal/database"
	"github.com/debugAyo/futminnaeats/backend/internal/models"
)

type RestaurantService struct {
	db *database.DB
}

func NewRestaurantService(db *database.DB) *RestaurantService {
	return &RestaurantService{db: db}
}

func (s *RestaurantService) ListRestaurants(ctx context.Context, campus string, search string) ([]models.Restaurant, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	query := `SELECT r.id, r.name, r.description, r.campus, r.address, r.latitude, 
	                 r.longitude, r.whatsapp_number, r.email, r.image_url, r.is_open, r.created_at,
	                 COALESCE(AVG(rv.rating), 0) as avg_rating,
	                 COUNT(rv.id) as review_count
	          FROM restaurants r
	          LEFT JOIN reviews rv ON r.id = rv.restaurant_id
	          WHERE 1=1`

	args := []interface{}{}

	if campus != "" {
		query += " AND r.campus = $" + fmt.Sprintf("%d", len(args)+1)
		args = append(args, campus)
	}
	if search != "" {
		query += " AND (r.name ILIKE $" + fmt.Sprintf("%d", len(args)+1) + " OR r.description ILIKE $" + fmt.Sprintf("%d", len(args)+1) + ")"
		args = append(args, "%"+search+"%")
	}

	query += " GROUP BY r.id ORDER BY r.created_at DESC"

	rows, err := s.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query restaurants: %w", err)
	}
	defer rows.Close()

	var restaurants []models.Restaurant
	for rows.Next() {
		var r models.Restaurant
		err := rows.Scan(&r.ID, &r.Name, &r.Description, &r.Campus, &r.Address,
			&r.Latitude, &r.Longitude, &r.WhatsappNumber, &r.Email, &r.ImageURL,
			&r.IsOpen, &r.CreatedAt, &r.AvgRating, &r.ReviewCount)
		if err != nil {
			return nil, fmt.Errorf("failed to scan restaurant: %w", err)
		}
		restaurants = append(restaurants, r)
	}

	return restaurants, nil
}

func (s *RestaurantService) GetRestaurant(ctx context.Context, restaurantID uuid.UUID) (*models.Restaurant, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var r models.Restaurant
	err := s.db.Pool.QueryRow(ctx,
		`SELECT r.id, r.name, r.description, r.campus, r.address, r.latitude,
		        r.longitude, r.whatsapp_number, r.email, r.image_url, r.is_open, r.created_at,
		        COALESCE(AVG(rv.rating), 0) as avg_rating,
		        COUNT(rv.id) as review_count
		 FROM restaurants r
		 LEFT JOIN reviews rv ON r.id = rv.restaurant_id
		 WHERE r.id = $1
		 GROUP BY r.id`,
		restaurantID,
	).Scan(&r.ID, &r.Name, &r.Description, &r.Campus, &r.Address,
		&r.Latitude, &r.Longitude, &r.WhatsappNumber, &r.Email, &r.ImageURL,
		&r.IsOpen, &r.CreatedAt, &r.AvgRating, &r.ReviewCount)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("restaurant not found")
		}
		return nil, fmt.Errorf("failed to fetch restaurant: %w", err)
	}

	return &r, nil
}

func (s *RestaurantService) GetRestaurantMenu(ctx context.Context, restaurantID uuid.UUID) ([]models.MenuItem, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := s.db.Pool.Query(ctx,
		`SELECT id, restaurant_id, name, description, price, category, image_url, is_available, created_at
		 FROM menu_items
		 WHERE restaurant_id = $1 AND is_available = true
		 ORDER BY created_at DESC`,
		restaurantID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to query menu items: %w", err)
	}
	defer rows.Close()

	var items []models.MenuItem
	for rows.Next() {
		var item models.MenuItem
		err := rows.Scan(&item.ID, &item.RestaurantID, &item.Name, &item.Description,
			&item.Price, &item.Category, &item.ImageURL, &item.IsAvailable, &item.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan menu item: %w", err)
		}
		items = append(items, item)
	}

	return items, nil
}
