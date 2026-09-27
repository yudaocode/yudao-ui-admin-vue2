/**
 * @typedef {Object} FmsReportListReqVO
 * @property {number} accountSetId
 * @property {string} startMonth
 * @property {string} endMonth
 */

/**
 * @typedef {Object} FmsReportUnmappedSubjectVO
 * @property {number} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} FmsReportItemVO
 * @property {number} id
 * @property {string} name
 * @property {number} rowNo
 * @property {number} level
 * @property {boolean} editable
 * @property {string} formula
 * @property {number} openingAmount
 * @property {number} closingAmount
 * @property {number} currentAmount
 * @property {number} yearAmount
 */

/**
 * @typedef {Object} FmsReportFormulaVO
 * @property {number=} subjectId
 * @property {string} subjectName
 * @property {string} subjectNumber
 * @property {'+'|'-'} operator
 * @property {number} rules
 * @property {number=} openingAmount
 * @property {number=} closingAmount
 * @property {number=} currentAmount
 * @property {number=} yearAmount
 */

/**
 * @typedef {Object} FmsReportFormulaItemUpdateReqVO
 * @property {number} subjectId
 * @property {'+'|'-'} operator
 * @property {number} rules
 */

/**
 * @typedef {Object} FmsReportFormulaUpdateReqVO
 * @property {number} accountSetId
 * @property {number} id
 * @property {Array<{subjectId: number, operator: string, rules: number}>} formulas
 */

export {}
