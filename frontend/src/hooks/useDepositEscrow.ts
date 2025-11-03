import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS } from '../config/contracts';
import { PROJECT_ESCROW_ABI } from '../config/abis';

export function useDepositEscrow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = async (projectId: number, amount: string) => {
    // MUSD uses 6 decimals
    const amountWithDecimals = parseUnits(amount, 6);

    writeContract({
      address: CONTRACTS.ProjectEscrow,
      abi: PROJECT_ESCROW_ABI,
      functionName: 'depositFunds',
      args: [BigInt(projectId), amountWithDecimals],
    });
  };

  return {
    deposit,
    isLoading: isPending || isConfirming,
    isSuccess,
    isError: !!error,
    errorMessage: error?.message,
    txHash: hash,
  };
}

