import React from 'react';

import isReactCompositeComponent from './utils/isReactCompositeComponent';
import isThenable from './utils/isThenable';
import { isPrepared, getPrepare, shouldAwaitOnSsr } from './prepared';

const updater = {
  enqueueSetState(publicInstance, partialState, callback) {
    const newState =
      typeof partialState === 'function'
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
  let preparedPromise;

  if (isPrepared(type)) {
    const p = getPrepare(type)(props, context);
    if (isThenable(p)) {
      preparedPromise = p.catch(errorHandler);
      if (shouldAwaitOnSsr(type)) {
        await preparedPromise;
      }
    }
  }
  const instance = createCompositeElementInstance({ type, props }, context);
  return [
    ...renderCompositeElementInstance(instance, context),
    preparedPromise,
  ];
}

function prepareElement(element, errorHandler, context) {
  if (element === null || typeof element !== 'object') {
    return Promise.resolve([null, context]);
  }
  const { type, props } = element;

  if (typeof type === 'string' || typeof type === 'symbol') {
    return Promise.resolve([props.children, context]);
  }

  if (
    typeof type === 'object' &&
    type.$$typeof.toString() === 'Symbol(react.provider)'
  ) {
    const _providers = new Map(context._providers);
    _providers.set(type._context.Provider, props);
    return Promise.resolve([props.children, { ...context, _providers }]);
  }

  if (
    typeof type === 'object' &&
    type.$$typeof.toString() === 'Symbol(react.context)'
  ) {
    const parentProvider =
      context._providers && context._providers.get(type._context.Provider);
    const value = parentProvider
      ? parentProvider.value
      : type._context.currentValue;

    const consumerFunc = props.children;
    return Promise.resolve([consumerFunc(value), context]);
  }

  if (
    typeof type === 'object' &&
    type.$$typeof.toString() === 'Symbol(react.forward_ref)'
  ) {
    return Promise.resolve([type.render(props, element.ref), context]);
  }
  if (!isReactCompositeComponent(type)) {
    return Promise.resolve([type(props), context]);
  }
  return prepareCompositeElement(element, errorHandler, context);
}

function prepare(element, options = {}, context = {}) {
  const {
    errorHandler = (error) => {
      throw error;
    },
  } = options;
  return prepareElement(element, errorHandler, context).then(
    ([children, childContext, p]) =>
      Promise.all(
        React.Children.toArray(children)
          .map((child) => prepare(child, options, childContext))
          .concat(p)
          .filter(Boolean),
      ),
  );
}

export default prepare;
