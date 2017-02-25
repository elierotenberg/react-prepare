// @flow
import { PropTypes } from 'react';

import prepared from './prepared';

const storeShape = PropTypes.shape({
  dispatch: PropTypes.func.isRequired,
});

type Opts = {
  componentDidMount?: boolean,
  componentWillReceiveProps?: boolean,
  contextTypes?: Object,
  pure?: boolean,
};

const dispatched = (prepareUsingDispatch: Function, opts: Opts = {}) => (
  OriginalComponent: Function,
) => {
  const prepare = (props, { store: { dispatch } }) =>
    prepareUsingDispatch(props, dispatch);
  const contextTypes = Object.assign(
    {},
    opts && opts.contextTypes ? opts.contextTypes : {},
    { store: storeShape },
  );
  const preparedOpts = Object.assign({}, opts, { contextTypes });
  return prepared(prepare, preparedOpts)(OriginalComponent);
};

export default dispatched;
