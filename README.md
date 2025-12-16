
# Game Database API

A Node.js/Express backend application for managing a game database with support for iOS and Android games. This application provides a RESTful API to create, read, update, delete, and search games, as well as populate the database with top 100 games from App Store and Google Play Store.

⚠️ For each feature (A and B) I use an [INVEST](https://www.invensislearning.com/blog/agile-invest-model-to-write-user-stories/#:~:text=INVEST%20is%20an%20acronym%20that,-quality,%20specific%20user%20stories.) method to have little - estimable and testable feature. 
Explain below ⬇️

### FEATURE A: Search Functionality
:warning: You can read each description of PR to have more informations about technical choices.

I first do the feature with all functionnalities and Unit test
- [PR : -- add search game feature + TU --](https://github.com/XyDisorder/technical-interview/pull/1)

When my MR were validated (by me in this case) I move the search.html into the main index.htm
- [PR : ---move search.html into index.html and delete it --](https://github.com/XyDisorder/technical-interview/pull/2)

----

### FEATURE B: Populate Database with Top 100 Games
:warning: You can read each description of PR to have more informations about technical choices.

For this feature, one PR split in 2 commit to be more readable ([feature](https://github.com/XyDisorder/technical-interview/pull/3/commits/d59286d7b3545bd5568e18b9fd7bbc81ed9520c4) and [TU](https://github.com/XyDisorder/technical-interview/pull/3/commits/09243e6e82ae21ee791b30efdd56872813c180fb))
- [PR : -- Top 100 app populate](https://github.com/XyDisorder/technical-interview/pull/3)
-----

###  Fix 🔴  Quick win  for Production-Ready
1. **Centralized Error Handling** 
**Impact**: High - Security and user experience
**Effort**: Medium
**Problem**: Sequelize errors exposed directly, inconsistent handling  

2. **Input Validation** 
**Impact**: High - Security and data quality
**Effort**: Medium




# Theory Questions - Answers / NEXT TECHNICAL STEPS TO IMPROVE

TLDR;  
**Question 1**: The application needs database migration, security (auth), monitoring, caching, CI/CD, and comprehensive testing to be production-ready. Prioritize database and security first.

**Question 2**: Implement event-driven architecture using S3 notifications → Lambda → API for real-time processing, or scheduled jobs for predictable batch processing. Add idempotency and monitoring for reliability.

## Question 1: Production Readiness - Missing Pieces & Action Plan

### Current State Analysis

The application has basic functionality but lacks several critical production-ready components. Here's what's missing and an action plan to address each:

### Critical Missing Pieces

#### 0. **Architecture Refactoring - Separation of Concerns**

**Problem:**
All application logic is in a single `index.js` file (151 lines). Routes, business logic, and database queries are all mixed together. This creates several issues:
- Hard to maintain: Finding and modifying code requires navigating through a large file
- Difficult to test: Business logic is tightly coupled with HTTP handling
- Poor scalability: Adding new features requires modifying the main file
- No clear boundaries: Routes, controllers, and services are indistinguishable

**Current Structure:**
```
index.js (everything - 151 lines)
  ├── Route definitions
  ├── Request/response handling
  ├── Business logic
  └── Database queries
```

**Solution: Separate Routes/Controllers/Services**

**Target Structure:**
```
routes/
  └── games.routes.js      # Route definitions only
controllers/
  └── games.controller.js  # Request/response handling
services/
  ├── games.service.js     # Business logic
  └── populate.service.js   # Populate-specific logic
```

**Benefits:**
- **Maintainability**: Easy to find and modify code - each file has a single responsibility
- **Testability**: Services can be tested independently without HTTP layer
- **Scalability**: Easy to add new features without touching existing code
- **Separation of Concerns**: Clear boundaries between layers (HTTP → Controller → Service → Database)
- **Code Reusability**: Services can be reused across different controllers or even different applications
- **Team Collaboration**: Multiple developers can work on different layers simultaneously

**Implementation Example:**
```javascript
// routes/games.routes.js
router.get('/', gamesController.getAll);
router.post('/', validateGame, gamesController.create);

// controllers/games.controller.js
const getAll = async (req, res, next) => {
  try {
    const games = await gamesService.findAll();
    res.json(games);
  } catch (error) {
    next(error);
  }
};

// services/games.service.js
const findAll = async () => {
  return db.Game.findAll();
};
```

**Action Plan:**
1. Extract route definitions to `routes/games.routes.js`
2. Create controllers to handle HTTP request/response
3. Move business logic to service layer
4. Update tests to work with new structure
5. Ensure all functionality remains intact

**Effort**: Medium (2-3 hours)
**Impact**: High - Foundation for all future improvements. This refactoring makes all other improvements easier to implement.

#### 1. **Database & Infrastructure**
- **SQLite in production**: SQLite is not suitable for production with multiple concurrent users
- **No connection pooling**: No database connection management
- **No database backups**: No backup strategy
- **No migration strategy**: Migrations exist but no rollback plan for production

**Action Plan:**
- Migrate to PostgreSQL or MySQL for production
- Implement connection pooling (Sequelize supports this)
- Set up automated daily backups
- Create rollback procedures and test them

#### 2. **Security**
- **No authentication/authorization**: API is completely open
- **No HTTPS enforcement**: No SSL/TLS configuration
- **No API keys or rate limiting per user**: Only global rate limiting
- **SQL injection risks**: While Sequelize helps, need to audit all queries

**Action Plan:**
- Implement JWT-based authentication
- Add role-based access control (RBAC)
- Enforce HTTPS in production
- Add API key management for internal services
- Security audit of all database queries

#### 3. **Monitoring & Observability**
- **No application monitoring**: No APM (Application Performance Monitoring)
- **No error tracking**: Errors only logged to console
- **No metrics collection**: No performance metrics
- **No health checks**: No way to verify service health
- **No alerting**: No alerts for critical issues

**Action Plan:**
- Integrate error tracking (Sentry, Rollbar)
- Add APM tool (New Relic, Datadog, or open-source alternatives)
- Implement health check endpoint (`/health`)
- Set up metrics collection (Prometheus + Grafana)
- Configure alerts for error rates, response times, database connections

#### 4. **Scalability & Performance**
- **No caching**: Every request hits the database
- **No pagination**: GET /api/games returns all games
- **No database indexes**: Queries will slow down with data growth
- **No CDN**: Static files served directly from Express
- **Single instance**: No horizontal scaling capability

**Action Plan:**
- Add Redis for caching frequently accessed data
- Implement pagination on all list endpoints
- Add database indexes on frequently queried fields (name, platform, storeId)
- Move static files to CDN (CloudFront, Cloudflare)
- Design for stateless application (enables horizontal scaling)

#### 5. **Configuration & Environment Management**
- **Hardcoded values**: Port, URLs hardcoded in code
- **No environment-specific configs**: Same config for dev/staging/prod
- **No secrets management**: Sensitive data in code/config files

**Action Plan:**
- Use environment variables for all configuration
- Implement secrets management (AWS Secrets Manager, HashiCorp Vault)
- Create separate config files per environment
- Never commit secrets to version control

#### 6. **Testing & Quality Assurance**
- **Limited test coverage**: Only basic unit and integration tests
- **No E2E tests**: No end-to-end testing
- **No load testing**: No performance testing
- **No security testing**: No vulnerability scanning

**Action Plan:**
- Increase test coverage to >80%
- Add E2E tests for critical user flows
- Implement load testing (k6, Artillery)
- Regular security audits and dependency scanning

#### 7. **Deployment & CI/CD**
- **No CI/CD pipeline**: Manual deployment
- **No automated testing in pipeline**: Tests run manually
- **No deployment strategy**: No blue-green or canary deployments
- **No rollback mechanism**: No way to quickly revert

**Action Plan:**
- Set up CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins)
- Automated testing on every commit
- Implement deployment strategy (blue-green or canary)
- Automated rollback on health check failures

#### 8. **Documentation**
- **No API documentation**: No Swagger/OpenAPI spec
- **No deployment documentation**: No runbooks
- **No architecture documentation**: No system design docs

**Action Plan:**
- Generate OpenAPI/Swagger documentation
- Create deployment runbooks
- Document architecture and data flows
- Maintain changelog

### Prioritized Action Plan

**Phase 1: Critical (Week 1-2)**
1. Migrate database to PostgreSQL
2. Add environment variables and secrets management
3. Implement health check endpoint
4. Add basic monitoring (error tracking + metrics)

**Phase 2: High Priority (Week 3-4)**
5. Add authentication/authorization
6. Implement pagination and database indexes
7. Set up CI/CD pipeline
8. Add caching layer (Redis)

**Phase 3: Important (Week 5-6)**
9. Comprehensive testing (increase coverage)
10. API documentation (Swagger)
11. Load testing and performance optimization
12. Security audit

**Phase 4: Nice to Have (Week 7+)**
13. Advanced monitoring and alerting
14. CDN for static assets
15. Advanced deployment strategies

---

## Question 2: Daily Automated Population - Solution & Architecture

### Current Situation
- Data team delivers new files daily to S3 bucket
- Service needs to ingest files automatically via populate API
- Manual trigger is not scalable

### Proposed Solution: Event-Driven Architecture

#### Option 1: S3 Event-Driven (Recommended)

**Architecture:**
```
S3 Bucket → S3 Event Notification → AWS Lambda/EventBridge → API Endpoint
```

**Implementation:**
1. **S3 Event Notification**: Configure S3 to trigger on object creation
2. **AWS Lambda Function**: Triggered by S3 event, calls populate API
3. **API Endpoint**: Existing `/api/games/populate` endpoint (slightly modified)

**Benefits:**
- Real-time processing (immediate ingestion when files arrive)
- Serverless (no infrastructure to manage)
- Cost-effective (pay per execution)
- Automatic retry on failure

**Code Changes Needed:**
- Modify populate endpoint to accept optional S3 file paths
- Add Lambda function to handle S3 events
- Add idempotency check (don't process same file twice)

#### Option 2: Scheduled Job (Alternative)

**Architecture:**
```
Cron Job (AWS EventBridge/Cron) → API Endpoint → S3 Polling → Process Files
```

**Implementation:**
1. **Scheduled Task**: Run daily at specific time (e.g., 2 AM)
2. **S3 Polling**: Check for new files since last run
3. **Process Files**: Call populate endpoint for new files

**Benefits:**
- Predictable execution time
- Easier to monitor and debug
- Can batch process multiple files

**Drawbacks:**
- Not real-time (delay until scheduled time)
- May miss files if schedule is off

### Recommended Architecture (Option 1 Enhanced)

```
┌─────────────┐
│  S3 Bucket  │
│  (New Files)│
└──────┬──────┘
       │
       │ S3 Event (ObjectCreated)
       ▼
┌─────────────────┐
│  AWS EventBridge│
│  or Lambda      │
└──────┬──────────┘
       │
       │ HTTP Request
       ▼
┌─────────────────┐
│  Populate API   │
│  /api/games/    │
│  populate       │
└──────┬──────────┘
       │
       │ Process
       ▼
┌─────────────────┐
│   Database      │
└─────────────────┘
```

### Implementation Details

#### 1. Enhanced Populate Endpoint

**Modify `/api/games/populate` to accept optional parameters:**
```javascript
POST /api/games/populate
Body: {
  iosUrl?: string,      // Optional: override default iOS URL
  androidUrl?: string,  // Optional: override default Android URL
  source?: string       // Track source: 'manual' | 'scheduled' | 's3-event'
}
```

#### 2. Idempotency & Deduplication

**Add file tracking to prevent duplicate processing:**
- Store processed file metadata (ETag, last modified date)
- Check before processing to avoid duplicates
- Use database table: `processed_files(file_path, etag, processed_at)`

#### 3. Error Handling & Retry Logic

**Implement robust error handling:**
- Dead letter queue for failed processing
- Exponential backoff retry
- Alert on repeated failures
- Log all processing attempts

#### 4. Monitoring & Observability

**Track population metrics:**
- Success/failure rates
- Processing time
- Number of games added/updated
- File processing history

### Alternative: Message Queue Architecture

For higher reliability and scalability:

```
S3 → SQS → Worker Service → Database
```

**Benefits:**
- Guaranteed delivery
- Better error handling
- Can scale workers independently
- Better for high-volume scenarios

### Code Changes Required

1. **New Service Layer**: `services/populate.service.js`
   - Extract populate logic from route handler
   - Add idempotency checks
   - Add file tracking

2. **New Endpoint**: `POST /api/games/populate/from-s3`
   - Accepts S3 file paths
   - Validates file existence
   - Processes files

3. **Database Migration**: Add `processed_files` table
   - Track processed files
   - Prevent duplicates

4. **Lambda Function** (if using AWS):
   - Triggered by S3 events
   - Calls populate API
   - Handles errors and retries

### Recommended Approach

**For MVP/Initial Implementation:**
- Use **Option 1 (S3 Event-Driven)** with AWS Lambda
- Simple, cost-effective, real-time
- Minimal infrastructure changes

**For Production at Scale:**
- Use **Message Queue Architecture** (SQS + Workers)
- Better reliability and scalability
- More control over processing

### Action Plan

**Week 1 :**
1. Extract populate logic to service layer
2. Add idempotency checks
3. Create processed_files table
4. Modify populate endpoint to accept optional URLs
5. Add monitoring and logging
6. Test with manual S3 file uploads

**Week 2:**
7. Set up S3 event notifications
8. Create Lambda function (or scheduled job)
9. End-to-end testing

**Week 3:**
Cooldown phase && test

**Week 4:**
10. Production deployment
11. Monitor and optimize
12. Document process

---





