/**
 * Convert the convenience values used by the Vue2 compatibility drawer to
 * the DTO shape consumed by BpmSimpleModelNodeVO.
 *
 * The Vue3 designer writes the nested DTO directly.  Older Vue2 drawers used
 * flat/legacy names (for example delaySetting.timeDuration or a top-level
 * httpRequestSetting).  Keeping this adapter pure with respect to its input
 * contract lets the advanced JSON editor continue to carry newer fields while
 * making the common visual controls safe to submit to the current backend.
 */
import { NodeType } from '../consts'

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function clone(value) {
  if (Array.isArray(value)) return value.map((item) => clone(item))
  if (isObject(value)) {
    const result = {}
    Object.keys(value).forEach((key) => { result[key] = clone(value[key]) })
    return result
  }
  return value
}

function ensureArray(target, key) {
  if (!Array.isArray(target[key])) target[key] = []
}

function durationUnit(unit) {
  const value = String(unit === undefined || unit === null ? '' : unit).toUpperCase()
  if (value === '1' || value === 'MINUTE' || value === 'MINUTES' || value === 'M') return 'M'
  if (value === '2' || value === 'HOUR' || value === 'HOURS' || value === 'H') return 'H'
  if (value === '3' || value === 'DAY' || value === 'DAYS' || value === 'D') return 'D'
  return 'H'
}

function dateTimeValue(value) {
  if (!value) return ''
  if (value instanceof Date) {
    const pad = (item) => String(item).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
  }
  return String(value).trim().replace(/\s+/, 'T').replace(/\.\d+Z$/, '')
}

/** Normalize the delay node's old flat controls to delayType/delayTime. */
export function normalizeDelaySetting(setting) {
  if (!isObject(setting)) return setting
  const hasLegacyDuration = setting.timeDuration !== undefined || setting.timeUnit !== undefined
  const hasLegacyDate = setting.dateTime !== undefined
  const hasCanonicalType = setting.delayType !== undefined && setting.delayType !== null
  const hasCanonicalTime = setting.delayTime !== undefined && setting.delayTime !== null && setting.delayTime !== ''

  if (!hasCanonicalType && (hasLegacyDuration || hasLegacyDate)) {
    if (hasLegacyDate && !hasLegacyDuration && setting.dateTime) {
      setting.delayType = 2
      setting.delayTime = dateTimeValue(setting.dateTime)
    } else if (setting.timeDuration !== undefined && setting.timeDuration !== null && setting.timeDuration !== '') {
      const number = Number(setting.timeDuration)
      if (!Number.isNaN(number) && number > 0) {
        setting.delayType = 1
        setting.delayTime = durationIso(number, setting.timeUnit)
      }
    }
  } else if (hasCanonicalType && !hasCanonicalTime && setting.timeDuration !== undefined) {
    // A partially edited legacy object may retain delayType but lose delayTime.
    const number = Number(setting.timeDuration)
    if (Number(setting.delayType) === 1 && !Number.isNaN(number) && number > 0) {
      setting.delayTime = durationIso(number, setting.timeUnit)
    } else if (Number(setting.delayType) === 2 && setting.dateTime) {
      setting.delayTime = dateTimeValue(setting.dateTime)
    }
  }

  // Do not send names that are not part of BpmSimpleModelNodeVO.  This also
  // prevents a later reopen from mistaking stale controls for canonical data.
  delete setting.timeDuration
  delete setting.timeUnit
  delete setting.dateTime
  return setting
}

function durationIso(number, unit) {
  const suffix = durationUnit(unit)
  return suffix === 'D' ? `P${number}D` : `PT${number}${suffix}`
}

function normalizeHttpRequestSetting(setting) {
  if (!isObject(setting)) return setting
  ensureArray(setting, 'header')
  ensureArray(setting, 'body')
  ensureArray(setting, 'response')
  ;['header', 'body'].forEach((key) => {
    setting[key].forEach((item) => {
      if (!isObject(item)) return
      const type = Number(item.type)
      // HttpRequestParam.type is @NotNull + @InEnum on the backend.  Older
      // Vue2 payloads omitted it, so make the legacy default explicit while
      // preserving empty key/value values for the UI validator to report.
      item.type = type === 2 ? 2 : 1
      if (item.key === undefined || item.key === null) item.key = ''
      if (item.value === undefined || item.value === null) item.value = ''
    })
  })
  setting.response.forEach((item) => {
    if (!isObject(item)) return
    if (item.key === undefined || item.key === null) item.key = ''
    if (item.value === undefined || item.value === null) item.value = ''
  })
  return setting
}

