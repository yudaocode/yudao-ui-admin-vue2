import request from '@/utils/request';
// IoT OTA 任务 API
export const IoTOtaTaskApi = {
    // 查询 OTA 升级任务分页
    getOtaTaskPage: async (params) => {
        return await request({ method: 'get', url: `/iot/ota/task/page`, params });
    },
    // 查询 OTA 升级任务详情
    getOtaTask: async (id) => {
        return await request({ method: 'get', url: `/iot/ota/task/get?id=` + id });
    },
    // 创建 OTA 升级任务
    createOtaTask: async (data) => {
        return await request({ method: 'post', url: `/iot/ota/task/create`, data });
    },
    // 取消 OTA 升级任务
    cancelOtaTask: async (id) => {
        return await request({ method: 'post', url: `/iot/ota/task/cancel?id=` + id });
    }
};
