package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                  int
	DatabaseURL           string
	SupabaseJWTSecret     string
	SupabaseProjectRef    string
	SupabaseServiceRole   string
	GeminiAPIKey          string
	FrontendURL           string
}

func Load() (*Config, error) {
	// Load .env file if it exists (non-fatal)
	_ = godotenv.Load()

	cfg := &Config{
		Port:                  getEnvInt("PORT", 8080),
		DatabaseURL:           getEnvString("SUPABASE_DB_URL", ""),
		SupabaseJWTSecret:     getEnvString("SUPABASE_JWT_SECRET", ""),
		SupabaseProjectRef:    getEnvString("SUPABASE_PROJECT_REF", ""),
		SupabaseServiceRole:   getEnvString("SUPABASE_SERVICE_ROLE_KEY", ""),
		GeminiAPIKey:          getEnvString("GEMINI_API_KEY", ""),
		FrontendURL:           getEnvString("FRONTEND_URL", "http://localhost:5173"),
	}

	// Validate required fields
	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("SUPABASE_DB_URL is required")
	}
	if cfg.SupabaseJWTSecret == "" {
		return nil, fmt.Errorf("SUPABASE_JWT_SECRET is required")
	}
	if cfg.SupabaseProjectRef == "" {
		return nil, fmt.Errorf("SUPABASE_PROJECT_REF is required")
	}
	if cfg.SupabaseServiceRole == "" {
		return nil, fmt.Errorf("SUPABASE_SERVICE_ROLE_KEY is required")
	}

	return cfg, nil
}

func getEnvString(key, defaultValue string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultValue
	}
	return val
}

func getEnvInt(key string, defaultValue int) int {
	val := os.Getenv(key)
	if val == "" {
		return defaultValue
	}
	intVal, err := strconv.Atoi(val)
	if err != nil {
		return defaultValue
	}
	return intVal
}
