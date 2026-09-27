import request from '@/utils/request';
// 设备 API
export const DeviceApi = {
    // 查询设备分页
    getDevicePage: async (params) => {
        return await request({ method: 'get', url: `/iot/device/page`, params });
    },
    // 查询设备详情
    getDevice: async (id) => {
        return await request({ method: 'get', url: `/iot/device/get?id=` + id });
    },
    // 新增设备
    createDevice: async (data) => {
        return await request({ method: 'post', url: `/iot/device/create`, data });
    },
    // 修改设备
    updateDevice: async (data) => {
        return await request({ method: 'put', url: `/iot/device/update`, data });
    },
    // 修改设备分组
    updateDeviceGroup: async (data) => {
        return await request({ method: 'put', url: `/iot/device/update-group`, data });
    },
    // 删除单个设备
    deleteDevice: async (id) => {
        return await request({ method: 'delete', url: `/iot/device/delete?id=` + id });
    },
    // 删除多个设备
    deleteDeviceList: async (ids) => {
        return await request({ method: 'delete', url: `/iot/device/delete-list`, params: { ids: ids.join(',') } });
    },
    // 导出设备
    exportDeviceExcel: async (params) => {
        return await request({ method: 'get', responseType: 'blob', url: `/iot/device/export-excel`, params });
    },
    // 获取设备数量
    getDeviceCount: async (productId) => {
        return await request({ method: 'get', url: `/iot/device/count?productId=` + productId });
    },
    // 获取设备的精简信息列表
    getSimpleDeviceList: async (deviceType, productId) => {
        return await request({ method: 'get', url: `/iot/device/simple-list?`, params: { deviceType, productId } });
    },
    // 获取设备位置列表（用于地图展示）
    getDeviceLocationList: async () => {
        return await request({ method: 'get', url: `/iot/device/location-list` });
    },
    // 根据产品编号，获取设备的精简信息列表
    getDeviceListByProductId: async (productId) => {
        return await request({ method: 'get', url: `/iot/device/simple-list?`, params: { productId } });
    },
    // 获取导入模板
    importDeviceTemplate: async () => {
        return await request({ method: 'get', responseType: 'blob', url: `/iot/device/get-import-template` });
    },
    // 获取设备属性最新数据
    getLatestDeviceProperties: async (params) => {
        return await request({ method: 'get', url: `/iot/device/property/get-latest`, params });
    },
    // 获取设备属性历史数据
    getHistoryDevicePropertyList: async (params) => {
        return await request({ method: 'get', url: `/iot/device/property/history-list`, params });
    },
    // 获取设备认证信息
    getDeviceAuthInfo: async (id) => {
        return await request({ method: 'get', url: `/iot/device/get-auth-info`, params: { id } });
    },
    // 查询设备消息分页
    getDeviceMessagePage: async (params) => {
        return await request({ method: 'get', url: `/iot/device/message/page`, params });
    },
    // 查询设备消息配对分页
    getDeviceMessagePairPage: async (params) => {
        return await request({ method: 'get', url: `/iot/device/message/pair-page`, params });
    },
    // 发送设备消息
    sendDeviceMessage: async (params) => {
        return await request({ method: 'post', url: `/iot/device/message/send`, data: params });
    },
    // 绑定子设备到网关
    bindDeviceGateway: async (data) => {
        return await request({ method: 'put', url: `/iot/device/bind-gateway`, data });
    },
    // 解绑子设备与网关
    unbindDeviceGateway: async (data) => {
        return await request({ method: 'put', url: `/iot/device/unbind-gateway`, data });
    },
    // 获取网关的子设备列表
    getSubDeviceList: async (gatewayId) => {
        return await request({ method: 'get',
            url: `/iot/device/sub-device-list`,
            params: { gatewayId }
        });
    },
    // 获取未绑定网关的子设备分页
    getUnboundSubDevicePage: async (params) => {
        return await request({ method: 'get', url: `/iot/device/unbound-sub-device-page`, params });
    }
};
