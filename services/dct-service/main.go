package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

type Visit struct {
	ID                int       `json:"id"`
	SubjectID         int       `json:"subject_id"`
	VisitID           int       `json:"visit_id"`
	ScheduledStart    time.Time `json:"scheduled_start"`
	ScheduledEnd      time.Time `json:"scheduled_end"`
	VideoRoomID       string    `json:"video_room_id"`
	VisitStatus       string    `json:"visit_status"`
	RecordingURL      string    `json:"recording_url,omitempty"`
	InvestigatorNotes string    `json:"investigator_notes,omitempty"`
	TenantID          int       `json:"tenant_id"`
}

type VisitEvent struct {
	ID        int       `json:"id"`
	VisitID   int       `json:"visit_id"`
	EventType string    `json:"event_type"`
	Timestamp time.Time `json:"timestamp"`
}

var (
	visits   = make(map[int]*Visit)
	events   = []VisitEvent{}
	visitsMu sync.Mutex
	visitID  = 1
	eventID  = 1
)

func main() {
	fmt.Println("ClinCommand OS™ - Go-based DCT Telemedicine Service Booted on port 8083.")

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"HEALTHY", "service":"dct-service"}`))
	})

	http.HandleFunc("/api/v1/dct/visits", handleVisits)
	http.HandleFunc("/api/v1/dct/visits/", handleVisitTransition)

	http.ListenAndServe(":8083", nil)
}

func handleVisits(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	visitsMu.Lock()
	defer visitsMu.Unlock()

	if r.Method == http.MethodPost {
		var req Visit
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"success":false,"errors":["Invalid JSON request body"]}`))
			return
		}

		req.ID = visitID
		visitID++
		req.VisitStatus = "SCHEDULED"
		visits[req.ID] = &req

		// Log room creation event
		events = append(events, VisitEvent{
			ID:        eventID,
			VisitID:   req.ID,
			EventType: "ROOM_CREATED",
			Timestamp: time.Now(),
		})
		eventID++

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": req})
		return
	}

	if r.Method == http.MethodGet {
		subjectStr := r.URL.Query().Get("subject_id")
		list := []*Visit{}
		if subjectStr != "" {
			subID, _ := strconv.Atoi(subjectStr)
			for _, v := range visits {
				if v.SubjectID == subID {
					list = append(list, v)
				}
			}
		} else {
			for _, v := range visits {
				list = append(list, v)
			}
		}
		json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": list})
		return
	}

	w.WriteHeader(http.StatusMethodNotAllowed)
}

func handleVisitTransition(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 6 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"success":false,"errors":["Invalid visit URL path"]}`))
		return
	}

	idStr := pathParts[5]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"success":false,"errors":["Invalid visit ID"]}`))
		return
	}

	transition := pathParts[len(pathParts)-1]

	visitsMu.Lock()
	defer visitsMu.Unlock()

	visit, exists := visits[id]
	if !exists {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"success":false,"errors":["Visit not found"]}`))
		return
	}

	switch transition {
	case "checkin":
		if visit.VisitStatus != "SCHEDULED" {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(fmt.Sprintf(`{"success":false,"errors":["Invalid state transition from %s to PATIENT_CHECKED_IN"]}`, visit.VisitStatus)))
			return
		}
		visit.VisitStatus = "PATIENT_CHECKED_IN"
		events = append(events, VisitEvent{ID: eventID, VisitID: visit.ID, EventType: "PATIENT_JOINED", Timestamp: time.Now()})
		eventID++

	case "start":
		if visit.VisitStatus != "PATIENT_CHECKED_IN" {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(fmt.Sprintf(`{"success":false,"errors":["Invalid state transition from %s to IN_PROGRESS"]}`, visit.VisitStatus)))
			return
		}
		visit.VisitStatus = "IN_PROGRESS"
		events = append(events, VisitEvent{ID: eventID, VisitID: visit.ID, EventType: "INVESTIGATOR_JOINED", Timestamp: time.Now()})
		eventID++

	case "complete":
		if visit.VisitStatus != "IN_PROGRESS" {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(fmt.Sprintf(`{"success":false,"errors":["Invalid state transition from %s to COMPLETED"]}`, visit.VisitStatus)))
			return
		}
		var req struct {
			Notes        string `json:"notes"`
			RecordingURL string `json:"recording_url"`
		}
		json.NewDecoder(r.Body).Decode(&req)
		visit.VisitStatus = "COMPLETED"
		visit.InvestigatorNotes = req.Notes
		visit.RecordingURL = req.RecordingURL
		events = append(events, VisitEvent{ID: eventID, VisitID: visit.ID, EventType: "VISIT_COMPLETED", Timestamp: time.Now()})
		eventID++

	case "missed":
		if visit.VisitStatus != "SCHEDULED" {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(fmt.Sprintf(`{"success":false,"errors":["Invalid state transition from %s to MISSED"]}`, visit.VisitStatus)))
			return
		}
		visit.VisitStatus = "MISSED"

	default:
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"success":false,"errors":["Unknown transition endpoint"]}`))
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "data": visit})
}
