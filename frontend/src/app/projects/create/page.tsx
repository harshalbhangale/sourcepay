"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateProject } from "@/hooks/useCreateProject";
import { useMUSDBalance } from "@/hooks/useMUSDBalance";

export default function CreateProjectPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { createProject, isCreating, currentStep } = useCreateProject();
  const { musdBalance, isLoading: balanceLoading } = useMUSDBalance(address);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repositoryUrl: "",
    totalBounty: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert("Please connect your wallet first");
      return;
    }

    setError(null);

    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.totalBounty) {
        throw new Error("Please fill in all required fields");
      }

      // Check if user has enough MUSD
      const bountyAmount = parseFloat(formData.totalBounty);
      const userBalance = parseFloat(musdBalance);
      
      if (userBalance < bountyAmount) {
        throw new Error(`Insufficient MUSD balance. You have ${musdBalance} MUSD but need ${bountyAmount} MUSD`);
      }

      // Create project with smart contract integration
      const result = await createProject({
        name: formData.name,
        description: formData.description,
        repositoryUrl: formData.repositoryUrl,
        totalBounty: formData.totalBounty,
        ownerWallet: address,
      });

      if (result.success) {
        // Success! Redirect to the projects page
        alert(`🎉 Project "${formData.name}" created successfully!\n\nMUSD approved and project saved to database.`);
        router.push(`/projects`);
      } else {
        throw new Error(result.error || "Failed to create project");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      console.error("Error creating project:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Redirect if not connected
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
            You need to connect your wallet to create a project
          </p>
          <ConnectButton />
        </main>
      </div>
    );
  }

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
            <ConnectButton />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px" }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: "40px" }}>
          <Link
            href="/projects"
            style={{
              fontSize: "14px",
              color: "#737373",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            ← Back to Projects
          </Link>
          <h2
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: "#171717",
              marginBottom: "8px",
            }}
          >
            Create New Project
          </h2>
          <p style={{ fontSize: "16px", color: "#737373" }}>
            Set up a new project and start receiving contributions from
            developers
          </p>
        </div>

        {/* Create Project Form */}
        <form onSubmit={handleSubmit}>
          <div
            style={{
              padding: "32px",
              border: "1px solid #e5e5e5",
              borderRadius: "12px",
              backgroundColor: "#ffffff",
            }}
          >
            {error && (
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  marginBottom: "24px",
                  color: "#dc2626",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* Project Name */}
            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#171717",
                  marginBottom: "8px",
                }}
              >
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="My Awesome Project"
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
            <div style={{ marginBottom: "24px" }}>
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
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project, its goals, and what kind of contributions you're looking for..."
                rows={5}
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

            {/* Repository URL */}
            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="repositoryUrl"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#171717",
                  marginBottom: "8px",
                }}
              >
                Repository URL
              </label>
              <input
                type="url"
                id="repositoryUrl"
                name="repositoryUrl"
                value={formData.repositoryUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repo"
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

            {/* Total Bounty */}
            <div style={{ marginBottom: "32px" }}>
              <label
                htmlFor="totalBounty"
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#171717",
                  marginBottom: "8px",
                }}
              >
                Total Bounty (MUSD) *
              </label>
              <input
                type="number"
                id="totalBounty"
                name="totalBounty"
                required
                min="0"
                step="0.000001"
                value={formData.totalBounty}
                onChange={handleChange}
                placeholder="1000.00"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
              />
              <p
                style={{ fontSize: "12px", color: "#737373", marginTop: "8px" }}
              >
                You&apos;ll need to deposit this amount to the escrow contract
                after project creation
              </p>
            </div>

            {/* Connected Wallet Info */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  color: "#737373",
                  marginBottom: "4px",
                }}
              >
                Project Owner
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#171717",
                  fontWeight: "500",
                }}
              >
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </div>
            </div>

            {/* MUSD Balance Display */}
            {!balanceLoading && (
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#166534", fontWeight: "600" }}>
                  💰 Your MUSD Balance: {parseFloat(musdBalance).toLocaleString()} MUSD
                </div>
              </div>
            )}

            {/* Current Step Display */}
            {isCreating && currentStep && (
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#1e40af", fontWeight: "600" }}>
                  🔄 {currentStep}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ display: "flex", gap: "16px" }}>
              <Button
                type="submit"
                size="lg"
                disabled={isCreating}
                style={{ flex: 1 }}
              >
                {isCreating ? currentStep || "Creating Project..." : "🚀 Create Project & Approve MUSD"}
              </Button>
              <Link href="/projects">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </form>

        {/* Info Section */}
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "12px",
          }}
        >
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#171717",
              marginBottom: "12px",
            }}
          >
            📝 What happens next?
          </h3>
          <ul
            style={{
              fontSize: "14px",
              color: "#374151",
              lineHeight: "1.8",
              paddingLeft: "20px",
            }}
          >
            <li>✅ <strong>Step 1:</strong> MUSD approval transaction (you&apos;ll confirm in wallet)</li>
            <li>✅ <strong>Step 2:</strong> Project saved to database</li>
            <li>📋 <strong>Step 3:</strong> Create tasks and set bounties</li>
            <li>👥 <strong>Step 4:</strong> Contributors claim and complete tasks</li>
            <li>🤖 <strong>Step 5:</strong> Source Agent auto-scores submissions</li>
            <li>💰 <strong>Step 6:</strong> Payouts distributed automatically</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
