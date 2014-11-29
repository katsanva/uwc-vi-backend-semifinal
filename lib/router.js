/**
 * Created by katsanva on 05.10.2014.
 */

var express = require('express'),
    async = require('async'),
    _ = require('underscore'),
    parseString = require('xml2js').parseString,
    url = require('url'),
    api = require('./api'),
    config = require(__dirname + '/../config.json'),
    router = new express.Router(),
    client;


module.exports = function(memcacheClient) {
    client = memcacheClient;

    return router;
};

var sendResponse = function(res, err, result) {
    if (err) {
        return res.status(err.code || 500).json(err).end();
    }

    res.json(result).end();
};

router.get('/currency', function(req, res) {
    var getCurrency = function(key, getCurrencyFromApi, cb) {
            var getFromStorage = function(callback) {
                    client.get(key, function(err, response) {
                        if (err && err.type !== 'NOT_FOUND') {
                            return callback(err);
                        }

                        callback(null, response || {})
                    })
                },
                resolveStorageResult = function(response, callback) {
                    if (response[key]) {
                        try {
                            resultData[key] = JSON.parse(response[key]);
                            fromCache = true;

                            return callback(null, resultData[key]);
                        } catch (err) {
                            return callback(err);
                        }
                    }

                    fromCache = false;

                    getCurrencyFromApi(function(response, body) {
                        parseString(body.body, callback);
                    });
                },
                putToCache = function(result, callback) {
                    if (!fromCache) {
                        return client.set(key, JSON.stringify(result), {exptime: 24 * 3600}, function(error) {
                            console.log('saved', key);
                            resultData[key] = result;

                            callback(error, resultData);
                        });
                    }

                    return callback(null, resultData)
                };

            async.waterfall(
                [
                    getFromStorage.bind(this),
                    resolveStorageResult.bind(this),
                    putToCache.bind(this)
                ],
                cb
            );
        },
        resultData = {},
        requiredCurrencies = [
            'bankCurrency',
            'bankCurrencyCashless',
            'officialCurrency'
        ],
        fromCache;

// iterate over required currencies to get necessary data
    async.map(requiredCurrencies,
        function(item, callback) {
            getCurrency(item + 'Key', api[item + 'Rates'], callback);
        }, sendResponse.bind(this, res));
});

router.post('/departments', function(req, res) {
    var key = 'departments_' + JSON.stringify(req.body) || '';

    getGenericList(key, api.getBankDepartments, req, res);
});

router.post('/partners', function(req, res) {
    var key = 'partners_' + JSON.stringify(req.body);

    getGenericList(key, api.getPartnersBonusPlus, req, res);

});

function getGenericList(key, apiCall, req, res) {
    var options = _.pick(req.body, ['city', 'address']),
        resultData, fromCache;

    var getFromStorage = function(callback) {
            client.get(key, function(err, response) {
                if (err && err.type !== 'NOT_FOUND') {
                    return callback(err);
                }
                callback(null, response || {})
            })
        },
        resolveStorageResult = function(response, callback) {
            if (response[key]) {
                try {
                    resultData = JSON.parse(response[key]);
                    fromCache = true;

                    return callback(null, resultData);
                } catch (err) {
                    return callback(err);
                }
            }

            fromCache = false;

            apiCall(options, function(response, body) {
                parseString(body.body, callback);
            });
        },
        pushToCache = function(result, callback) {
            if (!fromCache) {
                return client.set(key, JSON.stringify(result), {exptime: 30 * 24 * 3600}, function(error) {
                    console.log('saved', key);

                    callback(error, result);
                });
            }

            return callback(null, result)
        };

    async.waterfall([
            getFromStorage.bind(this),
            resolveStorageResult.bind(this),
            pushToCache.bind(this)
        ],
        sendResponse.bind(this, res)
    );
}
