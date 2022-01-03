import { App, ConversationStore, MemoryStore } from '@slack/bolt';
import { actions, slashCommand, view } from '@slack-wrench/fixtures';
import JestReceiver from '@slack-wrench/jest-bolt-receiver';

import { InteractionFlow, interactionFlow } from './index';

const random = 'RANDOM';

const noop = () => {};

const defaultInteractionIdGenerator = InteractionFlow.interactionIdGenerator;

interface TestState {
  foo: string;
  baz?: string;
}

describe('Bolt interaction flows', () => {
  const flowName = 'test';
  const flowId = InteractionFlow.createFlowId(flowName, random);

  let store: ConversationStore;
  let receiver: JestReceiver;
  let app: App;
  let state: TestState;

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

    interactionFlow<TestState>(flowName, noop)(app);

    expect(() => interactionFlow<TestState>(flowName, noop)(app)).toThrow(
      /declared twice/,
    );
  });

  it('Allows state to be set from commands', async () => {
    expect.assertions(2);

    const command = '/command';
    const instanceId = 'a/lovely/instance';
    const customFlowId = InteractionFlow.createFlowId(flowName, instanceId);

    interactionFlow<TestState>(flowName, (flow) => {
      app.command(command, async ({ ack }) => {
        await ack();
        await flow.start(state, instanceId);
      });
    })(app);

    const { ack } = await receiver.send(slashCommand(command));

    expect(ack).toBeCalled();
    expect(await store.get(customFlowId)).toEqual(state);
  });

  it('Allows flows to be started with a custom instanceId', async () => {
    expect.assertions(2);

    const command = '/command';

    interactionFlow<TestState>(flowName, (flow) => {
      app.command(command, async ({ ack }) => {
        await ack();
        await flow.start(state);
      });
    })(app);

    const { ack } = await receiver.send(slashCommand(command));

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

      interactionFlow<TestState>(flowName, (flow) => {
        flow.action(buttonId, async ({ context, ack }) => {
          expect(context.state).toEqual(state);
          await ack();
        });
      })(app);

      const { ack } = await receiver.send(
        actions.blockButtonAction({
          action_id,
        }),
      );

      expect(ack).toBeCalled();
    });

    it('sets the previous state for stateful view actions', async () => {
      expect.assertions(2);

      const id = 'test';
      const callback_id = InteractionFlow.createInteractionId(flowId, id);

      interactionFlow<TestState>(flowName, (flow) => {
        flow.view(id, async ({ context, ack }) => {
          expect(context.state).toEqual(state);
          await ack();
        });
      })(app);

      const { ack } = await receiver.send(
        view.viewSubmitAction({
          callback_id,
        }),
      );

      expect(ack).toBeCalled();
    });

    it('matches actions using constraints', async () => {
      expect.assertions(1);
      const block_id = 'BLOCK';

      interactionFlow<TestState>(flowName, (flow) => {
        flow.action(
          { action_id: buttonId, block_id },
          async ({ context, ack }) => {
            await ack();
            expect(context.state).toEqual(state);
          },
        );
      })(app);

      await receiver.send(
        actions.blockButtonAction({
          action_id,
          block_id,
        }),
      );
    });

    it('allows actions to set state', async () => {
      expect.assertions(1);

      const newState: TestState = {
        ...state,
        baz: 'faz',
      };

      interactionFlow<TestState>(flowName, (flow) => {
        flow.action(buttonId, async ({ context }) => {
          await context.setState(newState);
        });
      })(app);

      await receiver.send(
        actions.blockButtonAction({
          action_id,
        }),
      );

      expect(await store.get(flowId)).toEqual(newState);
    });

    it('removes state when a flow ends', async () => {
      expect.assertions(1);

      interactionFlow<TestState>(flowName, (flow) => {
        flow.action(buttonId, async ({ context }) => {
          await context.endFlow();
        });
      })(app);

      await receiver.send(
        actions.blockButtonAction({
          action_id,
        }),
      );

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
