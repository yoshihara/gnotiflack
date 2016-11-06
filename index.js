'use strict';

const https = require('https');
const request = require('request');
const async = require('async');
const _ = require('lodash');

console.log('Loading function');

exports.handler = (event, context, callback) => {
    var githubOptions = {
        url: 'https://api.github.com/notifications',
        headers: {
            'Content-type': 'application/json',
            'User-Agent': 'gnotiflack-Bot',
            'Authorization': `token ${event.token}`
        }
    }

    var slackOptions = {
        url: event.incomingWebhook,
        headers: {
            'Content-type': 'application/json'
        }
    };

    async.waterfall([
        function(githubCallback) {
            request(githubOptions, (error, response, body) => {
                githubCallback(null, body)
            })
        },

        function(body, githubCallback) {
            async.each(JSON.parse(body), (notification, slackCallback) => {
                var message = JSON.stringify({
                    'attachments': [
                        {
                            'title': notification.subject.title,
                            'text': notification.subject.url.replace(/api\./, '').replace(/repos\//, '').replace(/pulls\//, 'pull/')
                        }
                    ]
                });

                request.post(slackOptions, (error, response, body) => {
                    console.log(body);
                    slackCallback();
                }).form(message);

            }, (err) => {
                if (err) {
                    console.log('Fail slack posting.')
                } else {
                    githubCallback('succeeded');
                }
            });
        }
    ], (result, err) => {
        if (err) {
            console.log(`Fail ${err}.`)
        } else {
            callback(null, result);
        }
    });
};
