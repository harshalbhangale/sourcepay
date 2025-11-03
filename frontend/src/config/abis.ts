// Smart Contract ABIs for SourcePay

export const MUSD_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "initialSupply", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "allowance", "type": "uint256" },
      { "internalType": "uint256", "name": "needed", "type": "uint256" }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "sender", "type": "address" },
      { "internalType": "uint256", "name": "balance", "type": "uint256" },
      { "internalType": "uint256", "name": "needed", "type": "uint256" }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "faucet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const PROJECT_ESCROW_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_musdToken", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "FundsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "recipient", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "FundsReleased",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "projectId", "type": "uint256" }],
    "name": "getProjectBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "depositFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "releaseFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const FEATURE_TASK_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "bountyAmount", "type": "uint256" },
      { "internalType": "string", "name": "githubIssueUrl", "type": "string" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" }
    ],
    "name": "createTask",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "internalType": "address", "name": "assignee", "type": "address" }
    ],
    "name": "assignTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "internalType": "string", "name": "prUrl", "type": "string" }
    ],
    "name": "submitTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "taskId", "type": "uint256" }],
    "name": "getTask",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "projectId", "type": "uint256" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "bountyAmount", "type": "uint256" },
          { "internalType": "address", "name": "assignee", "type": "address" },
          { "internalType": "uint8", "name": "status", "type": "uint8" },
          { "internalType": "string", "name": "githubIssueUrl", "type": "string" },
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "updatedAt", "type": "uint256" }
        ],
        "internalType": "struct FeatureTask.Task",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "bountyAmount", "type": "uint256" }
    ],
    "name": "TaskCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "assignee", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "assignedAt", "type": "uint256" }
    ],
    "name": "TaskAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "submitter", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "prUrl", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "submittedAt", "type": "uint256" }
    ],
    "name": "TaskSubmitted",
    "type": "event"
  }
] as const;

export const PAYOUT_DISTRIBUTOR_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_escrow", "type": "address" },
      { "internalType": "address", "name": "_musdToken", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "internalType": "uint256", "name": "projectId", "type": "uint256" },
      { "internalType": "address", "name": "contributor", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "score", "type": "uint256" }
    ],
    "name": "createPayout",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "payoutId", "type": "uint256" }],
    "name": "processPayout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "payoutId", "type": "uint256" },
      { "indexed": true, "internalType": "uint256", "name": "taskId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "contributor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "PayoutCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "payoutId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "contributor", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "success", "type": "bool" }
    ],
    "name": "PayoutProcessed",
    "type": "event"
  }
] as const;

