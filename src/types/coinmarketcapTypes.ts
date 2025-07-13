// CoinMarketCap API Response Types

export interface CoinMarketCapResponse {
  status: CoinMarketCapStatus;
  data: CoinMarketCapData[];
}

export interface CoinMarketCapStatus {
  timestamp: string;
  error_code: number;
  error_message: string | null;
  elapsed: number;
  credit_count: number;
  notice: string | null;
  total_count: number;
}

export interface CoinMarketCapData {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  num_market_pairs: number;
  date_added: string;
  tags: string[];
  max_supply: number | null;
  circulating_supply: number;
  total_supply: number;
  infinite_supply: boolean;
  platform: CoinMarketCapPlatform | null;
  cmc_rank: number;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  tvl_ratio: number | null;
  last_updated: string;
  quote: {
    USD: CoinMarketCapQuote;
  };
}

export interface CoinMarketCapPlatform {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  token_address: string;
}

export interface CoinMarketCapQuote {
  price: number;
  volume_24h: number;
  volume_change_24h: number;
  percent_change_1h: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  percent_change_60d: number;
  percent_change_90d: number;
  market_cap: number;
  market_cap_dominance: number;
  fully_diluted_market_cap: number;
  tvl: number | null;
  last_updated: string;
}

// Simplified types for your business logic
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  rank: number;
  price: number;
  marketCap: number;
  // volume24h: number;
  // priceChange24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  infiniteSupply: boolean;
  lastUpdated: string;
}

// Database storage type
export interface CoinRecord {
  id: string;
  symbol: string;
  name: string;
  cmc_rank: number;
  price: number;
  market_cap: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  infinite_supply: boolean;
  platform: string | null;
  self_reported_circulating_supply: number | null;
  self_reported_market_cap: number | null;
  tvl_ratio: number | null;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

// Transformation functions
export function transformToSimplifiedCoin(apiData: CoinMarketCapData): Coin {
  return {
    id: apiData.id.toString(),
    symbol: apiData.symbol,
    name: apiData.name,
    rank: apiData.cmc_rank,
    price: apiData.quote.USD.price,
    marketCap: apiData.quote.USD.market_cap,
    // volume24h: apiData.quote.USD.volume_24h,
    // priceChange24h: apiData.quote.USD.percent_change_24h,
    circulatingSupply: apiData.circulating_supply,
    totalSupply: apiData.total_supply,
    maxSupply: apiData.max_supply,
    infiniteSupply: apiData.infinite_supply,
    lastUpdated: apiData.last_updated
  };
}

export function transformToDbRecord(apiData: CoinMarketCapData): CoinRecord {
  return {
    id: apiData.id.toString(),
    symbol: apiData.symbol,
    name: apiData.name,
    cmc_rank: apiData.cmc_rank,
    price: apiData.quote.USD.price,
    market_cap: apiData.quote.USD.market_cap,
    // volume_24h: apiData.quote.USD.volume_24h,
    // percent_change_24h: apiData.quote.USD.percent_change_24h,
    circulating_supply: apiData.circulating_supply,
    total_supply: apiData.total_supply,
    max_supply: apiData.max_supply,
    infinite_supply: apiData.infinite_supply,
    platform: apiData.platform?.name || null,
    self_reported_circulating_supply: apiData.self_reported_circulating_supply,
    self_reported_market_cap: apiData.self_reported_market_cap,
    tvl_ratio: apiData.tvl_ratio,
    last_updated: apiData.last_updated,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
} 