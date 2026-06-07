# TASK 6: PRODUCT PROFILE MODULE
## Implementation Blueprint (Backend + Frontend)
**MedicoExpress Medical Affairs Digital Command Center**

---

## MODULE OVERVIEW

**Module ID:** product-profile-v1  
**Tasks Implemented:** Task 6 (Product Profile Development)  
**Backend:** Node.js + Express + PostgreSQL  
**Frontend:** React 18 + Vite + Tailwind CSS  
**Status:** Ready for development (Jun 14, 2026)  
**Target Completion:** Jun 18, 2026 (5 days)

---

## PROJECT STRUCTURE

```
modules/
└── product-profile/
    ├── backend/
    │   ├── src/
    │   │   ├── controllers/
    │   │   │   ├── productProfileController.js
    │   │   │   ├── gateController.js
    │   │   │   └── auditController.js
    │   │   ├── services/
    │   │   │   ├── productProfileService.js
    │   │   │   ├── complianceService.js
    │   │   │   ├── fairBalanceService.js
    │   │   │   └── auditTrailService.js
    │   │   ├── models/
    │   │   │   ├── ProductProfile.js
    │   │   │   ├── Gate.js
    │   │   │   ├── ApprovalSignature.js
    │   │   │   ├── DecisionLog.js
    │   │   │   └── AuditTrail.js
    │   │   ├── routes/
    │   │   │   ├── profileRoutes.js
    │   │   │   ├── gateRoutes.js
    │   │   │   └── auditRoutes.js
    │   │   ├── middleware/
    │   │   │   ├── auth.js
    │   │   │   ├── validation.js
    │   │   │   ├── compliance.js
    │   │   │   └── auditLog.js
    │   │   ├── utils/
    │   │   │   ├── fairBalanceCalculator.js
    │   │   │   ├── sourceValidator.js
    │   │   │   ├── onLabelVerifier.js
    │   │   │   └── errorHandler.js
    │   │   ├── config/
    │   │   │   ├── database.js
    │   │   │   ├── env.js
    │   │   │   └── constants.js
    │   │   └── server.js
    │   ├── tests/
    │   │   ├── unit/
    │   │   │   ├── services.test.js
    │   │   │   ├── utils.test.js
    │   │   │   └── models.test.js
    │   │   ├── integration/
    │   │   │   ├── api.test.js
    │   │   │   ├── gates.test.js
    │   │   │   └── compliance.test.js
    │   │   └── e2e/
    │   │       └── workflow.test.js
    │   ├── Dockerfile
    │   ├── docker-compose.yml
    │   ├── package.json
    │   ├── .env.example
    │   ├── README.md
    │   └── k8s/
    │       ├── deployment.yaml
    │       ├── service.yaml
    │       ├── configmap.yaml
    │       └── secrets.yaml
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── components/
    │   │   │   ├── ProductProfileForm.jsx
    │   │   │   ├── ProductProfileViewer.jsx
    │   │   │   ├── GateStatusPanel.jsx
    │   │   │   ├── ApprovalWorkflow.jsx
    │   │   │   ├── DecisionLog.jsx
    │   │   │   ├── FairBalanceCalculator.jsx
    │   │   │   └── AuditTrail.jsx
    │   │   ├── hooks/
    │   │   │   ├── useProductProfile.js
    │   │   │   ├── useGateStatus.js
    │   │   │   ├── useApprovalWorkflow.js
    │   │   │   └── useApiCall.js
    │   │   ├── services/
    │   │   │   ├── apiClient.js
    │   │   │   ├── productProfileAPI.js
    │   │   │   ├── gateAPI.js
    │   │   │   └── auditAPI.js
    │   │   ├── styles/
    │   │   │   ├── components.css
    │   │   │   ├── forms.css
    │   │   │   └── gates.css
    │   │   ├── pages/
    │   │   │   ├── ProductProfilePage.jsx
    │   │   │   ├── GateDashboard.jsx
    │   │   │   └── AuditPage.jsx
    │   │   ├── context/
    │   │   │   └── ProductProfileContext.js
    │   │   ├── App.jsx
    │   │   └── main.jsx
    │   ├── tests/
    │   │   ├── components.test.jsx
    │   │   ├── hooks.test.js
    │   │   ├── integration.test.jsx
    │   │   └── e2e/
    │   │       └── workflow.spec.js
    │   ├── public/
    │   ├── vite.config.js
    │   ├── package.json
    │   ├── tailwind.config.js
    │   ├── .env.example
    │   ├── README.md
    │   └── Dockerfile
    │
    ├── docs/
    │   ├── API_SPEC.md (OpenAPI/Swagger)
    │   ├── COMPONENT_SPEC.md (Storybook)
    │   ├── INTEGRATION_GUIDE.md (How to use in ClinCommandOS)
    │   ├── DEPLOYMENT_GUIDE.md (Docker, Kubernetes)
    │   └── DEVELOPMENT_GUIDE.md (Setup, run locally)
    │
    ├── module.config.json
    ├── .github/
    │   └── workflows/
    │       ├── build.yml
    │       ├── test.yml
    │       └── deploy.yml
    └── README.md
```

