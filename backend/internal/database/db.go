package database

import (
	"context"
	"embed"
	"fmt"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jmoiron/sqlx"
	_ "github.com/jackc/pgx/v5/stdlib"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

type DB struct {
	Pool *pgxpool.Pool
	SqlX *sqlx.DB
}

func New(databaseURL string) (*DB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect using pgx pool
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create pgx pool: %w", err)
	}

	// Test the connection
	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Also create sqlx connection for compatibility with some queries
	sqlxDB, err := sqlx.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlx connection: %w", err)
	}

	db := &DB{
		Pool: pool,
		SqlX: sqlxDB,
	}

	// Run migrations
	if err := db.RunMigrations(ctx); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return db, nil
}

func (db *DB) RunMigrations(ctx context.Context) error {
	// Read migration files in order
	migrations := []string{
		"migrations/001_create_profiles.sql",
		"migrations/002_create_restaurants.sql",
		"migrations/003_create_menu_items.sql",
		"migrations/004_create_orders.sql",
		"migrations/005_create_order_items.sql",
		"migrations/006_create_reviews.sql",
	}

	for _, migrationFile := range migrations {
		data, err := migrationFiles.ReadFile(migrationFile)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", migrationFile, err)
		}

		if _, err := db.Pool.Exec(ctx, string(data)); err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", migrationFile, err)
		}

		log.Printf("✓ Migration executed: %s", migrationFile)
	}

	return nil
}

func (db *DB) Close() error {
	if db.Pool != nil {
		db.Pool.Close()
	}
	if db.SqlX != nil {
		return db.SqlX.Close()
	}
	return nil
}

func (db *DB) WithTimeout(ctx context.Context, timeout time.Duration) (context.Context, context.CancelFunc) {
	return context.WithTimeout(ctx, timeout)
}
