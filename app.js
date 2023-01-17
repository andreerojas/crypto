const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');
const { application } = require('express');
require('dotenv').config();

const port = 3000;
const baseURL = "https://pro-api.coinmarketcap.com/";
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static('public'));

app.listen(port, ()=>{
    console.log(`Listening on port ${port}`);
})

app.get('/test',async (req,res)=>{
    const id = Math.floor(Math.random()*82)+1;
    const url_test = `https://swapi.dev/api/people/${id}/`;
    const config = {headers : {Accept : 'application/json'}};
    const {data} = await axios.get(url_test,config);
    console.log(process.env.CMC_API_KEY);
    res.render('home',{data});
})

app.get('/sandbox',async (req,res)=>{
    const url =  "https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=2&convert_id=2781,2790";
    const config = {headers : { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY_SANDBOX,
                                 'Accept': 'application/json',
                                 'Accept-Encoding' : 'deflate,gzip'}};
    const {data} = await axios.get(url, config);
    console.log("data is",data);
    console.log("quote is: ",data["data"][0].quote);
    res.send('sandbox');
})

app.get('/conversion',async (req,res)=>{
    const quoteURL =   baseURL + "v1/cryptocurrency/listings/latest?start=1&limit=5&convert_id=2781";
    const config = {headers : { 'X-CMC_PRO_API_KEY': process.env.CMC_API_KEY,
                                 'Accept': 'application/json',
                                 'Accept-Encoding' : 'deflate,gzip'}};
    const {data : quoteData} = await axios.get(quoteURL, config);
    const ids = quoteData["data"].map( currency => currency.id);
    const metaURL = `${baseURL}v2/cryptocurrency/info?id=${ids.join()}`;
    const {data : metadata} = await axios.get(metaURL,config);
    
    const currencies = quoteData["data"].map(currency =>{
        const ret = {};
        ret.id = currency.id;
        ret.logo = metadata["data"][`${currency.id}`]["logo"];
        ret.name = currency["name"];
        ret.symbol = currency["symbol"];
        ret.price = Number.parseFloat(currency["quote"]["2781"]["price"]).toFixed(2);
        ret.change24h = Number.parseFloat(currency["quote"]["2781"]["percent_change_24h"]).toFixed(2);
        ret.marketCap = Number.parseFloat(currency["quote"]["2781"]["market_cap"]).toFixed(2);
        ret.volume =  Number.parseFloat(currency["quote"]["2781"]["volume_24h"]).toFixed(2);;
        return ret;
    })
    console.log(currencies);
    res.send('conversion');
})

