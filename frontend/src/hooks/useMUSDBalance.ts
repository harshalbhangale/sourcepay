import { useReadContract, useBalance } from 'wagmi';
import { CONTRACTS } from '../config/contracts';
import { MUSD_ABI } from '../config/abis';
import { formatUnits } from 'viem';

export function useMUSDBalance(address: `0x${string}` | undefined) {
  // Get MUSD balance
  const { 
    data: musdBalance, 
    isLoading: isLoadingMUSD, 
    refetch: refetchMUSD 
  } = useReadContract({
    address: CONTRACTS.MUSD,
    abi: MUSD_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  // Get decimals
  const { data: decimals } = useReadContract({
    address: CONTRACTS.MUSD,
    abi: MUSD_ABI,
    functionName: 'decimals',
    query: {
      enabled: !!address,
    },
  });

  // Get BTC balance (native currency on Mezo)
  const { 
    data: btcBalance, 
    isLoading: isLoadingBTC, 
    refetch: refetchBTC 
  } = useBalance({
    address: address,
    query: {
      enabled: !!address,
      refetchInterval: 10000,
    },
  });

  // Format balances - MUSD uses 6 decimals like USDC
  const musdDecimals = decimals || 6;
  const formattedMUSD = musdBalance ? formatUnits(musdBalance, musdDecimals) : '0.00';
  const formattedBTC = btcBalance ? formatUnits(btcBalance.value, 18) : '0.00';

  return {
    musdBalance: formattedMUSD,
    musdBalanceRaw: musdBalance,
    btcBalance: formattedBTC,
    btcBalanceRaw: btcBalance,
    decimals: musdDecimals,
    isLoading: isLoadingMUSD || isLoadingBTC,
    refetch: () => {
      refetchMUSD();
      refetchBTC();
    },
  };
}

