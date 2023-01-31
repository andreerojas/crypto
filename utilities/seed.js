const {supportedCurrencies} = require('./currenciesList');
const axios = require('axios');
require('dotenv').config();
const mongoose = require('mongoose');
const Currency = require('../models/currency')

mongoose.connect('mongodb://127.0.0.1:27017/crypto')
.then(()=>{
    console.log("CONNECTED TO DATABASE");
    updateCurrenciesData();
})
.catch(e =>{
    console.log("ERROR CONNECTING TO DATABASE");        
});

const supportedCurrenciesIDs = supportedCurrencies.map(curr => curr.id).join();
const euroID = 2790;
const usdID = 2781;
const fiat = euroID;
const baseURL = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/";
const quoteURL =  `${baseURL}quotes/latest?id=${supportedCurrenciesIDs}&aux=cmc_rank&convert_id=${fiat}`;
const metaURL = `${baseURL}info?id=${supportedCurrenciesIDs}`;
const config = {headers : { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
    'Accept': 'application/json',
    'Accept-Encoding' : 'deflate,gzip'}};

const updateCurrenciesData = async ()=>{
    try{
        const {data : quoteData} = await axios.get(quoteURL, config);
        const {data : metaData} = await axios.get(metaURL,config);
        const currenciesArray = [];
        for(let idx in metaData['data']){
            const {id : API_id , name, symbol, logo} = metaData['data'][idx];
            const {cmc_rank : API_ranking} = quoteData['data'][idx];
            const {price, percent_change_24h : change24h,  market_cap : marketCap,  volume_24h : volume} = quoteData['data'][idx]['quote'][fiat];
            const newCurrency = new Currency({API_id, name, symbol, logo, price, change24h, marketCap, volume, API_ranking});
            currenciesArray.push(newCurrency);
        }
        await Currency.insertMany(currenciesArray);
        console.log('data was added to currencies collection');
    }catch(e){
        console.error('An error occured while seeding currency data to DB ... ', e);
    }
}
