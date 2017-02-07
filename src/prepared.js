import React, { PureComponent, Component } from 'react';

import { __REACT_PREPARE__ } from './constants';

const prepared = (prepare, {
  pure = true,
  componentDidMount = true,
  componentWillReceiveProps = true,
} = {}) => (OriginalComponent) => {
  const { displayName } = OriginalComponent;
  class PreparedComponent extends (pure ? PureComponent : Component) {
    static displayName = `PreparedComponent${displayName ? `(${displayName})` : ''}`;

    componentDidMount() {
      if(componentDidMount) {
        prepare(this.props);
      }
    }

    componentWillReceiveProps(nextProps) {
      if(componentWillReceiveProps) {
        prepare(nextProps);
      }
    }

    render() {
      return <OriginalComponent {...this.props} />;
    }
  }
  PreparedComponent[__REACT_PREPARE__] = prepare.bind(null);
  return PreparedComponent;
};

function isPrepared(CustomComponent) {
  return typeof CustomComponent[__REACT_PREPARE__] === 'function';
}

function getPrepare(CustomComponent) {
  return CustomComponent[__REACT_PREPARE__];
}

export { isPrepared, getPrepare };
export default prepared;
