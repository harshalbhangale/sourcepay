"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  description: string;
  repoUrl: string | null;
  totalBounty: string;
  status: string;
  owner: {
    id: string;
    walletAddress: string;
    username: string | null;
    reputation: number;
  };
  tasks: any[];
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    bountyAmount: "",
    difficulty: "",
    githubIssueUrl: "",
  });
  const [creatingTask, setCreatingTask] = useState(false);

  const projectId = params.id as string;

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(
          `http://localhost:5001/api/projects/${projectId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }
        const data = await response.json();
        setProject(data.data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Unable to load project. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const isOwner =
    project &&
    address &&
    project.owner.walletAddress.toLowerCase() === address.toLowerCase();

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !taskFormData.title ||
      !taskFormData.description ||
      !taskFormData.bountyAmount
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    setCreatingTask(true);
    try {
      const response = await fetch("http://localhost:5001/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskFormData,
          projectId,
          ownerWallet: address, // Send wallet address for ownership verification
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create task");
      }

      const data = await response.json();

      // Reset form and close modal
      setTaskFormData({
        title: "",
        description: "",
        bountyAmount: "",
        difficulty: "",
        githubIssueUrl: "",
      });
      setShowCreateTaskModal(false);

      // Refresh project to show new task
      alert(`Task "${taskFormData.title}" created successfully!`);
      window.location.reload();
    } catch (err: any) {
      alert(err.message || "Failed to create task");
      console.error("Error creating task:", err);
    } finally {
      setCreatingTask(false);
    }
  };

  const handleViewOnBlockchain = () => {
    // Open Mezo Explorer for the ProjectRegistry contract
    const contractAddress =
      process.env.NEXT_PUBLIC_PROJECT_REGISTRY_ADDRESS ||
      "0x6E82D1F51652000907F1457030F2275F88cf87c3";
    const mezoExplorerUrl = `https://explorer.test.mezo.org/address/${contractAddress}`;
    window.open(mezoExplorerUrl, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#171717",
                borderRadius: "4px",
              }}
            />
            <h1
              style={{ fontSize: "20px", fontWeight: "bold", color: "#171717" }}
            >
              SourcePay
            </h1>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link
              href="/projects"
              style={{
                fontSize: "14px",
                textDecoration: "none",
                color: "#737373",
                fontWeight: "500",
              }}
            >
              Projects
            </Link>
            <Link
              href="/tasks"
              style={{
                fontSize: "14px",
                textDecoration: "none",
                color: "#737373",
                fontWeight: "500",
              }}
            >
              Tasks
            </Link>
            {isConnected && (
              <Link
                href="/dashboard"
                style={{
                  fontSize: "14px",
                  textDecoration: "none",
                  color: "#737373",
                  fontWeight: "500",
                }}
              >
                Dashboard
              </Link>
            )}
            <ConnectButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 16px" }}
      >
        {/* Back Link */}
        <Link
          href="/projects"
          style={{
            fontSize: "14px",
            color: "#737373",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          ← Back to Projects
        </Link>

        {/* Loading State */}
        {loading && (
          <div
            style={{ textAlign: "center", padding: "80px 0", color: "#737373" }}
          >
            Loading project details...
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div
              style={{
                fontSize: "16px",
                color: "#dc2626",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        )}

        {/* Project Details */}
        {!loading && !error && project && (
          <>
            {/* Project Header */}
            <div
              style={{
                padding: "32px",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  marginBottom: "24px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h2
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      color: "#171717",
                      marginBottom: "16px",
                    }}
                  >
                    {project.name}
                  </h2>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        padding: "4px 12px",
                        backgroundColor:
                          project.status.toLowerCase() === "active"
                            ? "#d1fae5"
                            : "#f3f4f6",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: "500",
                        color:
                          project.status.toLowerCase() === "active"
                            ? "#065f46"
                            : "#6b7280",
                      }}
                    >
                      {project.status}
                    </div>
                    <div style={{ fontSize: "14px", color: "#737373" }}>
                      Owner: {project.owner.walletAddress.slice(0, 10)}...
                      {project.owner.walletAddress.slice(-8)}
                    </div>
                    {isOwner && (
                      <div
                        style={{
                          padding: "4px 12px",
                          backgroundColor: "#dbeafe",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#1e40af",
                        }}
                      >
                        You own this project
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#737373",
                      marginBottom: "4px",
                    }}
                  >
                    Total Bounty
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#171717",
                    }}
                  >
                    {project.totalBounty} MUSD
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "24px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "8px",
                  marginBottom: "24px",
                }}
              >
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#171717",
                    marginBottom: "12px",
                  }}
                >
                  Description
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#525252",
                    lineHeight: "1.6",
                  }}
                >
                  {project.description}
                </p>
              </div>

              {project.repoUrl && (
                <div style={{ marginBottom: "16px" }}>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "14px",
                      color: "#2563eb",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    🔗 View Repository →
                  </a>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  paddingTop: "24px",
                  borderTop: "1px solid #e5e5e5",
                }}
              >
                {isOwner && (
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateTaskModal(true)}
                  >
                    Create Task
                  </Button>
                )}
                <Button variant="outline" onClick={handleViewOnBlockchain}>
                  View on Blockchain
                </Button>
              </div>
            </div>

            {/* Tasks Section */}
            <div
              style={{
                padding: "32px",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                backgroundColor: "#ffffff",
              }}
            >
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#171717",
                  marginBottom: "16px",
                }}
              >
                Tasks
              </h3>
              {project.tasks.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>
                    📋
                  </div>
                  <p style={{ fontSize: "14px", color: "#737373" }}>
                    No tasks created yet.
                    {isOwner && " Create your first task to get started!"}
                  </p>
                  {isOwner && (
                    <Button
                      style={{ marginTop: "16px" }}
                      onClick={() => setShowCreateTaskModal(true)}
                    >
                      Create First Task
                    </Button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {project.tasks.map((task: any) => (
                    <div
                      key={task.id}
                      style={{
                        padding: "20px",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              marginBottom: "8px",
                            }}
                          >
                            <h4
                              style={{
                                fontSize: "16px",
                                fontWeight: "600",
                                color: "#171717",
                              }}
                            >
                              {task.title}
                            </h4>
                            <span
                              style={{
                                padding: "4px 12px",
                                backgroundColor:
                                  task.status === "OPEN"
                                    ? "#d1fae5"
                                    : task.status === "ASSIGNED"
                                    ? "#fef3c7"
                                    : task.status === "SUBMITTED"
                                    ? "#dbeafe"
                                    : "#f3f4f6",
                                borderRadius: "9999px",
                                fontSize: "12px",
                                fontWeight: "500",
                                color:
                                  task.status === "OPEN"
                                    ? "#065f46"
                                    : task.status === "ASSIGNED"
                                    ? "#92400e"
                                    : task.status === "SUBMITTED"
                                    ? "#1e40af"
                                    : "#6b7280",
                              }}
                            >
                              {task.status}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#737373",
                              marginBottom: "12px",
                            }}
                          >
                            {task.description}
                          </p>
                          {task.assignee && (
                            <div style={{ fontSize: "13px", color: "#737373" }}>
                              Assigned to:{" "}
                              {task.assignee.walletAddress.slice(0, 6)}...
                              {task.assignee.walletAddress.slice(-4)}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: "right", marginLeft: "24px" }}>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#737373",
                              marginBottom: "4px",
                            }}
                          >
                            Bounty
                          </div>
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "700",
                              color: "#171717",
                            }}
                          >
                            {task.bountyAmount}
                          </div>
                          <div style={{ fontSize: "12px", color: "#737373" }}>
                            MUSD
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setShowCreateTaskModal(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                color: "#171717",
                marginBottom: "8px",
              }}
            >
              Create New Task
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#737373",
                marginBottom: "24px",
              }}
            >
              Add a new task to your project for contributors to claim and
              complete
            </p>

            <form onSubmit={handleCreateTask}>
              {/* Task Title */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="title"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#171717",
                    marginBottom: "8px",
                  }}
                >
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={taskFormData.title}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, title: e.target.value })
                  }
                  placeholder="Fix login bug"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="description"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#171717",
                    marginBottom: "8px",
                  }}
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what needs to be done..."
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              {/* Bounty Amount */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="bountyAmount"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#171717",
                    marginBottom: "8px",
                  }}
                >
                  Bounty Amount (MUSD) *
                </label>
                <input
                  type="number"
                  id="bountyAmount"
                  required
                  min="0"
                  step="0.000001"
                  value={taskFormData.bountyAmount}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      bountyAmount: e.target.value,
                    })
                  }
                  placeholder="100.00"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Difficulty */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="difficulty"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#171717",
                    marginBottom: "8px",
                  }}
                >
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  value={taskFormData.difficulty}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      difficulty: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <option value="">Select difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* GitHub Issue URL */}
              <div style={{ marginBottom: "24px" }}>
                <label
                  htmlFor="githubIssueUrl"
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#171717",
                    marginBottom: "8px",
                  }}
                >
                  GitHub Issue URL
                </label>
                <input
                  type="url"
                  id="githubIssueUrl"
                  value={taskFormData.githubIssueUrl}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      githubIssueUrl: e.target.value,
                    })
                  }
                  placeholder="https://github.com/user/repo/issues/123"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <Button
                  type="submit"
                  disabled={creatingTask}
                  style={{ flex: 1 }}
                >
                  {creatingTask ? "Creating..." : "Create Task"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateTaskModal(false)}
                  disabled={creatingTask}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
