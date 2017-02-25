// @flow
const { describe, it } = global;
import t from 'tcomb';

import isThenable from '../utils/isThenable';

describe('isThenable(p)', () => {
  it('recognizes a native Promise as thenable', () => {
    t.assert(isThenable(Promise.resolve()));
  });

  it('recognizes null as non-thenable', () => {
    t.assert(!isThenable(null));
  });

  it('recognizes void 0 as non-thenable', () => {
    t.assert(!isThenable(void 0));
  });

  it('recognizes function as non-thenable', () => {
    function nonThenable() {}
    t.assert(!isThenable(nonThenable));
  });

  it('recognizes arrow as non-thenable', () => {
    t.assert(!isThenable(() => {}));
  });

  it('recognizes custom thenable as thenable', () => {
    const thenable = {
      then: () => Promise.resolve(),
    };
    t.assert(isThenable(thenable));
  });
});
