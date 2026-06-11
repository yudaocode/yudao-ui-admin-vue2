import { TaskStatusEnum } from '@/api/bpm/task'

/**
 * 节点类型
 */
export const NodeType = {
  END_EVENT_NODE: 1, // 结束节点
  START_USER_NODE: 10, // 发起人节点
  USER_TASK_NODE: 11, // 审批人节点
  COPY_TASK_NODE: 12, // 抄送人节点
  TRANSACTOR_NODE: 13, // 办理人节点
  DELAY_TIMER_NODE: 14, // 延迟器节点
  TRIGGER_NODE: 15, // 触发器节点
  CHILD_PROCESS_NODE: 20, // 子流程节点
  CONDITION_NODE: 50, // 条件节点
  CONDITION_BRANCH_NODE: 51, // 条件分支节点 (对应排他网关)
  PARALLEL_BRANCH_NODE: 52, // 并行分支节点 (对应并行网关)
  INCLUSIVE_BRANCH_NODE: 53, // 包容分支节点 (对应包容网关)
  ROUTER_BRANCH_NODE: 54 // 路由分支节点
}

export const NodeId = {
  START_USER_NODE_ID: 'StartUserNode', // 发起人节点 Id
  END_EVENT_NODE_ID: 'EndEvent' // 结束节点 Id
}

// 候选人策略枚举 （ 用于审批节点、抄送节点 )
export const CandidateStrategy = {
  ROLE: 10, // 指定角色
  DEPT_MEMBER: 20, // 部门成员
  DEPT_LEADER: 21, // 部门的负责人
  MULTI_LEVEL_DEPT_LEADER: 23, // 连续多级部门的负责人
  POST: 22, // 指定岗位
  USER: 30, // 指定用户
  APPROVE_USER_SELECT: 34, // 审批人自选
  START_USER_SELECT: 35, // 发起人自选
  START_USER: 36, // 发起人自己
  START_USER_DEPT_LEADER: 37, // 发起人部门负责人
  START_USER_MULTI_LEVEL_DEPT_LEADER: 38, // 发起人连续多级部门的负责人
  USER_GROUP: 40, // 指定用户组
  FORM_USER: 50, // 表单内用户字段
  FORM_DEPT_LEADER: 51, // 表单内部门负责人
  EXPRESSION: 60 // 流程表达式
}

// 多人审批方式类型枚举 （ 用于审批节点 ）
export const ApproveMethodType = {
  RANDOM_SELECT_ONE_APPROVE: 1, // 随机挑选一人审批
  APPROVE_BY_RATIO: 2, // 多人会签(按通过比例)
  ANY_APPROVE: 3, // 多人或签(通过只需一人，拒绝只需一人)
  SEQUENTIAL_APPROVE: 4 // 多人依次审批
}

export const BpmHttpRequestParamTypeEnum = {
  FIXED_VALUE: 1, // 固定值
  FROM_FORM: 2 // 表单
}

export const BPM_HTTP_REQUEST_PARAM_TYPES = [
  { value: 1, label: '固定值' },
  { value: 2, label: '表单' }
]

// 审批拒绝类型枚举
export const RejectHandlerType = {
  FINISH_PROCESS: 1, // 结束流程
  RETURN_USER_TASK: 2 // 驳回到指定节点
}

// 用户任务超时处理类型枚举
export const TimeoutHandlerType = {
  REMINDER: 1, // 自动提醒
  APPROVE: 2, // 自动同意
  REJECT: 3 // 自动拒绝
}

// 用户任务的审批人为空时，处理类型枚举
export const AssignEmptyHandlerType = {
  APPROVE: 1, // 自动通过
  REJECT: 2, // 自动拒绝
  ASSIGN_USER: 3, // 指定人员审批
  ASSIGN_ADMIN: 4 // 转交给流程管理员
}

// 用户任务的审批人与发起人相同时，处理类型枚举
export const AssignStartUserHandlerType = {
  START_USER_AUDIT: 1, // 由发起人对自己审批
  SKIP: 2, // 自动跳过
  ASSIGN_DEPT_LEADER: 3 // 转交给部门负责人审批
}

// 用户任务的审批类型
export const ApproveType = {
  USER: 1, // 人工审批
  AUTO_APPROVE: 2, // 自动通过
  AUTO_REJECT: 3 // 自动拒绝
}

// 时间单位枚举
export const TimeUnitType = {
  MINUTE: 1, // 分钟
  HOUR: 2, // 小时
  DAY: 3 // 天
}

// 条件配置类型 （ 用于条件节点配置 ）
export const ConditionType = {
  EXPRESSION: 1, // 条件表达式
  RULE: 2 // 条件规则
}

