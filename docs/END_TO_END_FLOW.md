# 🚀 SourcePay - Complete End-to-End Flow

**Your MUSD Address:** `0xAF150474e242bF7c40408Ad47f91645B53e275cD`  
**Your Balance:** 1,000,000 MUSD ✅

---

## 🎯 How Everything Works Together

### **The Three Layers:**

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  - User Interface                                       │
│  - Wallet Connection (RainbowKit)                       │
│  - Smart Contract Interactions                          │
│  - API Calls to Backend                                 │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Express + Prisma)                 │
│  - Database (PostgreSQL)                                │
│  - REST API Endpoints                                   │
│  - Source Agent (AI Code Reviewer)                      │
│  - Business Logic                                       │
└─────────────────────────────────────────────────────────┘
                          ↓ ↑
┌─────────────────────────────────────────────────────────┐
│          SMART CONTRACTS (Mezo Testnet)                 │
│  - Mock MUSD (Your Token)                               │
│  - ProjectRegistry                                      │
│  - ProjectEscrow                                        │
│  - FeatureTask                                          │
│  - PayoutDistributor                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Complete User Journey

### **Scenario: Project Owner Creates Project → Developer Claims Task → Gets Paid**

---

## 🏗️ Phase 1: Project Creation (You - Project Owner)

### **What Happens:**

1. **Frontend:**
   - You connect wallet (MetaMask with 1M MUSD)
   - Navigate to `/projects/create`
   - Fill in project details
   - Click "Create Project"

2. **Smart Contract Layer:**
   ```solidity
   // 1. Approve MUSD spending
   MUSD.approve(ProjectEscrow, bountyAmount)
   
   // 2. Create project on-chain
   ProjectRegistry.createProject(...)
   
   // 3. MUSD transferred to escrow
   MUSD.transferFrom(you, escrow, bountyAmount)
   ```

3. **Backend Layer:**
   ```
   POST /api/projects
   → Creates project record in database
   → Links wallet address to user
   → Stores project metadata
   ```

4. **Result:**
   - Project visible at `/projects`
   - Your MUSD locked in escrow
   - Project status: ACTIVE

---

## 📋 Phase 2: Task Creation (You - Project Owner)

### **What Happens:**

1. **Frontend:**
   - Go to your project page
   - Click "Add Task"
   - Define task details and bounty
   - Submit

2. **Smart Contract Layer:**
   ```solidity
   // Create task on-chain (linked to project)
   FeatureTask.createTask(
     projectId,
     bountyAmount,
     metadata
   )
   ```

3. **Backend Layer:**
   ```
   POST /api/tasks
   → Creates task in database
   → Validates bounty doesn't exceed project budget
   → Only project owner can create tasks
   ```

4. **Result:**
   - Task visible at `/tasks`
   - Status: OPEN
   - Available for claiming

---

## 🎯 Phase 3: Task Claiming (Developer)

### **What Happens:**

1. **Frontend:**
   - Developer (different wallet) connects
   - Browses `/tasks`
   - Sees your OPEN task
   - Clicks "Claim Task"

2. **Backend Only:** (No blockchain yet)
   ```
   POST /api/tasks/{taskId}/claim
   Body: { walletAddress: "0xDeveloper..." }
   
   → Validates task is OPEN
   → Checks claimer is not project owner
   → Updates task status to ASSIGNED
   → Records assignee wallet address
   ```

3. **Result:**
   - Task status: OPEN → ASSIGNED
   - Developer can now work on it
   - No gas fees for claiming!

---

## 💻 Phase 4: Developer Works (Off-Chain)

### **What Happens:**

1. Developer goes to GitHub
2. Forks/clones the repository
3. Writes code to solve the task
4. Creates a Pull Request (PR)
5. Gets PR URL: `https://github.com/user/repo/pull/123`

**No blockchain or backend involved here - just coding!**

---

## ✉️ Phase 5: Work Submission (Developer)

### **What Happens:**

1. **Frontend:**
   - Developer goes to `/tasks`
   - Finds their ASSIGNED task
   - Clicks "Submit Work"
   - Enters GitHub PR URL
   - Submits

2. **Backend Layer:** (🤖 **SOURCE AGENT MAGIC!**)
   ```
   POST /api/tasks/{taskId}/submit
   Body: { prUrl: "github.com/.../pull/123", walletAddress: "0xDev..." }
   
   → Validates PR URL format
   → Checks developer is the assignee
   → Calls Source Agent to analyze PR
   
   🤖 SOURCE AGENT ANALYSIS:
   → Fetches PR diff from GitHub
   → Analyzes code quality (30%)
   → Checks test coverage (20%)
   → Reviews documentation (15%)
   → Evaluates PR description (15%)
   → Checks code style (10%)
   → Measures impact (10%)
   
   → Generates score (0-100)
   → Creates detailed feedback
   
   IF score >= 60:
     → Status: APPROVED
     → Task status: COMPLETED
     → Creates payout record
     → Calculates: payout = bounty × (score/100)
     → Updates developer reputation
   ELSE:
     → Status: REJECTED
     → Task status: DISPUTED
     → No payout
   ```