---

## BACKEND API SPECIFICATION

### Database Schema

**Table: product_profiles**
```sql
CREATE TABLE product_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(255) NOT NULL,
  product_generic_name VARCHAR(255) NOT NULL,
  fda_approval_date DATE NOT NULL,
  fda_indication VARCHAR(500),
  document_version INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, IN_REVIEW, APPROVED, RELEASED
  content TEXT NOT NULL, -- Markdown content
  fair_balance_score INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  last_modified_by UUID REFERENCES users(id),
  UNIQUE(product_name, document_version)
);

CREATE TABLE gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_profile_id UUID REFERENCES product_profiles(id) ON DELETE CASCADE,
  gate_number INT NOT NULL, -- 1-10
  gate_name VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PASSED, FAILED, REWORK
  assessment_result TEXT,
  assessed_by UUID REFERENCES users(id),
  assessed_at TIMESTAMP,
  expected_completion_date DATE,
  actual_completion_date DATE,
  UNIQUE(product_profile_id, gate_number)
);

CREATE TABLE approval_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_profile_id UUID REFERENCES product_profiles(id) ON DELETE CASCADE,
  approver_role VARCHAR(100) NOT NULL, -- Medical Specialist, Regulatory, etc.
  approver_id UUID REFERENCES users(id),
  signature_date TIMESTAMP,
  approval_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE decision_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_profile_id UUID REFERENCES product_profiles(id) ON DELETE CASCADE,
  decision_point VARCHAR(200) NOT NULL, -- e.g., "Step 1 — Trial selection"
  options JSON NOT NULL, -- Array of decision options
  chosen_option VARCHAR(200) NOT NULL,
  reasoning TEXT NOT NULL,
  evidence TEXT,
  skill_used VARCHAR(100),
  outcome VARCHAR(50), -- ACCEPTED, REJECTED, REWORK
  quality_score VARCHAR(10), -- A+, A, B+, etc.
  learning_point TEXT,
  next_batch_application TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_profile_id UUID REFERENCES product_profiles(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, APPROVE, REJECT
  actor_id UUID REFERENCES users(id),
  actor_role VARCHAR(100),
  change_details JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address INET
);
```

### API Endpoints

**Base URL:** `http://product-profile-service:3001/api`

**Authentication:** Bearer token (JWT)  
**Content-Type:** application/json

#### Product Profile CRUD

**POST /product-profiles**
```
Create new product profile
Request:
{
  "product_name": "Vonoprazan",
  "product_generic_name": "vonoprazan",
  "fda_approval_date": "2024-12-14",
  "fda_indication": "Duodenal ulcer, GERD"
}
Response: { id: UUID, status: "DRAFT", created_at: "..." }
```

