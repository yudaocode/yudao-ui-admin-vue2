import request from '@/utils/request';
// IoT OTA 任务记录 API
export const IoTOtaTaskRecordApi = {
    getOtaTaskRecordStatusStatistics: async (firmwareId, taskId) => {
        const params = {};
        if (firmwareId)
            params.firmwareId = firmwareId;
        if (taskId)
            params.taskId = taskId;
        return await request({ method: 'get', url: `/iot/ota/task/record/get-status-statistics`, params });
    },
    // 查询 OTA 任务记录分页
    getOtaTaskRecordPage: async (params) => {
        return await request({ method: 'get', url: `/iot/ota/task/record/page`, params });
    },
    // 取消 OTA 任务记录
    cancelOtaTaskRecord: async (id) => {
        return await request({ method: 'put', url: `/iot/ota/task/record/cancel?id=` + id });
    }
};
