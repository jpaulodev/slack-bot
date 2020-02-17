'use strict';

const querystring = require('querystring');
const slack = require('slack');
const { APP_TOKEN: token, CHANNEL } = process.env;

module.exports.handler = async event => {
  const params = querystring.parse(event.body);
  const { text: ip, user_name } = params;

  if (!ip || !ip.match(/\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b/)) {
    return {
      statusCode: 200,
      body: `IP \`${ip}\` inválido`
    }
  }

  await slack.chat.postMessage({
    token, 
    channel: `#${CHANNEL}`, 
    as_user: true,
    text: '@here Acesso!',
    link_names: true,
    attachments: [
      {
        title: 'Requester',
        fields: [
          {
            title: 'dev',
            value: `@${user_name}`,
            short: true
          },
          {
            title: 'ip',
            value: ip,
            short: true
          }
        ]
      },
      {
        fallback: 'acesso',
        callback_id: 'access_request',
        color: '3AA3E3',
        attachment_type:  'default',
        actions: [
          {
            name: 'positive',
            text: 'I got it :punch:',
            type: 'button',
            value: 'positive'
          }
        ]
      }
    ]
  });

  return {
    statusCode: 200,
    body: 'Hey, I\'ve just received your request! We are going to process it ASAP, please be patient!',
  };
};
