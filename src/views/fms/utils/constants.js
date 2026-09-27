export const FMS_ACCOUNTING_STANDARD_OPTIONS = [
  { label: '小企业会计准则（2013 年颁）', value: 1 }
]
export const FMS_CURRENCY_CODE = { RMB: 'RMB' }
export const FMS_CURRENCY_OPTIONS = [{ label: '人民币（RMB）', value: 'RMB' }]
export const FMS_LEDGER_BALANCE_MODE = { SAME_AS_SUBJECT: 1, OPPOSITE_TO_SUBJECT: 2 }
export const FMS_LEDGER_BALANCE_MODE_OPTIONS = [
  { label: '与科目方向相同', value: 1 },
  { label: '与科目方向相反', value: 2 }
]
export const FMS_DEFAULT_SUBJECT_LEVEL = 4
export const FMS_DEFAULT_SUBJECT_CODE_RULE = '4-2-2-2'
export const FMS_SUBJECT_LEVEL_MIN = 1
export const FMS_SUBJECT_LEVEL_MAX = 8
export const FMS_SUBJECT_CODE_LENGTH_MIN = 2
export const FMS_SUBJECT_CODE_LENGTH_MAX = 5

// Vue3 FMS 科目配置常量
export const FMS_SUBJECT_TYPE = {
  ASSET: 1,
  LIABILITY: 2,
  EQUITY: 3,
  COST: 4,
  PROFIT_LOSS: 5,
  COMMON: 6
}
export const FMS_SUBJECT_PARENT_ID_ROOT = 0
export const FMS_DEBIT_CREDIT_DIRECTION = { DEBIT: 1, CREDIT: 2 }
export const FMS_SUBJECT_STATUS = { ENABLED: 0, DISABLED: 1 }
export const FMS_SUBJECT_TYPE_OPTIONS = [
  { label: '资产', value: FMS_SUBJECT_TYPE.ASSET },
  { label: '负债', value: FMS_SUBJECT_TYPE.LIABILITY },
  { label: '权益', value: FMS_SUBJECT_TYPE.EQUITY },
  { label: '成本', value: FMS_SUBJECT_TYPE.COST },
  { label: '损益', value: FMS_SUBJECT_TYPE.PROFIT_LOSS }
]

export const FMS_AUXILIARY_TYPE = {
  CUSTOMER: 1,
  SUPPLIER: 2,
  EMPLOYEE: 3,
  PROJECT: 4,
  DEPARTMENT: 5,
  INVENTORY: 6,
  CUSTOM: 7
}

export const FMS_AUXILIARY_TYPE_OPTIONS = [
  { label: '客户', value: FMS_AUXILIARY_TYPE.CUSTOMER },
  { label: '供应商', value: FMS_AUXILIARY_TYPE.SUPPLIER },
  { label: '职员', value: FMS_AUXILIARY_TYPE.EMPLOYEE },
  { label: '项目', value: FMS_AUXILIARY_TYPE.PROJECT },
  { label: '部门', value: FMS_AUXILIARY_TYPE.DEPARTMENT },
  { label: '存货', value: FMS_AUXILIARY_TYPE.INVENTORY },
  { label: '自定义', value: FMS_AUXILIARY_TYPE.CUSTOM }
]

export const FMS_FORMULA_RULE = {
  BALANCE: 0,
  DEBIT_BALANCE: 1,
  CREDIT_BALANCE: 2,
  SUBJECT_DEBIT_BALANCE: 3,
  SUBJECT_CREDIT_BALANCE: 4,
  DEBIT_AMOUNT: 5,
  CREDIT_AMOUNT: 6,
  PROFIT_LOSS_AMOUNT: 7
}

export const FMS_FORMULA_RULE_OPTIONS = [
  { label: '余额', value: FMS_FORMULA_RULE.BALANCE },
  { label: '借方余额', value: FMS_FORMULA_RULE.DEBIT_BALANCE },
  { label: '贷方余额', value: FMS_FORMULA_RULE.CREDIT_BALANCE },
  { label: '科目借方余额', value: FMS_FORMULA_RULE.SUBJECT_DEBIT_BALANCE },
  { label: '科目贷方余额', value: FMS_FORMULA_RULE.SUBJECT_CREDIT_BALANCE },
  { label: '借方发生额', value: FMS_FORMULA_RULE.DEBIT_AMOUNT },
  { label: '贷方发生额', value: FMS_FORMULA_RULE.CREDIT_AMOUNT },
  { label: '损益发生额', value: FMS_FORMULA_RULE.PROFIT_LOSS_AMOUNT }
]

export const FMS_CLOSING_TYPE = {
  REGULAR: 1,
  PROFIT_LOSS: 2,
  UNPAID_VAT: 3,
  LOCAL_TAX: 4,
  INCOME_TAX: 5
}

export const FMS_CLOSING_TEMPLATE_CATEGORY = {
  DAILY_EXPENSE: 1,
  PURCHASE_SALE: 2,
  CURRENT_ACCOUNT: 3,
  TRANSFER_BUSINESS: 4
}

export const FMS_CLOSING_TEMPLATE_CATEGORY_OPTIONS = [
  { label: '日常开支', value: FMS_CLOSING_TEMPLATE_CATEGORY.DAILY_EXPENSE },
  { label: '采购销售', value: FMS_CLOSING_TEMPLATE_CATEGORY.PURCHASE_SALE },
  { label: '往来款', value: FMS_CLOSING_TEMPLATE_CATEGORY.CURRENT_ACCOUNT },
  { label: '转账业务', value: FMS_CLOSING_TEMPLATE_CATEGORY.TRANSFER_BUSINESS }
]

export const FMS_CLOSING_TIME_TYPE = {
  PERIOD_END: 1,
  PERIOD_BEGIN: 2,
  YEAR_BEGIN: 3
}

export const FMS_CLOSING_TIME_TYPE_OPTIONS = [
  { label: '期末', value: FMS_CLOSING_TIME_TYPE.PERIOD_END },
  { label: '期初', value: FMS_CLOSING_TIME_TYPE.PERIOD_BEGIN },
  { label: '年初', value: FMS_CLOSING_TIME_TYPE.YEAR_BEGIN }
]

export const FMS_CLOSING_VOUCHER_TYPE = {
  SEPARATE_GAIN_AND_LOSS: 1,
  COMBINED_GAIN_AND_LOSS: 2
}

export const FMS_CLOSING_VOUCHER_TYPE_OPTIONS = [
  {
    label: '收益和损失分开结转（分别生成收益凭证和损失凭证）',
    value: FMS_CLOSING_VOUCHER_TYPE.SEPARATE_GAIN_AND_LOSS
  },
  {
    label: '收益和损失同时结转',
    value: FMS_CLOSING_VOUCHER_TYPE.COMBINED_GAIN_AND_LOSS
  }
]

export const FMS_REPORT_TYPE = {
  BALANCE_SHEET: 1,
  INCOME_STATEMENT: 2,
  CASH_FLOW_STATEMENT: 3
}

/** 首页财务指标取数报表类型 */
export const FMS_FINANCE_INDICATOR_TYPE = {
  BALANCE_SHEET: FMS_REPORT_TYPE.BALANCE_SHEET,
  INCOME_STATEMENT: FMS_REPORT_TYPE.INCOME_STATEMENT
}

/** 首页指标颜色 */
export const FMS_HOME_METRIC_COLORS = ['#4e80ee', '#f6bd16', '#5ad8a6', '#e8684a', '#9270ca']