**GET /product-profiles/:id**
```
Retrieve product profile document
Response: { id, product_name, status, content, fair_balance_score, ... }
```

**GET /product-profiles/:id/draft**
```
Retrieve current draft (in-progress document)
Response: { id, content (markdown), last_section_completed, ... }
```

**PUT /product-profiles/:id**
```
Update product profile content
Request: { content: "markdown content", section: 3, ... }
Response: { id, updated_at, version, ... }
```

**DELETE /product-profiles/:id** (soft delete)
```
Archive product profile (compliance record kept)
Response: { id, deleted_at, deleted_by, ... }
```

#### Gate Management

**GET /product-profiles/:id/gates**
```
Retrieve all gate statuses for product profile
Response: [
  { gate_number: 1, gate_name: "Completeness", status: "PENDING", ... },
  { gate_number: 2, gate_name: "Source Traceability", status: "IN_PROGRESS", ... },
  ...
]
```

**POST /product-profiles/:id/gates/:gate_number/assess**
```
Submit gate assessment result
Request: {
  gate_number: 1,
  status: "PASSED",
  assessment_result: "All sections present, no placeholder text",
  assessed_by: UUID
}
Response: { gate_id, status: "PASSED", ... }
```

**GET /product-profiles/:id/gates/:gate_number/assessment**
```
Retrieve gate assessment results
Response: { gate_number, status, assessment_result, assessed_at, ... }
```

#### Fair-Balance Calculation

**POST /product-profiles/:id/fair-balance/calculate**
```
Calculate fair-balance score (0-100)
Request: {
  benefits_text: "...",
  risks_text: "..."
}
Response: {
  score: 85,
  breakdown: {
    benefit_word_count: 245,
    risk_word_count: 198,
    ratio: 1.24,
    assessment: "ACCEPTABLE (≥80)"
  }
}
```

#### Approval Workflow

**GET /product-profiles/:id/approvals**
```
Retrieve approval signature status
Response: [
  { approver_role: "Medical Specialist", status: "APPROVED", signature_date: "..." },
  { approver_role: "Regulatory", status: "PENDING", signature_date: null },
  ...
]
```

**POST /product-profiles/:id/approvals/:role/sign**
```
Submit approval signature
Request: { role: "Medical Specialist", approval_status: "APPROVED", comments: "..." }
Response: { role, status: "APPROVED", signature_date: "...", ... }
```

#### Decision Log

**POST /product-profiles/:id/decisions**
```
Log a decision for auto-learning
Request: {
  decision_point: "Step 1 — Trial selection",
  options: ["Phase 3 only", "Phase 2+3", "All studies"],
  chosen_option: "Phase 3 only",
  reasoning: "Phase 3 RCT is gold standard",
  evidence: "FDA guidance document",
  skill_used: "Pharma-Product-Profile-Synthesis-v1",
  outcome: "ACCEPTED",
  quality_score: "A+",
  learning_point: "Phase 3 priority rule applies broadly"
}
Response: { decision_id, created_at, ... }
```

**GET /product-profiles/:id/decisions**
```
Retrieve all decisions for product profile
Response: [ { decision_id, decision_point, chosen_option, ... }, ... ]
```

#### Audit Trail

**GET /product-profiles/:id/audit-trail**
```
Retrieve complete audit trail (compliance record)
Response: [
  { action: "CREATE", actor: "Medical Specialist", timestamp: "...", ... },
  { action: "UPDATE", actor: "Medical Specialist", timestamp: "...", ... },
  { action: "APPROVE", actor: "Regulatory", timestamp: "...", ... },
  ...
]
```

---

## FRONTEND COMPONENTS

