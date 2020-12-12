"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alfy = require('alfy');
const axios_1 = require("axios");
class Coingecko {
    constructor() { }
    async search(input) {
        const coins = await this.fetch();
        const criteria = (coin) => coin.symbol.indexOf(input) > -1;
        const filteredCoins = coins.filter(criteria).sort((a, b) => {
            if (a.symbol < b.symbol) {
                return -1;
            }
            else if (a.symbol > b.symbol) {
                return 1;
            }
            else {
                return 0;
            }
        });
        return this.getPrice(filteredCoins);
    }
    async getPrice(coins) {
        const coinIds = coins.map(coin => coin.id).join('%2C');
        return axios_1.default
            .get(`https://api.coingecko.com/api/v3/coins/markets?ids=${coinIds}&vs_currency=usd&order=market_cap_desc`)
            .then(resp => resp.data)
            .then(data => data.slice(0, 3))
            .then(data => data.map((coin) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            price: coin.current_price,
        })))
            .catch(err => alfy.output({ title: err.message }));
    }
    async fetch() {
        let data = alfy.cache.get('coins') || [];
        if (data.length === 0) {
            data = await axios_1.default
                .get('https://api.coingecko.com/api/v3/coins/list')
                .then(resp => resp.data);
            alfy.cache.set('coins', data, { maxAge: 60 * 60 * 24 * 1000 });
        }
        return data;
    }
}
const coingecko = new Coingecko();
async function run() {
    const result = await coingecko.search(alfy.input).then(coins => coins.map((coin) => ({
        title: coin.name,
        subtitle: `${coin.price} USD`,
        uid: coin.id,
        match: coin.id,
        arg: `https://www.coingecko.com/en/coins/${coin.id}`,
        autocomplete: coin.id,
    })));
    alfy.output(result);
}
run();
//# sourceMappingURL=index.js.map