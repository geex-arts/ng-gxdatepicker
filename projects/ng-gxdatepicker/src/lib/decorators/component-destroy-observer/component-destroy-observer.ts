import { MonoTypeOperatorFunction } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

export function componentNotDestroyed(component) {
  return () => {
    if (component['isDestroyed'] === undefined) {
      return true;
    }

    return component['isDestroyed']() === false;
  };
}

export function whileComponentNotDestroyed<T>(component): MonoTypeOperatorFunction<T> {
  return takeWhile(componentNotDestroyed(component));
}

export function ComponentDestroyObserver(constructor: any) {
  const originalDestroy = constructor.prototype.ngOnDestroy;

  constructor.prototype.isDestroyed = function() {
    if (this._isComponentDestroyed === undefined) {
      return false;
    }

    return this._isComponentDestroyed;
  };

  constructor.prototype.ngOnDestroy = function() {
    if (originalDestroy && typeof originalDestroy === 'function') {
      originalDestroy.apply(this, arguments);
    }

    this._isComponentDestroyed = true;
  };
}
