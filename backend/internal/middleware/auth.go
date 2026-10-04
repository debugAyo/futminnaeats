package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type contextKey string

const (
	UserIDContextKey contextKey = "user_id"
	EmailContextKey  contextKey = "email"
)

func Auth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error":"missing authorization header"}`, http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, `{"error":"invalid authorization format"}`, http.StatusUnauthorized)
				return
			}

			tokenString := parts[1]

			// Parse and verify the JWT
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				// Verify signing method
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
				}
				return []byte(jwtSecret), nil
			})

			if err != nil || !token.Valid {
				http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			// Extract claims
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				http.Error(w, `{"error":"invalid token claims"}`, http.StatusUnauthorized)
				return
			}

			// Get user ID from "sub" claim
			subClaim, ok := claims["sub"]
			if !ok {
				http.Error(w, `{"error":"missing sub claim"}`, http.StatusUnauthorized)
				return
			}

			userIDStr := fmt.Sprintf("%v", subClaim)
			userID, err := uuid.Parse(userIDStr)
			if err != nil {
				http.Error(w, `{"error":"invalid user id format"}`, http.StatusUnauthorized)
				return
			}

			// Get email claim
			email := ""
			if emailClaim, ok := claims["email"]; ok {
				email = fmt.Sprintf("%v", emailClaim)
			}

			// Attach to context
			ctx := context.WithValue(r.Context(), UserIDContextKey, userID)
			ctx = context.WithValue(ctx, EmailContextKey, email)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserID(r *http.Request) uuid.UUID {
	userID, ok := r.Context().Value(UserIDContextKey).(uuid.UUID)
	if !ok {
		return uuid.Nil
	}
	return userID
}

func GetEmail(r *http.Request) string {
	email, ok := r.Context().Value(EmailContextKey).(string)
	if !ok {
		return ""
	}
	return email
}