### ProductProfileForm.jsx
```javascript
/**
 * Form for creating/editing product profile
 * - Section-by-section editor (Sections 1-12)
 * - Auto-save every 30 seconds
 * - Real-time spell-check & word count
 * - Section progress tracker
 * - Fair-balance calculator inline
 */

export function ProductProfileForm({ profileId }) {
  const { profile, updateSection, saveProfile, completionPercentage } = 
    useProductProfile(profileId);
  
  const sections = [
    { num: 1, title: "Product Identity & Approval", minWords: 400, maxWords: 600 },
    { num: 2, title: "Therapeutic Classification", minWords: 400, maxWords: 600 },
    { num: 3, title: "Mechanism of Action", minWords: 800, maxWords: 1200 },
    { num: 4, title: "Clinical Efficacy Summary", minWords: 2000, maxWords: 3500 },
    // ... etc
  ];

  return (
    <div className="product-profile-form">
      <div className="header">
        <h1>{profile.product_name} - Product Profile</h1>
        <span className={`status ${profile.status}`}>{profile.status}</span>
        <span className="progress">{completionPercentage}% Complete</span>
      </div>

      <div className="section-navigator">
        {sections.map(section => (
          <div key={section.num} className="section-tab">
            <span className="number">{section.num}</span>
            <span className="title">{section.title}</span>
            <span className="status">{getStatus(section.num)}</span>
          </div>
        ))}
      </div>

      <div className="editor-panel">
        <textarea
          value={profile.currentSection}
          onChange={handleSectionUpdate}
          placeholder="Start typing section content..."
          className="editor"
        />
        
        <div className="side-panel">
          <div className="word-count">
            {wordCount} / {sections[activeSection].maxWords} words
          </div>
          
          <div className="fair-balance-mini">
            Benefits: {benefitsCount} words
            Risks: {risksCount} words
            Ratio: {(benefitsCount/risksCount).toFixed(2)}
          </div>

          <button onClick={saveProfile}>Save Section</button>
          <button onClick={moveToNextSection}>Next Section →</button>
        </div>
      </div>
    </div>
  );
}
```

### GateStatusPanel.jsx
```javascript
/**
 * Real-time display of all 10 gate statuses
 * - Color-coded: PENDING (gray), IN_PROGRESS (blue), PASSED (green), FAILED (red)
 * - Shows gate assessment results (if passed)
 * - Shows errors/blockers (if failed)
 * - Timeline view: expected vs. actual completion dates
 */

export function GateStatusPanel({ profileId }) {
  const { gates, gateTimeline } = useGateStatus(profileId);

  const gateDefinitions = [
    { num: 1, name: "Completeness", expectedDays: 1 },
    { num: 2, name: "Source Traceability", expectedDays: 1.5 },
    { num: 3, name: "On-Label Verification", expectedDays: 1 },
    { num: 4, name: "Fair-Balance Assessment", expectedDays: 1 },
    { num: 5, name: "Medical Accuracy", expectedDays: 1.5 },
    { num: 6, name: "Regulatory Compliance", expectedDays: 1 },
    { num: 7, name: "Legal Review", expectedDays: 1 },
    { num: 8, name: "Formatting & Structure", expectedDays: 1 },
    { num: 9, name: "Audit Trail", expectedDays: 1 },
    { num: 10, name: "Final Release", expectedDays: 0.5 }
  ];

  return (
    <div className="gate-status-panel">
      <h2>Quality Gates Progress</h2>
      
      <div className="gates-timeline">
        {gateDefinitions.map(gate => {
          const gateStatus = gates[gate.num - 1];
          return (
            <div key={gate.num} className={`gate ${gateStatus.status}`}>
              <div className="gate-header">
                <span className="gate-number">Gate {gate.num}</span>
                <span className="gate-name">{gate.name}</span>
                <span className={`status-badge ${gateStatus.status}`}>
                  {gateStatus.status}
                </span>
              </div>

              {gateStatus.status === 'PASSED' && (
                <div className="gate-result success">
                  ✅ Passed on {gateStatus.assessed_at}
                </div>
              )}

              {gateStatus.status === 'FAILED' && (
                <div className="gate-result error">
                  ❌ Failed: {gateStatus.assessment_result}
                  <button>View Details</button>
                  <button>Start Rework</button>
                </div>
              )}

              {gateStatus.status === 'IN_PROGRESS' && (
                <div className="gate-result in-progress">
                  ⏳ Expected {gate.expectedDays} days
                  {gateStatus.expected_completion_date && (
                    <span>Due: {gateStatus.expected_completion_date}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="summary">
        <span className="passed">{gates.filter(g => g.status === 'PASSED').length}/10 Gates Passed</span>
        <span className="estimated-completion">
          Est. Completion: {calculateEstimatedCompletion(gates)} days
        </span>
      </div>
    </div>
  );
}
```

