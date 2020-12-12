const alfy = require('alfy');
import axios from 'axios';
import {Coin, CoinPrice} from './types';

class Coingecko {
  constructor() {}

  async search(input: string): Promise<CoinPrice[]> {
    const coins = await this.fetch_price();
    const criteria = (coin: Coin) =>
      coin.name.toLowerCase().indexOf(input) > -1 ||
      coin.symbol.indexOf(input) > -1;

    const filteredCoins = coins.filter(criteria);
    return this.getPrice(filteredCoins);
  }

  private async getPrice(coins: Coin[]): Promise<CoinPrice[]> {
    const coinIds = coins.map(coin => coin.id).join('%2C');
    const data = await axios
      .get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`
      )
      .then(resp => resp.data);

    return coins.map(coin => ({...coin, price: data[coin.id].price}));
  }

  private async fetch_price(): Promise<Coin[]> {
    let data: Coin[] = alfy.cache.get('coins') || [];

    if (data.length === 0) {
      data = await axios
        .get('https://api.coingecko.com/api/v3/coins/list')
        .then(resp => resp.data);

      alfy.cache.set('coins', data, {maxAge: 15000});
    }

    return data;
  }
}

async function run() {
  const coingecko = new Coingecko();
  const result = await coingecko.search(alfy.input).then(coins =>
    coins.map((coin: CoinPrice) => ({
      title: coin.id,
      subtitle: `${coin.price} USD`,
      uid: coin.id,
      match: coin.id,
      autocomplete: coin.id,
    }))
  );
  alfy.log(result);
  alfy.output(result);
}

run();
