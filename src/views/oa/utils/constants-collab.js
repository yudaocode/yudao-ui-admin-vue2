/** 行政协同（公告/讨论/笔记/计划/日程/任务/汇报/首页）常量，对齐 Vue3 源 views/oa/utils/constants.ts */

/** OA 优先级（对齐后端 OaPriorityEnum） */
export const OA_PRIORITY = {
  NORMAL: 1,
  IMPORTANT: 2,
  URGENT: 3
}

/** OA 日程类型（对齐后端 OaScheduleTypeEnum） */
export const OA_SCHEDULE_TYPE = {
  REMINDER: 1,
  HOLIDAY: 2
}

/** OA 工作计划类型（对齐后端 OaPlanTypeEnum） */
export const OA_PLAN_TYPE = {
  DAY: 1,
  WEEK: 2,
  MONTH: 3
}

/** OA 工作计划状态（对齐后端 OaPlanStatusEnum） */
export const OA_PLAN_STATUS = {
  UNFINISHED: 1,
  FINISHED: 2,
  CANCELED: 3
}

/** OA 工作汇报类型（对齐后端 OaWorkReportTypeEnum） */
export const OA_WORK_REPORT_TYPE = {
  DAILY: 1,
  WEEKLY: 2,
  MONTHLY: 3
}

/** OA 工作汇报状态（对齐后端 OaWorkReportStatusEnum） */
export const OA_WORK_REPORT_STATUS = {
  DRAFT: 1,
  SUBMITTED: 2
}

/** OA 笔记查询场景 */
export const OA_NOTE_SCENE_TYPE = {
  MINE: 1,
  SHARED: 2
}

/** OA 笔记类型（对齐后端 OaNoteTypeEnum） */
export const OA_NOTE_TYPE = {
  MINE: 1,
  COMPANY: 2,
  SHARED: 3
}

/** OA 讨论类型（对齐后端 OaDiscussionTypeEnum） */
export const OA_DISCUSSION_TYPE = {
  ANNOUNCEMENT: 1,
  DISCUSSION: 2,
  VOTE: 3
}

/** OA 任务类型（对齐后端 OaTaskTypeEnum） */
export const OA_TASK_TYPE = {
  WORK: 1,
  PERSONAL: 2
}

/** OA 任务状态（对齐后端 OaTaskStatusEnum） */
export const OA_TASK_STATUS = {
  NEW: 1,
  RECEIVED: 2,
  IN_PROGRESS: 3,
  SUBMITTED: 4,
  COMPLETED: 5
}

/** OA 公告类型（对齐后端 OaAnnouncementTypeEnum） */
export const OA_ANNOUNCEMENT_TYPE = {
  ANNOUNCEMENT: 1,
  NOTICE: 2,
  VOTE: 3
}

/** OA 星期名称，按周日至周六排列 */
export const OA_WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