### ApprovalWorkflow.jsx
```javascript
/**
 * Approval workflow tracker
 * - Shows required approvers (8 roles)
 * - Status of each approval (signed/pending/rejected)
 * - Comment threads per approver
 * - Legal holds/escalations
 */

export function ApprovalWorkflow({ profileId }) {
  const { approvals, submitApproval } = useApprovalWorkflow(profileId);

  const roles = [
    "Product Medical Specialist",
    "Regulatory Specialist",
    "Compliance Officer",
    "External Clinical Expert",
    "Legal Counsel",
    "QA Reviewer",
    "VP Regulatory",
    "Chief Medical Officer (Final)"
  ];

  return (
    <div className="approval-workflow">
      <h2>Approval Signatures</h2>
      
      <div className="approval-chain">
        {roles.map((role, idx) => {
          const approval = approvals.find(a => a.approver_role === role);
          return (
            <div key={role} className={`approval-step ${approval?.approval_status || 'PENDING'}`}>
              <div className="step-number">{idx + 1}</div>
              <div className="step-details">
                <h4>{role}</h4>
                {approval?.approval_status === 'APPROVED' && (
                  <p className="approved">
                    ✅ Approved by {approval.approver_id}
                    on {approval.signature_date}
                  </p>
                )}
                {approval?.approval_status === 'PENDING' && (
                  <p className="pending">
                    ⏳ Awaiting signature
                    {role === "Chief Medical Officer (Final)" && 
                      " (gates 1-9 must pass first)"
                    }
                  </p>
                )}
                {approval?.approval_status === 'REJECTED' && (
                  <p className="rejected">
                    ❌ Rejected: {approval.comments}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {canSignApproval() && (
        <ApprovalSignForm role={currentUserRole} onSubmit={submitApproval} />
      )}
    </div>
  );
}
```

### FairBalanceCalculator.jsx
```javascript
/**
 * Interactive fair-balance calculator
 * - Highlights benefit language (green)
 * - Highlights risk language (red)
 * - Calculates ratio in real-time
 * - Shows score 0-100 with assessment
 * - Suggestions to improve balance
 */

export function FairBalanceCalculator({ profileId, profileContent }) {
  const { fairBalanceScore, breakdown } = useFairBalance(profileContent);

  const keywordMappings = {
    benefits: [
      "efficacy", "effective", "heals", "improves", "superior",
      "better", "faster", "strong", "excellent", "proven"
    ],
    risks: [
      "adverse", "side effect", "toxicity", "contraindication", "warning",
      "caution", "monitor", "discontinuation", "serious", "death"
    ]
  };

  return (
    <div className="fair-balance-calculator">
      <h2>Fair-Balance Assessment</h2>
      
      <div className="score-display">
        <div className={`score-circle ${getScoreCategory(fairBalanceScore)}`}>
          {fairBalanceScore}
        </div>
        <div className="score-label">
          {fairBalanceScore >= 80 ? "✅ ACCEPTABLE" : "❌ NEEDS REBALANCING"}
        </div>
      </div>

      <div className="breakdown">
        <p>Benefits mentioned: {breakdown.benefit_count} times ({breakdown.benefit_words} words)</p>
        <p>Risks mentioned: {breakdown.risk_count} times ({breakdown.risk_words} words)</p>
        <p>Ratio: {(breakdown.benefit_words / breakdown.risk_words).toFixed(2)}:1</p>
      </div>

      <div className="content-analysis">
        <h3>Content Highlighted</h3>
        <div className="highlighted-content">
          {highlightContent(profileContent, keywordMappings)}
        </div>
      </div>

      <div className="recommendations">
        <h3>Recommendations</h3>
        {fairBalanceScore < 80 && (
          <ul>
            <li>Increase risk/safety discussion by ~{100 - fairBalanceScore}%</li>
            <li>Add more adverse event frequency data</li>
            <li>Include contraindication & monitoring requirements</li>
            <li>Balance comparative benefit claims with similar risk statements</li>
          </ul>
        )}
      </div>
    </div>
  );
}
```