3. **Database Updates:**
   ```
   - Contribution record created
   - Score and feedback stored
   - Payout record created (if approved)
   - Task status updated
   - Developer reputation increased
   ```

4. **Result:**
   - Developer gets instant feedback
   - If approved: Payout pending
   - If rejected: Can improve and resubmit

---

## 💰 Phase 6: Payout Processing (Smart Contracts)

### **What Happens:**

1. **Smart Contract Layer:**
   ```solidity
   // Triggered when contribution approved
   PayoutDistributor.distributePayout(
     taskId,
     developer,
     payoutAmount
   )
   
   → Calls ProjectEscrow
   → MUSD transferred from escrow to developer
   → Emits PayoutProcessed event
   ```

2. **Backend Updates:**
   ```
   → Updates payout status: PENDING → COMPLETED
   → Records transaction hash
   → Updates user's total earnings
   ```

3. **Result:**
   - Developer receives MUSD in wallet
   - Payout visible in transaction history
   - Everyone's happy! 🎉

---

## 🔄 Current State vs Full Implementation

### ✅ **What's Working NOW:**

| Component | Status | Details |
|-----------|--------|---------|
| Backend API | ✅ 100% | All endpoints tested and working |
| Database | ✅ 100% | PostgreSQL with Prisma, all relations |
| Source Agent | ✅ 100% | Auto-scoring PR submissions |
| User Management | ✅ 100% | Auto-creation, stats, activity |
| Projects (Backend) | ✅ 100% | CRUD operations |
| Tasks (Backend) | ✅ 100% | Create, claim, submit |
| Contributions | ✅ 100% | Scoring, feedback, payouts |
| Mock MUSD | ✅ 100% | Deployed, you have 1M tokens |

### ⚠️ **What Needs Smart Contract Integration:**

| Feature | Current State | Needs |
|---------|--------------|-------|
| Project Creation | Backend only | Connect to ProjectRegistry contract |
| Escrow Deposit | No integration | MUSD approval + deposit to escrow |
| Payout Distribution | Backend simulation | Connect to PayoutDistributor |
| On-chain Task Tracking | Not implemented | Optional - can stay off-chain |

---

## 🎮 How to Test End-to-End RIGHT NOW

### **Step 1: Start Everything**

```bash
# Terminal 1 - Backend
cd /Users/buddyharshal/Desktop/SourcePay/backend
npm run dev:tsx

# Terminal 2 - Frontend
cd /Users/buddyharshal/Desktop/SourcePay/frontend
npm run dev
```

### **Step 2: Create a Project (As Owner)**

1. Open http://localhost:3000
2. Connect your wallet (the one with 1M MUSD)
3. Go to `/projects/create`
4. Fill in:
   - Name: "Test Project"
   - Description: "Testing SourcePay"
   - Repository: "https://github.com/youruser/repo"
   - Total Bounty: "1000" MUSD
5. Click "Create Project"

**What happens:** Backend creates project record

### **Step 3: Create a Task**

1. Go to your project page
2. Click "Add Task" (if available) or use API:

```bash
curl -X POST http://localhost:5001/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fix authentication bug",
    "description": "Fix the JWT token validation",
    "bountyAmount": "500",
    "difficulty": "Medium",
    "projectId": "YOUR_PROJECT_ID",
    "ownerWallet": "0x855bc3E892F22E8C9C99525799b885D5884471DD"
  }'
```

### **Step 4: Claim Task (Different Wallet)**

**Use a different wallet address!**

```bash
curl -X POST http://localhost:5001/api/tasks/TASK_ID/claim \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xDIFFERENT_WALLET_ADDRESS"
  }'
```

Or use the frontend with a different wallet connected.

### **Step 5: Submit Work**

```bash
curl -X POST http://localhost:5001/api/tasks/TASK_ID/submit \
  -H "Content-Type: application/json" \
  -d '{
    "prUrl": "https://github.com/test/repo/pull/42",
    "walletAddress": "0xDIFFERENT_WALLET_ADDRESS"
  }'
```

**🤖 SOURCE AGENT WILL:**
- Analyze the PR
- Generate score (0-100)
- Create detailed feedback
- Auto-approve if score >= 60
- Create payout record

### **Step 6: Check Results**

