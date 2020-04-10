import {
  Button,
  Image,
  Markdown,
  OptionObject,
  OverflowMenu,
  PlainText,
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
});
