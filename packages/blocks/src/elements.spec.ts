import {
  Button,
  ConversationsSelectInputElement,
  Image,
  Markdown,
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

  it('renders an option object', () => {
    expect.assertions(1);
    expect(OptionObject('Why best?', 'why-best-raven')).toMatchSnapshot();
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

  it('renders a minimal radio input element', () => {
    expect.assertions(1);
    expect(RadioInputElement('title', options)).toMatchSnapshot();
  });

  it('renders a radio input element with initial option', () => {
    expect.assertions(1);
    expect(RadioInputElement('title', options, options[0])).toMatchSnapshot();
  });

  it('renders a radio input element opts that override', () => {
    expect.assertions(1);
    expect(
      RadioInputElement('title', options, options[0], {
        initial_option: options[1],
      }),
    ).toMatchSnapshot();
  });

  it('renders a minimal static select input element', () => {
    expect.assertions(1);
    expect(
      StaticSelectInputElement('title', 'Select a book', options),
    ).toMatchSnapshot();
  });

  it('renders a static select input element with initial option', () => {
    expect.assertions(1);
    expect(
      StaticSelectInputElement('title', 'Select a book', options, options[0]),
    ).toMatchSnapshot();
  });

  it('renders a static select input element opts that override', () => {
    expect.assertions(1);
    expect(
      StaticSelectInputElement('title', 'Select a book', options, options[0], {
        initial_option: options[1],
      }),
    ).toMatchSnapshot();
  });

  it('renders a minimal conversation select input element', () => {
    expect.assertions(1);
    expect(
      ConversationsSelectInputElement('channel', 'Select a channel'),
    ).toMatchSnapshot();
  });

  it('renders a conversation select input element with initial option', () => {
    expect.assertions(1);
    expect(
      ConversationsSelectInputElement(
        'channel',
        'Select a channel',
        'GRK5NTHV1',
      ),
    ).toMatchSnapshot();
  });

  it('renders a conversation select input element opts that override', () => {
    expect.assertions(1);
    expect(
      ConversationsSelectInputElement(
        'channel',
        'Select a channel',
        'GRK5NTHV1',
        {
          initial_conversation: 'GRK5NTHV2',
        },
      ),
    ).toMatchSnapshot();
  });

  it('renders a minimal users select input element', () => {
    expect.assertions(1);
    expect(UsersSelectInputElement('user', 'Select a user')).toMatchSnapshot();
  });

  it('renders a users select input element with initial option', () => {
    expect.assertions(1);
    expect(
      UsersSelectInputElement('user', 'Select a user', 'DPJ215Q65'),
    ).toMatchSnapshot();
  });

  it('renders a users select input element opts that override', () => {
    expect.assertions(1);
    expect(
      UsersSelectInputElement('channel', 'Select a user', 'DPJ215Q65', {
        initial_user: 'DPBMEQCM8',
      }),
    ).toMatchSnapshot();
  });

  it('renders a minimal multi-conversation select input element', () => {
    expect.assertions(1);
    expect(
      MultiConversationsSelectInputElement('channel', 'Select channels'),
    ).toMatchSnapshot();
  });

  it('renders a multi-conversation select input element with initial option', () => {
    expect.assertions(1);
    expect(
      MultiConversationsSelectInputElement('channel', 'Select channels', [
        'GRK5NTHV1',
      ]),
    ).toMatchSnapshot();
  });

  it('renders a multi-conversation select input element opts that override', () => {
    expect.assertions(1);
    expect(
      MultiConversationsSelectInputElement(
        'channel',
        'Select channels',
        ['GRK5NTHV1'],
        {
          initial_conversations: ['GRK5NTHV2'],
        },
      ),
    ).toMatchSnapshot();
  });

  it('renders a minimal multi-users select input element', () => {
    expect.assertions(1);
    expect(
      MultiUsersSelectInputElement('users', 'Select users'),
    ).toMatchSnapshot();
  });

  it('renders a multi-users select input element with initial option', () => {
    expect.assertions(1);
    expect(
      MultiUsersSelectInputElement('users', 'Select users', ['DPJ215Q65']),
    ).toMatchSnapshot();
  });

  it('renders a multi-users select input element opts that override', () => {
    expect.assertions(1);
    expect(
      MultiUsersSelectInputElement('users', 'Select users', ['DPJ215Q65'], {
        initial_users: ['DPBMEQCM8'],
      }),
    ).toMatchSnapshot();
  });
});
