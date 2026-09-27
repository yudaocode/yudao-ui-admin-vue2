import request from '@/utils/request';
// IoT 告警配置 API
export const AlertConfigApi = {
    // 查询告警配置分页
    getAlertConfigPage: async (params) => {
        return await request({ method: 'get', url: `/iot/alert-config/page`, params });
    },
    // 查询告警配置详情
    getAlertConfig: async (id) => {
        return await request({ method: 'get', url: `/iot/alert-config/get?id=` + id });
    },
    // 新增告警配置
    createAlertConfig: async (data) => {
        return await request({ method: 'post', url: `/iot/alert-config/create`, data });
    },
    // 修改告警配置
    updateAlertConfig: async (data) => {
        return await request({ method: 'put', url: `/iot/alert-config/update`, data });
    },
    // 删除告警配置
    deleteAlertConfig: async (id) => {
        return await request({ method: 'delete', url: `/iot/alert-config/delete?id=` + id });
    },
    // 获取告警配置简单列表
    getSimpleAlertConfigList: async () => {
        return await request({ method: 'get', url: `/iot/alert-config/simple-list` });
    }
};
