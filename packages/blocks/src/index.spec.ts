import * as index from './index';

describe('The index', () => {
  it('exports everything', () => {
    expect.assertions(1);
    expect(Object.keys(index)).toMatchSnapshot();
  });
});
