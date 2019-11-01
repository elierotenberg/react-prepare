import React from "react";

import isReactCompositeComponent from "./utils/isReactCompositeComponent";
import isThenable from "./utils/isThenable";
import { isPrepared, getPrepare } from "./prepared";

const updater = {
  enqueueSetState(publicInstance, partialState, callback) {
    const newState = typeof partialState === "function"
      ? partialState(publicInstance.state, publicInstance.props)
      : partialState;

    publicInstance.state = Object.assign({}, publicInstance.state, newState);
    if (typeof callback === "function") {
      callback();
      return;
    }
  }
};

function createCompositeElementInstance(
  { type: CompositeComponent, props },
  context
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
    instance.getChildContext ? instance.getChildContext() : {}
  );
  return [instance.render(), childContext];
}

async function prepareCompositeElement({ type, props }, errorHandler, context) {
  if (isPrepared(type)) {
    const p = getPrepare(type)(props, context);
    if (isThenable(p)) {
      await p.catch(errorHandler);
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
  console.log("Bar", element);
  if (element === null || typeof element !== "object") {
    return Promise.resolve([null, context]);
  }
  let { type, props } = element;
  if (typeof type === "string" || typeof type === "symbol") {
    console.log("sdsadas", props.children);
    return Promise.resolve([props.children, context]);
  }
  if (
    typeof type === "object" &&
    type.$$typeof.toString() === "Symbol(react.provider)"
  ) {
    console.log("context", context);
    const map = new Map(context && context._providers);
    map.set(type._context.Provider, props);
    return Promise.resolve([props.children, { ...context, _providers: map }]);
  }
  if (
    typeof type === "object" &&
    type.$$typeof.toString() === "Symbol(react.context)"
  ) {
    const oldProps = props;
    props = context._providers.get(type._context.Provider).value;
    type = oldProps.children;
  }
  console.log("Doing elem: ", element, typeof type, context);
  if (!isReactCompositeComponent(type)) {
    // Heeere
    console.log("Was composite", props, type);
    return Promise.resolve([type(props), context]);
  }
  console.log("Was _not_ composite");
  const f = prepareCompositeElement(element, errorHandler, context);
  f.then(a => console.log("Result", a));
  return f;
}

function prepare(element, options = {}, context = {}) {
  const {
    errorHandler = error => {
      throw error;
    }
  } = options;
  return prepareElement(
    element,
    errorHandler,
    context
  ).then(([children, childContext]) =>
    Promise.all(
      React.Children
        .toArray(children)
        .map(child => prepare(child, options, childContext))
    )
  );
}

export default prepare;
