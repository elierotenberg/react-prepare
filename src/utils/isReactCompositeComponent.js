export default function isReactCompositeComponent(type) {
  if(typeof type !== 'function') {
    return false;
  }
  if(typeof type.prototype !== 'object') {
    return false;
  }
  if(typeof type.prototype.render !== 'function') {
    return false;
  }
  return true;
}