/** Normalize a condition-group object without manufacturing a required group. */
function normalizeConditionSetting(setting) {
  if (!isObject(setting)) return setting
  if (setting.conditionGroups) normalizeConditionGroups(setting.conditionGroups)
  if (setting.conditionType === undefined || setting.conditionType === null) {
    // Expression settings are unambiguous when no groups were supplied.  For
    // an otherwise empty object leave the value absent so backend validation
    // can report the incomplete node instead of receiving a fake condition.
    if (setting.conditionExpression) setting.conditionType = 1
    else if (setting.conditionGroups) setting.conditionType = 2
  }
  return setting
}

/**
 * Normalize trigger settings.  The compatibility drawer historically exposed
 * `node.httpRequestSetting`; the backend requires `node.triggerSetting` with a
 * trigger type and nested HTTP setting.
 */
export function normalizeTriggerSetting(node) {
  if (!isObject(node)) return node
  // GenericNodeConfig initializes an empty convenience object for every node
  // type.  Treat that placeholder as absent; otherwise an untouched trigger
  // would be converted into a backend-invalid triggerSetting with no URL.
  const legacy = isObject(node.httpRequestSetting) && Object.keys(node.httpRequestSetting).length > 0
    ? node.httpRequestSetting
    : undefined
  if (!legacy && isObject(node.httpRequestSetting) && Object.keys(node.httpRequestSetting).length === 0) {
    delete node.httpRequestSetting
  }
  let setting = isObject(node.triggerSetting) ? node.triggerSetting : undefined
  if (!setting && legacy) {
    setting = { type: 1, httpRequestSetting: clone(legacy) }
  } else if (setting && legacy && (Number(setting.type) === 1 || Number(setting.type) === 2)) {
    setting.httpRequestSetting = {
      ...(isObject(setting.httpRequestSetting) ? setting.httpRequestSetting : {}),
      ...clone(legacy)
    }
  }
  if (setting) {
    if ((setting.type === undefined || setting.type === null) && setting.httpRequestSetting) {
      setting.type = 1
    } else if ((setting.type === undefined || setting.type === null) && setting.formSettings) {
      // Form update/delete are represented by 10/11 in BpmTriggerTypeEnum.
      // Infer delete only when the legacy shape is unambiguous; otherwise use
      // the update variant and let the advanced editor override it.
      const firstFormSetting = Array.isArray(setting.formSettings) ? setting.formSettings[0] : undefined
      setting.type = firstFormSetting && firstFormSetting.deleteFields && !firstFormSetting.updateFormFields ? 11 : 10
    }
    if (Number(setting.type) === 1 || Number(setting.type) === 2) {
      if (setting.httpRequestSetting) normalizeHttpRequestSetting(setting.httpRequestSetting)
    } else if (Array.isArray(setting.formSettings)) {
      setting.formSettings.forEach((formSetting) => {
        if (!isObject(formSetting)) return
        normalizeConditionSetting(formSetting)
      })
    }
    node.triggerSetting = setting
    if (legacy) delete node.httpRequestSetting
  }
  return node
}

function normalizeConditionGroups(groups) {
  if (!isObject(groups)) return groups
  if (groups.and === undefined) groups.and = true
  if (!Array.isArray(groups.conditions)) groups.conditions = []
  groups.conditions.forEach((condition) => {
    if (!isObject(condition)) return
    if (condition.and === undefined) condition.and = true
    if (!Array.isArray(condition.rules)) condition.rules = []
    condition.rules.forEach((rule) => {
      if (isObject(rule) && rule.opCode === undefined) rule.opCode = '=='
    })
  })
  return groups
}

/** Keep router condition groups in the nested backend shape without touching
 * advanced fields that are not represented by the compatibility controls. */
export function normalizeRouterGroups(node) {
  if (!isObject(node) || !Array.isArray(node.routerGroups)) return node
  node.routerGroups.forEach((route) => {
    if (!isObject(route)) return
    if (route.conditionType === undefined || route.conditionType === null) {
      route.conditionType = route.conditionExpression ? 1 : 2
    }
    if (Number(route.conditionType) === 2 && route.conditionGroups) normalizeConditionGroups(route.conditionGroups)
  })
  return node
}

