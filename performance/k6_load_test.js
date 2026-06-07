import http from 'k6/http';
import { check, sleep } from 'k6';

// Performance targets:
// API p95 < 300ms
// Authentication < 500ms
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 users
    { duration: '1m', target: 20 },   // Stay at 20 users
    { duration: '30s', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests must complete below 300ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

export default function () {
  const url = 'http://localhost:5000/api/v1/compliance/validate';
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer MOCK_TEST_TOKEN',
    },
  };

  const res = http.post(url, JSON.stringify({}), params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency fits benchmark': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
