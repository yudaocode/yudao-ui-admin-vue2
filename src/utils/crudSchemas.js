/**
 * CRUD Schema 推导工具（Vue3 src/hooks/web/useCrudSchemas.ts 的 Vue2 等价实现）
 *
 * Vue3 版本是依赖 reactive 的 hook；本仓库为 Vue2，核心推导逻辑为纯函数，故移植为纯函数导出：
 * 返回的 allSchemas 是普通对象（非响应式），如需响应式请在使用处自行处理。
 *
 * 与 Vue3 版本的差异：
 * 1. table 列的 dictType 默认 formatter：Vue3 返回 h(DictTag) 渲染标签；Element UI 2.x 的
 *    formatter 只能返回字符串，故改为返回 getDictDataLabel 的字典文本。
 * 2. Vue3 通过 useI18n 翻译 options 的 label；本仓库无 i18n，label 原样透传。
 */
import { merge, cloneDeep } from 'lodash'
import { getBoolDictOptions, getDictDatas, getIntDictOptions } from '@/utils/dict'

// 遍历树结构
const eachTree = (tree, callback, parentNode) => {
  tree.forEach((node) => {
    callback(node, parentNode)
    if (node.children && node.children.length) {
      eachTree(node.children, callback, node)
    }
  })
}

// 树结构映射
const treeMap = (tree, { conversion, childrenKey = 'children' }) => {
  const mapTree = (data, parent) => {
    return data.map((node, index) => {
      const result = conversion(node, parent, index) || {}
      if (result[childrenKey] && result[childrenKey].length) {
        result[childrenKey] = mapTree(result[childrenKey], node)
      }
      return result
    })
  }
  return mapTree(tree || [], undefined)
}

// 简单数组过滤（剔除 undefined 等空值）
const filter = (array, predicate) => array.filter(predicate)

const findIndex = (array, predicate) => array.findIndex(predicate)

/**
 * 过滤所有结构：由 crudSchema 推导查询 / 表格 / 表单 / 详情四份配置
 *
 * @param crudSchema CRUD 列定义数组（isSearch / isTable / isForm / isDetail 控制展示）
 * @returns {{ searchSchema: Array, tableColumns: Array, formSchema: Array, detailSchema: Array }}
 */
export const useCrudSchemas = (crudSchema) => {
  // 所有结构数据
  const allSchemas = {
    searchSchema: [],
    tableColumns: [],
    formSchema: [],
    detailSchema: []
  }

  const searchSchema = filterSearchSchema(crudSchema, allSchemas)
  allSchemas.searchSchema = searchSchema || []

  const tableColumns = filterTableSchema(crudSchema)
  allSchemas.tableColumns = tableColumns || []

  const formSchema = filterFormSchema(crudSchema, allSchemas)
  allSchemas.formSchema = formSchema

  const detailSchema = filterDescriptionsSchema(crudSchema)
  allSchemas.detailSchema = detailSchema

  return {
    allSchemas
  }
}

// 过滤 Search 结构
const filterSearchSchema = (crudSchema, allSchemas) => {
  const searchSchema = []

  // 获取字典列表队列
  const searchRequestTask = []
  eachTree(crudSchema, (schemaItem) => {
    // 判断是否显示
    if (schemaItem?.isSearch || schemaItem.search?.show) {
      let component = schemaItem?.search?.component || 'Input'
      const options = []
      let comonentProps = {}
      if (schemaItem.dictType) {
        const allOptions = { label: '全部', value: '' }
        options.push(allOptions)
        getDictDatas(schemaItem.dictType).forEach((dict) => {
          options.push({ label: dict.label, value: dict.value })
        })
        comonentProps = {
          options: options
        }
        if (!schemaItem.search?.component) component = 'Select'
      }

      // 默认为 input
      const searchSchemaItem = merge(
        {
          component,
          ...schemaItem.search,
          field: schemaItem.field,
          label: schemaItem.search?.label || schemaItem.label
        },
        { componentProps: comonentProps }
      )
      if (searchSchemaItem.api) {
        searchRequestTask.push(async () => {
          const res = await searchSchemaItem.api()
          if (res) {
            const index = findIndex(allSchemas.searchSchema, (v) => {
              return v.field === searchSchemaItem.field
            })
            if (index !== -1) {
              allSchemas.searchSchema[index].componentProps.options = filterOptions(
                res,
                searchSchemaItem.componentProps.optionsAlias?.labelField
              )
            }
          }
        })
      }
      // 删除不必要的字段
      delete searchSchemaItem.show

      searchSchema.push(searchSchemaItem)
    }
  })
  for (const task of searchRequestTask) {
    task()
  }
  return searchSchema
}

