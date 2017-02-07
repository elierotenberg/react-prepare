const { describe, it } = global;
import t from 'tcomb';
import { PureComponent, Component } from 'react';

import isExtensionOf from '../utils/isExtensionOf';

describe('isExtensionOf(B, A)', () => {
  it('returns true when B extends A', () => {
    class A {}
    class B extends A {}
    t.assert(isExtensionOf(B, A));
  });

  it('returns false when B doesn\'t extend A', () => {
    class A {}
    class B {}
    t.assert(!isExtensionOf(B, A));
  });

  it('returns true when B extends C which extends A', () => {
    class A {}
    class C extends A {}
    class B extends C {}
    t.assert(isExtensionOf(B, A));
  });

  // weird but alas true
  it('recognizes PureComponent as not an extension of Component', () => {
    t.assert(!isExtensionOf(PureComponent, Component));
  });

  it('recognizes Composite Component as extension of Component', () => {
    class CompositeComponent extends Component {}
    t.assert(isExtensionOf(CompositeComponent, Component));
  });

  it('recognizes Pure Composite Component as extension of PureComponent', () => {
    class PureCompositeComponent extends PureComponent {}
    t.assert(isExtensionOf(PureCompositeComponent, PureComponent));
  });

  it('recognizes arrow component as not an extension of Component', () => {
    const ArrowComponent = () => null;
    t.assert(!isExtensionOf(ArrowComponent, Component));
  });
});
