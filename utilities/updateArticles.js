const axios = require('axios');
const Currency = require('../models/currency')
const Article = require('../models/article');
const {supportedCurrencies} = require('./currenciesList');
const supportedCurrenciesName = supportedCurrencies.map(curr => curr.name);
const baseURL = 'https://newsapi.org/v2/everything?'
const config = {headers : { 'X-Api-Key': process.env.NEWS_API_KEY}};
const sources = ['coindesk.com','finance.yahoo.com','cryptodaily.co.uk','coinjournal.net','seekingalpha.com','newsbtc.com','ccn.com','cryptopolitan.com','cointelegraph.com','markets.businessinsider.com'].join();
const numArticles = 1
const now = new Date();
now.setDate(now.getDate()-7);
const daysOlder = now.toISOString();
module.exports.updateArticles = async ()=>{
    try{
        let count = 0;
        for(let name of supportedCurrenciesName){
            const API_id = supportedCurrencies.find(curr => curr.name === name).id;
            const currency = await Currency.findOne({'API_id' : API_id});
            const queryURL = `${baseURL}q=%22${name.replaceAll(' ','%20')}%22&searchIn=title&language=en&sortBy=popularity&pageSize=${numArticles}&from=${daysOlder}`
            const {data : response} = await axios.get(queryURL, config);
            const articlesArray = [];
            for(let article of response.articles){
                const {author, title,description, url, urlToImage, publishedAt} = article;
                if(title && url){
                    articlesArray.push(new Article({author, title, description, url, urlToImage, publishedAt, 'currency' : currency._id}));
                }
            }
            if(articlesArray.length){
                await Article.deleteMany({'currency': currency._id});
                await Article.insertMany(articlesArray);
            } 
        }
        console.log('news collection updated',new Date());
    }catch(e){
        if (e.response) {
            console.log('Error with the currencies API: ', e.response.data.message);
        }else if(e.request){
            console.log('Error with the currencies API:', e.request)
        }else{
            console.log('Error with the database ... ', e)
        }
    }
}



