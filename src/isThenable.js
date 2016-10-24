function isThenable(p) {
  return p && typeof p === 'object' && typeof p.then === 'function';
}

export default isThenable;
