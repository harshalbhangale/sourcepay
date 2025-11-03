import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import { PAYOUT_DISTRIBUTOR_ABI } from '../config/abis';

interface ClaimPayoutParams {
  payoutId: number;
  contributionId: string;
}

export function useClaimPayout() {
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { writeContractAsync: processPayoutTx } = useWriteContract();

  const claimPayout = async (params: ClaimPayoutParams) => {
    setIsClaiming(true);
    setError(null);

    try {
      // Call smart contract to process payout
      const hash = await processPayoutTx({
        address: CONTRACTS.PayoutDistributor,
        abi: PAYOUT_DISTRIBUTOR_ABI,
        functionName: 'processPayout',
        args: [BigInt(params.payoutId)],
      });

      setTxHash(hash);

      // Wait for confirmation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Update backend with transaction hash
      // This would be an API call to update the payout status
      // await apiClient.put(`/contributions/${params.contributionId}/payout`, {
      //   txHash: hash,
      //   status: 'COMPLETED',
      // });

      setIsClaiming(false);
      return {
        success: true,
        txHash: hash,
      };
    } catch (err: any) {
      console.error('Error claiming payout:', err);
      setError(err.message || 'Failed to claim payout');
      setIsClaiming(false);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  return {
    claimPayout,
    isClaiming,
    error,
    txHash,
  };
}

