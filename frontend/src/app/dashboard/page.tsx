"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";

interface UserStats {
  projectsOwned: number;
  tasksClaimed: number;
  tasksCompleted: number;
  totalEarned: string;
}

interface Activity {
  id: string;
  type:
    | "project_created"
    | "task_claimed"
    | "task_completed"
    | "payout_received";
  title: string;
  amount?: string;
  timestamp: string;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState<UserStats>({
    projectsOwned: 0,
    tasksClaimed: 0,
    tasksCompleted: 0,
    totalEarned: "0",
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetchUserData();
    }
  }, [address, isConnected]);

  const fetchUserData = async () => {
    if (!address) return;

    try {
      setLoading(true);

      // Fetch user stats
      const statsResponse = await fetch(
        `http://localhost:5000/api/users/${address}/stats`
      );
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch user activity
      const activityResponse = await fetch(
        `http://localhost:5000/api/users/${address}/activity?limit=10`
      );
      const activityData = await activityResponse.json();

      if (activityData.success) {
        setActivities(activityData.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
        {/* Header */}
        <header
          style={{
            borderBottom: "1px solid #e5e5e5",
            backgroundColor: "#ffffff",
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
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#171717",
                }}
              >
                SourcePay
              </h1>
            </Link>
            <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <ConnectButton />
            </nav>
          </div>
        </header>

        <main
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "80px 16px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "24px" }}>🔐</div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#171717",
              marginBottom: "16px",
            }}
          >
            Connect Your Wallet
          </h2>
          <p
            style={{ fontSize: "16px", color: "#737373", marginBottom: "32px" }}
          >
            Connect your wallet to view your dashboard
          </p>
          <ConnectButton />
        </main>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      position: "relative"
    }}>
      {/* Animated background */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 10% 20%, rgba(102, 126, 234, 0.08) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(118, 75, 162, 0.08) 0%, transparent 50%)",
        zIndex: 0,
      }} />
      
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
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
            <Link
              href="/dashboard"
              style={{
                fontSize: "14px",
                textDecoration: "none",
                color: "#171717",
                fontWeight: "600",
              }}
            >
              Dashboard
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 16px" }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#171717",
              marginBottom: "8px",
            }}
          >
            Dashboard
          </h2>
          <p style={{ fontSize: "16px", color: "#737373" }}>
            Track your projects, tasks, and earnings
          </p>
        </div>

        {/* Wallet Info */}
        <div
          style={{
            padding: "24px",
            backgroundColor: "#f5f5f5",
            borderRadius: "12px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{ fontSize: "12px", color: "#737373", marginBottom: "8px" }}
          >
            Connected Wallet
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#171717",
              fontWeight: "600",
              fontFamily: "monospace",
            }}
          >
            {address}
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#737373" }}
          >
            Loading your stats...
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "24px",
                marginBottom: "40px",
              }}
            >
              <div
                className="hover-lift fade-in"
                style={{
                  padding: "32px",
                  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(102, 126, 234, 0.3)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 16px -4px rgba(102, 126, 234, 0.2)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#667eea",
                    marginBottom: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  📁 Projects Owned
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stats.projectsOwned}
                </div>
              </div>

              <div
                className="hover-lift fade-in"
                style={{
                  padding: "32px",
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(59, 130, 246, 0.3)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 16px -4px rgba(59, 130, 246, 0.2)",
                  transition: "all 0.3s ease",
                  animationDelay: "0.1s",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#3b82f6",
                    marginBottom: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  🎯 Tasks Claimed
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stats.tasksClaimed}
                </div>
              </div>

              <div
                className="hover-lift fade-in"
                style={{
                  padding: "32px",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 16px -4px rgba(16, 185, 129, 0.2)",
                  transition: "all 0.3s ease",
                  animationDelay: "0.2s",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#10b981",
                    marginBottom: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  ✅ Tasks Completed
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stats.tasksCompleted}
                </div>
              </div>

              <div
                className="hover-lift fade-in"
                style={{
                  padding: "32px",
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "20px",
                  boxShadow: "0 8px 16px -4px rgba(245, 158, 11, 0.2)",
                  transition: "all 0.3s ease",
                  animationDelay: "0.3s",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    color: "#f59e0b",
                    marginBottom: "12px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  💰 Total Earned
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {parseFloat(stats.totalEarned).toLocaleString()}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#f59e0b",
                    marginTop: "8px",
                    fontWeight: "700",
                  }}
                >
                  MUSD
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              style={{
                padding: "24px",
                border: "1px solid #e5e5e5",
                borderRadius: "12px",
                marginBottom: "40px",
                backgroundColor: "#ffffff",
              }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#171717",
                  marginBottom: "16px",
                }}
              >
                Quick Actions
              </h3>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link href="/projects/create">
                  <Button>+ Create Project</Button>
                </Link>
                <Link href="/tasks">
                  <Button variant="outline">Browse Tasks</Button>
                </Link>
                <Link href="/projects">
                  <Button variant="outline">View All Projects</Button>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#171717",
                  marginBottom: "24px",
                }}
              >
                Recent Activity
              </h3>
              {activities.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "12px",
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    📊
                  </div>
                  <h4
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#171717",
                      marginBottom: "8px",
                    }}
                  >
                    No Activity Yet
                  </h4>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#737373",
                      marginBottom: "24px",
                    }}
                  >
                    Start by creating a project or claiming a task!
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "center",
                    }}
                  >
                    <Link href="/projects/create">
                      <Button>Create Project</Button>
                    </Link>
                    <Link href="/tasks">
                      <Button variant="outline">Browse Tasks</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        padding: "16px",
                        border: "1px solid #e5e5e5",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#171717",
                            fontWeight: "500",
                          }}
                        >
                          {activity.title}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#737373",
                            marginTop: "4px",
                          }}
                        >
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      {activity.amount && (
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#16a34a",
                          }}
                        >
                          +{activity.amount} MUSD
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
