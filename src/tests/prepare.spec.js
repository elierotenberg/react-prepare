const { describe, it } = global;
import t from 'tcomb';
import sinon from 'sinon';
import equal from 'deep-equal';
import React from 'react';
import PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';

import prepared from '../prepared';
import prepare from '../prepare';

describe('prepare', () => {
  it('Shallow hierarchy (no children)', async () => {
    const doAsyncSideEffect = sinon.spy(async () => {});
    const prepareUsingProps = sinon.spy(async ({ text }) => {
      await doAsyncSideEffect(text);
    });
    const App = prepared(prepareUsingProps)(({ text }) => <div>{text}</div>);
    await prepare(<App text="foo" />);
    t.assert(
      prepareUsingProps.calledOnce,
      'prepareUsingProps has been called exactly once',
    );
    t.assert(
      equal(prepareUsingProps.getCall(0).args, [{ text: 'foo' }, {}]),
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
    const html = renderToStaticMarkup(<App text="foo" />);
    t.assert(html === '<div>foo</div>', 'renders with correct html');
  });

  it('Deep hierarchy', async () => {
    let classNameOfFirstChild = 'FirstChild';
    let classNameOfSecondChild = 'SecondChild';
    const doAsyncSideEffectForFirstChild = sinon.spy(async () => {
      classNameOfFirstChild = 'prepared(FirstChild)';
    });
    const prepareUsingPropsForFirstChild = sinon.spy(async ({ text }) => {
      await doAsyncSideEffectForFirstChild(text);
    });
    const doAsyncSideEffectForSecondChild = sinon.spy(async () => {
      classNameOfSecondChild = 'prepared(SecondChild)';
    });
    const prepareUsingPropsForSecondChild = sinon.spy(async ({ text }) => {
      await doAsyncSideEffectForSecondChild(text);
    });

    const FirstChild = prepared(prepareUsingPropsForFirstChild)(({ text }) => (
      <span className={classNameOfFirstChild}>{text}</span>
    ));
    const SecondChild = prepared(
      prepareUsingPropsForSecondChild,
    )(({ text }) => <span className={classNameOfSecondChild}>{text}</span>);

    const App = ({ texts }) => (
      <ul>
        <li key={0}><FirstChild text={texts[0]} /></li>
        <li key={1}><SecondChild text={texts[1]} /></li>
      </ul>
    );
    App.propTypes = {
      texts: PropTypes.array,
    };

    await prepare(<App texts={['first', 'second']} />);

    t.assert(
      prepareUsingPropsForFirstChild.calledOnce,
      'prepareUsingPropsForFirstChild has been called exactly once',
    );
    t.assert(
      equal(prepareUsingPropsForFirstChild.getCall(0).args, [
        { text: 'first' },
        {},
      ]),
      'prepareUsingPropsForFirstChild has been called with correct arguments',
    );
    t.assert(
      doAsyncSideEffectForFirstChild.calledOnce,
      'doAsyncSideEffectForFirstChild has been called exactly once',
    );
    t.assert(
      equal(doAsyncSideEffectForFirstChild.getCall(0).args, ['first']),
      'doAsyncSideEffectForFirstChild has been called with correct arguments',
    );

    t.assert(
      prepareUsingPropsForSecondChild.calledOnce,
      'prepareUsingPropsForSecondChild has been called exactly once',
    );
    t.assert(
      equal(prepareUsingPropsForSecondChild.getCall(0).args, [
        { text: 'second' },
        {},
      ]),
      'prepareUsingPropsForSecondChild has been called with correct arguments',
    );
    t.assert(
      doAsyncSideEffectForSecondChild.calledOnce,
      'doAsyncSideEffectForSecondChild has been called exactly once',
    );
    t.assert(
      equal(doAsyncSideEffectForSecondChild.getCall(0).args, ['second']),
      'doAsyncSideEffectForSecondChild has been called with correct arguments',
    );

    const html = renderToStaticMarkup(<App texts={['first', 'second']} />);
    t.assert(
      html ===
        '<ul><li><span class="prepared(FirstChild)">first</span></li><li><span class="prepared(SecondChild)">second</span></li></ul>',
    ); // eslint-disable-line max-len
  });
});
