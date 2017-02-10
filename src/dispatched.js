import prepared from './prepared';

const dispatched = (prepareUsingDispatch, opts) => (OriginalComponent) => {
  const prepare = (props, { store: { dispatch } }) => prepareUsingDispatch(props, dispatch);
  return prepared(prepare, opts)(OriginalComponent);
};

export default dispatched;
