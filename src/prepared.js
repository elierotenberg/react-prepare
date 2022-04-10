import React, { PureComponent, Component } from 'react';

import { __REACT_PREPARE__ } from './constants';

const prepared =
  (
    prepare,
    {
      pure = true,
      componentDidMount = true,
      componentWillReceiveProps = true,
      awaitOnSsr = true,
      contextTypes = {},
    } = {},
  ) =>
  (OriginalComponent) => {
    const { displayName } = OriginalComponent;
    class PreparedComponent extends (pure ? PureComponent : Component) {
      static displayName = `PreparedComponent${
        displayName ? `(${displayName})` : ''
      }`;

      // Placeholder to allow referencing this.context in lifecycle methods
      static contextTypes = contextTypes;

      componentDidMount() {
        if (componentDidMount) {
          prepare(this.props, this.context);
        }
      }

      componentWillReceiveProps(nextProps, nextContext) {
        if (
          typeof componentWillReceiveProps === 'function'
            ? componentWillReceiveProps(
                this.props,
                nextProps,
                this.context,
                nextContext,
              )
            : componentWillReceiveProps
        ) {
          prepare(nextProps, nextContext);
        }
      }

      render() {
        return <OriginalComponent {...this.props} />;
      }
    }
    PreparedComponent[__REACT_PREPARE__] = {
      prepare: prepare.bind(null),
      awaitOnSsr,
    };
    return PreparedComponent;
  };

function getPrepare(CustomComponent) {
  return (
    CustomComponent[__REACT_PREPARE__] &&
    CustomComponent[__REACT_PREPARE__].prepare
  );
}

function isPrepared(CustomComponent) {
  return typeof getPrepare(CustomComponent) === 'function';
}

function shouldAwaitOnSsr(CustomComponent) {
  return (
    CustomComponent[__REACT_PREPARE__] &&
    CustomComponent[__REACT_PREPARE__].awaitOnSsr
  );
}

export { isPrepared, getPrepare, shouldAwaitOnSsr };
export default prepared;
