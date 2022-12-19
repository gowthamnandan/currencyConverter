const bodyparser = require("body-parser");
const NodeCache = require('node-cache');
import express from "express";
import { APIs, currencyList } from "./../config/currency";
import axios from "axios";

const app = express();
const port = 8000;
let convertedAmount = '';

app.set("views", "src/views");
app.set("view engine", "ejs");

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
const myCache = new NodeCache();

app.listen(port, () => {
  return console.log(`Conversion APP is up and running on ${port}`);
});

/**landing page form*/
app.get("/conversion", (req, res) => {
  res.render("pages/conversion", {
    amount: 10,
    fromCurrency: 'CAD',
    toCurrency: 'INR',
    currency: currencyList,
    convertedAmount: convertedAmount,
  });
});

/**
 * getConversion is an Post object retrieved from UI
 * params - Amount, from currency, to currency
 * based upon the user's inputs it returns the converted amount against their selections
*/
app.post("/getConversion", async (req, res) => {
  const amount = req.body.from_amount;
  const fromCurrency = req.body.from_currency;
  const toCurrency = req.body.to_currency;
  let currentRate;
  if(myCache.has('allCurrencies')) {
    currentRate = myCache.get('allCurrencies');
} else {
    const apiCalls = await fetchAPI();
    if(apiCalls.status !== 200 ) {
        return res.render("pages/conversion", {
            currency: currencyList,
            convertedAmount: convertedAmount,
          });
    }
    currentRate = apiCalls.data.rates;
    myCache.set('allCurrencies', currentRate, 3600);
  }
  const fromCurrencyRate = currentRate[fromCurrency];
  const toCurrencyRate = currentRate[toCurrency];
  convertedAmount =((toCurrencyRate / fromCurrencyRate) * amount).toFixed(2);
  res.render("pages/conversion", {
    amount: amount,
    fromCurrency: fromCurrency,
    toCurrency: toCurrency,
    currency: currencyList,
    convertedAmount: convertedAmount,
  });
});

/** 
 * This method would return the exchanges rates of world currency 
 * Public API
*/

async function fetchAPI() {
    return axios.get(APIs.exchangeAPI).then((currency) => {
      return currency;
    }).catch ((error) => {
        throw error;
    });
}
