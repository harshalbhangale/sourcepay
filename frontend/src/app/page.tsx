"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Link from "next/link";
import styles from "./home.module.css";

interface Project {
  id: string;
  name: string;
  description: string;
  totalBounty: string;
  status: string;
  owner: {
    walletAddress: string;
  };
}

interface Stats {
  projectCount: number;
  taskCount: number;
  totalRewards: string;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    projectCount: 0,
    taskCount: 0,
    totalRewards: "0",
  });
  const [loading, setLoading] = useState(true);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch projects and stats - optimized to avoid dependency loops
  useEffect(() => {
    let cancelled = false;
    
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:5000/api/projects");
        if (response.ok) {
          const data = await response.json();
          if (!cancelled) {
            setProjects(data.data || []);
          }
        }
      } catch (error) {
        console.log("Projects not yet available:", error);
        if (!cancelled) {
          setProjects([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, []);
  
  // Memoize stats calculation
  const calculatedStats = useMemo(() => ({
    projectCount: projects.length,
    taskCount: 0,
    totalRewards: "0",
  }), [projects.length]);
  
  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);

  return (
    <div className={styles.container}>
      {/* Optimized background gradient - no animation */}
      <div className={styles.backgroundGradient} />
      
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.6)",
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
              gap: "12px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              $
            </div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                background: "linear-gradient(to right, #ffffff, #a0a0a0)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.05em",
              }}
            >
              SOURCEPAY
            </h1>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            <Link
              href="/projects"
              style={{
                fontSize: "15px",
                textDecoration: "none",
                color: "#ffffff",
                fontWeight: "500",
                opacity: 0.8,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
            >
              Projects
            </Link>
            <Link
              href="/tasks"
              style={{
                fontSize: "15px",
                textDecoration: "none",
                color: "#ffffff",
                fontWeight: "500",
                opacity: 0.8,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
            >
              Tasks
            </Link>
            {mounted && isConnected && (
              <Link
                href="/dashboard"
                style={{
                  fontSize: "15px",
                  textDecoration: "none",
                  color: "#ffffff",
                  fontWeight: "500",
                  opacity: 0.8,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
              >
                Dashboard
              </Link>
            )}
            {mounted && <ConnectButton />}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 16px" }}
      >
        <div
          style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "10px 20px",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "40px",
              color: "#ffffff",
            }}
          >
            ⚡ Powered by MUSD on Mezo Network
          </div>

          <h2
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              letterSpacing: "-0.05em",
              marginBottom: "32px",
              lineHeight: "1.1",
              background: "linear-gradient(to bottom, #ffffff, #808080)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Get Paid for Your Code
          </h2>

          <p
            style={{
              fontSize: "22px",
              color: "#a0a0a0",
              marginBottom: "48px",
              lineHeight: "1.6",
            }}
          >
            Automated bounties for open source contributors. Submit your PR,
            get scored by Source Agent, receive instant MUSD payments.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              paddingTop: "20px",
            }}
          >
            <Link href="/projects">
              <button
                style={{
                  padding: "16px 32px",
                  fontSize: "18px",
                  fontWeight: "600",
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 10px 40px rgba(255,255,255,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Explore Bounties
              </button>
            </Link>
            <Link href="/projects/create">
              <button
                style={{
                  padding: "16px 32px",
                  fontSize: "18px",
                  fontWeight: "600",
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  border: "2px solid rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
              >
                Create Project
              </button>
            </Link>
          </div>

          {mounted && isConnected && (
            <div
              style={{
                marginTop: "32px",
                padding: "20px",
                backgroundColor: "rgba(76,175,80,0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(76,175,80,0.3)",
              }}
            >
              <p
                style={{
                  fontSize: "15px",
                  color: "#4caf50",
                  fontWeight: "500",
                }}
              >
                ✅ Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "40px",
            maxWidth: "800px",
            margin: "120px auto 0",
            paddingTop: "80px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "48px", fontWeight: "bold", color: "#ffffff" }}
            >
              {stats.projectCount}
            </div>
            <div
              style={{ fontSize: "16px", color: "#808080", marginTop: "8px" }}
            >
              Active Projects
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "48px", fontWeight: "bold", color: "#ffffff" }}
            >
              {stats.taskCount}
            </div>
            <div
              style={{ fontSize: "16px", color: "#808080", marginTop: "8px" }}
            >
              Open Bounties
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "48px", fontWeight: "bold", color: "#ffffff" }}
            >
              ${stats.totalRewards}
            </div>
            <div
              style={{ fontSize: "16px", color: "#808080", marginTop: "8px" }}
            >
              Total Rewards
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "32px",
            marginTop: "120px",
          }}
        >
          <div
            style={{
              padding: "32px",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              💰
            </div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#ffffff",
              }}
            >
              MUSD Payments
            </h3>
            <p
              style={{ fontSize: "16px", color: "#808080", lineHeight: "1.6" }}
            >
              Get paid in Bitcoin-backed MUSD stablecoin. Instant settlements, no volatility, no intermediaries.
            </p>
          </div>

          <div
            style={{
              padding: "32px",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🤖
            </div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#ffffff",
              }}
            >
              Source Agent Scoring
            </h3>
            <p
              style={{ fontSize: "16px", color: "#808080", lineHeight: "1.6" }}
            >
              Automated PR analysis and scoring. No subjective reviews, no disputes, just fair compensation.
            </p>
          </div>

          <div
            style={{
              padding: "32px",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: "rgba(255,255,255,0.1)",
                borderRadius: "12px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              ⚡
            </div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: "600",
                marginBottom: "12px",
                color: "#ffffff",
              }}
            >
              Instant Payouts
            </h3>
            <p
              style={{ fontSize: "16px", color: "#808080", lineHeight: "1.6" }}
            >
              Smart contracts distribute payments automatically. Get paid in ~1 hour, not 2 weeks.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div
          style={{
            marginTop: "120px",
            padding: "64px",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontSize: "40px",
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#ffffff",
            }}
          >
            Ready to Fund Open Source?
          </h3>
          <p
            style={{
              fontSize: "20px",
              color: "#808080",
              marginBottom: "40px",
              maxWidth: "600px",
              margin: "0 auto 40px",
            }}
          >
            Join SourcePay and support developers building the future. Bitcoin-backed payments on Mezo Network.
          </p>
          <ConnectButton />
        </div>

        {/* Platform Status */}
        <div
          style={{
            marginTop: "80px",
            padding: "32px",
            backgroundColor: "rgba(255,255,255,0.02)",
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "24px",
              color: "#ffffff",
            }}
          >
            🎉 Platform Status - Live on Mezo Testnet
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
            }}
          >
            <div
              style={{
                padding: "16px",
                backgroundColor: "rgba(76,175,80,0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(76,175,80,0.3)",
              }}
            >
              <span style={{ color: "#4caf50", fontWeight: "600" }}>
                ● Smart Contracts Deployed
              </span>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "rgba(76,175,80,0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(76,175,80,0.3)",
              }}
            >
              <span style={{ color: "#4caf50", fontWeight: "600" }}>
                ● MUSD Integration Active
              </span>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "rgba(76,175,80,0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(76,175,80,0.3)",
              }}
            >
              <span style={{ color: "#4caf50", fontWeight: "600" }}>
                ● Source Agent Ready
              </span>
            </div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "rgba(76,175,80,0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(76,175,80,0.3)",
              }}
            >
              <span style={{ color: "#4caf50", fontWeight: "600" }}>
                ● Database Connected
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          marginTop: "120px",
          backgroundColor: "rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "48px 16px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              $
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#ffffff",
              }}
            >
              SOURCEPAY
            </span>
          </div>
          <p style={{ color: "#808080", marginBottom: "24px" }}>
            Automated bounties powered by MUSD on Mezo Network
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              fontSize: "14px",
            }}
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#808080", textDecoration: "none" }}
            >
              GitHub
            </a>
            <a
              href="https://explorer.test.mezo.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#808080", textDecoration: "none" }}
            >
              Explorer
            </a>
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#808080", textDecoration: "none" }}
            >
              Discord
            </a>
          </div>
          <p
            style={{
              marginTop: "32px",
              fontSize: "13px",
              color: "#606060",
            }}
          >
            © 2024 SourcePay. Built for Mezo Hackathon.
          </p>
        </div>
      </footer>
    </div>
  );
}
