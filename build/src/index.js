"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alfy = require('alfy');
const axios_1 = require("axios");
class Coingecko {
    constructor() { }
    async search(input) {
        const coins = await this.fetch();
        const criteria = (coin) => coin.name.toLowerCase().indexOf(input) > -1 ||
            coin.symbol.indexOf(input) > -1;
        const filteredCoins = coins.filter(criteria).slice(0, 5);
        return this.getPrice(filteredCoins);
    }
    async getPrice(coins) {
        const coinIds = coins.map(coin => coin.id).join('%2C');
        const data = await axios_1.default
            .get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd`)
            .then(resp => resp.data)
            .catch(err => alfy.output({ title: err.message }));
        return coins.map(coin => ({ ...coin, price: data[coin.id].usd }));
    }
    async fetch() {
        let data = alfy.cache.get('coins') || [];
        if (data.length === 0) {
            data = await axios_1.default
                .get('https://api.coingecko.com/api/v3/coins/list')
                .then(resp => resp.data);
            alfy.cache.set('coins', data, { maxAge: 15000 });
        }
        return data;
    }
}
const coingecko = new Coingecko();
async function run() {
    const result = await coingecko.search(alfy.input).then(coins => coins.map((coin) => ({
        title: coin.id,
        subtitle: `${coin.price} USD`,
        uid: coin.id,
        match: coin.id,
        autocomplete: coin.id,
    })));
    alfy.output(result);
}
run();
//# sourceMappingURL=index.js.map