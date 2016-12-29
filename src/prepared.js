import React, { PureComponent, Component } from 'react';

import { __REACT_PREPARE__ } from './constants';

function prepared(prepare, {
  pure = true,
  componentDidMount = true,
  componentWillReceiveProps = true,
  limitOfCalls = Infinity,
} = {}) {
  return (OriginalComponent) => {
    const { displayName } = OriginalComponent;

    // counter for calls of the prepare function
    // This enables to set a limit for the amount of calls.
    let calls = 0;

    class PreparedComponent extends (pure ? PureComponent : Component) {
      static displayName = `PreparedComponent${displayName ? `(${displayName})` : ''}`;

      static contextTypes = {
        store: React.PropTypes.object,
      }

      componentDidMount() {
        if(componentDidMount) {
          this.prepare();
        }
      }

      componentWillReceiveProps(nextProps) {
        if(componentWillReceiveProps) {
          this.prepare(nextProps);
        }
      }

      prepare(nextProps = this.props) {
        if(calls < limitOfCalls) {
          prepare(nextProps, this.context);
          calls = calls + 1;
        }
        else {
          // do nothing
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
