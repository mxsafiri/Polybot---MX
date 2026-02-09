export type ServerEnv = {
  MONGO_URI: string;
  USER_ADDRESSES: string;
  PROXY_WALLET: string;
  RPC_URL: string;
  USDC_CONTRACT_ADDRESS: string;
};

function requireEnv(name: keyof ServerEnv): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getServerEnv(): ServerEnv {
  return {
    MONGO_URI: requireEnv("MONGO_URI"),
    USER_ADDRESSES: requireEnv("USER_ADDRESSES"),
    PROXY_WALLET: requireEnv("PROXY_WALLET"),
    RPC_URL: requireEnv("RPC_URL"),
    USDC_CONTRACT_ADDRESS: requireEnv("USDC_CONTRACT_ADDRESS"),
  };
}
