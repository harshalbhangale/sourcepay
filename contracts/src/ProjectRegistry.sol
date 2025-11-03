// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProjectRegistry
 * @dev Registry for all DevQuest projects
 */
contract ProjectRegistry is Ownable {
    struct Project {
        string name;
        string description;
        address owner;
        string ipfsHash;
        uint256 totalBounty;
        address escrowAddress;
        ProjectStatus status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    enum ProjectStatus {
        ACTIVE,
        PAUSED,
        COMPLETED,
        CANCELLED
    }

    // Project ID counter
    uint256 private _projectIdCounter;

    // Mapping from project ID to Project
    mapping(uint256 => Project) private _projects;

    // Mapping from owner address to array of project IDs
    mapping(address => uint256[]) private _ownerProjects;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        address indexed owner,
        string name,
        uint256 totalBounty
    );

    event ProjectUpdated(
        uint256 indexed projectId,
        ProjectStatus status,
        uint256 updatedAt
    );

    event ProjectStatusChanged(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus
    );

    constructor() Ownable(msg.sender) {
        _projectIdCounter = 1;
    }

    /**
     * @dev Create a new project
     */
    function createProject(
        string memory name,
        string memory description,
        string memory ipfsHash,
        uint256 totalBounty,
        address escrowAddress
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Project name required");
        require(totalBounty > 0, "Total bounty must be greater than 0");

        uint256 projectId = _projectIdCounter++;

        _projects[projectId] = Project({
            name: name,
            description: description,
            owner: msg.sender,
            ipfsHash: ipfsHash,
            totalBounty: totalBounty,
            escrowAddress: escrowAddress,
            status: ProjectStatus.ACTIVE,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _ownerProjects[msg.sender].push(projectId);

        emit ProjectCreated(projectId, msg.sender, name, totalBounty);

        return projectId;
    }

    /**
     * @dev Update project status
     */
    function updateProjectStatus(
        uint256 projectId,
        ProjectStatus newStatus
    ) external {
        Project storage project = _projects[projectId];
        require(project.createdAt > 0, "Project does not exist");
        require(
            msg.sender == project.owner,
            "Only project owner can update"
        );

        ProjectStatus oldStatus = project.status;
        project.status = newStatus;
        project.updatedAt = block.timestamp;

        emit ProjectStatusChanged(projectId, oldStatus, newStatus);
        emit ProjectUpdated(projectId, newStatus, block.timestamp);
    }

    /**
     * @dev Update project IPFS hash
     */
    function updateProjectIpfsHash(
        uint256 projectId,
        string memory newIpfsHash
    ) external {
        Project storage project = _projects[projectId];
        require(project.createdAt > 0, "Project does not exist");
        require(
            msg.sender == project.owner,
            "Only project owner can update"
        );

        project.ipfsHash = newIpfsHash;
        project.updatedAt = block.timestamp;

        emit ProjectUpdated(projectId, project.status, block.timestamp);
    }

    /**
     * @dev Get project by ID
     */
    function getProject(uint256 projectId) external view returns (Project memory) {
        require(_projects[projectId].createdAt > 0, "Project does not exist");
        return _projects[projectId];
    }

    /**
     * @dev Get projects by owner
     */
    function getProjectsByOwner(
        address owner
    ) external view returns (uint256[] memory) {
        return _ownerProjects[owner];
    }

    /**
     * @dev Get total number of projects
     */
    function getTotalProjects() external view returns (uint256) {
        return _projectIdCounter - 1;
    }
}
