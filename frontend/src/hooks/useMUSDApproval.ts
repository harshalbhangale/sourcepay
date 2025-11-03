import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS } from '../config/contracts';
import { MUSD_ABI } from '../config/abis';

export function useMUSDApproval(ownerAddress: `0x${string}` | undefined, spenderAddress: `0x${string}`) {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Check current allowance
  const { data: allowance, refetch } = useReadContract({
    address: CONTRACTS.MUSD,
    abi: MUSD_ABI,
    functionName: 'allowance',
    args: ownerAddress ? [ownerAddress, spenderAddress] : undefined,
    query: {
      enabled: !!ownerAddress,
    },
  });

  const approve = async (amount: string) => {
    // MUSD uses 6 decimals (like USDC), not 18
    const amountWithDecimals = parseUnits(amount, 6);
    
    writeContract({
      address: CONTRACTS.MUSD,
      abi: MUSD_ABI,
      functionName: 'approve',
      args: [spenderAddress, amountWithDecimals],
    });
  };

  const isApproved = (requiredAmount: string) => {
    if (!allowance) return false;
    const required = parseUnits(requiredAmount, 6);
    return allowance >= required;
  };

  return {
    approve,
    isApproved,
    allowance,
    isLoading: isPending || isConfirming,
    isSuccess,
    txHash: hash,
    refetch,
  };
}

