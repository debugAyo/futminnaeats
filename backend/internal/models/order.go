package models

import (
	"time"

	"github.com/google/uuid"
)

type Order struct {
	ID               uuid.UUID    `db:"id" json:"id"`
	UserID           uuid.UUID    `db:"user_id" json:"user_id"`
	RestaurantID     uuid.UUID    `db:"restaurant_id" json:"restaurant_id"`
	Status           string       `db:"status" json:"status"`
	DeliveryFee      string       `db:"delivery_fee" json:"delivery_fee"`
	TotalAmount      string       `db:"total_amount" json:"total_amount"`
	DeliveryAddress  string       `db:"delivery_address" json:"delivery_address"`
	Notes            *string      `db:"notes" json:"notes"`
	ConfirmationCode *string      `db:"confirmation_code" json:"confirmation_code"`
	Items            []OrderItem  `json:"items,omitempty"`
	CreatedAt        time.Time    `db:"created_at" json:"created_at"`
	UpdatedAt        time.Time    `db:"updated_at" json:"updated_at"`
}

type OrderItem struct {
	ID         uuid.UUID `db:"id" json:"id"`
	OrderID    uuid.UUID `db:"order_id" json:"order_id"`
	MenuItemID uuid.UUID `db:"menu_item_id" json:"menu_item_id"`
	Name       string    `db:"name" json:"name"`
	Price      string    `db:"price" json:"price"`
	Quantity   int       `db:"quantity" json:"quantity"`
}

type CreateOrderRequest struct {
	RestaurantID    uuid.UUID `json:"restaurant_id" binding:"required"`
	DeliveryAddress string    `json:"delivery_address" binding:"required"`
	Notes           string    `json:"notes"`
	Items           []struct {
		MenuItemID uuid.UUID `json:"menu_item_id" binding:"required"`
		Quantity   int       `json:"quantity" binding:"required,min=1"`
	} `json:"items" binding:"required,min=1"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

type OrderSummary struct {
	OrderID              string
	StudentName          string
	Campus               string
	Items                []OrderItemSummary
	Subtotal             string
	DeliveryFee          string
	Total                string
	DeliveryAddress      string
	Notes                string
	ConfirmationCodeText string
}

type OrderItemSummary struct {
	Name     string
	Quantity int
	Price    string
}
