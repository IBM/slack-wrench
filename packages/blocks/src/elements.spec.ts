import { flatten, init, repeat, tail, takeLast } from 'ramda';

import {
  Button,
  ChannelsSelect,
  Checkboxes,
  ConversationsSelect,
  Datepicker,
  ImageElement,
  MultiChannelsSelect,
  MultiConversationsSelect,
  MultiStaticSelect,
  MultiUsersSelect,
  OptionObject,
  Overflow,
  PlainText,
  PlainTextInput,
  RadioButtons,
  StaticSelect,
  UsersSelect,
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
      expect(option.text).toEqual(PlainText(`${dynamicText.substr(0, 73)} …`));
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

  describe('datepicker', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(Datepicker('datepicker')).toMatchSnapshot();
    });

    it('truncates ellipsis for placeholder', () => {
      expect.assertions(1);
      const datepicker = Datepicker('datepicker', dynamicText);
      expect(datepicker.placeholder?.text).toEqual(
        `${dynamicText.substr(0, 148)} …`,
      );
    });

    it('renders with valid initial_date', () => {
      expect.assertions(1);
      expect(
        Datepicker('datepicker', undefined, '2015-10-21'),
      ).toMatchSnapshot();
    });

    it('throws for invalidly formatted date', () => {
      expect.assertions(1);
      expect(() => {
        return Datepicker('datepicker', undefined, 'Tomorrow');
      }).toThrow();
    });

    it('allows override LimitOpts for too long value', () => {
      expect.assertions(1);
      const datepicker = Datepicker(
        'datepicker',
        dynamicText,
        undefined,
        undefined,
        {
          placeholder: truncate,
        },
      );
      expect(datepicker.placeholder?.text).toEqual(dynamicText.substr(0, 150));
    });
  });

  describe('image', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(ImageElement(url, text)).toMatchSnapshot();
    });

    it('truncates ellipsis for alt_text', () => {
      expect.assertions(1);
      const image = ImageElement(url, dynamicText);
      expect(image.alt_text).toEqual(`${dynamicText.substr(0, 1998)} …`);
    });

    it('allows override LimitOpts for too long url', () => {
      expect.assertions(1);
      expect(() => {
        return ImageElement(dynamicText, text, {
          image_url: disallow,
        });
      }).toThrow();
    });
  });

  describe('overflow menu', () => {
    it('renders', () => {
      expect.assertions(1);
      expect(
        Overflow(
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
        Overflow(
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
        Overflow(
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
        PlainTextInput('title', 'and the Prisoner of Azkaban', 'Enter a title'),
      ).toMatchSnapshot();
    });

    it('renders with initial value, placeholder, and opts', () => {
      expect.assertions(1);
      expect(
        PlainTextInput(
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
      const truncatedString = `${dynamicText.substr(0, 148)} …`;
      const truncated = PlainTextInput('TBD', dynamicText, dynamicText);
      expect(truncated.initial_value).toEqual(truncatedString);
      expect(truncated.placeholder?.text).toEqual(truncatedString);
    });

    it('allows override LimitOpts for too long initial_value', () => {
      expect.assertions(1);
      expect(
        PlainTextInput('TBD', dynamicText, undefined, undefined, {
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
      expect(Checkboxes('title', options)).toMatchSnapshot();
    });

    it('renders with initial options', () => {
      expect.assertions(1);
      expect(
        Checkboxes('title', options, [options[0], options[1]]),
      ).toMatchSnapshot();
    });

    it('renders with opts that override', () => {
      expect.assertions(1);
      expect(
        Checkboxes('title', options, [options[0]], {
          initial_options: [options[1]],
        }),
      ).toMatchSnapshot();
    });

    it('truncates options', () => {
      expect.assertions(2);
      const manyOptions = tooLongOptions;
      const truncated = Checkboxes('title', manyOptions, manyOptions);
      expect(truncated.options).toHaveLength(10);
      expect(truncated.initial_options).toHaveLength(10);
    });

    it('allows override LimitOpts for too long initial_options', () => {
      expect.assertions(1);
      expect(() => {
        return Checkboxes('title', options, tooLongOptions, undefined, {
          initial_options: disallow,
        });
      }).toThrow();
    });
  });

  describe('radio input element', () => {
    const tooLongOptions = flatten(repeat(options, 5)); // 15 options

    it('renders a minimal example', () => {
      expect.assertions(1);
      expect(RadioButtons('title', options)).toMatchSnapshot();
    });

    it('renders with initial option', () => {
      expect.assertions(1);
      expect(RadioButtons('title', options, options[0])).toMatchSnapshot();
    });

    it('renders with opts that override', () => {
      expect.assertions(1);
      expect(
        RadioButtons('title', options, options[0], {
          initial_option: options[1],
        }),
      ).toMatchSnapshot();
    });

    it('truncates options', () => {
      expect.assertions(1);
      const manyOptions = tooLongOptions;
      const truncated = RadioButtons('title', manyOptions);
      expect(truncated.options).toHaveLength(10);
    });

    it('allows override LimitOpts for too long options', () => {
      expect.assertions(1);
      expect(() => {
        return RadioButtons('title', tooLongOptions, undefined, undefined, {
          options: disallow,
        });
      }).toThrow();
    });
  });

  describe('select input', () => {
    const tooLongOptions = flatten(repeat(options, 50)); // 150 long
    describe('static element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          StaticSelect('title', 'Select a book', options),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          StaticSelect('title', 'Select a book', options, options[0]),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          StaticSelect('title', 'Select a book', options, options[0], {
            initial_option: options[1],
          }),
        ).toMatchSnapshot();
      });

      it('truncates options', () => {
        expect.assertions(1);
        const truncated = StaticSelect(
          'title',
          'Select a book',
          tooLongOptions,
        );
        expect(truncated.options).toHaveLength(100);
      });

      it('allows override LimitOpts for too long options', () => {
        expect.assertions(1);
        expect(() => {
          return StaticSelect(
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

    describe('multi static element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          MultiStaticSelect('title', 'Select a book', options),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          MultiStaticSelect('title', 'Select a book', options, init(options)),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          MultiStaticSelect('title', 'Select a book', options, init(options), {
            initial_options: tail(options),
          }),
        ).toMatchSnapshot();
      });

      it('truncates options', () => {
        expect.assertions(1);
        const truncated = MultiStaticSelect(
          'title',
          'Select a book',
          tooLongOptions,
        );
        expect(truncated.options).toHaveLength(100);
      });

      it('allows override LimitOpts for too long options', () => {
        expect.assertions(1);
        expect(() => {
          return MultiStaticSelect(
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
        expect(ChannelsSelect('channel', 'Select channel')).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          ChannelsSelect('channel', 'Select channel', 'GRK5NTHV1'),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          ChannelsSelect('channel', 'Select channel', 'GRK5NTHV1', {
            initial_channel: 'GRK5NTHV2',
          }),
        ).toMatchSnapshot();
      });

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 148)} …`;
        expect(
          ChannelsSelect('channel', dynamicText).placeholder?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          ChannelsSelect('channel', dynamicText, undefined, undefined, {
            placeholder: truncate,
          }).placeholder?.text,
        ).toHaveLength(150);
      });
    });

    describe('conversation element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          ConversationsSelect('conversation', 'Select a conversation'),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          ConversationsSelect(
            'conversation',
            'Select a conversation',
            'GRK5NTHV1',
          ),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          ConversationsSelect(
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
        const truncatedString = `${dynamicText.substr(0, 148)} …`;
        expect(
          ConversationsSelect('conversation', dynamicText).placeholder?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          ConversationsSelect(
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
        expect(UsersSelect('user', 'Select a user')).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          UsersSelect('user', 'Select a user', 'DPJ215Q65'),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          UsersSelect('user', 'Select a user', 'DPJ215Q65', {
            initial_user: 'DPBMEQCM8',
          }),
        ).toMatchSnapshot();
      });

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 148)} …`;
        expect(UsersSelect('user', dynamicText).placeholder?.text).toEqual(
          truncatedString,
        );
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          UsersSelect('user', dynamicText, undefined, undefined, {
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
          MultiChannelsSelect('channels', 'Select channels'),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          MultiChannelsSelect('channels', 'Select channels', ['GRK5NTHV1']),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          MultiChannelsSelect('channels', 'Select channels', ['GRK5NTHV1'], {
            initial_channels: ['GRK5NTHV2'],
          }),
        ).toMatchSnapshot();
      });

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 148)} …`;
        expect(
          MultiChannelsSelect('channels', dynamicText).placeholder?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          MultiChannelsSelect('channel', dynamicText, undefined, undefined, {
            placeholder: truncate,
          }).placeholder?.text,
        ).toHaveLength(150);
      });
    });

    describe('conversations element', () => {
      it('renders a minimal example', () => {
        expect.assertions(1);
        expect(
          MultiConversationsSelect('conversations', 'Select conversations'),
        ).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          MultiConversationsSelect('conversations', 'Select conversations', [
            'GRK5NTHV1',
          ]),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          MultiConversationsSelect(
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
        const truncatedString = `${dynamicText.substr(0, 148)} …`;
        expect(
          MultiConversationsSelect('conversations', dynamicText).placeholder
            ?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          MultiConversationsSelect(
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
        expect(MultiUsersSelect('users', 'Select users')).toMatchSnapshot();
      });

      it('renders with initial option', () => {
        expect.assertions(1);
        expect(
          MultiUsersSelect('users', 'Select users', ['DPJ215Q65']),
        ).toMatchSnapshot();
      });

      it('renders with opts that override', () => {
        expect.assertions(1);
        expect(
          MultiUsersSelect('users', 'Select users', ['DPJ215Q65'], {
            initial_users: ['DPBMEQCM8'],
          }),
        ).toMatchSnapshot();
      });

      it('truncates placeholder with ellipsis', () => {
        expect.assertions(1);
        const truncatedString = `${dynamicText.substr(0, 148)} …`;
        expect(
          MultiUsersSelect('users', dynamicText).placeholder?.text,
        ).toEqual(truncatedString);
      });

      it('allows override LimitOpts for too long placeholder', () => {
        expect.assertions(1);
        expect(
          MultiUsersSelect('users', dynamicText, undefined, undefined, {
            placeholder: truncate,
          }).placeholder?.text,
        ).toHaveLength(150);
      });
    });
  });
});
