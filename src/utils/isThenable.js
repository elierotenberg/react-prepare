// @flow
function isThenable(p: any) {
  return p && typeof p === 'object' && typeof p.then === 'function';
}

export default isThenable;
