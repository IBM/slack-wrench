import { PlainText } from '@slack-wrench/blocks';
import {
  BasicElementAction,
  BlockAction,
  BlockButtonAction,
  BlockElementAction,
  BlockOverflowAction,
  ButtonAction,
  OverflowAction,
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

export function blockButtonAction(
  action?: Partial<ButtonAction>,
  options?: Partial<BlockButtonAction>,
): BlockButtonAction {
  const { action_ts, text, action_id, block_id, value } = fields;

  return blockAction<ButtonAction>(
    {
      type: 'button',
      action_ts,
      text: PlainText(text),
      action_id,
      block_id,
      value,
      ...action,
    },
    options,
  );
}

export function blockOverflowAction(
  action?: Partial<OverflowAction>,
  options?: Partial<BlockOverflowAction>,
): BlockOverflowAction {
  const { action_ts, text, action_id, block_id, value } = fields;

  return blockAction<OverflowAction>(
    {
      type: 'overflow',
      action_ts,
      selected_option: {
        text: PlainText(text),
        value,
      },
      action_id,
      block_id,
      ...action,
    },
    options,
  );
}
