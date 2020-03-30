import { actions, slashCommand, view } from '@slack-wrench/fixtures';
import JestReceiver from '@slack-wrench/jest-bolt-receiver';
import { App, ConversationStore, MemoryStore } from '@slack/bolt';
import delay from 'delay';

import { InteractionFlow, interactionFlow } from './index';

const random = 'RANDOM';
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const defaultInteractionIdGenerator = InteractionFlow.interactionIdGenerator;

describe('Bolt interaction flows', () => {
  const flowName = 'test';
  const flowId = InteractionFlow.createFlowId(flowName, random);

  let store: ConversationStore;
  let receiver: JestReceiver;
  let app: App;
  let state: any;

  beforeEach(() => {
    InteractionFlow.interactionIdGenerator = () => random;

    store = new MemoryStore();
    InteractionFlow.store = store;
    receiver = new JestReceiver();
    state = { foo: 'bar' };

    app = new App({ receiver, token: 'TOKEN' });
  });

  afterEach(() => {
    InteractionFlow.interactionIdGenerator = defaultInteractionIdGenerator;
  });

  it('prevents duplicate flow names', () => {
    expect.assertions(1);

    interactionFlow(flowName, noop)(app);

    expect(() => interactionFlow(flowName, noop)(app)).toThrow(
      /declared twice/,
    );
  });

  it('Allows state to be set from commands', async () => {
    expect.assertions(2);

    const command = '/command';
    const instanceId = 'a/lovely/instance';
    const customFlowId = InteractionFlow.createFlowId(flowName, instanceId);

    interactionFlow(flowName, flow => {
      app.command(command, async ({ ack }) => {
        ack();
        await flow.start(state, instanceId);
      });
    })(app);

    const { ack } = receiver.send(slashCommand(command));

    await delay(0);

    expect(ack).toBeCalled();
    expect(await store.get(customFlowId)).toEqual(state);
  });

  it('Allows flows to be started with a custom instanceId', async () => {
    expect.assertions(2);

    const command = '/command';

    interactionFlow(flowName, flow => {
      app.command(command, async ({ ack }) => {
        ack();
        await flow.start(state);
      });
    })(app);

    const { ack } = receiver.send(slashCommand(command));

    await delay(0);

    expect(ack).toBeCalled();
    expect(await store.get(flowId)).toEqual(state);
  });

  it('uses a uuid as a default id generator', () => {
    expect.assertions(1);

    expect(defaultInteractionIdGenerator()).toMatch(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
    );
  });

  it('can parse flow ids', () => {
    expect.assertions(1);

    expect(InteractionFlow.parseFlowId(flowId)).toEqual({
      flowId,
      instanceId: random,
      name: flowName,
    });
  });

  describe('stateful actions', () => {
    const buttonId = 'button-id';
    const action_id = InteractionFlow.createInteractionId(flowId, buttonId);

    beforeEach(async () => {
      await store.set(flowId, state);
    });

    it('sets the previous state for stateful actions', async () => {
      expect.assertions(2);

      interactionFlow(flowName, flow => {
        flow.action(buttonId, ({ context, ack }) => {
          expect(context.state).toEqual(state);
          ack();
        });
      })(app);

      const { ack } = receiver.send(
        actions.blockButtonAction({
          action_id,
        }),
      );

      await delay(0);
      expect(ack).toBeCalled();
    });

    it('sets the previous state for stateful view actions', async () => {
      expect.assertions(2);

      const id = 'test';
      const callback_id = InteractionFlow.createInteractionId(flowId, id);

      interactionFlow(flowName, flow => {
        flow.view(id, ({ context, ack }) => {
          expect(context.state).toEqual(state);
          ack();
        });
      })(app);

      const { ack } = receiver.send(
        view.viewSubmitAction({
          callback_id,
        }),
      );

      await delay(0);
      expect(ack).toBeCalled();
    });

    it('matches actions using constraints', async () => {
      expect.assertions(1);
      const block_id = 'BLOCK';

      interactionFlow(flowName, flow => {
        flow.action({ action_id: buttonId, block_id }, ({ context }) => {
          expect(context.state).toEqual(state);
        });
      })(app);

      receiver.send(
        actions.blockButtonAction({
          action_id,
          block_id,
        }),
      );

      await delay(0);
    });

    it('allows actions to set state', async () => {
      expect.assertions(1);

      const newState = {
        ...state,
        baz: 'faz',
      };

      interactionFlow(flowName, flow => {
        flow.action(buttonId, async ({ context }) => {
          await context.setState(newState);
        });
      })(app);

      receiver.send(
        actions.blockButtonAction({
          action_id,
        }),
      );

      await delay(0);

      expect(await store.get(flowId)).toEqual(newState);
    });

    it('removes state when a flow ends', async () => {
      expect.assertions(1);

      interactionFlow(flowName, flow => {
        flow.action(buttonId, async ({ context }) => {
          await context.endFlow();
        });
      })(app);

      receiver.send(
        actions.blockButtonAction({
          action_id,
        }),
      );

      await delay(0);
      await expect(store.get(flowId)).rejects.toThrow('Conversation expired');
    });

    it('can parse interaction ids', () => {
      expect.assertions(1);

      expect(InteractionFlow.parseInteractionId(action_id)).toEqual({
        flowId,
        instanceId: random,
        name: flowName,
        interaction: buttonId,
        interactionId: action_id,
      });
    });
  });
});
