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
            'User-Agent': 'Awesome-Octocat-App',
            'Authorization': `token ${event.token}`
        }
    }

    var slackOptions = {
        url: `https://hooks.slack.com${event.path}`,
        headers: {
            'Content-type': 'application/json'
        }
    };

    async.waterfall([
        function(callback) {
            request(githubOptions, (error, response, body) => {
                callback(null, body)
            })
        },

        function(body, callback) {
            async.each(JSON.parse(body), (notification, slackCallback) => {
                var message = JSON.stringify({
                    'attachments': [
                        {
                            'title': notification.subject.title,
                            'text': notification.subject.url.replace(/api\./, '').replace(/repos\//, '')
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
                    callback('');
                }
            });
        }
    ], (err, result) => {
        if (err) {
            console.log(`Fail ${err}.`)
        } else {
            callback(null, 'succeeded');
        }
    });
};
