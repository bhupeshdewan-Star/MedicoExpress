# PHASE 2: MODULAR ARCHITECTURE & INTEGRATION PLAN
## MedicoExpress Medical Affairs Digital Command Center
## Execution Strategy: 45 Tasks as Standalone Modules for ClinCommandOS Integration

**Timeline:** June 14 — July 31, 2026  
**Deliverables:** 45 standalone modules (Node.js/React components)  
**Integration Target:** ClinCommandOS main application  
**Status:** READY FOR EXECUTION (Phase 2 approved)

---

## EXECUTIVE OVERVIEW

Phase 2 will **NOT** create standalone documents. Instead, each of the 45 Medico-Marketing tasks will be developed as **fully-functional modules** (backend services + React components) that can be:

1. ✅ Tested independently
2. ✅ Integrated into ClinCommandOS main application
3. ✅ Reused across other pharmaceutical workflows
4. ✅ Maintained and upgraded separately
5. ✅ Version-controlled and deployed independently

This approach addresses the quality issues in the current ClinCommandOS application by building **modular, enterprise-grade components from the ground up**.

---

## WHY MODULAR ARCHITECTURE?

### Current ClinCommandOS Issues (Why Rebuild)

**Problems Identified:**
- ❌ Monolithic codebase (hard to maintain, test, scale)
- ❌ Tightly coupled components (changes break other features)
- ❌ No clear separation of concerns (medical logic mixed with UI logic)
- ❌ Limited reusability (modules can't be reused across projects)
- ❌ Poor testability (components depend on multiple systems)
- ❌ Difficult to deploy incrementally (must deploy entire app)

**Solution: Modular Architecture**
- ✅ Each module is independent (own database, API, UI)
- ✅ Loosely coupled (modules communicate via REST/GraphQL)
- ✅ Clear interfaces (contract between modules)
- ✅ Highly testable (unit test each module independently)
- ✅ Deployable independently (DevOps-friendly)
- ✅ Scalable (add modules without touching core app)
- ✅ Reusable (same module used in multiple contexts)

---

## MODULE STRUCTURE

### Standard Module Template

Each of the 45 tasks will follow this folder structure:

```
medicoexpress-modules/
├── medico-marketing-modules/
│   ├── product-appraisal/              (Task 1 - Phase 1 completed)
│   │   ├── backend/
│   │   │   ├── src/
│   │   │   │   ├── controllers/
│   │   │   │   │   └── appraisalController.js
│   │   │   │   ├── services/
│   │   │   │   │   └── appraisalService.js
│   │   │   │   ├── models/
│   │   │   │   │   └── Appraisal.js
│   │   │   │   ├── routes/
│   │   │   │   │   └── appraisalRoutes.js
│   │   │   │   ├── middleware/
│   │   │   │   │   ├── validation.js
│   │   │   │   │   ├── authorization.js
│   │   │   │   │   └── audit.js
│   │   │   │   ├── utils/
│   │   │   │   │   ├── scoring.js
│   │   │   │   │   └── compliance-checker.js
│   │   │   │   └── config/
│   │   │   │       └── database.js
│   │   │   ├── tests/
│   │   │   │   ├── unit/
│   │   │   │   │   └── appraisalService.test.js
│   │   │   │   ├── integration/
│   │   │   │   │   └── appraisalAPI.test.js
│   │   │   │   └── e2e/
│   │   │   │       └── appraisalWorkflow.test.js
│   │   │   ├── package.json
│   │   │   ├── Dockerfile
│   │   │   └── README.md
│   │   ├── frontend/
│   │   │   ├── src/
│   │   │   │   ├── components/
│   │   │   │   │   ├── AppraisalForm.jsx
│   │   │   │   │   ├── AppraisalScore.jsx
│   │   │   │   │   └── AppraisalHistory.jsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAppraisal.js
│   │   │   │   ├── services/
│   │   │   │   │   └── appraisalAPI.js
│   │   │   │   ├── styles/
│   │   │   │   │   └── appraisal.css
│   │   │   │   ├── pages/
│   │   │   │   │   └── AppraisalPage.jsx
│   │   │   │   └── App.jsx
│   │   │   ├── tests/
│   │   │   │   ├── components/
│   │   │   │   │   └── AppraisalForm.test.jsx
│   │   │   │   └── integration/
│   │   │   │       └── AppraisalFlow.test.jsx
│   │   │   ├── package.json
│   │   │   ├── vite.config.js
│   │   │   └── README.md
│   │   ├── sop/
│   │   │   └── SOP-MM-001-PRODUCT-APPRAISAL.md (from Phase 1)
│   │   ├── docs/
│   │   │   ├── API-SPECIFICATION.md
│   │   │   ├── COMPONENT-SPECIFICATION.md
│   │   │   ├── INTEGRATION-GUIDE.md
│   │   │   └── DEPLOYMENT-GUIDE.md
│   │   └── module.config.json
│   │       {
│   │         "moduleName": "product-appraisal",
│   │         "version": "1.0.0",
│   │         "type": "medico-marketing",
│   │         "dependencies": [],
│   │         "apiPort": 3001,
│   │         "database": "postgres",
│   │         "exports": {
│   │           "api": "/backend/src/routes/appraisalRoutes.js",
│   │           "component": "/frontend/src/components/AppraisalForm.jsx",
│   │           "service": "/backend/src/services/appraisalService.js"
│   │         }
│   │       }
│   │
│   ├── product-monograph/              (Task 2 - Phase 1 completed)
│   ├── scientific-narrative/           (Task 3 - Phase 1 completed)
│   ├── hcp-slide-deck/                (Task 4 - Phase 1 completed)
│   ├── medical-newsletter/             (Task 5 - Phase 1 completed)
│   │
│   ├── product-profile/                (Task 6 - Phase 2)
│   ├── competitive-analysis/           (Task 7 - Phase 2)
│   ├── launch-planning/                (Task 8 - Phase 2)
│   ├── clinical-evidence-summary/      (Task 9 - Phase 2)
│   ├── key-messages/                   (Task 10 - Phase 2)
│   ├── ... (Tasks 11-35 Phase 2)
│   └── compliance-archive/             (Task 50 - Phase 2)
│
└── integration/
    ├── module-registry.json             # Catalog of all modules
    ├── integration-tests/               # Cross-module tests
    ├── docker-compose.override.yml      # Spin up all modules locally
    └── INTEGRATION-ARCHITECTURE.md      # How modules work together
```

---

## PHASE 2 TASK ALLOCATION: 45 MODULES

### Batch 1: Tasks 6-10 (Jun 14-27) — Foundation Modules

#### **Task 6: Product Profile Module**
- **Backend Service:** Product profile CRUD API
  - Endpoints: POST /profiles, GET /profiles/:id, PUT /profiles/:id
  - Database: PostgreSQL (product_profiles table)
  - Validation: SOP-MM-002 compliance checks
  - Audit: Full audit trail for every change
- **Frontend Component:** Product profile editor + viewer
  - React components for creating/editing product profiles
  - Form validation, section completion tracking
  - Publish workflow with compliance gates
- **Tests:** Unit + Integration + E2E tests
- **Deployment:** Docker container, ready for Kubernetes
- **Integration Points:** Links to competitive-analysis, launch-planning modules

#### **Task 7: Competitive Analysis Module**
- **Backend Service:** Competitor data ingestion + analysis API
  - Endpoints: POST /competitors, GET /competitors/:id, POST /analysis
  - Analysis engine: Compare efficacy, safety, pricing, market share
  - Database: PostgreSQL (competitors table, analysis_results table)
- **Frontend Component:** Competitive matrix viewer, analysis dashboard
  - Interactive comparison tables
  - Market position visualization
  - Trend analysis charts
- **Tests:** Unit + Integration (with product-profile module)
- **Deployment:** Standalone Docker container
- **Integration Points:** Consumes product-profile data, feeds into launch-planning

#### **Task 8: Launch Planning Module**
- **Backend Service:** Launch plan generation + timeline management
  - Endpoints: POST /launch-plans, GET /launch-plans/:id, PUT /timeline
  - Calendar integration (Google Calendar API)
  - Milestone tracking, status updates
  - Database: PostgreSQL (launch_plans, milestones tables)
- **Frontend Component:** Launch timeline editor, Gantt chart view
  - Drag-and-drop milestone reordering
  - Resource allocation view
  - Risk tracking dashboard
- **Tests:** Unit + Integration (with competitive-analysis, key-messages)
- **Deployment:** Docker container
- **Integration Points:** Consumes competitive-analysis data, key-messages data

#### **Task 9: Clinical Evidence Summary Module**
- **Backend Service:** Trial data aggregation + summary generation
  - Endpoints: POST /evidence, GET /evidence/:id, POST /summary
  - Data source: FDA documents, published trials, company databases
  - Summary generation: Automated extraction of key stats
  - Database: PostgreSQL (clinical_evidence, trial_data tables)
- **Frontend Component:** Evidence viewer, summary PDF generator
  - Interactive evidence timeline
  - Trial results comparison
  - PDF export with compliance watermarks
- **Tests:** Unit + Integration
- **Deployment:** Docker container
- **Integration Points:** Feeds into product-monograph, scientific-narrative modules (from Phase 1)

#### **Task 10: Key Messages Module**
- **Backend Service:** Message vault + approval workflow
  - Endpoints: POST /messages, GET /messages/:category, PUT /approval
  - Approval workflow: Draft → Expert Review → Approved
  - Version control: Track message changes over time
  - Database: PostgreSQL (key_messages, message_versions tables)
- **Frontend Component:** Message editor, approval interface
  - Message template library
  - Compliance checker integration
  - Bulk export (for sales team)
- **Tests:** Unit + Integration
- **Deployment:** Docker container
- **Integration Points:** Consumed by HCP-briefing, medical-newsletter modules

**Batch 1 Resource Allocation:**
- Backend developers: 3 engineers × 2 weeks = 240 hours
- Frontend developers: 2 engineers × 2 weeks = 160 hours
- QA engineers: 2 engineers × 2 weeks = 160 hours
- DevOps/Infrastructure: 1 engineer × 2 weeks = 80 hours
- **Total Batch 1: 640 hours (0.8 FTE × 2 weeks)**

---

### Batch 2: Tasks 11-20 (Jun 28-Jul 11) — HCP Engagement Modules

#### **Task 11: HCP Briefing (Indication 1) Module**
- **Backend:** Briefing document generation, version control
- **Frontend:** Rich text editor, document viewer (PDF preview)
- **Integration:** Consumes product-profile, clinical-evidence-summary, key-messages

#### **Task 12: HCP Briefing (Indication 2) Module**
- **Variation of Task 11 (template reuse)**
- Same architecture, different indication data

#### **Task 13: Case Study #1 Module**
- **Backend:** Case repository, case study workflow engine
- **Frontend:** Case story editor, narrative builder
- **Integration:** Consumes product-profile, HCP-briefing data

#### **Task 14: Case Study #2 Module**
- **Variation of Task 13**

#### **Task 15: FAQ Module**
- **Backend:** FAQ database, Q&A workflow, approval engine
  - Endpoints: POST /faqs, GET /faqs (filtered), PUT /approval
  - Approval workflow: Compliance + Medical expert review
- **Frontend:** FAQ search + viewer, admin Q&A interface
- **Integration:** Consumes product data, key-messages

#### **Task 16: Objection Handling Module**
- **Backend:** Objection library, response generation
  - Endpoints: POST /objections, GET /responses/:objectionId
  - AI-powered (LLM) response suggestion based on objection type
- **Frontend:** Sales rep tool, objection library viewer
- **Integration:** Consumes product-profile, competitive-analysis data

#### **Task 17: Patient Education Module**
- **Backend:** Patient content generation, readability checking
  - Endpoints: POST /patient-content, GET /content/:id
  - Compliance: Plain language validation, on-label verification
- **Frontend:** Patient-friendly content editor, preview (mobile optimized)
- **Integration:** Consumes clinical-evidence, key-messages

#### **Task 18: HCP Training (General) Module**
- **Backend:** Training content management, progress tracking
  - Endpoints: POST /training, GET /training/:id, POST /completion
  - LMS integration (learning management system)
- **Frontend:** Training slide viewer, quiz engine, progress dashboard
- **Integration:** Consumes all prior modules (product, evidence, briefings, etc.)

#### **Task 19: HCP Training (Specialists) Module**
- **Variation of Task 18 (specialist-level content)**

#### **Task 20: Medical Society Submission Module**
- **Backend:** Abstract generation, submission tracking
  - Endpoints: POST /abstracts, GET /abstracts/:id, POST /submit
  - Congress/journal API integration
- **Frontend:** Abstract editor, submission tracker, revision history
- **Integration:** Consumes clinical-evidence, scientific-narrative

**Batch 2 Resource Allocation:**
- Backend developers: 3 engineers × 2 weeks = 240 hours
- Frontend developers: 3 engineers × 2 weeks = 240 hours
- QA engineers: 2 engineers × 2 weeks = 160 hours
- DevOps/Infrastructure: 1 engineer × 2 weeks = 80 hours
- **Total Batch 2: 720 hours (0.9 FTE × 2 weeks)**

---

### Batch 3: Tasks 21-35 (Jul 12-25) — Content & Expansion Modules

#### **Tasks 21-25: Product Infographics Modules (5 topics)**
- **Backend:** Infographic data service, SVG/PNG generation
  - Endpoints: POST /infographics, GET /infographics/:id
  - Data visualization: Chart.js, D3.js integration
- **Frontend:** Infographic designer, preview, export
- **Integration:** Consumes clinical-evidence, product data

#### **Tasks 26-30: Regional Medical Newsletter Modules (5 regions)**
- **Backend:** Localized content management, regional data sources
  - Endpoints: POST /newsletters/:region, GET /newsletters
  - Localization: Language translation, regional compliance rules
- **Frontend:** Newsletter editor, distribution manager, engagement analytics
- **Integration:** Consumes all medical content modules

#### **Tasks 31-35: Medical Content Localization Modules (5 languages)**
- **Backend:** Translation engine, compliance validation for each region
  - Endpoints: POST /localization, GET /content/:language
  - Translation: Human translation + AI validation
  - Compliance: Regional regulatory checks (UCPMP, ABPI, etc.)
- **Frontend:** Translation editor, regional preview, compliance checker
- **Integration:** Works with product-profile, clinical-evidence, key-messages

**Batch 3 Resource Allocation:**
- Backend developers: 3 engineers × 2 weeks = 240 hours
- Frontend developers: 2 engineers × 2 weeks = 160 hours
- QA engineers: 2 engineers × 2 weeks = 160 hours
- Localization specialists: 2 × 2 weeks = 160 hours
- **Total Batch 3: 720 hours (0.9 FTE × 2 weeks)**

---

### Batch 4: Tasks 36-50 (Jul 26-31) — Operations & Integration Modules

#### **Tasks 36-38: Field Force Training Modules (3 modules)**
- **Backend:** Training LMS, sales rep certification tracking
  - Endpoints: POST /training, GET /progress/:repId, POST /certification
  - Certification: Automatic quiz-based certification
- **Frontend:** Training dashboard, certification interface, progress tracking
- **Integration:** Consumes HCP-training, product-profile modules

#### **Tasks 39-40: Sales Support Modules (2 modules)**
- **Backend:** Sales collateral repository, digital sales aid
  - Endpoints: POST /collateral, GET /collateral/:repId (personalized)
  - Sync: Local-first sync for offline access
- **Frontend:** Mobile-optimized collateral viewer, annotation tools
- **Integration:** Works offline with cloud sync

#### **Tasks 41-45: Congress Coverage Modules (5 modules)**
- **Backend:** Congress data integration, session tracking
  - Endpoints: POST /congress, GET /sessions/:congressId
  - Real-time: Updates on conference presentations, findings
- **Frontend:** Congress dashboard, session tracker, finding aggregator
- **Integration:** Feeds into medical-newsletter, scientific-narrative modules

#### **Tasks 46-48: Digital Content Modules (3 modules)**
- **Backend:** Digital asset management, social media API integration
  - Endpoints: POST /digital-content, GET /content/:platform
  - Publishing: Social media, email, web
- **Frontend:** Content scheduler, multi-channel publisher, analytics
- **Integration:** Consumes all medical content modules

#### **Tasks 49-50: Compliance & Archive Modules (2 modules)**
- **Backend:** Compliance audit engine, archive management
  - Endpoints: POST /compliance-check, GET /audit-trail, POST /archive
  - Audit trail: Immutable log of all activities
  - Archive: Long-term storage with retention policies
- **Frontend:** Compliance dashboard, audit viewer, archive search
- **Integration:** Touches all modules (compliance gates on everything)

**Batch 4 Resource Allocation:**
- Backend developers: 3 engineers × 1 week = 120 hours
- Frontend developers: 2 engineers × 1 week = 80 hours
- QA engineers: 2 engineers × 1 week = 80 hours
- DevOps/Infrastructure: 1 engineer × 1 week = 40 hours
- Compliance specialists: 1 × 1 week = 40 hours
- **Total Batch 4: 360 hours (0.45 FTE × 1 week)**

---

## MODULE INTEGRATION ARCHITECTURE

### How Modules Connect to ClinCommandOS

**ClinCommandOS Main Application** (existing, being improved)
```
┌─────────────────────────────────────────────────┐
│         ClinCommandOS Web Application            │
│  (React frontend + Express.js backend)           │
│                                                   │
│  ┌───────────────────────────────────────────┐  │
│  │        Module Integration Layer            │  │
│  │  (API Gateway, Module Registry, Auth)      │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
         │         │         │         │         │
         ↓         ↓         ↓         ↓         ↓
    ┌─────────┬─────────┬─────────┬─────────┬─────────┐
    │ Product │  HCP    │ Clinical│ Field   │Compliance│
    │ Profile │Briefing │Evidence │Support  │ & Archive│
    │ Module  │ Module  │ Module  │ Module  │ Module  │
    └─────────┴─────────┴─────────┴─────────┴─────────┘
    (Each module is a separate Docker container)
```

### Module-to-Module Communication

**Pattern 1: REST API (Synchronous)**
```
Product-Profile Module
    → GET /api/product-profile/:id
    → Returns: {name, INN, indication, efficacy, safety, ...}

Competitive-Analysis Module
    → Calls product-profile API to get baseline
    → Returns: Competitor comparison matrix

Launch-Planning Module
    → Calls product-profile + competitive-analysis APIs
    → Returns: Launch timeline with competitive positioning
```

**Pattern 2: Event Streaming (Asynchronous)**
```
Product-Profile Module publishes: "product.updated" event
    → ClinCommandOS event bus (Redis pub/sub or Kafka)
    → Subscribed modules: clinical-evidence, key-messages, etc.
    → Triggered actions: Revalidate compliance, regenerate summaries
```

**Pattern 3: Shared Database (Read-Only)**
```
Product-Profile stores data in PostgreSQL (product_profiles table)
Competitive-Analysis reads from (product_profiles table)
Clinical-Evidence reads from (product_profiles, clinical_trials tables)
    → All modules use same PostgreSQL instance
    → Each module has its own schema (no conflicts)
    → Foreign keys establish data relationships
```

### Integration Points with ClinCommandOS

**Authentication & Authorization:**
- All modules use ClinCommandOS JWT token
- Module-level permissions (RBAC)
- User session management via Redis

**Audit & Compliance:**
- All modules log to centralized audit trail
- Compliance gates enforced at API gateway
- Signature/approval workflows via integration layer

**Data Persistence:**
- PostgreSQL: All module data
- Redis: Session cache, temporary data, event bus
- S3: Document storage (PDFs, infographics, etc.)

**Monitoring & Logging:**
- Centralized logging (ELK stack or CloudWatch)
- Metrics collection (Prometheus)
- Tracing (Jaeger or OpenTelemetry)

---

## DEVELOPMENT WORKFLOW

### Per-Module Development Cycle

**Week 1: Design & Setup**
1. **Day 1-2:** API design (OpenAPI spec)
   - Define endpoints
   - Request/response schemas
   - Error handling
   
2. **Day 3:** Database schema design
   - Create PostgreSQL tables
   - Define relationships
   
3. **Day 4-5:** Frontend component design
   - Wireframes
   - Component hierarchy
   - State management

**Week 2: Implementation**
1. **Day 1-3:** Backend implementation
   - Controllers, services, models
   - Database queries
   - Validation middleware
   - Audit logging
   
2. **Day 3-4:** Frontend implementation
   - React components
   - API integration
   - Form handling
   - Error states

**Week 3: Testing & Refinement**
1. **Day 1-2:** Unit tests
   - Service tests
   - Component tests
   - Utility tests
   
2. **Day 3:** Integration tests
   - API endpoint tests
   - Database transaction tests
   - Module-to-module communication
   
3. **Day 4-5:** E2E tests + QA
   - Full workflow testing
   - Browser testing
   - Performance testing
   
4. **Week 4:** Refinement
   - Bug fixes
   - Performance optimization
   - Documentation

### Parallel Development (Batching)

**Tasks 6-10 (5 modules in parallel):**
- Team 1 (2 engineers): Product-Profile backend + tests
- Team 2 (2 engineers): Competitive-Analysis backend + tests
- Team 3 (2 engineers): Launch-Planning frontend + tests
- Team 4 (2 engineers): Clinical-Evidence backend + frontend
- Team 5 (1 engineer): Key-Messages backend + frontend
- **QA team:** Cross-module integration tests

This parallel approach completes 5 modules in 2 weeks (vs. 10 weeks sequentially).

---

## QUALITY ASSURANCE (MODULE TESTING)

### Per-Module Testing Framework

```javascript
// Unit Tests (Backend)
describe('AppraisalService', () => {
  test('calculateScore() returns score 0-100', () => {
    const score = AppraisalService.calculateScore(mockData);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
  
  test('compliance gates pass on valid input', async () => {
    const result = await AppraisalService.validateCompliance(mockAppraisal);
    expect(result.pass).toBe(true);
    expect(result.exceptions).toEqual([]);
  });
});

// Integration Tests (API)
describe('GET /api/appraisal/:id', () => {
  test('returns 200 with valid appraisal', async () => {
    const response = await request(app)
      .get(`/api/appraisal/${appraisalId}`)
      .expect(200);
    expect(response.body.score).toBeDefined();
  });
  
  test('checks authorization on every call', async () => {
    const response = await request(app)
      .get(`/api/appraisal/${appraisalId}`)
      .set('Authorization', 'invalid-token')
      .expect(401);
  });
  
  test('logs to audit trail', async () => {
    await request(app)
      .get(`/api/appraisal/${appraisalId}`)
      .set('Authorization', validToken);
    const auditEntry = await auditLog.findOne({action: 'appraisal.read'});
    expect(auditEntry).toBeDefined();
  });
});

// Component Tests (Frontend)
describe('AppraisalForm', () => {
  test('renders all required input fields', () => {
    const {getByLabelText} = render(<AppraisalForm />);
    expect(getByLabelText('Product Name')).toBeInTheDocument();
    expect(getByLabelText('INN')).toBeInTheDocument();
    expect(getByLabelText('Stage')).toBeInTheDocument();
  });
  
  test('submits with valid data', async () => {
    const {getByText, getByLabelText} = render(<AppraisalForm />);
    fireEvent.change(getByLabelText('Product Name'), {target: {value: 'Vonoprazan'}});
    fireEvent.click(getByText('Submit'));
    expect(mockAPI.post).toHaveBeenCalledWith(expect.objectContaining({
      productName: 'Vonoprazan'
    }));
  });
});

// E2E Tests (Full Workflow)
describe('Appraisal Full Workflow', () => {
  test('user can create, review, and approve appraisal', async () => {
    // 1. Create appraisal via UI
    await page.goto('http://localhost:3000/appraisal');
    await page.fill('input[name="productName"]', 'Vonoprazan');
    await page.click('button[type="submit"]');
    
    // 2. API called successfully
    expect(mockAPI.post.mock.calls.length).toBeGreaterThan(0);
    
    // 3. QA compliance gates triggered automatically
    const complianceResult = await mockAPI.post.mock.results[0].value;
    expect(complianceResult.gatesPassed).toBe(true);
    
    // 4. Approval workflow initiated
    expect(mockAPI.post).toHaveBeenCalledWith(expect.objectContaining({
      action: 'approve'
    }));
  });
});
```

### Testing Metrics (Per Module)

| Metric | Target | Enforcement |
|--------|--------|-------------|
| **Code Coverage** | ≥80% | Fail build if <80% |
| **Unit Tests** | All public methods | Mandatory |
| **Integration Tests** | All API endpoints | Mandatory |
| **E2E Tests** | Happy path + error flows | Mandatory |
| **Performance** | API response <200ms | Load testing |
| **Security** | Pass OWASP Top 10 checks | Automated scanning |
| **Compliance** | All gates pass | Automated on build |

---

## DEPLOYMENT STRATEGY

### Per-Module Docker Image

```dockerfile
# Dockerfile for each module backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3001
HEALTH CHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
CMD ["npm", "start"]
```

### Docker Compose for Local Development

```yaml
# docker-compose.override.yml (local dev - all modules)
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: medicoexpress
  
  redis:
    image: redis:7-alpine
  
  product-profile:
    build: ./modules/product-profile/backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
  
  competitive-analysis:
    build: ./modules/competitive-analysis/backend
    ports:
      - "3002:3001"
    depends_on:
      - postgres
      - product-profile
  
  launch-planning:
    build: ./modules/launch-planning/backend
    ports:
      - "3003:3001"
    depends_on:
      - postgres
      - product-profile
      - competitive-analysis
  
  # ... 42 more modules ...
  
  clincommand-web:
    build: ./apps/web
    ports:
      - "5173:5173"
    environment:
      - VITE_API_GATEWAY=http://localhost:8000
```

### Kubernetes Deployment

```yaml
# k8s-deployment.yaml (production - ClinCommandOS main)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: clincommand-api-gateway
spec:
  template:
    spec:
      containers:
      - name: api-gateway
        image: clincommand/api-gateway:latest
        ports:
        - containerPort: 8000
        env:
        - name: MODULE_REGISTRY
          valueFrom:
            configMapKeyRef:
              name: module-registry
              key: registry.json
---
apiVersion: v1
kind: Service
metadata:
  name: product-profile-service
spec:
  selector:
    app: product-profile
  ports:
  - port: 3001
    targetPort: 3001
---
# ... 45 module services ...
```

### Deployment Flow

```
1. Developer commits code to GitHub
   ↓
2. GitHub Actions triggered (CI pipeline)
   ├─ Run tests (unit + integration + E2E)
   ├─ Code coverage check (must be >80%)
   ├─ Compliance validation (gates pass)
   ├─ Security scanning (OWASP Top 10)
   ├─ Build Docker image
   ├─ Push to Docker registry (if all checks pass)
   ↓
3. Module deployed to staging Kubernetes cluster
   ├─ Health checks pass
   ├─ Integration tests run against staging
   ├─ Performance baseline checks
   ↓
4. Manual approval (QA team signs off)
   ↓
5. Module deployed to production Kubernetes cluster
   ├─ Canary deployment (10% of traffic)
   ├─ Monitor error rates, latency
   ├─ Gradual rollout to 100% (if healthy)
   ↓
6. Module available in ClinCommandOS main application
```

---

## INTEGRATION INTO CLINCOMMANDOS

### Module Registry (Central Catalog)

```json
// module-registry.json
{
  "modules": [
    {
      "id": "product-profile",
      "name": "Product Profile Module",
      "version": "1.0.0",
      "status": "active",
      "type": "medico-marketing",
      "endpoints": {
        "api": "http://product-profile-service:3001/api",
        "health": "http://product-profile-service:3001/health"
      },
      "dependencies": [],
      "exports": {
        "component": "@medicoexpress/product-profile/AppraisalForm",
        "service": "@medicoexpress/product-profile/appraisalService",
        "api": "http://product-profile-service:3001/api"
      },
      "permissions": ["product:read", "product:write", "product:approve"],
      "version": "1.0.0"
    },
    {
      "id": "competitive-analysis",
      "name": "Competitive Analysis Module",
      "version": "1.0.0",
      "status": "active",
      "type": "medico-marketing",
      "dependencies": ["product-profile"],
      ...
    },
    ...45 modules total...
  ]
}
```

### API Gateway (Integration Layer)

```javascript
// API Gateway routes all module requests
const express = require('express');
const moduleRegistry = require('./module-registry.json');

const router = express.Router();

// Dynamically route to modules based on registry
router.use('/api/:moduleId/:path*', async (req, res) => {
  const { moduleId, path } = req.params;
  const module = moduleRegistry.modules.find(m => m.id === moduleId);
  
  if (!module) {
    return res.status(404).json({ error: 'Module not found' });
  }
  
  // Check permissions
  const userPermissions = req.user.permissions;
  const requiredPermissions = module.permissions;
  if (!userPermissions.some(p => requiredPermissions.includes(p))) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  
  // Route to module
  const moduleURL = `${module.endpoints.api}/${path}`;
  const response = await fetch(moduleURL, {
    method: req.method,
    headers: {
      ...req.headers,
      'Authorization': req.headers.authorization,
      'X-Module-Call-Id': req.id, // Tracing
    },
    body: req.body
  });
  
  res.status(response.status).json(await response.json());
});

module.exports = router;
```

### React Component Integration

```javascript
// ClinCommandOS Dashboard integrates module components
import React, { useState } from 'react';
import { ProductProfileForm } from '@medicoexpress/product-profile';
import { CompetitiveAnalysisMatrix } from '@medicoexpress/competitive-analysis';
import { LaunchTimeline } from '@medicoexpress/launch-planning';

export default function MedicoMarketingDashboard() {
  const [productId, setProductId] = useState(null);
  
  return (
    <div className="dashboard">
      <h1>Medico-Marketing Module Suite</h1>
      
      {/* Product Profile Module */}
      <section>
        <ProductProfileForm 
          onSubmit={(data) => setProductId(data.id)}
          apiEndpoint="/api/product-profile"
        />
      </section>
      
      {productId && (
        <>
          {/* Competitive Analysis Module */}
          <section>
            <CompetitiveAnalysisMatrix 
              productId={productId}
              apiEndpoint="/api/competitive-analysis"
            />
          </section>
          
          {/* Launch Planning Module */}
          <section>
            <LaunchTimeline 
              productId={productId}
              apiEndpoint="/api/launch-planning"
            />
          </section>
        </>
      )}
    </div>
  );
}
```

---

## TIMELINE & MILESTONES

### Phase 2 Execution Calendar

```
WEEK 1-2 (Jun 14-27): Batch 1 Modules (5 modules)
├─ Jun 14: Kick-off, architecture review
├─ Jun 17: First module APIs deployed to staging
├─ Jun 20: First module integrated to main app (beta)
├─ Jun 24: All 5 modules in staging
├─ Jun 27: Batch 1 Release (5 modules live) ✅
│
WEEK 3-4 (Jun 28-Jul 11): Batch 2 Modules (10 modules)
├─ Jun 28: Batch 2 kick-off
├─ Jul 1: First 3 modules in staging
├─ Jul 4: All 10 modules in staging
├─ Jul 8: First 5 modules integrated to main app
├─ Jul 11: Batch 2 Release (10 modules live) ✅
│
WEEK 5-6 (Jul 12-25): Batch 3 Modules (15 modules)
├─ Jul 12: Batch 3 kick-off
├─ Jul 15: First batch (5 infographic modules) in staging
├─ Jul 18: Regional newsletter modules ready
├─ Jul 21: Localization modules tested
├─ Jul 25: Batch 3 Release (15 modules live) ✅
│
WEEK 7-8 (Jul 26-31): Batch 4 Modules (15 modules)
├─ Jul 26: Batch 4 intensive push
├─ Jul 28: All modules complete & tested
├─ Jul 29: Final integration testing
├─ Jul 30: Final compliance checks
├─ Jul 31: Batch 4 Release (15 modules live) ✅
│
PHASE 2 COMPLETE:
├─ 45 modules deployed
├─ All integrated with ClinCommandOS
├─ Ready for Phase 3 (Clinical Research modules)
└─ Ready for full UI/UX integration
```

---

## SUCCESS CRITERIA

### Phase 2 Module Delivery Success Metrics

| Metric | Target | Enforcement |
|--------|--------|-------------|
| **Modules Deployed** | 45/45 | Zero tolerance |
| **Test Coverage** | ≥80% per module | Automated check |
| **Quality Gates** | 100% pass rate | Mandatory approval |
| **API Response Time** | <200ms p95 | Load testing |
| **Uptime** | 99.9% in staging | SLA monitoring |
| **Security Scan** | Zero critical issues | Automated scanning |
| **Code Review** | 2 approvals min | Mandatory |
| **Documentation** | 100% complete | Checklist verification |
| **Integration Tests** | All pass | Automated on build |
| **On-Time Delivery** | Jul 31 deadline | Strict timeline |

---

## NEXT STEPS (UPON EXECUTIVE APPROVAL)

1. ✅ **June 7-13:** Final approval, team allocation
2. ✅ **June 14:** Phase 2 Kick-Off
   - Architecture review with engineering team
   - Module template review
   - Batch 1 task assignment
   - Development environment setup
3. **June 14-27:** Batch 1 Development
   - Code daily standups
   - Module-level code reviews
   - Continuous integration testing
4. **June 27:** Batch 1 Release to ClinCommandOS
5. **June 28-31:** Batch 2 Kickoff + Batch 1 Monitoring

---

## CONCLUSION

Phase 2 transforms MedicoExpress from a **document-generation project** into a **full-featured, modular, enterprise-grade medical affairs platform**.

Each of the 45 tasks becomes a **production-ready module** that:
- ✅ Is independently testable and deployable
- ✅ Integrates cleanly with ClinCommandOS
- ✅ Follows enterprise coding standards
- ✅ Has 100% test coverage
- ✅ Is audit-ready and compliance-certified
- ✅ Is scalable and maintainable long-term

This addresses the quality issues in the current ClinCommandOS by building **from scratch with proper architecture**, rather than trying to patch the existing monolithic application.

---

**Status:** READY FOR EXECUTION (Executive Approval Pending)

**Target Start:** June 14, 2026 (if approved June 13)

**Target Completion:** July 31, 2026

**Deliverable:** 45 production-ready modules integrated with ClinCommandOS main application

---

**END OF PHASE 2 MODULAR ARCHITECTURE PLAN**
