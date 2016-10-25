import React from 'react';

import isExtensionOf from './isExtensionOf';
import isThenable from './isThenable';
import { isPrepared, getPrepare } from './prepared';

function createCompositeElementInstance({ type: CompositeComponent, props }, context) {
  const instance = new CompositeComponent(props, context);
  if(instance.componentWillMount) {
    instance.componentWillMount();
  }
  return instance;
}

function renderCompositeElementInstance(instance, context = {}) {
  return [instance.render(), instance.getChildContext ? instance.getChildContext() : context];
}

function disposeOfCompositeElementInstance(instance) {
  if(instance.componentWillUnmount) {
    instance.componentWillUnmount();
  }
}

async function prepareCompositeElement({ type, props }, context) {
  let nextProps = props;
  if(isPrepared(type)) {
    const p = getPrepare(type)(props);
    const pValue = isThenable(p) ? await p : p;
    if(pValue) {
      nextProps = pValue;
    }
  }
  let instance = null;
  try {
    instance = createCompositeElementInstance({ type, props: nextProps }, context);
    return renderCompositeElementInstance(instance, context);
  }
  finally {
    if(instance !== null) {
      disposeOfCompositeElementInstance(instance);
    }
  }
}

async function prepareElement(element, context) {
  if(element === null || typeof element !== 'object') {
    return [null, context];
  }
  const { type, props } = element;
  if(typeof type === 'string') {
    return [props.children, context];
  }
  if(!isExtensionOf(type, React.Component) && !isExtensionOf(type, React.PureComponent)) {
    return [type(props), context];
  }
  return await prepareCompositeElement(element, context);
}

async function prepare(element, context = {}) {
  const [children, childContext] = await prepareElement(element, context);
  await Promise.all(React.Children.toArray(children).map((child) => prepare(child, childContext)));
}

export default prepare;
