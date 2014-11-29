/**
 * Created by katsanva on 05.10.2014.
 */

var request = require('request'),
    _ = require('underscore'),
    config = require(__dirname + '/../config.json');

function sendRequest(path, prefix, params, callback) {
    var options = {
        method: 'GET',
        json: true,
        url: 'https://' + (prefix || 'privat24') + '.privatbank.ua/' + path,
        qs: params
    };

    console.log(options);

    request(options, callback);
}

module.exports = {
    bankCurrencyRates: function(callback) {
        sendRequest('p24api/pubinfo', 'api', {exchange: '', coursid: 5}, callback);
    },
    bankCurrencyCashlessRates: function(callback) {
        sendRequest('p24api/pubinfo', 'api', {cardExchange: ''}, callback);
    },
    officialCurrencyRates: function(callback) {
        sendRequest('p24/accountorder', 'privat24', {oper: 'prp', apicour: '', PUREXML: '', country: 'ua'}, callback);
    },
    getPartnersBonusPlus: function(options, callback) {
        options = _.extend(options, {oper: 'prp', bonus: '', PUREXML: ""})

        sendRequest('p24/accountorder', 'privat24', options, callback);
    },
    getBankDepartments: function(options, callback) {
        options = _.extend(options, {oper: 'prp', pboffice: '', PUREXML: ""})

        sendRequest('p24/accountorder', 'privat24', options, callback);
    }
};
