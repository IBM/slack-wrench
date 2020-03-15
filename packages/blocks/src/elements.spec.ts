import { Button, Markdown, PlainText } from './elements';

describe('Slack Element widgets', () => {
  const text = 'Ravenclaw is obviously the best house.';
  const buttonId = 'ravenAgree';

  it('renders markdown text', () => {
    expect.assertions(1);
    expect(Markdown(text)).toMatchSnapshot();
  });

  it('renders a plaintext block', () => {
    expect.assertions(1);
    expect(PlainText(text)).toMatchSnapshot();
  });

  it('renders a plaintext block without emoji', () => {
    expect.assertions(1);
    expect(PlainText(text, false)).toMatchSnapshot();
  });

  it('renders a button', () => {
    expect.assertions(1);
    expect(Button(text, buttonId)).toMatchSnapshot();
  });
});
