"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyparser = require("body-parser");
const NodeCache = require('node-cache');
const express_1 = __importDefault(require("express"));
const currency_1 = require("./../config/currency");
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
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
        currency: currency_1.currencyList,
        convertedAmount: convertedAmount,
    });
});
/**
 * getConversion is an Post object retrieved from UI
 * params - Amount, from currency, to currency
 * based upon the user's inputs it returns the converted amount against their selections
*/
app.post("/getConversion", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const amount = req.body.from_amount;
    const fromCurrency = req.body.from_currency;
    const toCurrency = req.body.to_currency;
    let currentRate;
    if (myCache.has('allCurrencies')) {
        currentRate = myCache.get('allCurrencies');
        console.log('In cache', currentRate);
    }
    else {
        const apiCalls = yield fetchAPI();
        if (apiCalls.status !== 200) {
            return res.render("pages/conversion", {
                currency: currency_1.currencyList,
                convertedAmount: convertedAmount,
            });
        }
        currentRate = apiCalls.data.rates;
        myCache.set('allCurrencies', currentRate, 3600);
    }
    const fromCurrencyRate = currentRate[fromCurrency];
    const toCurrencyRate = currentRate[toCurrency];
    convertedAmount = ((toCurrencyRate / fromCurrencyRate) * amount).toFixed(2);
    console.log('convertedAmount', fromCurrencyRate, toCurrencyRate, convertedAmount);
    res.render("pages/conversion", {
        amount: amount,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        currency: currency_1.currencyList,
        convertedAmount: convertedAmount,
    });
}));
/**
 * This method would return the exchanges rates of world currency
 * Public API
*/
function fetchAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        return axios_1.default.get(currency_1.APIs.exchangeAPI).then((currency) => {
            return currency;
        }).catch((error) => {
            throw error;
        });
    });
}
//# sourceMappingURL=app.js.map