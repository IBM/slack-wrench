import {
  ActionConstraints,
  AnyMiddlewareArgs,
  App,
  BlockAction,
  ConversationStore,
  MemoryStore,
  Middleware,
  SlackAction,
  SlackViewAction,
} from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { v4 as uuid } from 'uuid';

import { Interaction } from './types';

export interface FlowIdParts {
  name: string; // Story name
  instanceId: string; // Unique id for each interaction
  flowId: string; // Combination name + interaction id
}

export interface InteractionIdParts extends FlowIdParts {
  interaction: string; // Action that was taken in the flow
  interactionId: string; // combination flowId and action
}

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

  private store: ConversationStore<FlowState>;

  constructor(
    name: string,
    app: App,
    controller: Interaction.Controller<FlowState>,
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
    this.store = InteractionFlow.store as ConversationStore<FlowState>;

    controller(this, app);
  }

  public static createFlowId = (name: string, interactionId: string): string =>
    [name, interactionId].join(InteractionFlow.idSep);

  public static parseFlowId = (flowId: string): FlowIdParts => {
    const [name, instanceId] = flowId.split(InteractionFlow.idSep);

    return {
      flowId,
      name,
      instanceId,
    };
  };

  public static createInteractionId = (
    flowId: string,
    interactionId: string,
  ): string => [flowId, interactionId].join(InteractionFlow.interactionSep);

  public static parseInteractionId = (
    interactionId: string,
  ): InteractionIdParts => {
    const [flowId, interaction] = interactionId.split(
      InteractionFlow.interactionSep,
    );

    return {
      ...InteractionFlow.parseFlowId(flowId),
      interaction,
      interactionId,
    };
  };

  private interactionIdPattern = (id: string): RegExp =>
    new RegExp(
      InteractionFlow.createInteractionId(
        InteractionFlow.createFlowId(this.name, '.*'),
        id,
      ),
    );

  private static getFlowId({ body }: AnyMiddlewareArgs): string {
    /* istanbul ignore else */
    if ('actions' in body) {
      const actionBody = body as BlockAction;
      const { flowId } = this.parseInteractionId(
        actionBody.actions[0].action_id,
      );
      return flowId;
    }

    /* istanbul ignore else */
    if ('view' in body) {
      const viewBody = body as SlackViewAction;
      const { flowId } = this.parseInteractionId(viewBody.view.callback_id);

      return flowId;
    }

    // Just in case slack does something weird, I'm unsure how to trigger this
    /* istanbul ignore next */
    throw new Error("Couldn't find a flow in provided context");
  }

  private flowInteractionIds = (flowId: string): Interaction.FlowIds =>
    this.interactionIds.reduce((ids, interactionId) => {
      // Safe to perform in a `reduce` operation
      // eslint-disable-next-line no-param-reassign
      ids[interactionId] = InteractionFlow.createInteractionId(
        flowId,
        interactionId,
      );

      return ids;
    }, {} as Interaction.FlowIds);

  private contextExtensions(
    flowId: string,
    state: FlowState,
  ): Interaction.FlowContext<FlowState> {
    const { store } = InteractionFlow;

    return {
      state,
      setState: (newState: FlowState, expiresAt?: number): Promise<unknown> =>
        store.set(flowId, newState, expiresAt),
      endFlow: (): Promise<unknown> => store.set(flowId, '', 0),
      interactionIds: this.flowInteractionIds(flowId),
    };
  }

  private contextMiddleware: Middleware<AnyMiddlewareArgs> = async (args) => {
    const { context } = args;
    // Ignoring istanbul became hard.
    // `next` will never be undefined. It's only that way if it's the last middleware
    // in the chain, this middleware is always added at the front so it's impossible to
    // get it undefined in tests
    const next =
      args.next ||
      /* istanbul ignore next */ ((): Promise<void> => Promise.resolve());

    const flowId = InteractionFlow.getFlowId(args);
    const state = await this.store.get(flowId);

    Object.assign(context, this.contextExtensions(flowId, state));

    await next();
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
    id?: string,
  ): Promise<Interaction.FlowContext<FlowState>> {
    const { store } = InteractionFlow;

    const flowId = InteractionFlow.createFlowId(
      this.name,
      id || InteractionFlow.interactionIdGenerator(),
    );

    await store.set(flowId, initialState);

    return this.contextExtensions(flowId, initialState);
  }

  action<ActionType extends SlackAction>(
    actionIdOrConstraints: string | Interaction.ActionConstraints,
    ...listeners: Middleware<
      Interaction.FlowActionMiddlewareArgs<FlowState, ActionType>
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

  view<ViewActionType extends SlackViewAction>(
    callback_id: string,
    ...listeners: Middleware<
      Interaction.FlowViewMiddlewareArgs<FlowState, ViewActionType>
    >[]
  ): void {
    this.interactionIds.push(callback_id);

    this.app.view(
      this.interactionIdPattern(callback_id),
      ...this.injectListeners(...listeners),
    );
  }
}

export function interactionFlow<FlowState>(
  name: string,
  controller: Interaction.Controller<FlowState>,
) {
  return (app: App): InteractionFlow =>
    new InteractionFlow<FlowState>(name, app, controller);
}