// 表单权限的枚举
export const FieldPermissionType = {
  READ: '1', // 只读
  WRITE: '2', // 编辑
  NONE: '3' // 隐藏
}

// 操作按钮类型枚举 (用于审批节点)
export const OperationButtonType = {
  APPROVE: 1, // 通过
  REJECT: 2, // 拒绝
  TRANSFER: 3, // 转办
  DELEGATE: 4, // 委派
  ADD_SIGN: 5, // 加签
  RETURN: 6, // 退回
  COPY: 7 // 抄送
}

// 条件组默认值
export const DEFAULT_CONDITION_GROUP_VALUE = {
  and: true,
  conditions: [
    {
      and: true,
      rules: [
        {
          opCode: '==',
          leftSide: '',
          rightSide: ''
        }
      ]
    }
  ]
}

export const NODE_DEFAULT_TEXT = new Map()
NODE_DEFAULT_TEXT.set(NodeType.USER_TASK_NODE, '请配置审批人')
NODE_DEFAULT_TEXT.set(NodeType.COPY_TASK_NODE, '请配置抄送人')
NODE_DEFAULT_TEXT.set(NodeType.CONDITION_NODE, '请设置条件')
NODE_DEFAULT_TEXT.set(NodeType.START_USER_NODE, '请设置发起人')
NODE_DEFAULT_TEXT.set(NodeType.DELAY_TIMER_NODE, '请设置延迟器')
NODE_DEFAULT_TEXT.set(NodeType.ROUTER_BRANCH_NODE, '请设置路由节点')
NODE_DEFAULT_TEXT.set(NodeType.TRIGGER_NODE, '请设置触发器')
NODE_DEFAULT_TEXT.set(NodeType.TRANSACTOR_NODE, '请设置办理人')
NODE_DEFAULT_TEXT.set(NodeType.CHILD_PROCESS_NODE, '请设置子流程')

export const NODE_DEFAULT_NAME = new Map()
NODE_DEFAULT_NAME.set(NodeType.USER_TASK_NODE, '审批人')
NODE_DEFAULT_NAME.set(NodeType.COPY_TASK_NODE, '抄送人')
NODE_DEFAULT_NAME.set(NodeType.CONDITION_NODE, '条件')
NODE_DEFAULT_NAME.set(NodeType.START_USER_NODE, '发起人')
NODE_DEFAULT_NAME.set(NodeType.DELAY_TIMER_NODE, '延迟器')
NODE_DEFAULT_NAME.set(NodeType.ROUTER_BRANCH_NODE, '路由分支')
NODE_DEFAULT_NAME.set(NodeType.TRIGGER_NODE, '触发器')
NODE_DEFAULT_NAME.set(NodeType.TRANSACTOR_NODE, '办理人')
NODE_DEFAULT_NAME.set(NodeType.CHILD_PROCESS_NODE, '子流程')

// 候选人策略。暂时不从字典中取。控制显示顺序
export const CANDIDATE_STRATEGY = [
  { label: '指定成员', value: CandidateStrategy.USER },
  { label: '指定角色', value: CandidateStrategy.ROLE },
  { label: '指定岗位', value: CandidateStrategy.POST },
  { label: '部门成员', value: CandidateStrategy.DEPT_MEMBER },
  { label: '部门负责人', value: CandidateStrategy.DEPT_LEADER },
  { label: '连续多级部门负责人', value: CandidateStrategy.MULTI_LEVEL_DEPT_LEADER },
  { label: '发起人自选', value: CandidateStrategy.START_USER_SELECT },
  { label: '审批人自选', value: CandidateStrategy.APPROVE_USER_SELECT },
  { label: '发起人本人', value: CandidateStrategy.START_USER },
  { label: '发起人部门负责人', value: CandidateStrategy.START_USER_DEPT_LEADER },
  { label: '发起人连续部门负责人', value: CandidateStrategy.START_USER_MULTI_LEVEL_DEPT_LEADER },
  { label: '用户组', value: CandidateStrategy.USER_GROUP },
  { label: '表单内用户字段', value: CandidateStrategy.FORM_USER },
  { label: '表单内部门负责人', value: CandidateStrategy.FORM_DEPT_LEADER },
  { label: '流程表达式', value: CandidateStrategy.EXPRESSION }
]

// 审批节点 的审批类型
export const APPROVE_TYPE = [
  { label: '人工审批', value: ApproveType.USER },
  { label: '自动通过', value: ApproveType.AUTO_APPROVE },
  { label: '自动拒绝', value: ApproveType.AUTO_REJECT }
]

