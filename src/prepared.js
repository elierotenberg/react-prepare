import React, { PureComponent, Component } from 'react';

import { __REACT_PREPARE__ } from './constants';

const prepared = (
  prepare,
  {
    pure = true,
    componentDidMount = true,
    componentWillReceiveProps = true,
    /*
    * Does this prepared func has to resolve before travelling further down the tree. If set to false
    * the prepare function is executed but not awaited before traveling further down. It is awaited
    * before prepare resolves, so the result will be ready to use when rendering the html.
    */
    hasSsrDataDeps: _hasSsrDataDeps = true,
    contextTypes = {},
  } = {},
) => OriginalComponent => {
  const { displayName } = OriginalComponent;
  class PreparedComponent extends (pure ? PureComponent : Component) {
    static displayName = `PreparedComponent${displayName ? `(${displayName})` : ''}`;

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
    _hasSsrDataDeps,
  };
  return PreparedComponent;
};

function isPrepared(CustomComponent) {
  return typeof getPrepare(CustomComponent) === 'function';
}

function getPrepare(CustomComponent) {
  return (
    CustomComponent[__REACT_PREPARE__] &&
    CustomComponent[__REACT_PREPARE__].prepare
  );
}
function hasSsrDataDeps(CustomComponent) {
  return (
    CustomComponent[__REACT_PREPARE__] &&
    CustomComponent[__REACT_PREPARE__].hasSsrDataDeps
  );
}

export { isPrepared, getPrepare, hasSsrDataDeps };
export default prepared;
