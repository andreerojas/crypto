const {supportedCurrencies} = require('./currenciesList');
const axios = require('axios');
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const mongoose = require('mongoose');
const Currency = require('../models/currency')
const Article = require('../models/article');
const supportedCurrenciesIDs = supportedCurrencies.map(curr => curr.id).join();
const euroID = 2790;
const usdID = 2781;
const fiat = euroID;
const baseURL = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/";
const quoteURL =  `${baseURL}quotes/latest?id=${supportedCurrenciesIDs}&aux=cmc_rank&convert_id=${fiat}`;
const metaURL = `${baseURL}info?id=${supportedCurrenciesIDs}`;
const configCurrencies = {headers : { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
    'Accept': 'application/json',
    'Accept-Encoding' : 'deflate,gzip'}};
const supportedCurrenciesName = supportedCurrencies.map(curr => curr.name);
const baseURLArticles = 'https://newsapi.org/v2/everything?'
const configArticles = {headers : { 'X-Api-Key': process.env.NEWS_API_KEY}};
const sources = ['coindesk.com','finance.yahoo.com','cryptodaily.co.uk','coinjournal.net','seekingalpha.com','newsbtc.com','ccn.com','cryptopolitan.com','cointelegraph.com'].join();
const numArticles = 2
const now = new Date();
now.setDate(now.getDate()-1);
const yesterday = now.toISOString();

const mongoURL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/crypto';
mongoose.connect(mongoURL)
.then(async ()=>{
    console.log("CONNECTED TO DATABASE");
    await updateCurrenciesData();
    await updateArticles();
    console.log('finished');
})
.catch(e =>{
    console.log("ERROR CONNECTING TO DATABASE");        
});

const updateCurrenciesData = async ()=>{
    try{
        const {data : quoteData} = await axios.get(quoteURL, configCurrencies);
        const {data : metaData} = await axios.get(metaURL,configCurrencies);
        await Currency.deleteMany({});
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

const updateArticles = async ()=>{
    try{
        const articlesArray = [];
        for(let name of supportedCurrenciesName){
            const API_id = supportedCurrencies.find(curr => curr.name === name).id;
            const currency = await Currency.findOne({'API_id' : API_id});
            const queryURL = `${baseURLArticles}q=%22${name.replaceAll(' ','%20')}%22&searchIn=title&language=en&sortBy=popularity&pageSize=${numArticles}&from=${yesterday}`
            const {data : response} = await axios.get(queryURL, configArticles);
            for(let article of response.articles){
                const {author, title,description, url, urlToImage, publishedAt} = article;
                if(title && url){
                    articlesArray.push(new Article({author, title, description, url, urlToImage, publishedAt, 'currency' : currency._id}));
                }
            }
        }
        if(articlesArray.length){
            await Article.insertMany(articlesArray);
        }  
        console.log('finished updating articles DB')
    }catch(e){
        console.error(e);
    }
}