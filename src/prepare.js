import React from 'react';

import isReactCompositeComponent from './utils/isReactCompositeComponent';
import isThenable from './utils/isThenable';
import { isPrepared, getPrepare } from './prepared';

const updater = {
  enqueueSetState(publicInstance, partialState, callback) {
    const newState = typeof partialState === 'function'
      ? partialState(publicInstance.state, publicInstance.props)
      : partialState;

    publicInstance.state = Object.assign({}, publicInstance.state, newState);
    if (typeof callback === 'function') {
      callback();
      return;
    }
  },
};

function createCompositeElementInstance(
  { type: CompositeComponent, props },
  context,
) {
  const instance = new CompositeComponent(props, context);
  const state = instance.state || null;

  instance.props = props;
  instance.state = state;
  instance.context = context;
  instance.updater = updater;
  instance.refs = {};

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

async function prepareCompositeElement({ type, props }, context) {
  if (isPrepared(type)) {
    const p = getPrepare(type)(props, context);
    if (isThenable(p)) {
      await p;
    } else {
      await Promise.resolve();
    }
  } else {
    await Promise.resolve();
  }
  const instance = createCompositeElementInstance({ type, props }, context);
  return renderCompositeElementInstance(instance, context);
}

function prepareElement(element, context) {
  if (element === null || typeof element !== 'object') {
    return Promise.resolve([null, context]);
  }
  const { type, props } = element;
  // React.Fragment can be either a symbol or number based on the existence of
  // ES2015 Symbol support of the current runtime environment. An equality
  // comparison works for both cases.
  if (typeof type === 'string' || type === React.Fragment) {
    return Promise.resolve([props.children, context]);
  }
  if (!isReactCompositeComponent(type)) {
    return Promise.resolve([type(props), context]);
  }
  return prepareCompositeElement(element, context);
}

function prepare(element, context = {}) {
  return prepareElement(element, context).then(([children, childContext]) =>
    Promise.all(
      React.Children
        .toArray(children)
        .map(child => prepare(child, childContext)),
    ),
  );
}

export default prepare;
