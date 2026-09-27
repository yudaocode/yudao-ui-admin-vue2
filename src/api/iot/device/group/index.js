import request from '@/utils/request';
// IoT 设备分组 API
export const DeviceGroupApi = {
    // 查询设备分组分页
    getDeviceGroupPage: async (params) => {
        return await request({ method: 'get', url: `/iot/device-group/page`, params });
    },
    // 查询设备分组详情
    getDeviceGroup: async (id) => {
        return await request({ method: 'get', url: `/iot/device-group/get?id=` + id });
    },
    // 新增设备分组
    createDeviceGroup: async (data) => {
        return await request({ method: 'post', url: `/iot/device-group/create`, data });
    },
    // 修改设备分组
    updateDeviceGroup: async (data) => {
        return await request({ method: 'put', url: `/iot/device-group/update`, data });
    },
    // 删除设备分组
    deleteDeviceGroup: async (id) => {
        return await request({ method: 'delete', url: `/iot/device-group/delete?id=` + id });
    },
    // 获取设备分组的精简信息列表
    getSimpleDeviceGroupList: async () => {
        return await request({ method: 'get', url: `/iot/device-group/simple-list` });
    }
};
