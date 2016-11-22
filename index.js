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
    };

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
            var notifications = _.map(JSON.parse(body), (notification) => {
                let title = notification.subject.title;
                let url = notification.subject.url;
                let convertedUrl = url.replace(/api\./, '').replace(/repos\//, '').replace(/pulls\//, 'pull/');

                return {'title': title, 'text': convertedUrl, 'mrkdwn': 'text'};
            });


            var message = JSON.stringify({
                'text': `${notifications.length} notifications :point_right: https://github.com/notifications`,
                'attachments': notifications
            });

            request.post(slackOptions, (error, response, body) => {
                githubCallback(body, error)
            }).form(message);

        }
    ], (result, err) => {
        if (err) {
            console.log(`Fail ${err}.`)
        } else {
            callback(null, result);
        }
    });
};
