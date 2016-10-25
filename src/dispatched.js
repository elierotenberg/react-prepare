import prepared from './prepared';

function dispatched(prepare, opts) {
  return (OriginalComponent) => {
    const nextPrepare = (props, { store: { dispatch } }) => prepare(props, dispatch);
    return prepared(nextPrepare, opts)(OriginalComponent);
  };
}

export default dispatched;
