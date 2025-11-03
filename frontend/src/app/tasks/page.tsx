"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useTaskManagement } from "@/hooks/useTaskManagement";
import { useToast } from "@/components/ui/toast";
import { CardSkeleton } from "@/components/ui/skeleton";
import TaskCard from "./TaskCard";
import styles from "./tasks.module.css";

interface Task {
  id: string;
  title: string;
  description: string;
  bountyAmount: string;
  status: string;
  project: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    walletAddress: string;
    username: string | null;
    reputation: number;
  };
}

export default function TasksPage() {
  const { address, isConnected } = useAccount();
  const { claimTask, submitWork, isProcessing, currentStep } = useTaskManagement();
  const { showToast, ToastComponent } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<
    "all" | "OPEN" | "ASSIGNED" | "COMPLETED"
  >("all");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [prUrl, setPrUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    
    async function fetchTasks() {
      try {
        const response = await fetch("http://localhost:5001/api/tasks");
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        
        if (!cancelled) {
          setTasks(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        if (!cancelled) {
          setError("Unable to load tasks. Please try again later.");
          setTasks([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTasks();
    
    return () => {
      cancelled = true;
    };
  }, []);

  // Memoize filtered tasks to avoid recalculating on every render
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === "all") return true;
      if (filter === "ASSIGNED") {
        return task.status === "ASSIGNED" || task.status === "IN_PROGRESS";
      }
      return task.status === filter;
    });
  }, [tasks, filter]);

  const handleClaimTask = useCallback(async (taskId: string, taskIndex: number) => {
    if (!isConnected || !address) {
      showToast("Please connect your wallet to claim tasks", "warning");
      return;
    }

    try {
      // Use blockchain integration
      const result = await claimTask({
        taskId,
        blockchainTaskId: taskIndex + 1, // Simple mapping for now
        walletAddress: address,
      });

      if (result.success) {
        showToast("✅ Task claimed on blockchain! You can now start working on it.", "success");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        throw new Error(result.error || "Failed to claim task");
      }
    } catch (err: any) {
      console.error("Error claiming task:", err);
      showToast(err.message || "Failed to claim task. Please try again.", "error");
    }
  }, [isConnected, address, claimTask, showToast]);

  const handleSubmitWork = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prUrl) {
      showToast("Please enter a PR URL", "warning");
      return;
    }

    if (!selectedTask || !address) return;

    try {
      const taskIndex = tasks.findIndex(t => t.id === selectedTask.id);
      
      // Use blockchain integration
      const result = await submitWork({
        taskId: selectedTask.id,
        blockchainTaskId: taskIndex + 1, // Simple mapping
        prUrl,
        walletAddress: address,
      });

      if (result.success && result.data) {
        const data = result.data as any;
        const contribution = data.contribution || {};
        const analysis = data.analysis || {};
        const payout = data.payout || {};
        const score = contribution?.score || analysis?.score || 0;
        const status = contribution?.status || 'PENDING';
        const payoutAmount = payout?.amount || '0';

        showToast(
          `🎉 Score: ${score}/100 | Status: ${status} | Payout: ${payoutAmount} MUSD`,
          status === 'APPROVED' ? 'success' : 'warning'
        );

        // Close modal and refresh
        setShowSubmitModal(false);
        setPrUrl("");
        setSelectedTask(null);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error(result.error || "Failed to submit work");
      }
    } catch (err: any) {
      console.error("Error submitting work:", err);
      showToast(err.message || "Failed to submit work. Please try again.", "error");
    }
  }, [prUrl, selectedTask, address, tasks, submitWork, showToast]);

  const openSubmitModal = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowSubmitModal(true);
  }, []);

  return (
    <div className={styles.container}>
      {ToastComponent}
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoBox} />
            <h1 className={styles.logoText}>SourcePay</h1>
          </Link>
          <nav className={styles.nav}>
            <Link href="/projects" className={`${styles.navLink} ${styles.navLinkInactive}`}>
              Projects
            </Link>
            <Link href="/tasks" className={`${styles.navLink} ${styles.navLinkActive}`}>
              Tasks
            </Link>
            {isConnected && (
              <Link href="/dashboard" className={`${styles.navLink} ${styles.navLinkInactive}`}>
                Dashboard
              </Link>
            )}
            <ConnectButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>Available Tasks</h2>
          <p className={styles.pageSubtitle}>
            Claim tasks, complete work, and earn MUSD rewards
          </p>
        </div>

        {/* Blockchain Status Indicator */}
        {isProcessing && currentStep && (
          <div className={styles.statusIndicator}>
            <div className={styles.spinner} />
            <div className={styles.statusText}>{currentStep}</div>
          </div>
        )}

        <div className={styles.filters}>
          {[
            { label: "All Tasks", value: "all" as const },
            { label: "Open", value: "OPEN" as const },
            { label: "Claimed", value: "ASSIGNED" as const },
            { label: "Completed", value: "COMPLETED" as const },
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`${styles.filterButton} ${
                filter === filterOption.value ? styles.filterButtonActive : ""
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
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

        {/* Empty State */}
        {!loading && !error && filteredTasks.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>
              No {filter !== "all" ? filter : ""} Tasks Found
            </h3>
            <p className={styles.emptyText}>
              {filter === "all"
                ? "No tasks available yet. Check back later or create a project!"
                : `No ${filter} tasks at the moment.`}
            </p>
            <Link href="/projects">
              <Button>Browse Projects</Button>
            </Link>
          </div>
        )}

        {/* Tasks List */}
        {!loading && !error && filteredTasks.length > 0 && (
          <>
            <div className={styles.count}>
              Showing {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "task" : "tasks"}
            </div>
            <div className={styles.tasksList}>
              {filteredTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isConnected={isConnected}
                  isProcessing={isProcessing}
                  userAddress={address}
                  onClaim={handleClaimTask}
                  onSubmit={openSubmitModal}
                  taskIndex={index}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Submit Work Modal */}
      {showSubmitModal && selectedTask && (
        <div className={styles.modal} onClick={() => setShowSubmitModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Submit Your Work</h2>
            <p className={styles.modalSubtitle}>
              Submit your Pull Request for review. Source Agent will analyze your
              contribution and calculate your payout.
            </p>

            {/* Task Info */}
            <div className={styles.taskInfoBox}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#171717", marginBottom: "8px" }}>
                {selectedTask.title}
              </div>
              <div style={{ fontSize: "14px", color: "#737373", marginBottom: "12px" }}>
                {selectedTask.project.name}
              </div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#171717" }}>
                {selectedTask.bountyAmount} MUSD
              </div>
            </div>

            <form onSubmit={handleSubmitWork}>
              <div className={styles.formGroup}>
                <label htmlFor="prUrl" className={styles.label}>
                  Pull Request URL *
                </label>
                <input
                  type="url"
                  id="prUrl"
                  required
                  value={prUrl}
                  onChange={(e) => setPrUrl(e.target.value)}
                  placeholder="https://github.com/user/repo/pull/123"
                  className={styles.input}
                />
                <p className={styles.helpText}>
                  Your PR will be analyzed by Source Agent. Score: 70-100 = Full
                  payout, 60-69 = Partial payout
                </p>
              </div>

              <div className={styles.tipsBox}>
                <div className={styles.tipsTitle}>💡 Submission Tips</div>
                <ul className={styles.tipsList}>
                  <li>Make sure your PR is complete and tested</li>
                  <li>Include clear description and documentation</li>
                  <li>Add tests if applicable</li>
                  <li>Follow the project's code style</li>
                </ul>
              </div>

              <div className={styles.modalActions}>
                <Button type="submit" disabled={isProcessing} style={{ flex: 1 }}>
                  {isProcessing
                    ? currentStep || "Submitting & Analyzing..."
                    : "🔗 Submit for AI Review (Blockchain)"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSubmitModal(false);
                    setPrUrl("");
                  }}
                  disabled={isProcessing}
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
