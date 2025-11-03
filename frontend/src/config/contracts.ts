// SourcePay Smart Contract Addresses on Mezo Testnet

export const CONTRACTS = {
  // MUSD Token
  MUSD: (process.env.NEXT_PUBLIC_MUSD_CONTRACT_ADDRESS || '0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503') as `0x${string}`,
  
  // SourcePay Contracts
  ProjectRegistry: (process.env.NEXT_PUBLIC_CONTRACT_PROJECT_REGISTRY || '0x6E82D1F51652000907F1457030F2275F88cf87c3') as `0x${string}`,
  ProjectEscrow: (process.env.NEXT_PUBLIC_CONTRACT_PROJECT_ESCROW || '0x355dE584F4E4a13c7a8587cF7E8a8C0237988035') as `0x${string}`,
  FeatureTask: (process.env.NEXT_PUBLIC_CONTRACT_FEATURE_TASK || '0x5B73125722956714F570966B0FD659036029f241') as `0x${string}`,
  PayoutDistributor: (process.env.NEXT_PUBLIC_CONTRACT_PAYOUT_DISTRIBUTOR || '0x26ab82a7b1A337246e83A2264b59AF2cA273E040') as `0x${string}`,
} as const;

export const CHAIN_CONFIG = {
  chainId: 31611,
  name: 'Mezo Testnet',
  rpcUrl: 'https://rpc.test.mezo.org',
  explorerUrl: 'https://explorer.test.mezo.org',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
} as const;


