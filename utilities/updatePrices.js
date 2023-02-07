const axios = require('axios');
const Currency = require('../models/currency')
const {supportedCurrencies} = require('./currenciesList');
const supportedCurrenciesIDs = supportedCurrencies.map(curr => curr.id).join();
const euroID = 2790;
const usdID = 2781;
const fiat = euroID;
const fiatSymbols = {'2790' : '€' , '2781' : '$'};
const baseURL = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/";
const quoteURL =  `${baseURL}quotes/latest?id=${supportedCurrenciesIDs}&convert_id=${fiat}`;
const metaURL = `${baseURL}info?id=${supportedCurrenciesIDs}`;
const config = {headers : { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
    'Accept': 'application/json',
    'Accept-Encoding' : 'deflate,gzip'}};

module.exports.updatePrices = async ()=>{
    const {data : quoteData} = await axios.get(quoteURL, config);
    const currenciesArray = [];
    for(let idx in quoteData['data']){
        const {price, percent_change_24h : change24h,  market_cap : marketCap,  volume_24h : volume} = quoteData['data'][idx]['quote'][fiat];
        await Currency.findOneAndUpdate({API_id : idx}, {price, change24h, marketCap, volume});
    }
    console.log('currencies information updated',new Date());
}

module.exports.fiatSymbol = fiatSymbols[fiat];