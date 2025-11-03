import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS } from '../config/contracts';
import { FEATURE_TASK_ABI } from '../config/abis';
import { apiClient } from '../services/api';

// Task ID mapping: We'll use a counter approach
// Backend UUID will map to blockchain uint256
let taskIdCounter = 1;

interface CreateTaskParams {
  projectId: string; // Backend UUID
  title: string;
  description: string;
  bountyAmount: string;
  difficulty?: string;
  githubIssueUrl?: string;
  ownerWallet: string;
}

interface ClaimTaskParams {
  taskId: string; // Backend UUID
  blockchainTaskId: number; // Blockchain uint256
  walletAddress: string;
}

interface SubmitWorkParams {
  taskId: string; // Backend UUID
  blockchainTaskId: number; // Blockchain uint256
  prUrl: string;
  walletAddress: string;
}

export function useTaskManagement() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');

  const { writeContractAsync: createTaskOnChain } = useWriteContract();
  const { writeContractAsync: assignTaskOnChain } = useWriteContract();
  const { writeContractAsync: submitTaskOnChain } = useWriteContract();

  // Create task with blockchain integration
  const createTask = async (params: CreateTaskParams) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create task on blockchain
      setCurrentStep('Creating task on blockchain...');
      
      const bountyWithDecimals = parseUnits(params.bountyAmount, 6); // MUSD decimals
      const blockchainProjectId = taskIdCounter; // In production, map UUID to uint256
      
      const txHash = await createTaskOnChain({
        address: CONTRACTS.FeatureTask,
        abi: FEATURE_TASK_ABI,
        functionName: 'createTask',
        args: [
          BigInt(blockchainProjectId),
          params.title,
          params.description,
          bountyWithDecimals,
          params.githubIssueUrl || '',
          '', // ipfsHash
        ],
      });

      setCurrentStep('Waiting for blockchain confirmation...');
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const blockchainTaskId = taskIdCounter++;

      // Step 2: Save to backend
      setCurrentStep('Saving to database...');
      const response = await apiClient.post('/tasks', {
        ...params,
        blockchainTaskId, // Store blockchain ID
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to save task');
      }

      const data = response.data as any;
      setCurrentStep('Task created successfully!');
      setIsProcessing(false);

      return {
        success: true,
        taskId: data?.id || '',
        blockchainTaskId,
        txHash,
        data: data,
      };
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
      setIsProcessing(false);
      return { success: false, error: err.message };
    }
  };

  // Claim task with blockchain integration
  const claimTask = async (params: ClaimTaskParams) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Assign on blockchain
      setCurrentStep('Claiming task on blockchain...');
      
      const txHash = await assignTaskOnChain({
        address: CONTRACTS.FeatureTask,
        abi: FEATURE_TASK_ABI,
        functionName: 'assignTask',
        args: [BigInt(params.blockchainTaskId), params.walletAddress as `0x${string}`],
      });

      setCurrentStep('Waiting for confirmation...');
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 2: Update backend
      setCurrentStep('Updating database...');
      const response = await apiClient.post(`/tasks/${params.taskId}/claim`, {
        walletAddress: params.walletAddress,
        txHash,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to claim task');
      }

      const data = response.data as any;
      setCurrentStep('Task claimed successfully!');
      setIsProcessing(false);

      return {
        success: true,
        txHash,
        data: data,
      };
    } catch (err: any) {
      console.error('Error claiming task:', err);
      setError(err.message || 'Failed to claim task');
      setIsProcessing(false);
      return { success: false, error: err.message };
    }
  };

  // Submit work with blockchain integration
  const submitWork = async (params: SubmitWorkParams) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Submit on blockchain
      setCurrentStep('Submitting work on blockchain...');
      
      const txHash = await submitTaskOnChain({
        address: CONTRACTS.FeatureTask,
        abi: FEATURE_TASK_ABI,
        functionName: 'submitTask',
        args: [BigInt(params.blockchainTaskId), params.prUrl],
      });

      setCurrentStep('Waiting for confirmation...');
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 2: Submit to backend (triggers Source Agent)
      setCurrentStep('🤖 Source Agent analyzing your code...');
      const response = await apiClient.post(`/tasks/${params.taskId}/submit`, {
        prUrl: params.prUrl,
        walletAddress: params.walletAddress,
        txHash,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to submit work');
      }

      const data = response.data as any;
      setCurrentStep('Analysis complete!');
      setIsProcessing(false);

      return {
        success: true,
        txHash,
        data: data,
      };
    } catch (err: any) {
      console.error('Error submitting work:', err);
      setError(err.message || 'Failed to submit work');
      setIsProcessing(false);
      return { success: false, error: err.message };
    }
  };

  return {
    createTask,
    claimTask,
    submitWork,
    isProcessing,
    error,
    currentStep,
  };
}

