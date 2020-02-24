import {
  BasicElementAction,
  BlockAction,
  BlockButtonAction,
  BlockElementAction,
  ButtonAction,
} from '@slack/bolt';

import fields from './fields';

// Helper function to create more specific Block Actions
function blockAction<Action extends BasicElementAction = BlockElementAction>(
  action: Action,
  options: Partial<BlockAction<Action>> = {},
): BlockAction<Action> {
  const {
    token,
    response_url,
    trigger_id,
    api_app_id,
    team,
    user,
    channel,
  } = fields;

  return {
    type: 'block_actions',
    actions: [action],
    team,
    user,
    channel,
    token,
    response_url,
    trigger_id,
    api_app_id,
    container: {},
    ...options,
  };
}

// Will eventually have more exports
// eslint-disable-next-line import/prefer-default-export
export function blockButtonAction(
  action?: Partial<ButtonAction>,
  options?: Partial<BlockButtonAction>,
): BlockButtonAction {
  return blockAction<ButtonAction>(
    {
      type: 'button',
      action_ts: 'ACTION_TS',
      text: {
        type: 'plain_text',
        text: 'TEXT',
      },
      action_id: 'ACTION_ID',
      block_id: 'BLOCK_ID',
      value: 'VALUE',
      ...action,
    },
    options,
  );
}
