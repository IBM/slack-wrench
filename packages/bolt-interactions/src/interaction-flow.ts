import {
  ActionConstraints,
  AnyMiddlewareArgs,
  App,
  ConversationStore,
  MemoryStore,
  Middleware,
  SlackAction,
} from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import uuid from 'uuid/v4';

import {
  FlowInteractionIds,
  InteractionActionConstraints,
  InteractionController,
  InteractionFlowActionMiddlewareArgs,
  InteractionFlowContext,
} from './types';

export class InteractionFlow<FlowState = unknown> {
  public static interactionIdGenerator: () => string = uuid;

  public static store: ConversationStore = new MemoryStore();

  private static appFlows = new Map<App, string[]>();

  private static idSep = '_';

  private static interactionSep = ':::';

  private app: App;

  private readonly name: string;

  public client: WebClient;

  private interactionIds: string[] = [];

  constructor(
    name: string,
    app: App,
    controller: InteractionController<FlowState>,
  ) {
    const flowNames = InteractionFlow.appFlows.get(app) || [];

    if (flowNames.includes(name)) {
      throw new Error(`Interaction flow ${name} declared twice`);
    }

    flowNames.push(name);
    InteractionFlow.appFlows.set(app, flowNames);

    this.name = name;
    this.app = app;
    this.client = app.client;

    controller(this, app);
  }

  public static createFlowId = (name: string, interactionId: string): string =>
    [name, interactionId].join(InteractionFlow.idSep);

  private getFlowId({ body }: AnyMiddlewareArgs): string {
    /* istanbul ignore else */
    if ('actions' in body) {
      const [flowId] = this.parseInteractionId(body.actions[0].action_id);
      return flowId;
    }

    // Just in case slack does something weird, I'm unsure how to trigger this
    /* istanbul ignore next */
    throw new Error("Couldn't find a flow in provided context");
  }

  private parseInteractionId = (id: string): Array<string> =>
    id.split(InteractionFlow.interactionSep);

  private interactionIdPattern = (id: string): RegExp =>
    new RegExp(
      InteractionFlow.createInteractionId(
        InteractionFlow.createFlowId(this.name, '.*'),
        id,
      ),
    );

  public static createInteractionId = (
    flowId: string,
    interactionId: string,
  ): string => [flowId, interactionId].join(InteractionFlow.interactionSep);

  private flowInteractionIds = (flowId: string): FlowInteractionIds =>
    this.interactionIds.reduce((map, actionId) => {
      // eslint-disable-next-line no-param-reassign
      map[actionId] = InteractionFlow.createInteractionId(flowId, actionId);

      return map;
    }, {} as FlowInteractionIds);

  private contextExtentions(
    flowId: string,
    state: FlowState,
  ): InteractionFlowContext<FlowState> {
    const { store } = InteractionFlow;

    return {
      state,
      setState: (newState: FlowState, expiresAt?: number): Promise<unknown> =>
        store.set(flowId, newState, expiresAt),
      endFlow: (): Promise<unknown> => store.set(flowId, '', 0),
      interactionIds: this.flowInteractionIds(flowId),
    };
  }

  private contextMiddleware: Middleware<AnyMiddlewareArgs> = async args => {
    const { context, next } = args;
    const { store } = InteractionFlow;
    const flowId = this.getFlowId(args);
    const state = await store.get(flowId);

    Object.assign(context, this.contextExtentions(flowId, state));

    next();
  };

  private injectListeners(
    ...listeners: Middleware<any>[]
  ): Middleware<AnyMiddlewareArgs>[] {
    return [
      // Coerce InteractionFlow middleware into bolt middleware.
      // Because context deserves good typing too.
      (this.contextMiddleware as unknown) as Middleware<AnyMiddlewareArgs>,
      ...((listeners as unknown[]) as Middleware<AnyMiddlewareArgs>[]),
    ];
  }

  public async start(
    initialState: FlowState,
  ): Promise<InteractionFlowContext<FlowState>> {
    const { store } = InteractionFlow;

    const flowId = InteractionFlow.createFlowId(
      this.name,
      InteractionFlow.interactionIdGenerator(),
    );

    await store.set(flowId, initialState);

    return this.contextExtentions(flowId, initialState);
  }

  action<ActionType extends SlackAction>(
    actionIdOrConstraints: string | InteractionActionConstraints,
    ...listeners: Middleware<
      InteractionFlowActionMiddlewareArgs<FlowState, ActionType>
    >[]
  ): void {
    const constraints =
      typeof actionIdOrConstraints === 'string'
        ? { action_id: actionIdOrConstraints }
        : actionIdOrConstraints;

    const flowConstraints: ActionConstraints = {
      ...constraints,
      action_id: this.interactionIdPattern(constraints.action_id),
    };

    this.interactionIds.push(constraints.action_id);

    this.app.action(flowConstraints, ...this.injectListeners(...listeners));
  }
}

export function interactionFlow<FlowState>(
  name: string,
  controller: InteractionController<FlowState>,
) {
  return (app: App): InteractionFlow =>
    new InteractionFlow<FlowState>(name, app, controller);
}
