import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS } from '../config/contracts';
import { MUSD_ABI } from '../config/abis';
import { apiClient } from '../services/api';

interface CreateProjectParams {
  name: string;
  description: string;
  repositoryUrl?: string;
  totalBounty: string;
  ownerWallet: string;
}

export function useCreateProject() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const { writeContractAsync: approveMUSD } = useWriteContract();

  const createProject = async (params: CreateProjectParams) => {
    setIsCreating(true);
    setError(null);

    try {
      const bountyAmount = parseUnits(params.totalBounty, 6); // MUSD has 6 decimals

      // Step 1: Approve MUSD spending
      setCurrentStep('Approving MUSD...');
      await approveMUSD({
        address: CONTRACTS.MUSD,
        abi: MUSD_ABI,
        functionName: 'approve',
        args: [CONTRACTS.ProjectEscrow, bountyAmount],
      });

      // Wait for approval transaction
      setCurrentStep('Waiting for approval confirmation...');
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for confirmation

      // Step 2: Create project in backend first to get projectId
      setCurrentStep('Creating project record...');
      const backendResponse = await apiClient.post('/projects', {
        name: params.name,
        description: params.description,
        repositoryUrl: params.repositoryUrl,
        totalBounty: params.totalBounty,
        ownerWallet: params.ownerWallet,
      });

      if (!backendResponse.success) {
        throw new Error(backendResponse.error || 'Failed to create project');
      }

      const data = backendResponse.data as any;
      const projectId = data?.id;
      
      // Convert projectId (UUID string) to uint256 for smart contract
      // For now, we'll use a simple hash or just skip on-chain deposit
      // In production, you'd want a mapping between UUID and uint256
      
      // Step 3: Deposit to escrow (optional - can be done later)
      // This requires projectId to be a uint256, which needs proper implementation
      // For MVP, we'll skip this and just use the backend
      
      setCurrentStep('Project created successfully!');
      setIsCreating(false);

      return {
        success: true,
        projectId,
        data: data,
      };
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
      setIsCreating(false);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  return {
    createProject,
    isCreating,
    error,
    currentStep,
  };
}

