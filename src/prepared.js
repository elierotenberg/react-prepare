import React, { PureComponent, Component } from 'react';

import { __REACT_PREPARE__ } from './constants';

function prepared(prepare, {
  pure = true,
  componentDidMount = true,
  componentWillReceiveProps = true,
} = {}) {
  return (OriginalComponent) => {
    const { displayName } = OriginalComponent;
    class PreparedComponent extends (pure ? PureComponent : Component) {
      static displayName = `PreparedComponent${displayName ? `(${displayName})` : ''}`;

      static contextTypes = {
        store: React.PropTypes.object,
      }

      componentDidMount() {
        if(componentDidMount) {
          prepare(this.props, this.context);
        }
      }

      componentWillReceiveProps(nextProps) {
        if(componentWillReceiveProps) {
          prepare(nextProps, this.context);
        }
      }

      render() {
        return <OriginalComponent {...this.props} />;
      }
    }
    PreparedComponent[__REACT_PREPARE__] = prepare.bind(null);
    return PreparedComponent;
  };
}

function isPrepared(CustomComponent) {
  return typeof CustomComponent[__REACT_PREPARE__] === 'function';
}

function getPrepare(CustomComponent) {
  return CustomComponent[__REACT_PREPARE__];
}

export { isPrepared, getPrepare };
export default prepared;
