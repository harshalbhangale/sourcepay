// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FeatureTask
 * @dev Manages individual tasks within projects
 */
contract FeatureTask is Ownable {
    struct Task {
        uint256 projectId;
        string title;
        string description;
        uint256 bountyAmount;
        address assignee;
        TaskStatus status;
        string githubIssueUrl;
        string ipfsHash;
        uint256 createdAt;
        uint256 updatedAt;
    }

    enum TaskStatus {
        OPEN,
        ASSIGNED,
        IN_PROGRESS,
        SUBMITTED,
        COMPLETED,
        DISPUTED
    }

    // Task ID counter
    uint256 private _taskIdCounter;

    // Mapping from task ID to Task
    mapping(uint256 => Task) private _tasks;

    // Mapping from project ID to array of task IDs
    mapping(uint256 => uint256[]) private _projectTasks;

    // Mapping from assignee to array of task IDs
    mapping(address => uint256[]) private _assigneeTasks;

    // Events
    event TaskCreated(
        uint256 indexed taskId,
        uint256 indexed projectId,
        string title,
        uint256 bountyAmount
    );

    event TaskAssigned(
        uint256 indexed taskId,
        address indexed assignee,
        uint256 assignedAt
    );

    event TaskSubmitted(
        uint256 indexed taskId,
        address indexed submitter,
        string prUrl,
        uint256 submittedAt
    );

    event TaskStatusChanged(
        uint256 indexed taskId,
        TaskStatus oldStatus,
        TaskStatus newStatus
    );

    event TaskScored(
        uint256 indexed taskId,
        uint256 score,
        address indexed scorer
    );

    constructor() Ownable(msg.sender) {
        _taskIdCounter = 1;
    }

    /**
     * @dev Create a new task
     */
    function createTask(
        uint256 projectId,
        string memory title,
        string memory description,
        uint256 bountyAmount,
        string memory githubIssueUrl,
        string memory ipfsHash
    ) external returns (uint256) {
        require(projectId > 0, "Invalid project ID");
        require(bytes(title).length > 0, "Task title required");
        require(bountyAmount > 0, "Bounty amount must be greater than 0");

        uint256 taskId = _taskIdCounter++;

        _tasks[taskId] = Task({
            projectId: projectId,
            title: title,
            description: description,
            bountyAmount: bountyAmount,
            assignee: address(0),
            status: TaskStatus.OPEN,
            githubIssueUrl: githubIssueUrl,
            ipfsHash: ipfsHash,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        _projectTasks[projectId].push(taskId);

        emit TaskCreated(taskId, projectId, title, bountyAmount);

        return taskId;
    }

    /**
     * @dev Assign task to a contributor
     */
    function assignTask(uint256 taskId, address assignee) external {
        Task storage task = _tasks[taskId];
        require(task.createdAt > 0, "Task does not exist");
        require(assignee != address(0), "Invalid assignee address");
        require(
            task.status == TaskStatus.OPEN,
            "Task must be in OPEN status"
        );

        TaskStatus oldStatus = task.status;
        task.assignee = assignee;
        task.status = TaskStatus.ASSIGNED;
        task.updatedAt = block.timestamp;

        _assigneeTasks[assignee].push(taskId);

        emit TaskAssigned(taskId, assignee, block.timestamp);
        emit TaskStatusChanged(taskId, oldStatus, TaskStatus.ASSIGNED);
    }

    /**
     * @dev Submit task with PR URL
     */
    function submitTask(uint256 taskId, string memory prUrl) external {
        Task storage task = _tasks[taskId];
        require(task.createdAt > 0, "Task does not exist");
        require(
            msg.sender == task.assignee,
            "Only assignee can submit task"
        );
        require(
            task.status == TaskStatus.ASSIGNED ||
                task.status == TaskStatus.IN_PROGRESS,
            "Invalid task status for submission"
        );

        TaskStatus oldStatus = task.status;
        task.status = TaskStatus.SUBMITTED;
        task.updatedAt = block.timestamp;

        emit TaskSubmitted(taskId, msg.sender, prUrl, block.timestamp);
        emit TaskStatusChanged(taskId, oldStatus, TaskStatus.SUBMITTED);
    }

    /**
     * @dev Update task status
     */
    function updateTaskStatus(
        uint256 taskId,
        TaskStatus newStatus
    ) external {
        Task storage task = _tasks[taskId];
        require(task.createdAt > 0, "Task does not exist");

        TaskStatus oldStatus = task.status;
        task.status = newStatus;
        task.updatedAt = block.timestamp;

        emit TaskStatusChanged(taskId, oldStatus, newStatus);
    }

    /**
     * @dev Score a task (emit event for backend tracking)
     */
    function scoreTask(uint256 taskId, uint256 score) external {
        Task storage task = _tasks[taskId];
        require(task.createdAt > 0, "Task does not exist");
        require(
            task.status == TaskStatus.SUBMITTED,
            "Task must be submitted"
        );

        emit TaskScored(taskId, score, msg.sender);
    }

    /**
     * @dev Get task by ID
     */
    function getTask(uint256 taskId) external view returns (Task memory) {
        require(_tasks[taskId].createdAt > 0, "Task does not exist");
        return _tasks[taskId];
    }

    /**
     * @dev Get tasks by project ID
     */
    function getTasksByProject(
        uint256 projectId
    ) external view returns (uint256[] memory) {
        return _projectTasks[projectId];
    }

    /**
     * @dev Get tasks by assignee
     */
    function getTasksByAssignee(
        address assignee
    ) external view returns (uint256[] memory) {
        return _assigneeTasks[assignee];
    }

    /**
     * @dev Get total number of tasks
     */
    function getTotalTasks() external view returns (uint256) {
        return _taskIdCounter - 1;
    }
}
