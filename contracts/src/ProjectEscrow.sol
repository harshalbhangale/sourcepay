// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProjectEscrow
 * @dev Holds MUSD funds for projects and manages payouts
 */
contract ProjectEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public musdToken;

    struct Escrow {
        uint256 projectId;
        address depositor;
        uint256 totalAmount;
        uint256 lockedAmount;
        uint256 availableAmount;
        bool exists;
    }

    // Mapping from project ID to Escrow
    mapping(uint256 => Escrow) private _escrows;

    // Authorized contracts that can lock/release funds
    mapping(address => bool) public authorizedContracts;

    // Events
    event Deposited(
        uint256 indexed projectId,
        address indexed depositor,
        uint256 amount
    );

    event Locked(
        uint256 indexed projectId,
        uint256 amount,
        address indexed lockedBy
    );

    event Released(
        uint256 indexed projectId,
        address indexed recipient,
        uint256 amount
    );

    event Refunded(
        uint256 indexed projectId,
        address indexed recipient,
        uint256 amount
    );

    event AuthorizedContractAdded(address indexed contractAddress);
    event AuthorizedContractRemoved(address indexed contractAddress);

    modifier onlyAuthorized() {
        require(
            authorizedContracts[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    constructor(address _musdToken) Ownable(msg.sender) {
        require(_musdToken != address(0), "Invalid MUSD token address");
        musdToken = IERC20(_musdToken);
    }

    /**
     * @dev Deposit funds into escrow for a project
     */
    function deposit(
        uint256 projectId,
        uint256 amount
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        musdToken.safeTransferFrom(msg.sender, address(this), amount);

        if (!_escrows[projectId].exists) {
            _escrows[projectId] = Escrow({
                projectId: projectId,
                depositor: msg.sender,
                totalAmount: amount,
                lockedAmount: 0,
                availableAmount: amount,
                exists: true
            });
        } else {
            _escrows[projectId].totalAmount += amount;
            _escrows[projectId].availableAmount += amount;
        }

        emit Deposited(projectId, msg.sender, amount);
    }

    /**
     * @dev Lock funds for a specific payout
     */
    function lock(
        uint256 projectId,
        uint256 amount
    ) external onlyAuthorized {
        Escrow storage escrow = _escrows[projectId];
        require(escrow.exists, "Escrow does not exist");
        require(
            escrow.availableAmount >= amount,
            "Insufficient available funds"
        );

        escrow.lockedAmount += amount;
        escrow.availableAmount -= amount;

        emit Locked(projectId, amount, msg.sender);
    }

    /**
     * @dev Release locked funds to recipient
     */
    function release(
        uint256 projectId,
        address recipient,
        uint256 amount
    ) external nonReentrant onlyAuthorized {
        Escrow storage escrow = _escrows[projectId];
        require(escrow.exists, "Escrow does not exist");
        require(escrow.lockedAmount >= amount, "Insufficient locked funds");
        require(recipient != address(0), "Invalid recipient");

        escrow.lockedAmount -= amount;
        escrow.totalAmount -= amount;

        musdToken.safeTransfer(recipient, amount);

        emit Released(projectId, recipient, amount);
    }

    /**
     * @dev Refund available funds to depositor
     */
    function refund(uint256 projectId) external nonReentrant {
        Escrow storage escrow = _escrows[projectId];
        require(escrow.exists, "Escrow does not exist");
        require(
            msg.sender == escrow.depositor || msg.sender == owner(),
            "Not authorized to refund"
        );
        require(escrow.availableAmount > 0, "No available funds to refund");

        uint256 refundAmount = escrow.availableAmount;
        escrow.availableAmount = 0;
        escrow.totalAmount -= refundAmount;

        musdToken.safeTransfer(escrow.depositor, refundAmount);

        emit Refunded(projectId, escrow.depositor, refundAmount);
    }

    /**
     * @dev Add authorized contract
     */
    function addAuthorizedContract(address contractAddress) external onlyOwner {
        require(contractAddress != address(0), "Invalid contract address");
        authorizedContracts[contractAddress] = true;
        emit AuthorizedContractAdded(contractAddress);
    }

    /**
     * @dev Remove authorized contract
     */
    function removeAuthorizedContract(
        address contractAddress
    ) external onlyOwner {
        authorizedContracts[contractAddress] = false;
        emit AuthorizedContractRemoved(contractAddress);
    }

    /**
     * @dev Get escrow details for a project
     */
    function getEscrow(uint256 projectId) external view returns (Escrow memory) {
        require(_escrows[projectId].exists, "Escrow does not exist");
        return _escrows[projectId];
    }
}
