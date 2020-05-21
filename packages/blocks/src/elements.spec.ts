import { PlainTextElement } from '@slack/types';

import {
  Button,
  ChannelsSelectInputElement,
  CheckboxInputElement,
  ConversationsSelectInputElement,
  Image,
  Markdown,
  MultiChannelsSelectInputElement,
  MultiConversationsSelectInputElement,
  MultiUsersSelectInputElement,
  OptionObject,
  OverflowMenu,
  PlainText,
  PlainTextInputElement,
  RadioInputElement,
  StaticSelectInputElement,
  UsersSelectInputElement,
} from './elements';
import { truncate } from './lengthHelpers';

const dynamicText = '0123456789'.repeat(301); // 3010 characters long
const dynamicTextElement: PlainTextElement = {
  type: 'plain_text',
  text: dynamicText,
};

// TODO: test custom function

describe('Slack Element widgets', () => {
  const text = 'Ravenclaw is obviously the best house.';
  const url = 'http://placekitten.com/700/500';
  const buttonId = 'ravenAgree';

  it('renders markdown object', () => {
    expect.assertions(1);
    expect(Markdown(text)).toMatchSnapshot();
  });

  it('renders a plaintext object', () => {
    expect.assertions(1);
    expect(PlainText(text)).toMatchSnapshot();
  });

  it('renders a plaintext object without emoji', () => {
    expect.assertions(1);
    expect(PlainText(text, false)).toMatchSnapshot();
  });

  describe('option object', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(OptionObject('Why best?', 'why-best-raven')).toMatchSnapshot();
    });

    it('truncates ellipsis for text, description', () => {
      expect.assertions(1);
      expect(
        OptionObject(dynamicText, 'why-best-raven', {
          description: dynamicTextElement,
        }),
      ).toMatchSnapshot();
    });

    it('truncates url', () => {
      expect.assertions(1);
      expect(
        OptionObject('Why best?', 'why-best-raven', {
          url: dynamicText,
        }),
      ).toMatchSnapshot();
    });

    it('disallows too long value', () => {
      expect.assertions(1);
      expect(OptionObject('Why best?', dynamicText)).toThrow();
    });

    it('allows override truncateOptions for too long value', () => {
      expect.assertions(1);
      expect(
        OptionObject('Why best?', dynamicText, undefined, {
          value: truncate,
        }),
      ).toMatchSnapshot();
    });
  });

  it('renders a button element', () => {
    expect.assertions(1);
    expect(Button(text, buttonId)).toMatchSnapshot();
  });

  it('renders an image element', () => {
    expect.assertions(1);
    expect(Image(url, text)).toMatchSnapshot();
  });

  it('renders an overflow menu element', () => {
    expect.assertions(1);
    expect(
      OverflowMenu(
        [
          OptionObject('Why best?', 'why-best-raven'),
          OptionObject('Ping JK', 'notify-author'),
        ],
        'house-actions',
      ),
    ).toMatchSnapshot();
  });

  it('renders a minimal plain-text input element', () => {
    expect.assertions(1);
    expect(
      PlainTextInputElement(
        'title',
        'and the Prisoner of Azkaban',
        'Enter a title',
      ),
    ).toMatchSnapshot();
  });

  it('renders a plain-text input element with initial value, placeholder, and opts', () => {
    expect.assertions(1);
    expect(
      PlainTextInputElement(
        'title',
        'and the Prisoner of Azkaban',
        'Enter a title',
        {
          multiline: true,
          min_length: 10,
          max_length: 200,
        },
      ),
    ).toMatchSnapshot();
  });

  const options = [
    OptionObject('3', 'and the Prisoner of Azkaban'),
    OptionObject('6', 'and the Half-Blood Prince'),
    OptionObject('7', 'and the Deathly Hallows'),
  ];

  describe('checkbox input element', () => {
    it('renders a minimal example', () => {
      expect.assertions(1);
      expect(CheckboxInputElement('title', options)).toMatchSnapshot();
    });

    it('renders with initial options', () => {
      expect.assertions(1);
      expect(
        CheckboxInputElement('title', options, [options[0], options[1]]),
      ).toMatchSnapshot();
    });

    it('renders with opts that override', () => {
      expect.assertions(1);
      expect(
        CheckboxInputElement('title', options, [options[0]], {
          initial_options: [options[1]],
        }),
      ).toMatchSnapshot();
    });
  });

  describe('radio input element', () => {
    it('renders a minimal example', () => {
      expect.assertions(1);
      expect(RadioInputElement('title', options)).toMatchSnapshot();
    });

    it('renders with initial option', () => {
      expect.assertions(1);
      expect(RadioInputElement('title', options, options[0])).toMatchSnapshot();
    });

    it('renders with opts that override', () => {
      expect.assertions(1);
      expect(
        RadioInputElement('title', options, options[0], {
          initial_option: options[1],
        }),
      ).toMatchSnapshot();
    });
  });

  describe('select input', () => {
    describe('static element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          StaticSelectInputElement('title', 'Select a book', options),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          StaticSelectInputElement(
            'title',
            'Select a book',
            options,
            options[0],
          ),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          StaticSelectInputElement(
            'title',
            'Select a book',
            options,
            options[0],
            {
              initial_option: options[1],
            },
          ),
        ).toMatchSnapshot();
      });
    });

    describe('channels element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          ChannelsSelectInputElement('channel', 'Select channel'),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          ChannelsSelectInputElement('channel', 'Select channel', 'GRK5NTHV1'),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          ChannelsSelectInputElement('channel', 'Select channel', 'GRK5NTHV1', {
            initial_channel: 'GRK5NTHV2',
          }),
        ).toMatchSnapshot();
      });
    });

    describe('conversation element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          ConversationsSelectInputElement(
            'conversation',
            'Select a conversation',
          ),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          ConversationsSelectInputElement(
            'conversation',
            'Select a conversation',
            'GRK5NTHV1',
          ),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          ConversationsSelectInputElement(
            'conversation',
            'Select a conversation',
            'GRK5NTHV1',
            {
              initial_conversation: 'GRK5NTHV2',
            },
          ),
        ).toMatchSnapshot();
      });
    });

    describe('user element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          UsersSelectInputElement('user', 'Select a user'),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          UsersSelectInputElement('user', 'Select a user', 'DPJ215Q65'),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          UsersSelectInputElement('channel', 'Select a user', 'DPJ215Q65', {
            initial_user: 'DPBMEQCM8',
          }),
        ).toMatchSnapshot();
      });
    });
  });

  describe('multi-select input', () => {
    describe('channels element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          MultiChannelsSelectInputElement('channels', 'Select channels'),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          MultiChannelsSelectInputElement('channels', 'Select channels', [
            'GRK5NTHV1',
          ]),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          MultiChannelsSelectInputElement(
            'channels',
            'Select channels',
            ['GRK5NTHV1'],
            {
              initial_channels: ['GRK5NTHV2'],
            },
          ),
        ).toMatchSnapshot();
      });
    });

    describe('conversations element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          MultiConversationsSelectInputElement(
            'conversations',
            'Select conversations',
          ),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          MultiConversationsSelectInputElement(
            'conversations',
            'Select conversations',
            ['GRK5NTHV1'],
          ),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          MultiConversationsSelectInputElement(
            'conversations',
            'Select conversations',
            ['GRK5NTHV1'],
            {
              initial_conversations: ['GRK5NTHV2'],
            },
          ),
        ).toMatchSnapshot();
      });
    });

    describe('users element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          MultiUsersSelectInputElement('users', 'Select users'),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          MultiUsersSelectInputElement('users', 'Select users', ['DPJ215Q65']),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          MultiUsersSelectInputElement('users', 'Select users', ['DPJ215Q65'], {
            initial_users: ['DPBMEQCM8'],
          }),
        ).toMatchSnapshot();
      });
    });
  });
});