export const APPROVE_METHODS = [
  { label: '按顺序依次审批', value: ApproveMethodType.SEQUENTIAL_APPROVE },
  { label: '会签（可同时审批，至少 % 人必须审批通过）', value: ApproveMethodType.APPROVE_BY_RATIO },
  { label: '或签(可同时审批，有一人通过即可)', value: ApproveMethodType.ANY_APPROVE },
  { label: '随机挑选一人审批', value: ApproveMethodType.RANDOM_SELECT_ONE_APPROVE }
]

export const CONDITION_CONFIG_TYPES = [
  { label: '条件规则', value: ConditionType.RULE },
  { label: '条件表达式', value: ConditionType.EXPRESSION }
]

// 时间单位类型
export const TIME_UNIT_TYPES = [
  { label: '分钟', value: TimeUnitType.MINUTE },
  { label: '小时', value: TimeUnitType.HOUR },
  { label: '天', value: TimeUnitType.DAY }
]

// 超时处理执行动作类型
export const TIMEOUT_HANDLER_TYPES = [
  { label: '自动提醒', value: 1 },
  { label: '自动同意', value: 2 },
  { label: '自动拒绝', value: 3 }
]

export const REJECT_HANDLER_TYPES = [
  { label: '终止流程', value: RejectHandlerType.FINISH_PROCESS },
  { label: '驳回到指定节点', value: RejectHandlerType.RETURN_USER_TASK }
]

export const ASSIGN_EMPTY_HANDLER_TYPES = [
  { label: '自动通过', value: 1 },
  { label: '自动拒绝', value: 2 },
  { label: '指定成员审批', value: 3 },
  { label: '转交给流程管理员', value: 4 }
]

export const ASSIGN_START_USER_HANDLER_TYPES = [
  { label: '由发起人对自己审批', value: 1 },
  { label: '自动跳过', value: 2 },
  { label: '转交给部门负责人审批', value: 3 }
]

// 比较运算符
export const COMPARISON_OPERATORS = [
  { value: '==', label: '等于' },
  { value: '!=', label: '不等于' },
  { value: '>', label: '大于' },
  { value: '>=', label: '大于等于' },
  { value: '<', label: '小于' },
  { value: '<=', label: '小于等于' },
  { value: 'contain', label: '包含' },
  { value: '!contain', label: '不包含' }
]

// 审批操作按钮名称
export const OPERATION_BUTTON_NAME = new Map()
OPERATION_BUTTON_NAME.set(OperationButtonType.APPROVE, '通过')
OPERATION_BUTTON_NAME.set(OperationButtonType.REJECT, '拒绝')
OPERATION_BUTTON_NAME.set(OperationButtonType.TRANSFER, '转办')
OPERATION_BUTTON_NAME.set(OperationButtonType.DELEGATE, '委派')
OPERATION_BUTTON_NAME.set(OperationButtonType.ADD_SIGN, '加签')
OPERATION_BUTTON_NAME.set(OperationButtonType.RETURN, '退回')
OPERATION_BUTTON_NAME.set(OperationButtonType.COPY, '抄送')

// 默认的按钮权限设置
export const DEFAULT_BUTTON_SETTING = [
  { id: OperationButtonType.APPROVE, displayName: '通过', enable: true },
  { id: OperationButtonType.REJECT, displayName: '拒绝', enable: true },
  { id: OperationButtonType.TRANSFER, displayName: '转办', enable: true },
  { id: OperationButtonType.DELEGATE, displayName: '委派', enable: true },
  { id: OperationButtonType.ADD_SIGN, displayName: '加签', enable: true },
  { id: OperationButtonType.RETURN, displayName: '退回', enable: true }
]

// 办理人默认的按钮权限设置
export const TRANSACTOR_DEFAULT_BUTTON_SETTING = [
  { id: OperationButtonType.APPROVE, displayName: '办理', enable: true },
  { id: OperationButtonType.REJECT, displayName: '拒绝', enable: false },
  { id: OperationButtonType.TRANSFER, displayName: '转办', enable: false },
  { id: OperationButtonType.DELEGATE, displayName: '委派', enable: false },
  { id: OperationButtonType.ADD_SIGN, displayName: '加签', enable: false },
  { id: OperationButtonType.RETURN, displayName: '退回', enable: false }
]

// 发起人的按钮权限。暂时定死，不可以编辑
export const START_USER_BUTTON_SETTING = [
  { id: OperationButtonType.APPROVE, displayName: '提交', enable: true },
  { id: OperationButtonType.REJECT, displayName: '拒绝', enable: false },
  { id: OperationButtonType.TRANSFER, displayName: '转办', enable: false },
  { id: OperationButtonType.DELEGATE, displayName: '委派', enable: false },
  { id: OperationButtonType.ADD_SIGN, displayName: '加签', enable: false },
  { id: OperationButtonType.RETURN, displayName: '退回', enable: false }
]

