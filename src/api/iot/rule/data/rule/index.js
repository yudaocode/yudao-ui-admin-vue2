import request from '@/utils/request';
// IoT 数据流转规则 API
export const DataRuleApi = {
    // 查询数据流转规则分页
    getDataRulePage: async (params) => {
        return await request({ method: 'get', url: `/iot/data-rule/page`, params });
    },
    // 查询数据流转规则详情
    getDataRule: async (id) => {
        return await request({ method: 'get', url: `/iot/data-rule/get?id=` + id });
    },
    // 新增数据流转规则
    createDataRule: async (data) => {
        return await request({ method: 'post', url: `/iot/data-rule/create`, data });
    },
    // 修改数据流转规则
    updateDataRule: async (data) => {
        return await request({ method: 'put', url: `/iot/data-rule/update`, data });
    },
    // 删除数据流转规则
    deleteDataRule: async (id) => {
        return await request({ method: 'delete', url: `/iot/data-rule/delete?id=` + id });
    }
};
