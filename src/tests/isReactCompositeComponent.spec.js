// @flow
const { describe, it } = global;
import t from 'tcomb';
import React from 'react';
import { Provider } from 'react-redux';

import isReactCompositeComponent from '../utils/isReactCompositeComponent';

describe('isReactCompositeComponent', () => {
  it('should match Component', () => {
    class C extends React.Component {
      render() {
        return <div />;
      }
    }
    t.assert(isReactCompositeComponent(C), 'match Component');
  });

  it('should match PureComponent', () => {
    class C extends React.PureComponent {
      render() {
        return <div />;
      }
    }
    t.assert(isReactCompositeComponent(C), 'match PureComponent');
  });

  it('should not match functional component', () => {
    const C = () => <div />;
    t.assert(
      isReactCompositeComponent(C) === false,
      'not match functional component',
    );
  });

  it('should match redux Provider', () => {
    t.assert(isReactCompositeComponent(Provider), 'match redux Provider');
  });
});