export const MULTI_LEVEL_DEPT = [
  { label: '第 1 级部门', value: 1 },
  { label: '第 2 级部门', value: 2 },
  { label: '第 3 级部门', value: 3 },
  { label: '第 4 级部门', value: 4 },
  { label: '第 5 级部门', value: 5 },
  { label: '第 6 级部门', value: 6 },
  { label: '第 7 级部门', value: 7 },
  { label: '第 8 级部门', value: 8 },
  { label: '第 9 级部门', value: 9 },
  { label: '第 10 级部门', value: 10 },
  { label: '第 11 级部门', value: 11 },
  { label: '第 12 级部门', value: 12 },
  { label: '第 13 级部门', value: 13 },
  { label: '第 14 级部门', value: 14 },
  { label: '第 15 级部门', value: 15 }
]

// 流程实例的变量枚举
export const ProcessVariableEnum = {
  START_USER_ID: 'PROCESS_START_USER_ID', // 发起用户 ID
  START_TIME: 'PROCESS_START_TIME', // 发起时间
  PROCESS_DEFINITION_NAME: 'PROCESS_DEFINITION_NAME' // 流程定义名称
}

// 延迟类型
export const DelayTypeEnum = {
  FIXED_TIME_DURATION: 1, // 固定时长
  FIXED_DATE_TIME: 2 // 固定日期时间
}

export const DELAY_TYPE = [
  { label: '固定时长', value: DelayTypeEnum.FIXED_TIME_DURATION },
  { label: '固定日期', value: DelayTypeEnum.FIXED_DATE_TIME }
]

// ==================== 触发器相关定义 ====================
// 触发器类型枚举
export const TriggerTypeEnum = {
  HTTP_REQUEST: 1, // 发送 HTTP 请求触发器
  HTTP_CALLBACK: 2, // 接收 HTTP 回调请求触发器
  FORM_UPDATE: 10, // 表单数据更新触发器
  FORM_DELETE: 11 // 表单数据删除触发器
}

export const TRIGGER_TYPES = [
  { label: '发送 HTTP 请求', value: TriggerTypeEnum.HTTP_REQUEST },
  { label: '接收 HTTP 回调', value: TriggerTypeEnum.HTTP_CALLBACK },
  { label: '修改表单数据', value: TriggerTypeEnum.FORM_UPDATE },
  { label: '删除表单数据', value: TriggerTypeEnum.FORM_DELETE }
]

// 子流程发起人类型
export const ChildProcessStartUserTypeEnum = {
  MAIN_PROCESS_START_USER: 1, // 同主流程发起人
  FROM_FORM: 2 // 表单
}

export const CHILD_PROCESS_START_USER_TYPE = [
  { label: '同主流程发起人', value: ChildProcessStartUserTypeEnum.MAIN_PROCESS_START_USER },
  { label: '表单', value: ChildProcessStartUserTypeEnum.FROM_FORM }
]

export const ChildProcessStartUserEmptyTypeEnum = {
  MAIN_PROCESS_START_USER: 1, // 同主流程发起人
  CHILD_PROCESS_ADMIN: 2, // 子流程管理员
  MAIN_PROCESS_ADMIN: 3 // 主流程管理员
}

export const CHILD_PROCESS_START_USER_EMPTY_TYPE = [
  { label: '同主流程发起人', value: ChildProcessStartUserEmptyTypeEnum.MAIN_PROCESS_START_USER },
  { label: '子流程管理员', value: ChildProcessStartUserEmptyTypeEnum.CHILD_PROCESS_ADMIN },
  { label: '主流程管理员', value: ChildProcessStartUserEmptyTypeEnum.MAIN_PROCESS_ADMIN }
]

export const ChildProcessMultiInstanceSourceTypeEnum = {
  FIXED_QUANTITY: 1, // 固定数量
  NUMBER_FORM: 2, // 数字表单
  MULTIPLE_FORM: 3 // 多选表单
}

export const CHILD_PROCESS_MULTI_INSTANCE_SOURCE_TYPE = [
  { label: '固定数量', value: ChildProcessMultiInstanceSourceTypeEnum.FIXED_QUANTITY },
  { label: '数字表单', value: ChildProcessMultiInstanceSourceTypeEnum.NUMBER_FORM },
  { label: '多选表单', value: ChildProcessMultiInstanceSourceTypeEnum.MULTIPLE_FORM }
]

// 重新导出 TaskStatusEnum，方便其它模块从 consts 引入
export { TaskStatusEnum }
