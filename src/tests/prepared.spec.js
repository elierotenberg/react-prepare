// @flow
const { describe, it } = global;
import sinon from 'sinon';
import t from 'tcomb';
import equal from 'deep-equal';
import React, { Component, PureComponent, PropTypes } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import prepared, { isPrepared, getPrepare } from '../prepared';

describe('prepared', () => {
  class OriginalCompositeComponent extends Component {
    static propTypes = {
      text: PropTypes.string,
    };
    render() {
      return <div>{this.props.text}</div>;
    }
  }

  class OriginalCompositePureComponent extends PureComponent {
    static propTypes = {
      text: PropTypes.string,
    };
    render() {
      return <div>{this.props.text}</div>;
    }
  }

  const OriginalArrowComponent = ({ text }) => <div>{text}</div>;
  OriginalArrowComponent.propTypes = {
    text: PropTypes.string,
  };

  it('prepared Composite Component', async () => {
    const doAsyncSideEffect = sinon.spy(async () => {});
    const prepareUsingProps = sinon.spy(async ({ text }) => {
      await doAsyncSideEffect(text);
    });
    const PreparedCompositeComponent = prepared(prepareUsingProps, {
      pure: false,
    })(OriginalCompositeComponent);
    t.assert(
      !isPrepared(OriginalCompositeComponent),
      'OriginalComponent is not prepared',
    );
    t.assert(
      isPrepared(PreparedCompositeComponent),
      'PreparedComponent is prepared',
    );
    const prepare = getPrepare(PreparedCompositeComponent);
    t.assert(
      typeof prepare === 'function',
      'getPrepare(PreparedCompositeComponent) is a function',
    );
    await prepare({ text: 'foo' });
    t.assert(
      prepareUsingProps.calledOnce,
      'prepareUsingProps has been called exactly once',
    );
    t.assert(
      equal(prepareUsingProps.getCall(0).args, [{ text: 'foo' }]),
      'prepareUsingProps has been called with correct arguments',
    );
    t.assert(
      doAsyncSideEffect.calledOnce,
      'doAsyncSideEffect has been called exactly once',
    );
    t.assert(
      equal(doAsyncSideEffect.getCall(0).args, ['foo']),
      'doAsyncSideEffect has been called with correct arguments',
    );
    const html = renderToStaticMarkup(
      <PreparedCompositeComponent text="foo" />,
    );
    t.assert(html === '<div>foo</div>', 'renders with correct html');
  });

  it('prepared Composite Pure Component', async () => {
    const doAsyncSideEffect = sinon.spy(async () => {});
    const prepareUsingProps = sinon.spy(async ({ text }) => {
      await doAsyncSideEffect(text);
    });
    const PreparedCompositeComponent = prepared(prepareUsingProps)(
      OriginalCompositePureComponent,
    );
    t.assert(
      !isPrepared(OriginalCompositePureComponent),
      'OriginalComponent is not prepared',
    );
    t.assert(
      isPrepared(PreparedCompositeComponent),
      'PreparedComponent is prepared',
    );
    const prepare = getPrepare(PreparedCompositeComponent);
    t.assert(
      typeof prepare === 'function',
      'getPrepare(PreparedCompositeComponent) is a function',
    );
    await prepare({ text: 'foo' });
    t.assert(
      prepareUsingProps.calledOnce,
      'prepareUsingProps has been called exactly once',
    );
    t.assert(
      equal(prepareUsingProps.getCall(0).args, [{ text: 'foo' }]),
      'prepareUsingProps has been called with correct arguments',
    );
    t.assert(
      doAsyncSideEffect.calledOnce,
      'doAsyncSideEffect has been called exactly once',
    );
    t.assert(
      equal(doAsyncSideEffect.getCall(0).args, ['foo']),
      'doAsyncSideEffect has been called with correct arguments',
    );
    const html = renderToStaticMarkup(
      <PreparedCompositeComponent text="foo" />,
    );
    t.assert(html === '<div>foo</div>', 'renders with correct html');
  });

  it('prepared Arrow Component', async () => {
    const doAsyncSideEffect = sinon.spy(async () => {});
    const prepareUsingProps = sinon.spy(async ({ text }) => {
      await doAsyncSideEffect(text);
    });
    const PreparedCompositeComponent = prepared(prepareUsingProps)(
      OriginalArrowComponent,
    );
    t.assert(
      !isPrepared(OriginalArrowComponent),
      'OriginalComponent is not prepared',
    );
    t.assert(
      isPrepared(PreparedCompositeComponent),
      'PreparedComponent is prepared',
    );
    const prepare = getPrepare(PreparedCompositeComponent);
    t.assert(
      typeof prepare === 'function',
      'getPrepare(PreparedCompositeComponent) is a function',
    );
    await prepare({ text: 'foo' });
    t.assert(
      prepareUsingProps.calledOnce,
      'prepareUsingProps has been called exactly once',
    );
    t.assert(
      equal(prepareUsingProps.getCall(0).args, [{ text: 'foo' }]),
      'prepareUsingProps has been called with correct arguments',
    );
    t.assert(
      doAsyncSideEffect.calledOnce,
      'doAsyncSideEffect has been called exactly once',
    );
    t.assert(
      equal(doAsyncSideEffect.getCall(0).args, ['foo']),
      'doAsyncSideEffect has been called with correct arguments',
    );
    const html = renderToStaticMarkup(
      <PreparedCompositeComponent text="foo" />,
    );
    t.assert(html === '<div>foo</div>', 'renders with correct html');
  });
});
