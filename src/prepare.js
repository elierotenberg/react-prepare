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

async function prepareCompositeElement({ type, props }, errorHandler, context) {
  if (isPrepared(type)) {
    const p = getPrepare(type)(props, context).catch(errorHandler);
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

function prepareElement(element, errorHandler, context) {
  if (element === null || typeof element !== 'object') {
    return Promise.resolve([null, context]);
  }
  const { type, props } = element;
  if (typeof type === 'string') {
    return Promise.resolve([props.children, context]);
  }
  if (!isReactCompositeComponent(type)) {
    return Promise.resolve([type(props), context]);
  }
  return prepareCompositeElement(element, errorHandler, context);
}

function prepare(element, options = {}, context = {}) {
  const {
    errorHandler = error => {
      throw error;
    },
  } = options;
  return prepareElement(
    element,
    errorHandler,
    context,
  ).then(([children, childContext]) =>
    Promise.all(
      React.Children
        .toArray(children)
        .map(child => prepare(child, options, childContext)),
    ),
  );
}

export default prepare;