```bash
# Get contribution details
curl http://localhost:5001/api/contributions

# Get user stats
curl http://localhost:5001/api/users/0xDIFFERENT_WALLET_ADDRESS/stats
```

---

## 🔗 Adding Smart Contract Integration

To make the blockchain work, you need to connect the frontend to contracts:

### **1. Approve MUSD Spending**

```typescript
// In frontend when creating project
const musdContract = new ethers.Contract(MUSD_ADDRESS, MUSD_ABI, signer);
const escrowAddress = "0x355dE584F4E4a13c7a8587cF7E8a8C0237988035";

// Approve escrow to spend MUSD
await musdContract.approve(escrowAddress, bountyAmount);
```

### **2. Deposit to Escrow**

```typescript
const escrowContract = new ethers.Contract(escrowAddress, ESCROW_ABI, signer);

// Deposit MUSD into escrow
await escrowContract.deposit(projectId, bountyAmount);
```

### **3. Create Payout**

```typescript
// When contribution approved, trigger payout
const distributorContract = new ethers.Contract(
  DISTRIBUTOR_ADDRESS,
  DISTRIBUTOR_ABI,
  signer
);

await distributorContract.distributePayout(
  taskId,
  developerAddress,
  payoutAmount
);
```

---

## 🎯 What You Can Do RIGHT NOW

### **Without Smart Contract Integration:**

✅ Create projects (backend only)  
✅ Create tasks  
✅ Claim tasks  
✅ Submit work  
✅ **Get auto-scored by Source Agent** 🤖  
✅ See payout calculations  
✅ Track user stats and activity  

### **What's Missing:**

❌ Actual MUSD transfer to escrow  
❌ On-chain project registration  
❌ Automatic blockchain payout  

### **Workaround for Testing:**

You can manually send MUSD to developers using:

```bash
# In contracts directory
npx hardhat console --network mezoTestnet
```

```javascript
const musd = await ethers.getContractAt(
  "MockMUSD",
  "0xAF150474e242bF7c40408Ad47f91645B53e275cD"
);

// Send 500 MUSD to developer
await musd.transfer("0xDeveloperAddress", 500);
```

---

## 🚀 Next Steps to Full Integration

1. **Create React hooks for contract interactions:**
   - `useCreateProject` - Approve + deposit + backend API
   - `useClaimPayout` - Call PayoutDistributor
   - `useMUSDBalance` - Already exists!

2. **Update project creation flow:**
   - Add MUSD approval step
   - Call escrow deposit
   - Then save to backend

3. **Add payout claiming:**
   - Button to claim approved payouts
   - Calls smart contract
   - Updates backend with tx hash

---

## 📊 Current Architecture Summary

```
YOU (Project Owner)
  ↓
[Frontend] Connect Wallet → Shows 1M MUSD
  ↓
[Frontend] Create Project Form
  ↓
[Backend API] POST /api/projects → Database
  ↓
[Frontend] Create Task Form
  ↓
[Backend API] POST /api/tasks → Database
  
DEVELOPER (Different Wallet)
  ↓
[Frontend] Browse Tasks
  ↓
[Frontend] Click "Claim Task"
  ↓
[Backend API] POST /api/tasks/:id/claim → Database (Status: ASSIGNED)
  ↓
[GitHub] Developer creates PR
  ↓
[Frontend] Submit Work (PR URL)
  ↓
[Backend API] POST /api/tasks/:id/submit
  ↓
🤖 [Source Agent] Analyzes PR
  ├→ Fetches code diff
  ├→ Scores quality (0-100)
  ├→ Generates feedback
  └→ Auto-approves if score >= 60
  ↓
[Backend] Creates Payout Record
  ↓
[Database] Stores:
  - Contribution (score, feedback)
  - Payout (amount, status)
  - Updated task status
  - Developer reputation
  ↓
[Frontend] Shows approval + payout amount
```

---

## 🎉 What Makes This Special

1. **🤖 AI-Powered Code Review** - Source Agent automatically scores contributions
2. **💰 Instant Payout Calculation** - No manual review needed for scores >= 60
3. **📊 Transparent Scoring** - Detailed breakdown of code quality
4. **🚀 Fast Claims** - No gas fees to claim tasks (off-chain)
5. **💯 Fair Distribution** - Payout = Bounty × (Score/100)

---

## 🔧 Test It Now!

```bash
# Run this complete test
curl -X POST http://localhost:5001/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"AI Project","description":"Test","totalBounty":"1000","ownerWallet":"0x855bc3E892F22E8C9C99525799b885D5884471DD"}' \
  | jq .

# Should see your project created! 🎉
```

---

**Questions?** Let me know what you want to test or integrate next!


