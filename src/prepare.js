// @flow
import React from 'react';

import isReactCompositeComponent from './utils/isReactCompositeComponent';
import isThenable from './utils/isThenable';
import { isPrepared, getPrepare } from './prepared';

function createCompositeElementInstance(
  { type: CompositeComponent, props },
  context,
) {
  const instance = new CompositeComponent(props, context);
  if (instance.componentWillMount) {
    instance.componentWillMount();
  }
  return instance;
}

function renderCompositeElementInstance(instance, context = {}) {
  const childContext = Object.assign(
    {},
    context,
    instance.getChildContext ? instance.getChildContext() : {},
  );
  return [instance.render(), childContext];
}

function disposeOfCompositeElementInstance() {}

async function prepareCompositeElement({ type, props }, context) {
  if (isPrepared(type)) {
    const p = getPrepare(type)(props, context);
    if (isThenable(p)) {
      await p;
    }
  }
  let instance = null;
  try {
    instance = createCompositeElementInstance({ type, props }, context);
    return renderCompositeElementInstance(instance, context);
  } finally {
    if (instance !== null) {
      disposeOfCompositeElementInstance(instance);
    }
  }
}

async function prepareElement(element, context) {
  if (element === null || typeof element !== 'object') {
    return [null, context];
  }
  const { type, props } = element;
  if (typeof type === 'string') {
    return [props.children, context];
  }
  if (!isReactCompositeComponent(type)) {
    return [type(props), context];
  }
  return await prepareCompositeElement(element, context);
}

const prepare = async (element: any, context: Object = {}) => {
  const [children, childContext] = await prepareElement(element, context);
  await Promise.all(
    React.Children.toArray(children).map(child => prepare(child, childContext)),
  );
};

export default prepare;
