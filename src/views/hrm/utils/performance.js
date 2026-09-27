import {
  HrmPerformanceScoreCalculation,
  HrmPerformanceUpperLimitType
} from '@/views/hrm/utils/constants'

export function createDefaultAssessmentConfig() {
  return {
    name: '',
    scoreCalculation: HrmPerformanceScoreCalculation.WEIGHTED,
    upperLimitType: HrmPerformanceUpperLimitType.UNIFIED,
    upperLimitScore: 100,
    dimensions: []
  }
}

export function validateAssessmentConfig(config) {
  const dimensions = (config && config.dimensions) || []
  if (!dimensions.length) return '至少需要一个考核维度'
  const dimensionNames = new Set()
  const quotaNames = new Set()
  let dimensionTotalWeight = 0
  for (const dimension of dimensions) {
    const dimensionName = dimension.name && dimension.name.trim()
    if (!dimensionName) return '维度名称不能为空'
    if (dimensionNames.has(dimensionName)) return `维度名称（${dimensionName}）重复`
    dimensionNames.add(dimensionName)
    if (!isValidWeight(dimension.weight)) {
      return `维度（${dimensionName}）权重必须在 0% 到 100% 之间`
    }
    dimensionTotalWeight += dimension.weight
    const quotas = dimension.quotas || []
    if (!quotas.length) return `维度（${dimensionName}）至少需要一个指标`
    let quotaTotalWeight = 0
    for (const quota of quotas) {
      const quotaName = quota.name && quota.name.trim()
      if (!quotaName) return '指标名称不能为空'
      if (!quota.standard || !quota.standard.trim()) {
        return `指标（${quotaName}）考核标准不能为空`
      }
      if (quotaNames.has(quotaName)) return `指标名称（${quotaName}）重复`
      quotaNames.add(quotaName)
      if (!isValidWeight(quota.weight)) {
        return `指标（${quotaName}）权重必须在 0% 到 100% 之间`
      }
      if (quota.scoreType === undefined || quota.scoreType === null) {
        return `指标（${quotaName}）评分方式不能为空`
      }
      quotaTotalWeight += quota.weight
    }
    if (dimension.allowEdit) {
      if (quotaTotalWeight > 100) {
        return `可编辑维度（${dimensionName}）指标权重总和不能大于 100%`
      }
    } else if (!isHundred(quotaTotalWeight)) {
      return `维度（${dimensionName}）指标权重总和必须等于 100%`
    }
  }
  if (!isHundred(dimensionTotalWeight)) return '维度权重总和必须等于 100%'
}

export function cloneAssessmentConfig(config) {
  return {
    name: config.name,
    scoreCalculation: config.scoreCalculation,
    upperLimitType: config.upperLimitType,
    upperLimitScore: config.upperLimitScore,
    dimensions: (config.dimensions || []).map((dimension) => ({
      ...dimension,
      quotas: (dimension.quotas || []).map((quota) => ({ ...quota }))
    }))
  }
}

export function getQuotaWeightTotal(dimension) {
  return (dimension.quotas || []).reduce((total, quota) => total + Number(quota.weight || 0), 0)
}

export function isHundred(weight) {
  return Math.abs(weight - 100) < 0.001
}

export function isValidPerformanceScore(score) {
  return Number.isFinite(score) && score >= 0 && score <= 100 && hasAtMostTwoDecimals(score)
}

export function isValidPerformanceCoefficient(coefficient) {
  return Number.isFinite(coefficient) && coefficient >= 0 && hasAtMostTwoDecimals(coefficient)
}

export function isSameNumber(left, right) {
  return Math.abs(left - right) < 0.000001
}

function isValidWeight(weight) {
  return weight !== undefined && weight !== null && weight >= 0 && weight <= 100
}

function hasAtMostTwoDecimals(value) {
  return isSameNumber(value * 100, Math.round(value * 100))
}
