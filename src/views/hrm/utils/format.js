import { SolarDay } from 'tyme4ts'
import { DICT_TYPE, getDictDataLabel } from '@/utils/dict'
import {
  AGE_UNLIMITED_VALUE,
  HRM_WEEK_OPTIONS,
  HrmAttendanceHolidayType,
  HrmAttendanceLateEarlyDeductMethod,
  HrmEmployeeChangeTypeOptions,
  HrmEmployeeContractStatusOptions,
  HrmEmployeeContractTypeOptions,
  HrmEmployeeIdTypeOptions,
  HrmEmployeeQuitReasonOptions,
  HrmEmployeeQuitTypeOptions,
  HrmEmployeeTeachingMethodOptions,
  HrmInsuranceProjectType,
  HrmPerformanceAppealTimeoutAction,
  HrmPerformanceCycleTypeOptions,
  HrmPerformanceQuotaSettingType,
  HrmPerformanceRaterType,
  SALARY_NEGOTIABLE_VALUE
} from './constants'

/** 格式化 HRM 金额 */
export function formatHrmMoney(value) {
  return Number(value || 0).toFixed(2)
}

/** 格式化带千分位的 HRM 金额 */
export function formatHrmMoneyWithThousands(value) {
  return Number(value || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/** 格式化 HRM 比例 */
export function formatHrmRate(value) {
  return value === undefined || value === null ? '-' : `${Number(value).toFixed(2)}%`
}

/** 格式化 HRM 参保项目名称 */
export function formatHrmInsuranceProjectName(project) {
  if (
    project.type === HrmInsuranceProjectType.CUSTOM_SOCIAL_SECURITY ||
    project.type === HrmInsuranceProjectType.CUSTOM_PROVIDENT_FUND
  ) {
    return project.name || '-'
  }
  return getDictDataLabel(DICT_TYPE.HRM_INSURANCE_PROJECT_TYPE, project.type) || '-'
}

/** 格式化 HRM 分析项的字典分类 */
export function formatHrmAnalysisDictType(dictType, type) {
  return type === null ? '未填写' : getDictDataLabel(dictType, type) || '未知'
}

/** 格式化 HRM 分析项的区间分类 */
export function formatHrmAnalysisRangeType(rangeNames, type) {
  return type === null ? '未填写' : rangeNames[type] || '未知'
}

/** 获得 HRM 日历农历信息 */
export function getHrmLunarDateInfo(value) {
  const [year, month, day] = String(value || '')
    .split('-')
    .map(Number)
  if (!year || !month || !day) {
    return { dayText: '', monthDayText: '' }
  }
  try {
    const solarDay = SolarDay.fromYmd(year, month, day)
    const lunarDay = solarDay.getLunarDay()
    const lunarFestival = lunarDay.getFestival()
    const solarFestival = solarDay.getFestival()
    const lunarDayName = lunarDay.getName()
    return {
      dayText: (lunarFestival && lunarFestival.getName()) ||
        (solarFestival && solarFestival.getName()) || lunarDayName,
      monthDayText: `${lunarDay.getLunarMonth().getName()}${lunarDayName}`
    }
  } catch (error) {
    return { dayText: '', monthDayText: '' }
  }
}

/** 格式化 HRM 天数 */
export function formatHrmDays(value) {
  return Number(value || 0)
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

/** 格式化薪资组适用范围 */
export function formatSalaryGroupScope(salaryGroup) {
  return [...(salaryGroup.deptNames || []), ...(salaryGroup.employeeNames || [])].join('、') || '-'
}

/** 格式化考勤星期 */
export function formatHrmAttendanceWeeks(weeks) {
  return (
    (weeks || [])
      .map(week => {
        const option = HRM_WEEK_OPTIONS.find(item => item.value === week)
        return option && option.label
      })
      .filter(Boolean)
      .join('、') || '-'
  )
}

/** 格式化考勤特殊日期 */
export function formatHrmAttendanceSpecialDate(specialDate, shifts) {
  if (specialDate.type === HrmAttendanceHolidayType.REST) {
    return '休息'
  }
  const date = toDate(specialDate.date)
  const week = date ? date.getDay() || 7 : undefined
  const shift = (shifts || []).find(item => week && item.weeks.includes(week)) || (shifts || [])[0]
  return shift ? `${shift.startTime} - ${shift.endTime}` : '上班'
}

/** 格式化迟到早退扣款单位 */
export function formatHrmAttendanceDeductUnit(method) {
  if (method === HrmAttendanceLateEarlyDeductMethod.BY_MINUTE) {
    return '分钟'
  }
  if (method === HrmAttendanceLateEarlyDeductMethod.BY_COUNT) {
    return '次'
  }
  return '月'
}

/** 格式化考勤班次工作时长 */
export function formatHrmAttendanceShiftDuration(shift) {
  let duration = getTimeRangeMinutes(shift.startTime, shift.endTime)
  if (shift.excludeRestTime) {
    duration -= getTimeRangeMinutes(shift.restStartTime, shift.restEndTime)
  }
  duration = Math.max(duration, 0)
  return `${Math.floor(duration / 60)} 小时 ${duration % 60} 分钟`
}

/** 格式化 HRM 日期 */
export function formatHrmDate(value) {
  if (!value) {
    return '-'
  }
  const date = toDate(value)
  if (!date) {
    return '-'
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** 格式化 HRM 日期时间 */
export function formatHrmDateTime(value) {
  if (!value) {
    return '-'
  }
  const date = toDate(value)
  if (!date) {
    return '-'
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** 格式化 HRM 日期范围 */
export function formatHrmDateRange(startDate, endDate) {
  if (!startDate && !endDate) {
    return '-'
  }
  return `${formatHrmDate(startDate)} 至 ${formatHrmDate(endDate)}`
}

/** 格式化 HRM 年月 */
export function formatHrmYearMonth(year, month) {
  if (!year || !month) return '-'
  return `${year}-${String(month).padStart(2, '0')}`
}

/** 格式化 HRM 月份 */
export function formatHrmMonth(value) {
  if (!value) {
    return '-'
  }
  const date = toDate(value)
  return date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}` : '-'
}

/** 格式化员工证件类型 */
export function formatEmployeeIdType(value) {
  const option = HrmEmployeeIdTypeOptions.find(item => item.value === value)
  return option ? option.label : '-'
}

/** 格式化员工异动类型 */
export function formatEmployeeChangeType(value) {
  const option = HrmEmployeeChangeTypeOptions.find(item => item.value === value)
  return option ? option.label : '-'
}

/** 格式化员工教学方式 */
export function formatEmployeeTeachingMethod(value) {
  const option = HrmEmployeeTeachingMethodOptions.find(item => item.value === value)
  return option ? option.label : '-'
}

/** 格式化员工合同类型 */
export function formatEmployeeContractType(value) {
  const option = HrmEmployeeContractTypeOptions.find(item => item.value === value)
  return option ? option.label : '-'
}

/** 格式化员工合同状态 */
export function formatEmployeeContractStatus(value) {
  const option = HrmEmployeeContractStatusOptions.find(item => item.value === value)
  return option ? option.label : '-'
}

/** 格式化员工离职类型 */
export function formatEmployeeQuitType(value) {
  const option = HrmEmployeeQuitTypeOptions.find(item => item.value === value)
  return option ? option.label : '-'
}

/** 格式化员工离职原因 */
export function formatEmployeeQuitReason(value) {
  const option = HrmEmployeeQuitReasonOptions.find(item => item.value === value)
  return option ? option.label : '-'
}

/** 格式化 HRM 是否值 */
export function formatHrmYesNo(value) {
  if (value === undefined || value === null) return '-'
  return value ? '是' : '否'
}

/** 格式化招聘职位薪资范围 */
export function formatRecruitPostSalary(post) {
  if (post.minSalary === SALARY_NEGOTIABLE_VALUE && post.maxSalary === SALARY_NEGOTIABLE_VALUE) {
    return '面议'
  }
  const salaryRange = [post.minSalary, post.maxSalary]
    .filter(salary => salary !== undefined && salary !== null)
    .join('-')
  if (!salaryRange) return '-'
  const salaryUnit = post.salaryUnit !== undefined && post.salaryUnit !== null
    ? getDictDataLabel(DICT_TYPE.HRM_RECRUIT_SALARY_UNIT, post.salaryUnit)
    : ''
  return [salaryRange, salaryUnit].filter(Boolean).join(' ')
}

/** 格式化招聘职位年龄要求 */
export function formatRecruitPostAge(post) {
  if (post.minAge === AGE_UNLIMITED_VALUE && post.maxAge === AGE_UNLIMITED_VALUE) return '不限'
  const hasMinAge = post.minAge !== undefined && post.minAge !== null
  const hasMaxAge = post.maxAge !== undefined && post.maxAge !== null
  if (hasMinAge && hasMaxAge) return `${post.minAge}-${post.maxAge}`
  if (hasMinAge) return `${post.minAge} 岁以上`
  if (hasMaxAge) return `${post.maxAge} 岁以下`
  return '-'
}

/** 格式化招聘职位进度百分比 */
export function formatRecruitPostSchedule(post) {
  return post.recruitSchedule === undefined || post.recruitSchedule === null
    ? '-'
    : `${post.recruitSchedule}%`
}

/** 格式化招聘职位进度 */
export function formatRecruitPostProgress(post) {
  const joinedCount = post.hasEntryNum == null ? 0 : post.hasEntryNum
  const recruitCount = post.recruitNum == null ? 0 : post.recruitNum
  if (!recruitCount) return `${joinedCount} / ${recruitCount}`
  const schedule = post.recruitSchedule == null ? 0 : post.recruitSchedule
  return `${joinedCount} / ${recruitCount}（${schedule}%）`
}

/** 格式化绩效评分人层级 */
export function formatHrmPerformanceRaterLevel(raterType, level) {
  if (raterType === HrmPerformanceRaterType.SUPERIOR) {
    return level === 1 ? '直属上级' : `第 ${level} 级上级`
  }
  return level === 1 ? '直属部门负责人' : `第 ${level} 级部门负责人`
}

/** 格式化绩效评分阶段名称 */
export function formatHrmPerformanceReviewStageName(stage) {
  if (stage.rater && stage.rater.type === HrmPerformanceRaterType.SELF) {
    return '员工自评'
  }
  if (
    stage.rater &&
    (stage.rater.type === HrmPerformanceRaterType.SUPERIOR ||
      stage.rater.type === HrmPerformanceRaterType.DEPT_LEADER)
  ) {
    return `${formatHrmPerformanceRaterLevel(stage.rater.type, stage.rater.level || 1)}评分`
  }
  return '指定员工评分'
}

/** 格式化绩效计划周期 */
export function formatHrmPerformancePlanCycle(plan) {
  return [plan.cycle, plan.quarter ? `第 ${plan.quarter} 季度` : '']
    .filter(Boolean)
    .join(' / ') || '-'
}

/** 格式化绩效考核周期类型 */
export function formatHrmPerformanceCycleType(type) {
  const option = HrmPerformanceCycleTypeOptions.find(item => item.value === type)
  return option ? option.label : '-'
}

/** 格式化绩效指标制定方式 */
export function formatHrmPerformanceQuotaSettingType(type) {
  if (type === HrmPerformanceQuotaSettingType.SYSTEM) return '系统制定'
  return type === HrmPerformanceQuotaSettingType.EMPLOYEE ? '员工制定' : '-'
}

/** 格式化绩效申诉超期处理方式 */
export function formatHrmPerformanceAppealTimeout(plan) {
  if (!plan.resultConfirmation || !plan.appealTimeoutDays) return '-'
  const action = {
    [HrmPerformanceAppealTimeoutAction.REJECT]: '自动拒绝',
    [HrmPerformanceAppealTimeoutAction.APPROVE]: '自动通过'
  }[plan.appealTimeoutAction || 0]
  return action ? `超过 ${plan.appealTimeoutDays} 天未处理，${action}` : '-'
}

/** 格式化绩效评分人类型 */
export function formatHrmPerformanceRaterType(type) {
  return {
    [HrmPerformanceRaterType.SUPERIOR]: '上级',
    [HrmPerformanceRaterType.DEPT_LEADER]: '部门负责人',
    [HrmPerformanceRaterType.SPECIFIED]: '指定评分人',
    [HrmPerformanceRaterType.SELF]: '被考核人'
  }[type || 0] || '-'
}

function getTimeRangeMinutes(startTime, endTime) {
  if (!startTime || !endTime) {
    return 0
  }
  const start = startTime.split(':').map(Number)
  const end = endTime.split(':').map(Number)
  const startMinutes = start[0] * 60 + start[1]
  let endMinutes = end[0] * 60 + end[1]
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60
  }
  return endMinutes - startMinutes
}

function toDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parts = value.split('-').map(Number)
    const date = new Date(parts[0], parts[1] - 1, parts[2])
    return Number.isNaN(date.getTime()) ? undefined : date
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function pad(value) {
  return String(value).padStart(2, '0')
}
