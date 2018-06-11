import {ActivatedRoute, ParamMap} from '@angular/router';
import {OperatorFunction} from 'rxjs/interfaces';
import {Observable} from 'rxjs/Observable';
import {combineLatest} from 'rxjs/observable/combineLatest';
import {of} from 'rxjs/observable/of';
import {map} from 'rxjs/operators';


/**
 * Creates an {@type OperatorFunction} accepting a map, that replaces all ":key" occurrences in {@param value}
 * with the map-values.
 */
export function placeParamsIn(value: string): OperatorFunction<Map<string, string>, string> {
  return map((params: Map<string, string>) => {
    const keys = params.keys();

    // TypeScript does not support Map Iterators to target ES5.
    // see https://github.com/Microsoft/TypeScript/issues/11209#issuecomment-250242946
    let next = keys.next();
    while (!next.done) {
      value = value.replace(`:${next.value}`, params.get(next.value));
      next = keys.next();
    }
    return value;
  });
}

/**
 * Creates an {@type OperatorFunction} that converts a {@type ParamMap} into an instance of type ${@type Map}.
 */
function convertParamMapToMap(): OperatorFunction<ParamMap, Map<string, string>> {
  return map(paramMap => {
    const mapInstance = new Map();
    for (const key of paramMap.keys) {
      mapInstance.set(key, paramMap.get(key));
    }
    return mapInstance;
  });
}

/**
 * Flattens the given array of maps to a single map.
 * If a key is used in multiple maps, it will be yielded multiple times as well.
 */
function* flatten2dMapIterator<L, R>(maps: Map<L, R>[]): IterableIterator<[L, R]> {
  for (const singleMap of maps) {
    // TypeScript does not support Map Iterators to target ES5.
    // see https://github.com/Microsoft/TypeScript/issues/11209#issuecomment-250242946
    const keys = singleMap.keys();

    let next = keys.next();
    while (!next.done) {
      yield [next.value, singleMap.get(next.value)];
      next = keys.next();
    }
  }
}

/**
 * Returns the entire, absolute url with replaced parameters of a {@type ActivatedRoute}
 */
export function getUrlFromRoute(currentRoute: ActivatedRoute): Observable<string> {
  // filter out root and empty path parts (usually only root route)
  const routesFromRoot = currentRoute.pathFromRoot.filter(route => route.routeConfig && route.routeConfig.path);

  // return root path immediately
  if (routesFromRoot.length === 0) {
    return of('');
  }

  // map routes to url fragment with substituted parameters
  const urlFragments = routesFromRoot.map(route => route.paramMap.pipe(
    convertParamMapToMap(),
    placeParamsIn(route.routeConfig.path),
  ));

  return combineLatest(urlFragments, (...fragments: string[]) => {
    return fragments.join('/');
  });
}

/**
 * returns an observable of a map, that contains all (recursive) url parameters from an {@type ActivatedRoute}.
 */
export function getAllUrlParameters(currentRoute: ActivatedRoute): Observable<Map<string, string>> {
  // filter out root and empty path parts (usually only root route)
  const routesFromRoot = currentRoute.pathFromRoot;

  // return root path immediately
  if (routesFromRoot.length === 0) {
    return of(new Map());
  }

  // map routes to route parameter maps
  const routeParams = routesFromRoot
    .map(route => route.paramMap)
    .map(paramMap => paramMap.pipe(convertParamMapToMap()));

  // flatten parameter maps into one object
  return combineLatest(routeParams, (...paramMaps: Map<string, string>[]) => {
    return new Map(flatten2dMapIterator(paramMaps));
  });
}
