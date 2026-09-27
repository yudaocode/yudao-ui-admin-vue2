import request from '@/utils/request';
/** Modbus 点位配置 API */
export const DeviceModbusPointApi = {
    /** 获取设备的 Modbus 点位分页 */
    getModbusPointPage: async (params) => {
        return await request({ method: 'get', url: `/iot/device-modbus-point/page`, params });
    },
    /** 获取 Modbus 点位详情 */
    getModbusPoint: async (id) => {
        return await request({ method: 'get',
            url: `/iot/device-modbus-point/get?id=${id}`
        });
    },
    /** 创建 Modbus 点位配置 */
    createModbusPoint: async (data) => {
        return await request({ method: 'post', url: `/iot/device-modbus-point/create`, data });
    },
    /** 更新 Modbus 点位配置 */
    updateModbusPoint: async (data) => {
        return await request({ method: 'put', url: `/iot/device-modbus-point/update`, data });
    },
    /** 删除 Modbus 点位配置 */
    deleteModbusPoint: async (id) => {
        return await request({ method: 'delete', url: `/iot/device-modbus-point/delete?id=${id}` });
    }
};
