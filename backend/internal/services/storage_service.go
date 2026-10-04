package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/debugAyo/futminnaeats/backend/internal/database"
)

type StorageService struct {
	db                      *database.DB
	supabaseProjectRef      string
	supabaseServiceRoleKey  string
}

func NewStorageService(db *database.DB, projectRef, serviceRoleKey string) *StorageService {
	return &StorageService{
		db:                     db,
		supabaseProjectRef:     projectRef,
		supabaseServiceRoleKey: serviceRoleKey,
	}
}

func (s *StorageService) UploadAvatar(ctx context.Context, userID uuid.UUID, file multipart.File, fileHeader *multipart.FileHeader) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	// Validate file type
	fileName := fileHeader.Filename
	ext := strings.ToLower(filepath.Ext(fileName))
	contentType := fileHeader.Header.Get("Content-Type")

	validExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".webp": true,
	}
	validContentTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/webp": true,
	}

	if !validExtensions[ext] || !validContentTypes[contentType] {
		return "", fmt.Errorf("invalid file type: only JPEG, PNG, and WebP are allowed")
	}

	// Validate file size (max 2MB)
	if fileHeader.Size > 2*1024*1024 {
		return "", fmt.Errorf("file too large: maximum size is 2MB")
	}

	// Read file data
	fileData, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	// Delete old avatar if exists
	var oldFileName *string
	err = s.db.Pool.QueryRow(ctx, "SELECT avatar_url FROM profiles WHERE id = $1", userID).Scan(&oldFileName)
	if err == nil && oldFileName != nil {
		_ = s.deleteFileFromStorage(ctx, *oldFileName)
	}

	// Upload new avatar
	newFileName := userID.String() + ext
	uploadURL := fmt.Sprintf("https://%s.supabase.co/storage/v1/object/avatars/%s",
		s.supabaseProjectRef, newFileName)

	req, err := http.NewRequestWithContext(ctx, "PUT", uploadURL, bytes.NewReader(fileData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.supabaseServiceRoleKey)
	req.Header.Set("Content-Type", contentType)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to upload file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("upload failed: %s", string(body))
	}

	// Build public URL
	publicURL := fmt.Sprintf("https://%s.supabase.co/storage/v1/object/public/avatars/%s",
		s.supabaseProjectRef, newFileName)

	// Update profile with avatar URL
	_, err = s.db.Pool.Exec(ctx, "UPDATE profiles SET avatar_url = $1 WHERE id = $2", publicURL, userID)
	if err != nil {
		return "", fmt.Errorf("failed to update profile: %w", err)
	}

	return publicURL, nil
}

func (s *StorageService) DeleteAvatar(ctx context.Context, userID uuid.UUID) error {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	var avatarURL *string
	err := s.db.Pool.QueryRow(ctx, "SELECT avatar_url FROM profiles WHERE id = $1", userID).Scan(&avatarURL)
	if err != nil {
		return fmt.Errorf("profile not found: %w", err)
	}

	if avatarURL != nil {
		_ = s.deleteFileFromStorage(ctx, *avatarURL)
	}

	// Update profile to remove avatar URL
	_, err = s.db.Pool.Exec(ctx, "UPDATE profiles SET avatar_url = NULL WHERE id = $1", userID)
	if err != nil {
		return fmt.Errorf("failed to update profile: %w", err)
	}

	return nil
}

func (s *StorageService) deleteFileFromStorage(ctx context.Context, publicURL string) error {
	// Extract filename from URL
	// Format: https://[ref].supabase.co/storage/v1/object/public/avatars/[filename]
	parts := strings.Split(publicURL, "/avatars/")
	if len(parts) != 2 {
		return fmt.Errorf("invalid URL format")
	}
	fileName := parts[1]

	deleteURL := fmt.Sprintf("https://%s.supabase.co/storage/v1/object/avatars/%s",
		s.supabaseProjectRef, fileName)

	req, err := http.NewRequestWithContext(ctx, "DELETE", deleteURL, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+s.supabaseServiceRoleKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}
