import {
  App,
  SlackAction,
  SlackActionMiddlewareArgs,
  SlackViewAction,
  SlackViewMiddlewareArgs,
} from '@slack/bolt';

import { InteractionFlow } from '../interaction-flow';

export interface Controller<FlowState> {
  (flow: InteractionFlow<FlowState>, app: App): void;
}

export type FlowIds = Record<string, string>;

export interface FlowContext<FlowState> {
  setState: (state: any, expiresAt?: number) => Promise<unknown>;
  state: FlowState;
  endFlow: () => Promise<unknown>;
  interactionIds: FlowIds;
}

export interface FlowMiddlewareArgs<FlowState> {
  context: Record<string, string> & FlowContext<FlowState>;
}

export interface FlowActionMiddlewareArgs<
  FlowState,
  ActionType extends SlackAction = SlackAction
>
  extends FlowMiddlewareArgs<FlowState>,
    SlackActionMiddlewareArgs<ActionType> {}

export interface FlowViewMiddlewareArgs<
  FlowState,
  ViewActionType extends SlackViewAction = SlackViewAction
>
  extends FlowMiddlewareArgs<FlowState>,
    SlackViewMiddlewareArgs<ViewActionType> {}

export interface ActionConstraints {
  action_id: string;
  block_id?: string | RegExp;
  callback_id?: string | RegExp;
}
