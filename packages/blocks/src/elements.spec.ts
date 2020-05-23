import { flatten, repeat, takeLast } from 'ramda';

import {
  Button,
  ChannelsSelectInputElement,
  CheckboxInputElement,
  ConversationsSelectInputElement,
  Image,
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
import { disallow, truncate } from './limitHelpers';

const dynamicText = '0123456789'.repeat(301); // 3010 characters long

describe('Slack Element widgets', () => {
  const text = 'Ravenclaw is obviously the best house.';
  const url = 'http://placekitten.com/700/500';
  const buttonId = 'ravenAgree';

  describe('button', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(Button(text, buttonId)).toMatchSnapshot();
    });

    it('truncates ellipsis for text', () => {
      expect.assertions(1);
      const option = Button(dynamicText, buttonId);
      expect(option.text).toEqual(PlainText(`${dynamicText.substr(0, 72)}...`));
    });

    it('allows override LimitOpts for too long value', () => {
      expect.assertions(1);
      const button = Button(
        text,
        buttonId,
        { value: dynamicText },
        {
          value: truncate,
        },
      );
      expect(button.value).toHaveLength(2000);
    });
  });

  describe('image', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(Image(url, text)).toMatchSnapshot();
    });

    it('truncates ellipsis for alt_text', () => {
      expect.assertions(1);
      const image = Image(url, dynamicText);
      expect(image.alt_text).toEqual(`${dynamicText.substr(0, 1997)}...`);
    });

    it('allows override LimitOpts for too long url', () => {
      expect.assertions(1);
      expect(() => {
        return Image(dynamicText, text, {
          image_url: disallow,
        });
      }).toThrow();
    });
  });

  describe('overflow menu', () => {
    it('renders', () => {
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

    it('truncates options', () => {
      expect.assertions(1);
      expect(
        OverflowMenu(
          repeat(OptionObject('Why best?', 'why-best-raven'), 10),
          'house-actions',
        ).options,
      ).toHaveLength(5);
    });

    it('allows override LimitOpts function for too long options', () => {
      expect.assertions(1);
      const first3 = repeat(OptionObject('Why best?', 'why-best-raven'), 3);
      const middle2 = repeat(OptionObject('Watch movie', 'movie-watch'), 2);
      const last3 = repeat(OptionObject('Ping JK', 'notify-author'), 3);

      expect(
        OverflowMenu(
          [...first3, ...middle2, ...last3],
          'house-actions',
          undefined,
          {
            options: takeLast, // should take last 5 (limit is passed)
          },
        ).options,
      ).toEqual([...middle2, ...last3]);
    });
  });

  describe('plaintext input', () => {
    it('renders minimally', () => {
      expect.assertions(1);
      expect(
        PlainTextInputElement(
          'title',
          'and the Prisoner of Azkaban',
          'Enter a title',
        ),
      ).toMatchSnapshot();
    });

    it('renders with initial value, placeholder, and opts', () => {
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

    it('truncates placeholder and initial_value', () => {
      expect.assertions(2);
      const truncatedString = `${dynamicText.substr(0, 147)}...`;
      const truncated = PlainTextInputElement('TBD', dynamicText, dynamicText);
      expect(truncated.initial_value).toEqual(truncatedString);
      expect(truncated.placeholder?.text).toEqual(truncatedString);
    });

    it('allows override LimitOpts for too long initial_value', () => {
      expect.assertions(1);
      expect(
        PlainTextInputElement('TBD', dynamicText, undefined, undefined, {
          initial_value: truncate,
        }).initial_value,
      ).toHaveLength(150);
    });
  });

  const options = [
    OptionObject('3', 'and the Prisoner of Azkaban'),
    OptionObject('6', 'and the Half-Blood Prince'),
    OptionObject('7', 'and the Deathly Hallows'),
  ];

  describe('checkbox input element', () => {
    const tooLongOptions = flatten(repeat(options, 5)); // 15 options

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

    it('truncates options', () => {
      expect.assertions(2);
      const manyOptions = tooLongOptions;
      const truncated = CheckboxInputElement('title', manyOptions, manyOptions);
      expect(truncated.options).toHaveLength(10);
      expect(truncated.initial_options).toHaveLength(10);
    });

    it('allows override LimitOpts for too long initial_options', () => {
      expect.assertions(1);
      expect(() => {
        return CheckboxInputElement(
          'title',
          options,
          tooLongOptions,
          undefined,
          {
            initial_options: disallow,
          },
        );
      }).toThrow();
    });
  });

  describe('radio input element', () => {
    const tooLongOptions = flatten(repeat(options, 5)); // 15 options

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

    it('truncates options', () => {
      expect.assertions(1);
      const manyOptions = tooLongOptions;
      const truncated = RadioInputElement('title', manyOptions);
      expect(truncated.options).toHaveLength(10);
    });

    it('allows override LimitOpts for too long options', () => {
      expect.assertions(1);
      expect(() => {
        return RadioInputElement(
          'title',
          tooLongOptions,
          undefined,
          undefined,
          {
            options: disallow,
          },
        );
      }).toThrow();
    });
  });

  describe('select input', () => {
    const tooLongOptions = flatten(repeat(options, 50)); // 150 long
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

      it('truncates options', () => {
        expect.assertions(1);
        const truncated = StaticSelectInputElement(
          'title',
          'Select a book',
          tooLongOptions,
        );
        expect(truncated.options).toHaveLength(100);
      });

      it('allows override LimitOpts for too long options', () => {
        expect.assertions(1);
        expect(() => {
          return StaticSelectInputElement(
            'title',
            'Select a book',
            tooLongOptions,
            undefined,
            undefined,
            {
              options: disallow,
            },
          );
        }).toThrow();
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

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 147)}...`;
        expect(
          ChannelsSelectInputElement('channel', dynamicText).placeholder?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          ChannelsSelectInputElement(
            'channel',
            dynamicText,
            undefined,
            undefined,
            {
              placeholder: truncate,
            },
          ).placeholder?.text,
        ).toHaveLength(150);
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

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 147)}...`;
        expect(
          ConversationsSelectInputElement('conversation', dynamicText)
            .placeholder?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          ConversationsSelectInputElement(
            'conversation',
            dynamicText,
            undefined,
            undefined,
            {
              placeholder: truncate,
            },
          ).placeholder?.text,
        ).toHaveLength(150);
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
          UsersSelectInputElement('user', 'Select a user', 'DPJ215Q65', {
            initial_user: 'DPBMEQCM8',
          }),
        ).toMatchSnapshot();
      });

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 147)}...`;
        expect(
          UsersSelectInputElement('user', dynamicText).placeholder?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          UsersSelectInputElement('user', dynamicText, undefined, undefined, {
            placeholder: truncate,
          }).placeholder?.text,
        ).toHaveLength(150);
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

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 147)}...`;
        expect(
          MultiChannelsSelectInputElement('channels', dynamicText).placeholder
            ?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          MultiChannelsSelectInputElement(
            'channel',
            dynamicText,
            undefined,
            undefined,
            {
              placeholder: truncate,
            },
          ).placeholder?.text,
        ).toHaveLength(150);
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

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 147)}...`;
        expect(
          MultiConversationsSelectInputElement('conversations', dynamicText)
            .placeholder?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          MultiConversationsSelectInputElement(
            'conversations',
            dynamicText,
            undefined,
            undefined,
            {
              placeholder: truncate,
            },
          ).placeholder?.text,
        ).toHaveLength(150);
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

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 147)}...`;
        expect(
          MultiUsersSelectInputElement('users', dynamicText).placeholder?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          MultiUsersSelectInputElement(
            'users',
            dynamicText,
            undefined,
            undefined,
            {
              placeholder: truncate,
            },
          ).placeholder?.text,
        ).toHaveLength(150);
      });
    });
  });
});
