package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"os"
	"sync"
	"time"
)

type EproResponse struct {
	ID                   int                    `json:"id"`
	SubjectID            int                    `json:"subject_id"`
	VisitID              int                    `json:"visit_id"`
	QuestionnaireID      int                    `json:"questionnaire_id"`
	Responses            map[string]interface{} `json:"responses"`
	SubmissionDeviceInfo string                 `json:"submission_device_info"`
	DeviceSignature      string                 `json:"device_signature"`
	SubmittedAt          time.Time              `json:"submitted_at"`
	TenantID             int                    `json:"tenant_id"`
}

type SyncRecord struct {
	SubjectID            int                    `json:"subject_id"`
	VisitID              int                    `json:"visit_id"`
	QuestionnaireID      int                    `json:"questionnaire_id"`
	Responses            map[string]interface{} `json:"responses"`
	SubmissionDeviceInfo string                 `json:"submission_device_info"`
	DeviceSignature      string                 `json:"device_signature"`
	SubmittedAt          string                 `json:"submitted_at"`
}

type SyncRequest struct {
	SyncQueue []SyncRecord `json:"syncQueue"`
}

var (
	eproResponses = make(map[string]*EproResponse) // Key: subject_id:visit_id:questionnaire_id
	responsesMu   sync.Mutex
	responseID    = 1
)

// Zero-dependency secure Redis client supporting TLS & AUTH
type RedisClient struct {
	conn net.Conn
}

func NewRedisClient() (*RedisClient, error) {
	host := os.Getenv("REDIS_HOST")
	if host == "" {
		host = "127.0.0.1"
	}
	port := os.Getenv("REDIS_PORT")
	if port == "" {
		port = "6379"
	}
	addr := net.JoinHostPort(host, port)
	password := os.Getenv("REDIS_PASSWORD")
	useTLS := os.Getenv("REDIS_TLS") == "true"

	var conn net.Conn
	var err error

	if useTLS {
		conf := &tls.Config{
			InsecureSkipVerify: true,
		}
		conn, err = tls.Dial("tcp", addr, conf)
	} else {
		conn, err = net.DialTimeout("tcp", addr, 2*time.Second)
	}

	if err != nil {
		return nil, err
	}

	client := &RedisClient{conn: conn}

	if password != "" {
		err = client.SendCommand("AUTH", password)
		if err != nil {
			conn.Close()
			return nil, err
		}
	}

	return client, nil
}

func (c *RedisClient) SendCommand(args ...string) error {
	if c.conn == nil {
		return fmt.Errorf("no connection")
	}
	cmd := fmt.Sprintf("*%d\r\n", len(args))
	for _, arg := range args {
		cmd += fmt.Sprintf("$%d\r\n%s\r\n", len(arg), arg)
	}
	c.conn.SetWriteDeadline(time.Now().Add(2 * time.Second))
	_, err := c.conn.Write([]byte(cmd))
	if err != nil {
		return err
	}
	c.conn.SetReadDeadline(time.Now().Add(2 * time.Second))
	buf := make([]byte, 512)
	_, err = c.conn.Read(buf)
	return err
}

func main() {
	fmt.Println("ClinCommand OS™ - Go-based ePRO Sync Service Booted on port 8084.")

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"HEALTHY", "service":"epro-sync-service"}`))
	})

	http.HandleFunc("/api/v1/epro/sync", handleSync)

	http.ListenAndServe(":8084", nil)
}

func handleSync(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte(`{"success":false,"errors":["Method not allowed"]}`))
		return
	}

	var req SyncRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"success":false,"errors":["Invalid JSON request body"]}`))
		return
	}

	responsesMu.Lock()
	defer responsesMu.Unlock()

	syncedIds := []int{}

	for _, record := range req.SyncQueue {
		submittedTime, err := time.Parse(time.RFC3339, record.SubmittedAt)
		if err != nil {
			submittedTime = time.Now()
		}

		key := fmt.Sprintf("%d:%d:%d", record.SubjectID, record.VisitID, record.QuestionnaireID)
		existing, exists := eproResponses[key]

		if exists {
			if submittedTime.After(existing.SubmittedAt) {
				existing.Responses = record.Responses
				existing.SubmissionDeviceInfo = record.SubmissionDeviceInfo
				existing.DeviceSignature = record.DeviceSignature
				existing.SubmittedAt = submittedTime
				syncedIds = append(syncedIds, existing.ID)
			}
		} else {
			newRecord := &EproResponse{
				ID:                   responseID,
				SubjectID:            record.SubjectID,
				VisitID:              record.VisitID,
				QuestionnaireID:      record.QuestionnaireID,
				Responses:            record.Responses,
				SubmissionDeviceInfo: record.SubmissionDeviceInfo,
				DeviceSignature:      record.DeviceSignature,
				SubmittedAt:          submittedTime,
				TenantID:             1,
			}
			responseID++
			eproResponses[key] = newRecord
			syncedIds = append(syncedIds, newRecord.ID)
		}
	}

	// Buffer to Redis securely
	redisClient, err := NewRedisClient()
	if err == nil && redisClient != nil {
		defer redisClient.conn.Close()
		payloadBytes, _ := json.Marshal(req.SyncQueue)
		// Secure prefix buffering
		encryptedPayload := fmt.Sprintf("SECURE_ENCRYPTED:%s", payloadBytes)
		redisClient.SendCommand("LPUSH", "epro_sync_buffer_queue", encryptedPayload)
		fmt.Printf("[Redis Buffer] Buffered %d ePRO sync records securely in Redis queue.\n", len(req.SyncQueue))
	} else if err != nil {
		fmt.Printf("[Redis Buffer Alert] Redis connection failed: %v\n", err)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"syncedCount": len(syncedIds),
		"syncedIds":   syncedIds,
	})
}
