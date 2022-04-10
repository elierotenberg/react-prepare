const { describe, it } = global;
import url from 'url';
import t from 'tcomb';
import React from 'react';
import PropTypes from 'prop-types';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStore, applyMiddleware } from 'redux';
import { connect, Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import koa from 'koa';
import fetch from 'node-fetch';

import dispatched from '../dispatched';
import prepare from '../prepare';

const HTTP_STATUS_OK_BOUNDS = {
  min: 200,
  max: 300,
};

describe('dispatched', () => {
  it('Real-world-like example using redux, koa, et. al', async () => {
    // Create a fake echo server that replies with the pathname, preceded by 'echo '.
    const echoServer = koa().use(function* echo(next) {
      this.response.body = `echo ${this.request.path}`;
      yield next;
    });
    const echoHttpServer = echoServer.listen();
    try {
      const baseUrlObj = {
        protocol: 'http:',
        hostname: 'localhost',
        port: echoHttpServer.address().port,
      };

      // Action type constants, also used to expres fetch status
      const FETCH_STARTED = 'FETCH_STARTED';
      const FETCH_FAILED = 'FETCH_FAILED';
      const FETCH_SUCCEEDED = 'FETCH_SUCCEEDED';

      const rootReducer = (state = {}, { type, ...payload }) => {
        if (type === FETCH_STARTED) {
          const { into } = payload;
          return Object.assign({}, state, {
            [into]: {
              status: FETCH_STARTED,
            },
          });
        }
        if (type === FETCH_FAILED) {
          const { into, statusCode, err } = payload;
          return Object.assign({}, state, {
            [into]: {
              status: FETCH_FAILED,
              statusCode,
              err,
            },
          });
        }
        if (type === FETCH_SUCCEEDED) {
          const { into, value } = payload;
          return Object.assign({}, state, {
            [into]: {
              status: FETCH_SUCCEEDED,
              value,
            },
          });
        }
        return state;
      };

      // redux store used by the app
      const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));

      // async action creator
      const fetchInto = (pathname, into) => async (dispatch) => {
        dispatch({
          type: FETCH_STARTED,
          into,
        });
        const href = url.format(Object.assign({}, baseUrlObj, { pathname }));
        try {
          const res = await fetch(href);
          if (
            res.status < HTTP_STATUS_OK_BOUNDS.min ||
            res.status >= HTTP_STATUS_OK_BOUNDS.max
          ) {
            dispatch({
              type: FETCH_FAILED,
              into,
              statusCode: res.status,
              err: await res.text(),
            });
            return;
          }
          dispatch({
            type: FETCH_SUCCEEDED,
            into,
            value: await res.text(),
          });
          return;
        } catch (err) {
          dispatch({
            type: FETCH_FAILED,
            into,
            statusCode: null,
            err,
          });
        }
      };

      const OriginalEchoAlpha = ({ alpha }) => {
        if (typeof alpha !== 'object') {
          return <div>???</div>;
        }
        const { status, err, value } = alpha;
        if (status === FETCH_STARTED) {
          return <div>...</div>;
        }
        if (status === FETCH_FAILED) {
          return <div>Error fetching beta (Reason: {err})</div>;
        }
        return <div>{value}</div>;
      };
      OriginalEchoAlpha.propTypes = {
        alpha: PropTypes.object,
      };

      const ConnectedEchoAlpha = connect(({ alpha }) => ({ alpha }))(
        OriginalEchoAlpha,
      );

      const EchoAlpha = dispatched(({ value }, dispatch) =>
        dispatch(fetchInto(value, 'alpha')),
      )(ConnectedEchoAlpha);

      const OriginalEchoBeta = ({ beta }) => {
        if (typeof beta !== 'object') {
          return <div>???</div>;
        }
        const { status, err, value } = beta;
        if (status === FETCH_STARTED) {
          return <div>...</div>;
        }
        if (status === FETCH_FAILED) {
          return <div>Error fetching beta (Reason: {err})</div>;
        }
        return <div>{value}</div>;
      };
      OriginalEchoBeta.propTypes = {
        beta: PropTypes.object,
      };

      const ConnectedEchoBeta = connect(({ beta }) => ({ beta }))(
        OriginalEchoBeta,
      );

      const EchoBeta = dispatched(({ value }, dispatch) =>
        dispatch(fetchInto(value, 'beta')),
      )(ConnectedEchoBeta);

      const App = () => (
        <ul>
          <li key="alpha">
            <EchoAlpha value="foo" />
          </li>
          <li key="beta">
            <EchoBeta value="bar" />
          </li>
        </ul>
      );

      const app = (
        <Provider store={store}>
          <App />
        </Provider>
      );

      await prepare(app);
      const html = renderToStaticMarkup(app);
      t.assert(
        html ===
          '<ul><li><div>echo /foo</div></li><li><div>echo /bar</div></li></ul>',
        'renders correct html',
      );
    } finally {
      echoHttpServer.close();
    }
  });
});
