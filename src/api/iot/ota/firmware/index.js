import request from '@/utils/request';
// IoT OTA 固件 API
export const IoTOtaFirmwareApi = {
    // 查询 OTA 固件分页
    getOtaFirmwarePage: async (params) => {
        return await request({ method: 'get', url: `/iot/ota/firmware/page`, params });
    },
    // 查询 OTA 固件详情
    getOtaFirmware: async (id) => {
        return await request({ method: 'get', url: `/iot/ota/firmware/get?id=` + id });
    },
    // 新增 OTA 固件
    createOtaFirmware: async (data) => {
        return await request({ method: 'post', url: `/iot/ota/firmware/create`, data });
    },
    // 修改 OTA 固件
    updateOtaFirmware: async (data) => {
        return await request({ method: 'put', url: `/iot/ota/firmware/update`, data });
    },
    // 删除 OTA 固件
    deleteOtaFirmware: async (id) => {
        return await request({ method: 'delete', url: `/iot/ota/firmware/delete?id=` + id });
    }
};