/** Add required child-process defaults while retaining all advanced settings. */
export function normalizeChildProcessSetting(setting) {
  if (!isObject(setting)) return setting
  // As with the trigger placeholder, do not manufacture a required child
  // process configuration until the user has entered at least one setting or
  // supplied it through advanced JSON.
  if (Object.keys(setting).length === 0) return setting
  if (setting.async === undefined || setting.async === null) setting.async = false
  if (setting.skipStartUserNode === undefined || setting.skipStartUserNode === null) {
    setting.skipStartUserNode = false
  }
  if (!isObject(setting.startUserSetting)) {
    setting.startUserSetting = { type: 1, emptyType: 1 }
  } else {
    if (setting.startUserSetting.type === undefined || setting.startUserSetting.type === null) {
      setting.startUserSetting.type = 1
    }
    if (setting.startUserSetting.emptyType === undefined || setting.startUserSetting.emptyType === null) {
      setting.startUserSetting.emptyType = 1
    }
  }
  // The backend DTO keeps these nested objects optional at the Java field
  // level, but their properties are consumed by the call-activity converter.
  // Older/imported Vue2 payloads commonly contain only `{ enable: false }`,
  // which otherwise leaves null values in the generated process definition.
  if (!isObject(setting.timeoutSetting)) {
    setting.timeoutSetting = { enable: false, type: 1, timeExpression: '' }
  } else {
    if (setting.timeoutSetting.enable === undefined || setting.timeoutSetting.enable === null) {
      setting.timeoutSetting.enable = false
    }
    if (setting.timeoutSetting.type === undefined || setting.timeoutSetting.type === null) {
      setting.timeoutSetting.type = 1
    }
    if (setting.timeoutSetting.timeExpression === undefined || setting.timeoutSetting.timeExpression === null) {
      setting.timeoutSetting.timeExpression = ''
    }
  }
  if (!isObject(setting.multiInstanceSetting)) {
    setting.multiInstanceSetting = {
      enable: false,
      sequential: false,
      approveRatio: 100,
      sourceType: 1,
      source: '1'
    }
  } else {
    if (setting.multiInstanceSetting.enable === undefined || setting.multiInstanceSetting.enable === null) {
      setting.multiInstanceSetting.enable = false
    }
    if (setting.multiInstanceSetting.sequential === undefined || setting.multiInstanceSetting.sequential === null) {
      setting.multiInstanceSetting.sequential = false
    }
    if (setting.multiInstanceSetting.approveRatio === undefined || setting.multiInstanceSetting.approveRatio === null) {
      setting.multiInstanceSetting.approveRatio = 100
    }
    if (setting.multiInstanceSetting.sourceType === undefined || setting.multiInstanceSetting.sourceType === null) {
      setting.multiInstanceSetting.sourceType = 1
    }
    if (setting.multiInstanceSetting.source === undefined || setting.multiInstanceSetting.source === null) {
      setting.multiInstanceSetting.source = '1'
    }
  }
  if (!Array.isArray(setting.inVariables)) setting.inVariables = []
  if (!Array.isArray(setting.outVariables)) setting.outVariables = []
  return setting
}

/** Normalize one node in-place and return it for convenient save pipelines. */
export function normalizeNodeConfig(node) {
  if (!isObject(node)) return node
  const type = Number(node.type)
  if (node.conditionSetting) normalizeConditionSetting(node.conditionSetting)
  if (type === NodeType.DELAY_TIMER_NODE) normalizeDelaySetting(node.delaySetting)
  if (type === NodeType.TRIGGER_NODE) normalizeTriggerSetting(node)
  if (type === NodeType.ROUTER_BRANCH_NODE) normalizeRouterGroups(node)
  if (type === NodeType.CHILD_PROCESS_NODE) normalizeChildProcessSetting(node.childProcessSetting)
  return node
}

/**
 * Normalize an entire simple-model tree before it is sent to the backend.
 * Nodes are nested through both `childNode` and `conditionNodes`; handling
 * only the node whose drawer was last opened leaves imported/untouched child
 * nodes in legacy shapes and causes deployment validation failures.
 *
 * The editor owns the tree, so this intentionally mutates it in place and
 * returns the same root for a convenient save pipeline. A small visited list
 * protects against accidental cyclic data pasted into the JSON importer.
 */
export function normalizeNodeTree(root) {
  const visited = []
  const visit = (node) => {
    if (!isObject(node) || visited.indexOf(node) >= 0) return
    visited.push(node)
    normalizeNodeConfig(node)
    if (node.childNode) visit(node.childNode)
    if (Array.isArray(node.conditionNodes)) node.conditionNodes.forEach((item) => visit(item))
  }
  visit(root)
  return root
}
