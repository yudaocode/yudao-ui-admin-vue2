/**
 * 路由参数解析纯函数，对齐 Vue3 src/utils/routeParams.ts
 * 差异：qs 依赖替换为内置的 miniParseQuery（支持 a[b]=c 一层嵌套与 a[]=1 数组），未新增 npm 依赖
 */
const ROUTE_IFRAME_QUERY_KEY = '_iframe'
const EXTERNAL_LINK_ROUTE_PREFIX = '/external-link'

// qs.parse 的最小等价实现：key=value、URL 解码、一层嵌套 a[b]、数组 a[]（重复 key 后者覆盖前者，与 qs 默认一致）
const miniParseQuery = (queryString = '') => {
  const result = {}
  queryString = queryString.replace(/^\?/, '')
  if (!queryString) {
    return result
  }
  queryString.split('&').forEach((pair) => {
    if (!pair) {
      return
    }
    const eqIndex = pair.indexOf('=')
    const rawKey = eqIndex === -1 ? pair : pair.slice(0, eqIndex)
    const rawValue = eqIndex === -1 ? '' : pair.slice(eqIndex + 1)
    let key
    let value
    try {
      key = decodeURIComponent(rawKey.replace(/\+/g, ' '))
      value = decodeURIComponent(rawValue.replace(/\+/g, ' '))
    } catch (e) {
      key = rawKey
      value = rawValue
    }
    const bracketMatch = key.match(/^([^[\]]+)\[([^\]]*)\]$/)
    if (bracketMatch) {
      const parent = bracketMatch[1]
      const sub = bracketMatch[2]
      if (sub === '') {
        // a[]=1 -> { a: [1] }
        if (!isArray(result[parent])) {
          result[parent] = []
        }
        result[parent].push(value)
      } else {
        // a[b]=1 -> { a: { b: 1 } }
        if (typeof result[parent] !== 'object' || result[parent] === null || isArray(result[parent])) {
          result[parent] = {}
        }
        result[parent][sub] = value
      }
      return
    }
    result[key] = value
  })
  return result
}

const isArray = Array.isArray

export const parseQueryString = (queryString = '') => {
  return miniParseQuery(queryString)
}

export const splitRoutePath = (rawPath) => {
  if (!rawPath) {
    return { path: '' }
  }

  const hashIndex = rawPath.indexOf('#')
  const pathWithQuery = hashIndex === -1 ? rawPath : rawPath.slice(0, hashIndex)
  const hash = hashIndex === -1 ? undefined : rawPath.slice(hashIndex)
  const questionMarkIndex = pathWithQuery.indexOf('?')
  if (questionMarkIndex === -1) {
    return {
      ...(hash ? { hash } : {}),
      path: pathWithQuery
    }
  }

  const path = pathWithQuery.slice(0, questionMarkIndex)
  const query = parseQueryString(pathWithQuery.slice(questionMarkIndex + 1))
  return {
    ...(hash ? { hash } : {}),
    path,
    ...(Object.keys(query).length ? { query } : {})
  }
}

export const parseRouteLocation = (rawPath) => {
  return splitRoutePath(rawPath)
}

export const parseExternalRouteLocation = (rawPath) => {
  try {
    const url = new URL(rawPath)
    if (!url.searchParams.has(ROUTE_IFRAME_QUERY_KEY)) {
      return { path: rawPath }
    }
    url.searchParams.delete(ROUTE_IFRAME_QUERY_KEY)
    return {
      iframe: true,
      path: url.toString()
    }
  } catch (e) {
    return { path: rawPath }
  }
}

export const getExternalRoutePath = (id, name) => {
  return `${EXTERNAL_LINK_ROUTE_PREFIX}/${encodeURIComponent(String(id || name))}`
}

export const getDynamicPathParamNames = (path) => {
  const names = []
  path.replace(/:([A-Za-z0-9_]+)(?:\([^/]*\))?[?+*]?/g, (matched, key) => {
    names.push(key)
    return matched
  })
  return names
}

export const splitDynamicRouteParams = (path, query) => {
  if (!query || !Object.keys(query).length) {
    return {}
  }
  const paramNames = getDynamicPathParamNames(path)
  if (!paramNames.length) {
    return { query }
  }
  const nextQuery = { ...query }
  const params = {}
  paramNames.forEach((name) => {
    const value = nextQuery[name]
    if (value === undefined || value === null || value === '') {
      return
    }
    params[name] = value
    delete nextQuery[name]
  })
  return {
    ...(Object.keys(params).length ? { params } : {}),
    ...(Object.keys(nextQuery).length ? { query: nextQuery } : {})
  }
}

const isRepeatableParam = (matched) => matched.endsWith('*') || matched.endsWith('+')

const encodeRouteParam = (matched, value) => {
  if (isArray(value)) {
    const encodedSegments = value.map((item) => encodeURIComponent(String(item)))
    return isRepeatableParam(matched)
      ? encodedSegments.join('/')
      : encodeURIComponent(value.map((item) => String(item)).join(','))
  }
  return encodeURIComponent(String(value))
}

export const resolveDynamicPath = (path, params) => {
  if (!params) {
    return path
  }
  return path.replace(/:([A-Za-z0-9_]+)(?:\([^/]*\))?[?+*]?/g, (matched, key) => {
    const value = params[key]
    return value === undefined || value === null ? matched : encodeRouteParam(matched, value)
  })
}

export const createRouteLocation = (path, meta, routeName) => {
  const hash = meta && meta.hash
  const params = meta && meta.params
  const query = meta && meta.query

  if (params && Object.keys(params).length > 0 && routeName) {
    return {
      ...(hash ? { hash } : {}),
      name: routeName,
      params,
      query
    }
  }

  return {
    ...(hash ? { hash } : {}),
    path: resolveDynamicPath(path, params),
    query
  }
}
