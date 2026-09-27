import request from '@/utils/request';
/** Modbus 连接配置 API */
export const DeviceModbusConfigApi = {
    /** 获取设备的 Modbus 连接配置 */
    getModbusConfig: async (deviceId) => {
        return await request({ method: 'get',
            url: `/iot/device-modbus-config/get`,
            params: { deviceId }
        });
    },
    /** 保存 Modbus 连接配置 */
    saveModbusConfig: async (data) => {
        return await request({ method: 'post', url: `/iot/device-modbus-config/save`, data });
    }
};
