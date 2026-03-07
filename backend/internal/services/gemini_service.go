package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type GeminiService struct {
	apiKey string
}

func NewGeminiService(apiKey string) *GeminiService {
	return &GeminiService{apiKey: apiKey}
}

func (s *GeminiService) Recommend(ctx context.Context, query, campus string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 15*time.Second)
	defer cancel()

	prompt := fmt.Sprintf(
		`You are a helpful food assistant for FUT Minna students.
The student is on %s campus and asks: '%s'.
Based on available restaurants and their menus, give a concise,
friendly food recommendation in 60 words or less.
Be specific about food types and price ranges relevant to Nigerian
university students.`, campus, query)

	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{
						"text": prompt,
					},
				},
			},
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=%s", s.apiKey)

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call Gemini API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Gemini API error: %s", string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	// Extract recommendation from response
	contents, ok := result["candidates"].([]interface{})
	if !ok || len(contents) == 0 {
		return "", fmt.Errorf("unexpected response format")
	}

	candidate := contents[0].(map[string]interface{})
	content := candidate["content"].(map[string]interface{})
	parts := content["parts"].([]interface{})
	part := parts[0].(map[string]interface{})
	text := part["text"].(string)

	return text, nil
}
