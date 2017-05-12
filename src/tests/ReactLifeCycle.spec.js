const { describe, it } = global;
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import sinon from 'sinon';
import t from 'tcomb';

describe('React lifecycle methods', () => {
  class CompositeComponent extends Component {
    static propTypes = {
      spyForComponentWillMount: PropTypes.func,
      spyForComponentWillUnmount: PropTypes.func,
    };

    componentWillMount() {
      const { spyForComponentWillMount } = this.props;
      spyForComponentWillMount();
    }

    componentWillUnmount() {
      const { spyForComponentWillUnmount } = this.props;
      spyForComponentWillUnmount();
    }

    render() {
      return <div>CompositeComponent</div>;
    }
  }

  it('renderToString calls #componentWillMount()', () => {
    const spyForComponentWillMount = sinon.spy();
    const spyForComponentWillUnmount = () => void 0;
    renderToString(<CompositeComponent
      spyForComponentWillMount={spyForComponentWillMount}
      spyForComponentWillUnmount={spyForComponentWillUnmount}
    />);
    t.assert(spyForComponentWillMount.calledOnce, '#componentWillMount() has been called once');
  });

  it('renderToString doesn\'t call #componentWillUnmount()', () => {
    const spyForComponentWillMount = () => void 0;
    const spyForComponentWillUnmount = sinon.spy();
    renderToString(<CompositeComponent
      spyForComponentWillMount={spyForComponentWillMount}
      spyForComponentWillUnmount={spyForComponentWillUnmount}
    />);
    t.assert(spyForComponentWillUnmount.callCount === 0, '#componentWillUnmount() has not been called');
  });
});
