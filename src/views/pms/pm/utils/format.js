import { DICT_TYPE, getDictLabel } from '@/utils/dict';
import { parseTime } from '@/utils/ruoyi';
import { PmsIterationStatus, PmsProjectGroupType, PmsProjectType, PmsWorkItemPriority, PmsWorkItemStatusType, PmsWorkItemType } from './constants';
/** 获得工作项类型名称 */
export function getWorkItemTypeName(type) {
    return getDictLabel(DICT_TYPE.PMS_WORK_ITEM_TYPE, type) || '-';
}
/** 获得工作项类型编码 */
export function getWorkItemTypeCode(type) {
    return ({
        [PmsWorkItemType.REQUIREMENT]: 'requirement',
        [PmsWorkItemType.TASK]: 'task',
        [PmsWorkItemType.DEFECT]: 'defect'
    }[type] || 'task');
}
/** 获得工作项优先级名称 */
export function getPriorityName(priority) {
    return getDictLabel(DICT_TYPE.PMS_WORK_ITEM_PRIORITY, priority) || '-';
}
/** 获得工作项缺陷类型名称 */
export function getWorkItemDefectTypeName(defectType) {
    return getDictLabel(DICT_TYPE.PMS_WORK_ITEM_DEFECT_TYPE, defectType) || '-';
}
/** 获得工作项优先级标签类型 */
export function getPriorityTagType(priority) {
    return {
        [PmsWorkItemPriority.NONE]: 'info',
        [PmsWorkItemPriority.LOW]: 'info',
        [PmsWorkItemPriority.MEDIUM]: 'warning',
        [PmsWorkItemPriority.HIGH]: 'danger'
    }[priority ?? -1];
}
/** 获得工作项优先级颜色 */
export function getPriorityColor(priority) {
    return ({
        [PmsWorkItemPriority.NONE]: 'var(--el-text-color-secondary, #909399)',
        [PmsWorkItemPriority.LOW]: 'var(--el-color-success, #67c23a)',
        [PmsWorkItemPriority.MEDIUM]: 'var(--el-color-warning, #e6a23c)',
        [PmsWorkItemPriority.HIGH]: 'var(--el-color-danger, #f56c6c)'
    }[priority ?? -1] || 'var(--el-text-color-secondary, #909399)');
}
/** 获得工作项状态标签类型 */
export function getWorkItemStatusTagType(status) {
    return {
        [PmsWorkItemStatusType.PENDING]: 'info',
        [PmsWorkItemStatusType.PROCESSING]: 'warning',
        [PmsWorkItemStatusType.COMPLETED]: 'success'
    }[status ?? -1];
}
/** 获得迭代状态名称 */
export function getIterationStatusName(status) {
    if (status === undefined) {
        return '-';
    }
    return getDictLabel(DICT_TYPE.PMS_ITERATION_STATUS, status) || '-';
}
/** 获得迭代状态标签类型 */
export function getIterationStatusTagType(status) {
    return {
        [PmsIterationStatus.PLANNED]: 'info',
        [PmsIterationStatus.ACTIVE]: 'primary',
        [PmsIterationStatus.COMPLETED]: 'success'
    }[status ?? -1];
}
/** 获得项目分组类型名称 */
export function getProjectGroupTypeName(type) {
    return type === PmsProjectGroupType.CUSTOM ? '自定义分组' : '默认分组';
}
/** 格式化包含中文星期的日期 */
export function formatDateWithWeekday(date) {
    return parseTime(date, '{m}-{d}/周{a}');
}
/** 移除 HTML 标签并合并空白字符 */
export function stripHtmlTags(content) {
    return content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
/** 格式化项目类型 */
export function formatProjectType(type) {
    return getDictLabel(DICT_TYPE.PMS_PROJECT_TYPE, type) || '-';
}
/** 格式化项目类型简称 */
export function formatProjectTypeShort(type) {
    return type === PmsProjectType.AGILE ? '敏捷' : '普通';
}
/** 格式化项目可见范围 */
export function formatProjectOpenStatus(openStatus) {
    return openStatus ? '公开项目' : '私有项目';
}
/** 格式化项目成员级别 */
export function formatProjectMemberLevel(level) {
    return getDictLabel(DICT_TYPE.PMS_PROJECT_MEMBER_LEVEL, level) || '-';
}
/** 格式化项目工作项数量 */
export function formatProjectWorkItemCounts(project) {
    return `${project.completedWorkItemCount}/${project.pendingWorkItemCount}/${project.processingWorkItemCount}`;
}
/** 计算项目工作项完成率 */
export function formatProjectCompletionRate(project) {
    const total = project.pendingWorkItemCount + project.processingWorkItemCount + project.completedWorkItemCount;
    return total > 0 ? Math.round((project.completedWorkItemCount * 100) / total) : 0;
}
/** 格式化工时 */
export function formatWorkHours(hours) {
    return hours == null ? '--' : `${hours} 小时`;
}
