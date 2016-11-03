'use strict';

const https = require('https');
const request = require('request');

console.log('Loading function');

exports.handler = (event, context, callback) => {
    var token = event.token;
    var body = "";

    var githubOptions = {
        url: "https://api.github.com/notifications",
        headers: {
            "Content-type": "application/json",
            "User-Agent": "Awesome-Octocat-App",
            "Authorization": `token ${event.token}`
        }
    }

    request(githubOptions, (error, response, body) => {
        JSON.parse(body).forEach((notification) => {
            var data = JSON.stringify({
                "attachments": [
                    {
                        "title": notification.subject.title,
                        "text": notification.subject.url.replace(/api\./, '').replace(/repos\//, '')
                    }
                ]
            });

            var slack = https.request(
                {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    host: "hooks.slack.com",
                    path: event.path
                },
                (response) =>{
                    response.setEncoding('utf8');
                    response.on('data', (chunk) => {
                        console.log(`BODY: ${chunk}`);
                    });
                    response.on('end', () => {
                        console.log('No more data in response.');
                    });
                }
            );

            slack.on('error', (e) => {
                console.log(`problem with request: ${e.message}`);
            });

            slack.write(data);
            slack.end();
        });
    });
    callback(null, 'hoge');  // Echo back the first key value
};