---

## TESTING STRATEGY

### Unit Tests (Jest)

**Services Testing:**
```javascript
describe('FairBalanceService', () => {
  test('calculateScore returns 0-100', () => {
    const score = fairBalanceService.calculateScore(
      "Benefits text benefits benefits",
      "Risks text risks risks"
    );
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('score >= 80 when benefits and risks proportional', () => {
    const score = fairBalanceService.calculateScore(
      "Drug heals 90% of lesions (benefit)",
      "Headache 12%, monitor drug interactions (risks)"
    );
    expect(score).toBeGreaterThanOrEqual(80);
  });
});

describe('OnLabelVerifier', () => {
  test('rejects off-label indications', () => {
    const claim = "Vonoprazan is effective for preventing ulcers (off-label)";
    const result = onLabelVerifier.verifyClaim(claim, fda_label);
    expect(result.is_on_label).toBe(false);
    expect(result.reason).toContain("off-label");
  });

  test('approves on-label claims', () => {
    const claim = "Vonoprazan heals erosive GERD lesions (on-label)";
    const result = onLabelVerifier.verifyClaim(claim, fda_label);
    expect(result.is_on_label).toBe(true);
  });
});
```

### Integration Tests (Supertest)

```javascript
describe('POST /api/product-profiles/:id/gates/:gate_number/assess', () => {
  test('accepts gate 1 assessment with PASSED status', async () => {
    const response = await request(app)
      .post(`/api/product-profiles/${profileId}/gates/1/assess`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        gate_number: 1,
        status: 'PASSED',
        assessment_result: 'All sections present, no placeholder text'
      });

    expect(response.status).toBe(200);
    expect(response.body.gate_number).toBe(1);
    expect(response.body.status).toBe('PASSED');
  });

  test('blocks Gate 10 before Gates 1-9 pass', async () => {
    const response = await request(app)
      .post(`/api/product-profiles/${profileId}/gates/10/assess`)
      .set('Authorization', `Bearer ${token}`)
      .send({ gate_number: 10, status: 'PASSED' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Gates 1-9 must pass first");
  });
});
```

### E2E Tests (Playwright)

```javascript
test('Complete workflow: Create profile → Draft content → Pass all gates → Release', async ({ page }) => {
  // Step 1: Create product profile
  await page.goto('/product-profiles/new');
  await page.fill('input[name="product_name"]', 'Vonoprazan');
  await page.click('button:has-text("Create Profile")');

  // Step 2: Draft sections 1-12
  for (let i = 1; i <= 12; i++) {
    await page.click(`[data-section="${i}"]`);
    await page.fill('textarea.editor', section_content[i]);
    await page.click('button:has-text("Save Section")');
    await expect(page.locator('.success-message')).toBeVisible();
  }

  // Step 3: Monitor gates progression
  await page.goto(`/product-profiles/${profileId}/gates`);
  // Verify Gate 1 passes
  await expect(page.locator('[data-gate="1"] .status-badge')).toContainText('PASSED');
  // Wait for Gate 2 to complete
  await page.waitForSelector('[data-gate="2"] .status-badge:has-text("PASSED")', { timeout: 60000 });

  // Step 4: Submit approvals
  // ... (role-based approval workflow)

  // Step 5: Final release
  await page.click('button[data-action="release"]');
  await expect(page.locator('.status')).toContainText('RELEASED');
});
```

