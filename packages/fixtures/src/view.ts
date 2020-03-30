import { ViewSubmitAction } from '@slack/bolt';

import fields from './fields';

// eslint-disable-next-line import/prefer-default-export
export function viewSubmitAction(
  view?: Partial<ViewSubmitAction['view']>,
  options?: Partial<ViewSubmitAction>,
): ViewSubmitAction {
  const { api_app_id, callback_id, team, token, user } = fields;

  return {
    type: 'view_submission',
    team,
    user,
    view: {
      id: '',
      team_id: team.id,
      app_id: api_app_id,
      callback_id,
      bot_id: '',
      // can't use PlainText because weird bolt typings: https://github.com/slackapi/bolt/blob/master/src/types/view/index.ts#L20
      title: { type: 'plain_text', text: '', emoji: false },
      type: '',
      blocks: [],
      close: null,
      submit: null,
      hash: '',
      root_view_id: null,
      previous_view_id: null,
      clear_on_close: false,
      notify_on_close: false,
      private_metadata: '',
      state: { values: {} },
      ...view,
    },
    api_app_id,
    token,
    ...options,
  };
}
