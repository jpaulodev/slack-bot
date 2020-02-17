'use strict';

const querystring = require('querystring');
const slack = require('slack');
const { APP_TOKEN: token, CHANNEL } = process.env;

const handleDialogSubmission = async (payload) => {
  await slack.chat.postMessage({
    token, 
    channel: payload.state.replace(/[\<|\>]/g, ''),
    as_user: true,
    text: 'Your access has been created!',
    attachments: [
      {
        title: 'Your credentials:',
        fields: [
          {
            title: 'user',
            value: payload.submission.user,
            short: true
          },
          {
            title: 'pass',
            value: payload.submission.pass,
            short: true
          }
        ]
      }
    ]
  });
};

const handleAcceptButton = async (payload) => {
  const { callback_id, original_message, trigger_id } = payload;

  const requester = original_message.attachments[0].fields[0].value;

  const dialog = {
    callback_id,
    title: 'Credentials',
    submit_label: 'Request',
    notify_on_cancel: true,
    state: requester,
    elements: [
      {
        label: 'user',
        name: 'user',
        type: 'text',
        placeholder: 'dev_skywalker'
      },
      {
        label: 'pass',
        name: 'pass',
        type: 'text',
        placeholder: 'dev_pass'
      }
    ]
  };

  await slack.dialog.open({token, dialog, trigger_id});
};

module.exports.handler = async event => {
  const params = querystring.parse(event.body);
  const payload = JSON.parse(params.payload);

  let updatedAttachments = [];
  
  switch (payload.type) {
    case 'dialog_submission':
      await handleDialogSubmission(payload);
      return {
        statusCode: 200
      };
    case 'interactive_message':
      await handleAcceptButton(payload);

      updatedAttachments.push(payload.original_message.attachments[0]);
      updatedAttachments.push({
        link_names: true,
        title: `<@${payload.user.id}> is taking care of it :raised_hands:`,
        color: '#3AA3E3'
      });

      break;
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      token, 
      channel: `#${CHANNEL}`, 
      as_user: true,
      text: 'Access!',
      attachments: updatedAttachments
    })
  };
};
