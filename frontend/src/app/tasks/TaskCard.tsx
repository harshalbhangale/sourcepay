import { memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import styles from "./tasks.module.css";

interface TaskCardProps {
  task: {
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
      walletAddress: string;
    };
  };
  isConnected: boolean;
  isProcessing: boolean;
  userAddress?: string;
  onClaim: (taskId: string, taskIndex: number) => void;
  onSubmit: (task: any) => void;
  taskIndex: number;
}

const TaskCard = memo(function TaskCard({
  task,
  isConnected,
  isProcessing,
  userAddress,
  onClaim,
  onSubmit,
  taskIndex,
}: TaskCardProps) {
  const getStatusColor = () => {
    switch (task.status) {
      case "COMPLETED":
        return { bg: "#dcfce7", text: "#166534" };
      case "OPEN":
        return { bg: "#d1fae5", text: "#065f46" };
      case "ASSIGNED":
      case "IN_PROGRESS":
        return { bg: "#fef3c7", text: "#92400e" };
      case "SUBMITTED":
        return { bg: "#dbeafe", text: "#1e40af" };
      default:
        return { bg: "#f3f4f6", text: "#6b7280" };
    }
  };

  const statusColor = getStatusColor();
  
  const cardClass = task.status === "COMPLETED"
    ? `${styles.taskCard} ${styles.taskCardCompleted}`
    : task.status === "OPEN"
    ? `${styles.taskCard} ${styles.taskCardOpen}`
    : `${styles.taskCard} ${styles.taskCardAssigned}`;

  const isUserAssigned = task.assignee?.walletAddress.toLowerCase() === userAddress?.toLowerCase();

  return (
    <div className={cardClass}>
      <div className={styles.taskHeader}>
        <div className={styles.taskInfo}>
          <div className={styles.taskTitleRow}>
            <h4 className={styles.taskTitle}>{task.title}</h4>
            <span
              className={styles.taskStatus}
              style={{
                backgroundColor: statusColor.bg,
                color: statusColor.text,
              }}
            >
              {task.status}
            </span>
          </div>
          <Link href={`/projects/${task.project.id}`} className={styles.taskProjectLink}>
            {task.project.name} →
          </Link>
          <p className={styles.taskDescription}>{task.description}</p>
        </div>
        <div className={styles.taskBounty}>
          <div className={styles.bountyLabel}>Bounty</div>
          <div className={styles.bountyAmount}>
            {parseFloat(task.bountyAmount).toLocaleString()}
          </div>
          <div className={styles.bountyUnit}>MUSD</div>
        </div>
      </div>

      <div className={styles.taskFooter}>
        {task.assignee ? (
          <div className={styles.assigneeText}>
            Assigned to: {task.assignee.walletAddress.slice(0, 6)}...
            {task.assignee.walletAddress.slice(-4)}
          </div>
        ) : (
          <div className={styles.availableText}>✅ Available to claim</div>
        )}

        {task.status === "OPEN" && !task.assignee && (
          <Button
            onClick={() => onClaim(task.id, taskIndex)}
            disabled={!isConnected || isProcessing}
          >
            {isProcessing ? "Processing..." : "🔗 Claim Task (Blockchain)"}
          </Button>
        )}
        {(task.status === "ASSIGNED" || task.status === "IN_PROGRESS") && isUserAssigned && (
          <Button onClick={() => onSubmit(task)} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "📤 Submit Work (Blockchain)"}
          </Button>
        )}
      </div>
    </div>
  );
});

export default TaskCard;

