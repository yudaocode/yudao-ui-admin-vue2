import request from '@/utils/request';
// IoT 告警记录 API
export const AlertRecordApi = {
    // 查询告警记录分页
    getAlertRecordPage: async (params) => {
        return await request({ method: 'get', url: `/iot/alert-record/page`, params });
    },
    // 查询告警记录详情
    getAlertRecord: async (id) => {
        return await request({ method: 'get', url: `/iot/alert-record/get?id=` + id });
    },
    // 处理告警记录
    processAlertRecord: async (id, processRemark) => {
        return await request({ method: 'put',
            url: `/iot/alert-record/process`,
            data: { id, processRemark }
        });
    }
};