// 过滤 table 结构
const filterTableSchema = (crudSchema) => {
  const tableColumns = treeMap(crudSchema, {
    conversion: (schema) => {
      if (schema?.isTable !== false && schema?.table?.show !== false) {
        // 字典列：Element UI formatter 仅支持文本，返回字典 label（Vue3 版渲染 DictTag 标签）
        if (!schema.formatter && schema.dictType) {
          const dictType = schema.dictType
          schema.formatter = (row, column, cellValue) => {
            const dict = getDictDatas(dictType).find((d) => d.value === cellValue + '')
            return dict ? dict.label : ''
          }
        }
        return {
          ...schema.table,
          ...schema
        }
      }
    }
  })

  // 第一次过滤会有 undefined 所以需要二次过滤
  return filter(tableColumns, (data) => {
    if (data.children === void 0) {
      delete data.children
    }
    return !!data.field
  })
}

// 过滤 form 结构
const filterFormSchema = (crudSchema, allSchemas) => {
  const formSchema = []

  // 获取字典列表队列
  const formRequestTask = []

  eachTree(crudSchema, (schemaItem) => {
    // 判断是否显示
    if (schemaItem?.isForm !== false && schemaItem?.form?.show !== false) {
      let component = schemaItem?.form?.component || 'Input'
      let defaultValue = ''
      if (schemaItem.form?.value) {
        defaultValue = schemaItem.form?.value
      } else {
        if (component === 'InputNumber') {
          defaultValue = 0
        }
      }
      let comonentProps = {}
      if (schemaItem.dictType) {
        const options = []
        if (schemaItem.dictClass && schemaItem.dictClass === 'number') {
          getIntDictOptions(schemaItem.dictType).forEach((dict) => {
            options.push({ label: dict.label, value: dict.value })
          })
        } else if (schemaItem.dictClass && schemaItem.dictClass === 'boolean') {
          getBoolDictOptions(schemaItem.dictType).forEach((dict) => {
            options.push({ label: dict.label, value: dict.value })
          })
        } else {
          getDictDatas(schemaItem.dictType).forEach((dict) => {
            options.push({ label: dict.label, value: dict.value })
          })
        }
        comonentProps = {
          options: options
        }
        if (!(schemaItem.form && schemaItem.form.component)) component = 'Select'
      }

      // 默认为 input
      const formSchemaItem = merge(
        {
          component,
          value: defaultValue,
          ...schemaItem.form,
          field: schemaItem.field,
          label: schemaItem.form?.label || schemaItem.label
        },
        { componentProps: comonentProps }
      )

      if (formSchemaItem.api) {
        formRequestTask.push(async () => {
          const res = await formSchemaItem.api()
          if (res) {
            const index = findIndex(allSchemas.formSchema, (v) => {
              return v.field === formSchemaItem.field
            })
            if (index !== -1) {
              allSchemas.formSchema[index].componentProps.options = filterOptions(
                res,
                formSchemaItem.componentProps.optionsAlias?.labelField
              )
            }
          }
        })
      }

      // 删除不必要的字段
      delete formSchemaItem.show

      formSchema.push(formSchemaItem)
    }
  })

  for (const task of formRequestTask) {
    task()
  }
  return formSchema
}

// 过滤 descriptions 结构
const filterDescriptionsSchema = (crudSchema) => {
  const descriptionsSchema = []

  eachTree(crudSchema, (schemaItem) => {
    // 判断是否显示
    if (schemaItem?.isDetail !== false && schemaItem.detail?.show !== false) {
      const descriptionsSchemaItem = {
        ...schemaItem.detail,
        field: schemaItem.field,
        label: schemaItem.detail?.label || schemaItem.label
      }
      if (schemaItem.dictType) {
        descriptionsSchemaItem.dictType = schemaItem.dictType
      }
      if (schemaItem.detail?.dateFormat || schemaItem.formatter === 'formatDate') {
        // 优先使用 detail 下的配置，如果没有默认为 YYYY-MM-DD HH:mm:ss
        descriptionsSchemaItem.dateFormat = schemaItem?.detail?.dateFormat
          ? schemaItem?.detail?.dateFormat
          : 'YYYY-MM-DD HH:mm:ss'
      }

      // 删除不必要的字段
      delete descriptionsSchemaItem.show

      descriptionsSchema.push(descriptionsSchemaItem)
    }
  })

  return descriptionsSchema
}

// 给 options 添加国际化（本仓库无 i18n，label 原样透传，保留函数以保持与 Vue3 版结构一致）
const filterOptions = (options, labelField) => {
  return options?.map((v) => {
    if (labelField) {
      v['labelField'] = v[labelField]
    }
    return v
  })
}

// 将 tableColumns 指定 fields 放到最前面
export const sortTableColumns = (tableColumns, field) => {
  const fieldIndex = tableColumns.findIndex((item) => item.field === field)
  const fieldColumn = cloneDeep(tableColumns[fieldIndex])
  tableColumns.splice(fieldIndex, 1)
  // 添加到开头
  tableColumns.unshift(fieldColumn)
}
