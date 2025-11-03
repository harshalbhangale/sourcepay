# SourcePay Backend - API Quick Reference

**Base URL:** `http://localhost:5001/api`  
**Server Status:** ✅ Running  
**Database:** ✅ Connected  

---

## 🔐 Authentication

### Get Nonce
```bash
POST /api/auth/nonce
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Login with Signature
```bash
POST /api/auth/login
Content-Type: application/json

{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "message": "Sign this message to authenticate with SourcePay: 1762103097224",
  "signature": "0x..."
}
```

### Verify Token
```bash
POST /api/auth/verify
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📁 Projects

### Get All Projects
```bash
GET /api/projects
```

### Get Project by ID
```bash
GET /api/projects/:id
```

### Create Project
```bash
POST /api/projects
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description",
  "repositoryUrl": "https://github.com/user/repo",
  "totalBounty": "1000",
  "ownerWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Update Project (Protected)
```bash
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "ACTIVE"
}
```

---

## 📋 Tasks

### Get All Tasks
```bash
GET /api/tasks
# Optional filters:
GET /api/tasks?status=OPEN
GET /api/tasks?projectId=<uuid>
```

### Get Task by ID
```bash
GET /api/tasks/:id
```

### Create Task
```bash
POST /api/tasks
Content-Type: application/json

{
  "title": "Implement Feature X",
  "description": "Detailed description",
  "bountyAmount": "250",
  "difficulty": "Medium",
  "githubIssueUrl": "https://github.com/user/repo/issues/1",
  "projectId": "<project-uuid>",
  "ownerWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Update Task
```bash
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "IN_PROGRESS",
  "ownerWallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Claim Task
```bash
POST /api/tasks/:id/claim
Content-Type: application/json

{
  "walletAddress": "0x1234567890123456789012345678901234567890"
}
```

### Submit Work (Auto-scores!)
```bash
POST /api/tasks/:id/submit
Content-Type: application/json

{
  "prUrl": "https://github.com/user/repo/pull/42",
  "walletAddress": "0x1234567890123456789012345678901234567890"
}

# Response includes:
# - Contribution with score
# - Payout details
# - Source Agent analysis
```

---

## ✨ Contributions

### Get All Contributions
```bash
GET /api/contributions
# Optional filters:
GET /api/contributions?status=APPROVED
GET /api/contributions?taskId=<uuid>
GET /api/contributions?contributorId=<uuid>
```

### Get Contribution by ID
```bash
GET /api/contributions/:id
```

### Score Contribution (Protected)
```bash
PUT /api/contributions/:id/score
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 85,
  "feedback": "Great work! Minor improvements needed..."
}
```

### Analyze Contribution (Protected)
```bash
POST /api/contributions/:id/analyze
Authorization: Bearer <token>

# Triggers Source Agent analysis
```

---

## 👤 Users

### Get User Stats
```bash
GET /api/users/:walletAddress/stats

# Returns:
# - projectsOwned
# - tasksClaimed
# - tasksCompleted
# - totalEarned
```

### Get User Activity
```bash
GET /api/users/:walletAddress/activity
# Optional:
GET /api/users/:walletAddress/activity?limit=20
```

---

## 🏥 System

### Health Check
```bash
GET /health

# Response:
{
  "status": "ok",
  "message": "SourcePay API is running"
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Error details"
}
```

---

## 🎯 Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (not allowed) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 📝 Task Status Flow

```
OPEN → ASSIGNED → IN_PROGRESS → SUBMITTED → COMPLETED
                                          ↘
                                         DISPUTED
```

---

## 💡 Quick Examples

### Complete Workflow Example
```bash
# 1. Create project
curl -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web3 DApp",
    "description": "Decentralized application",
    "totalBounty": "5000",
    "ownerWallet": "0xOWNER..."
  }'

# 2. Create task
curl -X POST http://localhost:5001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smart Contract Integration",
    "description": "Integrate escrow contracts",
    "bountyAmount": "1000",
    "projectId": "<project-id>",
    "ownerWallet": "0xOWNER..."
  }'

# 3. Claim task (different user)
curl -X POST http://localhost:5001/api/tasks/<task-id>/claim \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0xDEV..."}'

# 4. Submit work
curl -X POST http://localhost:5001/api/tasks/<task-id>/submit \
  -H "Content-Type: application/json" \
  -d '{
    "prUrl": "https://github.com/user/repo/pull/123",
    "walletAddress": "0xDEV..."
  }'
# → Auto-scores and creates payout!
```

---

## 🚨 Important Notes

1. **Auto-Scoring:** Task submission automatically triggers Source Agent analysis
2. **User Creation:** Users are auto-created when claiming tasks or creating projects
3. **Budget Validation:** Tasks cannot exceed project's available budget
4. **Owner Restrictions:** Project owners cannot claim their own tasks
5. **PR Validation:** Only valid GitHub PR URLs are accepted
6. **Payout Calculation:** Payout = (bountyAmount × score) / 100

---

## 🔒 Protected Endpoints

These require `Authorization: Bearer <token>` header:
- `PUT /api/projects/:id`
- `PUT /api/contributions/:id/score`
- `POST /api/contributions/:id/analyze`

---

## 📱 Frontend Integration Tips

```javascript
// Example: Claim a task
const claimTask = async (taskId, walletAddress) => {
  const response = await fetch(`http://localhost:5001/api/tasks/${taskId}/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('Task claimed!', data.data);
  } else {
    console.error('Error:', data.message);
  }
};
```

---

**Last Updated:** November 2, 2025  
**Server:** http://localhost:5001  
**Status:** ✅ All systems operational