---

## DEPLOYMENT CONFIGURATION

### Docker (backend)

**Dockerfile:**
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json .
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: product_profile
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgres://app_user:secure_password@postgres:5432/product_profile
      NODE_ENV: development
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Kubernetes Deployment

**deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: product-profile-backend
  labels:
    app: product-profile
spec:
  replicas: 3
  selector:
    matchLabels:
      app: product-profile
  template:
    metadata:
      labels:
        app: product-profile
    spec:
      containers:
      - name: backend
        image: medicoexpress/product-profile:1.0.0
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: connection-string
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## CI/CD PIPELINE (GitHub Actions)

**build.yml:**
```yaml
name: Build & Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Check coverage
        run: npm run coverage
        # Fail if coverage < 80%
      
      - name: Build Docker image
        run: docker build -t medicoexpress/product-profile:${{ github.sha }} .
      
      - name: Push to Docker registry
        run: docker push medicoexpress/product-profile:${{ github.sha }}
      
      - name: Deploy to staging
        run: kubectl set image deployment/product-profile backend=medicoexpress/product-profile:${{ github.sha }}
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run security scan
        run: npm audit
```

---

## MODULE.CONFIG.JSON (Module Registry)

```json
{
  "id": "product-profile",
  "name": "Product Profile Module",
  "version": "1.0.0",
  "description": "Complete product profile development with SOP compliance",
  "status": "active",
  "taskId": "task-6",
  "batchNumber": 1,
  "targetCompletionDate": "2026-06-18",
  
  "backend": {
    "service": "product-profile-service",
    "port": 3001,
    "apiEndpoint": "http://product-profile-service:3001",
    "apiVersion": "v1"
  },
  
  "frontend": {
    "components": [
      "ProductProfileForm",
      "ProductProfileViewer",
      "GateStatusPanel",
      "ApprovalWorkflow",
      "FairBalanceCalculator"
    ],
    "port": 5173
  },
  
  "database": {
    "engine": "PostgreSQL",
    "tables": [
      "product_profiles",
      "gates",
      "approval_signatures",
      "decision_logs",
      "audit_trail"
    ]
  },
  
  "dependencies": [],
  
  "permissions": [
    "product:read",
    "product:write",
    "gate:assess",
    "approval:sign",
    "audit:read"
  ],
  
  "integrations": {
    "clincommandos": {
      "apiGateway": "http://api-gateway:8000",
      "componentImports": [
        "ProductProfileForm",
        "ProductProfileViewer"
      ],
      "authRequired": true
    }
  },
  
  "qualityGates": {
    "testCoverageMinimum": 80,
    "gatePassRateTarget": 95,
    "securityScanRequired": true
  }
}
```

---

## READY FOR EXECUTION

**This module blueprint is complete and ready for development June 14, 2026.**

Next steps:
1. ✅ Clone module from template
2. ✅ Setup PostgreSQL + environment variables
3. ✅ Develop backend services (3 days)
4. ✅ Develop React components (2 days)
5. ✅ Write & run all tests (1 day)
6. ✅ Deploy to staging (1 day)
7. ✅ Integration testing with ClinCommandOS (2 days)
8. ✅ Release to production (Jun 18)

**Team Assignment:**
- 2 Backend engineers (Task 6 & 7)
- 2 Frontend engineers (Task 6 & 7)
- 2 QA engineers (Testing & gates)
- 1 DevOps engineer (Docker/K8s)

**Success Criteria:**
- All 10 quality gates pass
- 89%+ test coverage
- <200ms API response time (p95)
- Zero security vulnerabilities
- Complete audit trail

---

**END OF TASK 6 MODULE BLUEPRINT**

