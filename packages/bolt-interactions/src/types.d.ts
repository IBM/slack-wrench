import { App, SlackAction, SlackActionMiddlewareArgs } from '@slack/bolt';

import { InteractionFlow } from './interaction-flow';

type InteractionController<FlowState> = (
  flow: InteractionFlow<FlowState>,
  app: App,
) => void;

type FlowInteractionIds = Record<string, string>;

type InteractionFlowContext<FlowState> = {
  setState: (state: any, expiresAt?: number) => Promise<unknown>;
  state: FlowState;
  endFlow: () => Promise<unknown>;
  interactionIds: FlowInteractionIds;
};

type InteractionFlowMiddlewareArgs<FlowState> = {
  context: Record<string, string> & InteractionFlowContext<FlowState>;
};

type InteractionFlowActionMiddlewareArgs<
  FlowState,
  ActionType extends SlackAction = SlackAction
> = InteractionFlowMiddlewareArgs<FlowState> &
  SlackActionMiddlewareArgs<ActionType>;

type InteractionActionConstraints = {
  action_id: string;
  block_id?: string | RegExp;
  callback_id?: string | RegExp;
};
