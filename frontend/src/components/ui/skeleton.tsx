import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '20px', className = '' }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '8px',
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        padding: '28px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid #e5e5e5',
        borderRadius: '20px',
        animation: 'pulse 2s ease-in-out infinite',
      }}
    >
      <Skeleton height="24px" width="70%" />
      <div style={{ height: '12px' }} />
      <Skeleton height="16px" width="90%" />
      <div style={{ height: '8px' }} />
      <Skeleton height="16px" width="85%" />
      <div style={{ height: '20px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton height="20px" width="30%" />
        <Skeleton height="20px" width="25%" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div
      style={{
        padding: '32px',
        background: 'rgba(255,255,255,0.9)',
        border: '1px solid #e5e5e5',
        borderRadius: '20px',
        animation: 'pulse 2s ease-in-out infinite',
      }}
    >
      <Skeleton height="14px" width="60%" />
      <div style={{ height: '16px' }} />
      <Skeleton height="48px" width="40%" />
    </div>
  );
}


