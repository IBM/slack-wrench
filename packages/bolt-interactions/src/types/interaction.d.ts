import { App, SlackAction, SlackActionMiddlewareArgs } from '@slack/bolt';

import { InteractionFlow } from '../interaction-flow';

declare namespace Interaction {
  interface Controller<FlowState> {
    (flow: InteractionFlow<FlowState>, app: App): void;
  }

  type FlowIds = Record<string, string>;

  interface FlowContext<FlowState> {
    setState: (state: any, expiresAt?: number) => Promise<unknown>;
    state: FlowState;
    endFlow: () => Promise<unknown>;
    interactionIds: FlowIds;
  }

  interface FlowMiddlewareArgs<FlowState> {
    context: Record<string, string> & FlowContext<FlowState>;
  }

  interface FlowActionMiddlewareArgs<
    FlowState,
    ActionType extends SlackAction = SlackAction
  >
    extends FlowMiddlewareArgs<FlowState>,
      SlackActionMiddlewareArgs<ActionType> {}

  interface ActionConstraints {
    action_id: string;
    block_id?: string | RegExp;
    callback_id?: string | RegExp;
  }
}
