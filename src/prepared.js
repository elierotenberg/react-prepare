import { PureComponent, Component, createElement } from 'react';

import { __REACT_PREPARE__ } from './constants';

function prepared(prepare, {
  pure = true,
  componentDidMount = true,
  componentWillReceiveProps = true,
} = {}) {
  return (OriginalComponent) => {
    class PreparedComponent extends (pure ? PureComponent : Component) {
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
        return createElement(OriginalComponent, this.props);
      }
    }
    const { displayName } = OriginalComponent;
    PreparedComponent.displayName = `PreparedComponent${displayName ? `(${displayName})` : ''}`;
    PreparedComponent[__REACT_PREPARE__] = prepare.bind(null);
    return PreparedComponent;
  };
}

export default prepared;
