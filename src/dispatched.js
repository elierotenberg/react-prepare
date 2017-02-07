import prepared from './prepared';

const dispatched = (prepare, opts) => (OriginalComponent) => {
  const nextPrepare = (props, { store: { dispatch } }) => prepare(props, dispatch);
  return prepared(nextPrepare, opts)(OriginalComponent);
};

export default dispatched;
