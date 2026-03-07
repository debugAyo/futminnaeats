package services

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/debugAyo/futminnaeats/backend/internal/database"
	"github.com/debugAyo/futminnaeats/backend/internal/models"
)

type OrderService struct {
	db *database.DB
}

func NewOrderService(db *database.DB) *OrderService {
	return &OrderService{db: db}
}

func (s *OrderService) CreateOrder(ctx context.Context, userID uuid.UUID, req *models.CreateOrderRequest) (*models.Order, *models.OrderSummary, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Get restaurant and user profile
	var restaurantName string
	var campusName string
	var userName string

	err := s.db.Pool.QueryRow(ctx, "SELECT name FROM restaurants WHERE id = $1", req.RestaurantID).Scan(&restaurantName)
	if err != nil {
		return nil, nil, fmt.Errorf("restaurant not found: %w", err)
	}

	err = s.db.Pool.QueryRow(ctx, "SELECT campus, name FROM profiles WHERE id = $1", userID).Scan(&campusName, &userName)
	if err != nil {
		return nil, nil, fmt.Errorf("profile not found: %w", err)
	}

	// Calculate total amount
	var subtotal float64
	var totalAmount float64
	const deliveryFee = 200.0

	for _, item := range req.Items {
		var price float64
		err := s.db.Pool.QueryRow(ctx, "SELECT price FROM menu_items WHERE id = $1", item.MenuItemID).Scan(&price)
		if err != nil {
			return nil, nil, fmt.Errorf("menu item not found: %w", err)
		}
		subtotal += price * float64(item.Quantity)
	}
	totalAmount = subtotal + deliveryFee

	// Start transaction
	tx, err := s.db.Pool.Begin(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Create order
	orderID := uuid.New()
	var notes *string
	if req.Notes != "" {
		notes = &req.Notes
	}

	err = tx.QueryRow(ctx,
		`INSERT INTO orders (id, user_id, restaurant_id, status, delivery_fee, total_amount, delivery_address, notes)
		 VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7)
		 RETURNING id`,
		orderID, userID, req.RestaurantID, deliveryFee, totalAmount, req.DeliveryAddress, notes,
	).Scan(&orderID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create order: %w", err)
	}

	// Create order items
	var itemSummaries []models.OrderItemSummary
	for _, item := range req.Items {
		var itemName string
		var itemPrice float64
		err := tx.QueryRow(ctx, "SELECT name, price FROM menu_items WHERE id = $1", item.MenuItemID).Scan(&itemName, &itemPrice)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to fetch menu item: %w", err)
		}

		_, err = tx.Exec(ctx,
			`INSERT INTO order_items (id, order_id, menu_item_id, name, price, quantity)
			 VALUES ($1, $2, $3, $4, $5, $6)`,
			uuid.New(), orderID, item.MenuItemID, itemName, itemPrice, item.Quantity,
		)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to create order item: %w", err)
		}

		itemSummaries = append(itemSummaries, models.OrderItemSummary{
			Name:     itemName,
			Quantity: item.Quantity,
			Price:    fmt.Sprintf("%.2f", itemPrice),
		})
	}

	err = tx.Commit(ctx)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Build order object
	order := &models.Order{
		ID:              orderID,
		UserID:          userID,
		RestaurantID:    req.RestaurantID,
		Status:          "pending",
		DeliveryFee:     fmt.Sprintf("%.2f", deliveryFee),
		TotalAmount:     fmt.Sprintf("%.2f", totalAmount),
		DeliveryAddress: req.DeliveryAddress,
		Notes:           notes,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// Build summary for WhatsApp
	summary := &models.OrderSummary{
		OrderID:              orderID.String()[:8],
		StudentName:          userName,
		Campus:               campusName,
		Items:                itemSummaries,
		Subtotal:            fmt.Sprintf("%.2f", subtotal),
		DeliveryFee:          "200.00",
		Total:                fmt.Sprintf("%.2f", totalAmount),
		DeliveryAddress:      req.DeliveryAddress,
		Notes:                req.Notes,
		ConfirmationCodeText: "[Pending confirmation]",
	}

	return order, summary, nil
}

func (s *OrderService) GetOrder(ctx context.Context, orderID uuid.UUID) (*models.Order, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var order models.Order
	err := s.db.Pool.QueryRow(ctx,
		`SELECT id, user_id, restaurant_id, status, delivery_fee, total_amount, 
		        delivery_address, notes, confirmation_code, created_at, updated_at
		 FROM orders WHERE id = $1`,
		orderID,
	).Scan(&order.ID, &order.UserID, &order.RestaurantID, &order.Status, &order.DeliveryFee,
		&order.TotalAmount, &order.DeliveryAddress, &order.Notes, &order.ConfirmationCode,
		&order.CreatedAt, &order.UpdatedAt)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("order not found")
		}
		return nil, fmt.Errorf("failed to fetch order: %w", err)
	}

	// Fetch order items
	rows, err := s.db.Pool.Query(ctx,
		`SELECT id, order_id, menu_item_id, name, price, quantity
		 FROM order_items WHERE order_id = $1`,
		orderID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch order items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var item models.OrderItem
		err := rows.Scan(&item.ID, &item.OrderID, &item.MenuItemID, &item.Name, &item.Price, &item.Quantity)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order item: %w", err)
		}
		order.Items = append(order.Items, item)
	}

	return &order, nil
}

func (s *OrderService) UpdateOrderStatus(ctx context.Context, orderID uuid.UUID, newStatus string) (*models.Order, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var confirmationCode *string

	// If transitioning to confirmed, generate code
	if newStatus == "confirmed" {
		code, err := generateConfirmationCode()
		if err != nil {
			return nil, fmt.Errorf("failed to generate confirmation code: %w", err)
		}
		confirmationCode = &code
	}

	err := s.db.Pool.QueryRow(ctx,
		`UPDATE orders SET status = $1, confirmation_code = $2, updated_at = NOW()
		 WHERE id = $3
		 RETURNING id, user_id, restaurant_id, status, delivery_fee, total_amount, 
		           delivery_address, notes, confirmation_code, created_at, updated_at`,
		newStatus, confirmationCode, orderID,
	).Scan(&orderID, &(*new(uuid.UUID)), &(*new(uuid.UUID)), &(*new(string)), &(*new(string)),
		&(*new(string)), &(*new(string)), &(*new(*string)), confirmationCode, &(*new(time.Time)), &(*new(time.Time)))

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("order not found")
		}
		return nil, fmt.Errorf("failed to update order status: %w", err)
	}

	// Fetch updated order
	return s.GetOrder(ctx, orderID)
}

func (s *OrderService) GetUserOrders(ctx context.Context, userID uuid.UUID) ([]models.Order, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := s.db.Pool.Query(ctx,
		`SELECT id, user_id, restaurant_id, status, delivery_fee, total_amount,
		        delivery_address, notes, confirmation_code, created_at, updated_at
		 FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch orders: %w", err)
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var order models.Order
		err := rows.Scan(&order.ID, &order.UserID, &order.RestaurantID, &order.Status,
			&order.DeliveryFee, &order.TotalAmount, &order.DeliveryAddress, &order.Notes,
			&order.ConfirmationCode, &order.CreatedAt, &order.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}
		orders = append(orders, order)
	}

	return orders, nil
}

func generateConfirmationCode() (string, error) {
	max := big.NewInt(10000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%04d", n.Int64()), nil
}
