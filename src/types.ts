export interface Coin {
  id: string;
  symbol: string;
  name: string;
}

export interface CoinPrice extends Coin {
  price: number;
}
