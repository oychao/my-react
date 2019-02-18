export const latentSet = function(target: any, name: string, value: any): void {
  if (!target.hasOwnProperty(name)) {
    Object.defineProperty(target, name, {
      value,
      enumerable: false,
      configurable: false
    });
  }
};

export const applyMixins = function(
  derivedCtor: any,
  baseCtors: Array<any>
): void {
  baseCtors.forEach(
    (baseCtor: any): void => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(
        (name: string): void => {
          latentSet(derivedCtor.prototype, name, baseCtor.prototype[name]);
        }
      );
    }
  );
};

export const warning = function(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
};

export const isArray = Array.isArray;

export const isUndefined = function(object: any): boolean {
  return object === undefined;
};

export const isNull = function(object: any): boolean {
  return object === null;
};

export const isPlainObject = function(object: any) {
  return Object.prototype.toString.call(object) === '[object Object]';
};

export const isString = function(object: any): boolean {
  return typeof object === 'string';
};

export const isNumber = function(object: any): boolean {
  return typeof object === 'number';
};

export const isFunction = function(object: any): boolean {
  return typeof object === 'function';
};

export const isEqualObject = function(
  object: Riact.TObject,
  other: Riact.TObject
): boolean {
  if (isPlainObject(object) && isPlainObject(other)) {
    const entries1: Array<[string, string]> = Object.entries(object);
    const entries2: Array<[string, string]> = Object.entries(other);
    if (entries1.length !== entries2.length) {
      return false;
    }
    for (let i = 0; i < entries1.length; i++) {
      const [k1, v1]: [string, string] = entries1[i];
      const [k2, v2]: [string, string] = entries2[i];
      if (k1 !== k2 || v1 !== v2) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const isEqualArray = function(array: Array<any>, other: Array<any>) {
  if (isArray(array) && isArray(other) && array.length === other.length) {
    for (let i = 0; i < array.length; i++) {
      if (!Object.is(array[i], other[i])) {
        return false;
      }
    }
    return true;
  }
  return false;
};

export const pick = function(
  object: Riact.TObject,
  keys: string | Array<string>
): Riact.TObject {
  keys = isString(keys) ? (keys as string).split(' ') : keys;
  return (keys as Array<string>).reduce(
    (acc: Riact.TObject, key: string): Riact.TObject => {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        acc[key] = object[key];
      }
      return acc;
    },
    {}
  );
};

export const omit = function(
  object: Riact.TObject,
  keys: string | Array<string>
): Riact.TObject {
  const result: Riact.TObject = Object.assign({}, object);
  keys = isString(keys) ? (keys as string).split(' ') : keys;
  (keys as Array<string>).forEach(
    (key: string): void => {
      delete result[key];
    }
  );
  return result;
};

export const flattenArray = function(arr: Array<any>): Array<any> {
  return arr.reduce((acc: Array<any>, sub: any): Array<any> => {
    return acc.concat(isArray(sub) ? flattenArray(sub) : sub);
  }, []);
};

export const dfsWalk = function(
  node: Riact.TObject,
  key: string,
  handler: Riact.TFunction,
  index: number = 0,
  parentNode: Riact.TObject = null
): void {
  if (!handler.call(null, node, index, parentNode)) {
    return;
  }
  const children: Array<Riact.TObject> = node[key] as Array<Riact.TObject>;
  if (children && isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const child: Riact.TObject = children[i];
      dfsWalk(child, key, handler, i, node);
    }
  }
};

/**
 * calculate longest increasing subsequence (only for positive numbers)
 * @param arr array of number
 */
export const calcLis = function(arr: Array<number>): Array<number> {
  const M: Array<number> = [-1];
  const P: Array<number> = [];
  const S: Array<number> = [];
  let i: number;
  let left: number;
  let right: number;
  let mid: number;
  let len: number;
  for (i = 0; i < arr.length; i++) {
    // skip negative numbers
    if (arr[i] < 0) {
      continue;
    }
    left = 1;
    right = M.length;
    while (left < right) {
      mid = Math.floor((left + right) / 2);
      if (arr[M[mid]] < arr[i]) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    M[left] = i;
    P[i] = M[left - 1];
  }

  len = M.length - 1;
  i = M[len];
  while (i !== -1) {
    S[len-- - 1] = arr[i];
    i = P[i];
  }
  return S;
};

/**
 * trim same elements for two arrays, return deviation counts of beginning
 * and ending
 * @param list1 array of object
 * @param list2 array of object
 * @param key key name for identification
 */
export const trimTwoLists = function(list1: Array<Riact.TObject>, list2:Array<Riact.TObject>, key: string): [number, number] {
	let sd: number = 0;
	let ed: number = 0;
	let idx1: number = 0, idx2: number = 0;
	const { length: len1 }: Riact.TObject = list1;
	const { length: len2 }: Riact.TObject = list2;
	while(sd < len1 && sd < len2 && list1[idx1][key] === list2[idx1][key]) {
		sd++;
		idx1 = sd;
		idx2 = sd;
	}
	idx1 = len1 - ed - 1;
	idx2 = len2 - ed - 1;
	while(sd + ed < len1 && sd + ed < len2 && list1[idx1][key] === list2[idx2][key]) {
		ed++;
    idx1 = len1 - ed - 1;
    idx2 = len2 - ed - 1;
	}
	return [sd, ed];
};
