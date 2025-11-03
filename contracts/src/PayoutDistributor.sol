// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IProjectEscrow {
    function lock(uint256 projectId, uint256 amount) external;
    function release(uint256 projectId, address recipient, uint256 amount) external;
}

/**
 * @title PayoutDistributor
 * @dev Distributes payments to contributors based on scores
 */
contract PayoutDistributor is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IProjectEscrow public escrowContract;
    IERC20 public musdToken;

    struct Payout {
        uint256 taskId;
        uint256 projectId;
        address contributor;
        uint256 amount;
        uint256 score;
        PayoutStatus status;
        uint256 createdAt;
        uint256 processedAt;
    }

    enum PayoutStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }

    // Payout ID counter
    uint256 private _payoutIdCounter;

    // Mapping from payout ID to Payout
    mapping(uint256 => Payout) private _payouts;

    // Mapping from task ID to payout ID
    mapping(uint256 => uint256) private _taskPayouts;

    // Events
    event PayoutCreated(
        uint256 indexed payoutId,
        uint256 indexed taskId,
        address indexed contributor,
        uint256 amount
    );

    event PayoutProcessed(
        uint256 indexed payoutId,
        address indexed contributor,
        uint256 amount,
        bool success
    );

    event PayoutClaimed(
        uint256 indexed payoutId,
        address indexed contributor,
        uint256 amount
    );

    constructor(
        address _escrowContract,
        address _musdToken
    ) Ownable(msg.sender) {
        require(_escrowContract != address(0), "Invalid escrow address");
        require(_musdToken != address(0), "Invalid MUSD token address");
        escrowContract = IProjectEscrow(_escrowContract);
        musdToken = IERC20(_musdToken);
        _payoutIdCounter = 1;
    }

    /**
     * @dev Create a payout for a contributor
     */
    function createPayout(
        uint256 taskId,
        uint256 projectId,
        address contributor,
        uint256 amount,
        uint256 score
    ) external onlyOwner returns (uint256) {
        require(contributor != address(0), "Invalid contributor address");
        require(amount > 0, "Amount must be greater than 0");
        require(_taskPayouts[taskId] == 0, "Payout already exists for task");

        uint256 payoutId = _payoutIdCounter++;

        _payouts[payoutId] = Payout({
            taskId: taskId,
            projectId: projectId,
            contributor: contributor,
            amount: amount,
            score: score,
            status: PayoutStatus.PENDING,
            createdAt: block.timestamp,
            processedAt: 0
        });

        _taskPayouts[taskId] = payoutId;

        emit PayoutCreated(payoutId, taskId, contributor, amount);

        return payoutId;
    }

    /**
     * @dev Process a single payout
     */
    function processPayout(
        uint256 payoutId
    ) external nonReentrant onlyOwner {
        Payout storage payout = _payouts[payoutId];
        require(payout.createdAt > 0, "Payout does not exist");
        require(
            payout.status == PayoutStatus.PENDING,
            "Payout already processed"
        );

        payout.status = PayoutStatus.PROCESSING;

        try
            escrowContract.release(
                payout.projectId,
                payout.contributor,
                payout.amount
            )
        {
            payout.status = PayoutStatus.COMPLETED;
            payout.processedAt = block.timestamp;
            emit PayoutProcessed(payoutId, payout.contributor, payout.amount, true);
        } catch {
            payout.status = PayoutStatus.FAILED;
            emit PayoutProcessed(payoutId, payout.contributor, payout.amount, false);
        }
    }

    /**
     * @dev Batch process multiple payouts
     */
    function batchProcessPayouts(
        uint256[] calldata payoutIds
    ) external nonReentrant onlyOwner {
        for (uint256 i = 0; i < payoutIds.length; i++) {
            uint256 payoutId = payoutIds[i];
            Payout storage payout = _payouts[payoutId];

            if (
                payout.createdAt > 0 &&
                payout.status == PayoutStatus.PENDING
            ) {
                payout.status = PayoutStatus.PROCESSING;

                try
                    escrowContract.release(
                        payout.projectId,
                        payout.contributor,
                        payout.amount
                    )
                {
                    payout.status = PayoutStatus.COMPLETED;
                    payout.processedAt = block.timestamp;
                    emit PayoutProcessed(
                        payoutId,
                        payout.contributor,
                        payout.amount,
                        true
                    );
                } catch {
                    payout.status = PayoutStatus.FAILED;
                    emit PayoutProcessed(
                        payoutId,
                        payout.contributor,
                        payout.amount,
                        false
                    );
                }
            }
        }
    }

    /**
     * @dev Get payout by ID
     */
    function getPayout(uint256 payoutId) external view returns (Payout memory) {
        require(_payouts[payoutId].createdAt > 0, "Payout does not exist");
        return _payouts[payoutId];
    }

    /**
     * @dev Get payout by task ID
     */
    function getPayoutByTask(uint256 taskId) external view returns (uint256) {
        return _taskPayouts[taskId];
    }

    /**
     * @dev Update escrow contract address
     */
    function updateEscrowContract(address newEscrow) external onlyOwner {
        require(newEscrow != address(0), "Invalid escrow address");
        escrowContract = IProjectEscrow(newEscrow);
    }
}
