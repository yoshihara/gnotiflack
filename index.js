'use strict';

const https = require('https');
const request = require('request');

console.log('Loading function');

exports.handler = (event, context, callback) => {
    var token = event.token;
    var body = '';

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

    request(githubOptions, (error, response, body) => {
        JSON.parse(body).forEach((notification) => {
            var data = JSON.stringify({
                'attachments': [
                    {
                        'title': notification.subject.title,
                        'text': notification.subject.url.replace(/api\./, '').replace(/repos\//, '')
                    }
                ]
            });

            request.post(slackOptions, (error, response, body) => {
                console.log(body);
            }).form(data);
        });
    });
    callback(null, 'hoge');  // Echo back the first key value
};
