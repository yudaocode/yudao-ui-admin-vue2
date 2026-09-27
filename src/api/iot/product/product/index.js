import request from '@/utils/request';
// IOT 产品设备类型枚举类 0: 直连设备, 1: 网关子设备, 2: 网关设备
export var DeviceTypeEnum;
(function (DeviceTypeEnum) {
    DeviceTypeEnum[DeviceTypeEnum["DEVICE"] = 0] = "DEVICE";
    DeviceTypeEnum[DeviceTypeEnum["GATEWAY_SUB"] = 1] = "GATEWAY_SUB";
    DeviceTypeEnum[DeviceTypeEnum["GATEWAY"] = 2] = "GATEWAY"; // 网关设备
})(DeviceTypeEnum || (DeviceTypeEnum = {}));
// IoT 协议类型枚举
export var ProtocolTypeEnum;
(function (ProtocolTypeEnum) {
    ProtocolTypeEnum["TCP"] = "tcp";
    ProtocolTypeEnum["UDP"] = "udp";
    ProtocolTypeEnum["WEBSOCKET"] = "websocket";
    ProtocolTypeEnum["HTTP"] = "http";
    ProtocolTypeEnum["MQTT"] = "mqtt";
    ProtocolTypeEnum["EMQX"] = "emqx";
    ProtocolTypeEnum["COAP"] = "coap";
    ProtocolTypeEnum["MODBUS_TCP_CLIENT"] = "modbus_tcp_client";
    ProtocolTypeEnum["MODBUS_TCP_SERVER"] = "modbus_tcp_server";
})(ProtocolTypeEnum || (ProtocolTypeEnum = {}));
// IoT 序列化类型枚举
export var SerializeTypeEnum;
(function (SerializeTypeEnum) {
    SerializeTypeEnum["JSON"] = "json";
    SerializeTypeEnum["BINARY"] = "binary";
})(SerializeTypeEnum || (SerializeTypeEnum = {}));
// IoT 产品 API
export const ProductApi = {
    // 查询产品分页
    getProductPage: async (params) => {
        return await request({ method: 'get', url: `/iot/product/page`, params });
    },
    // 查询产品详情
    getProduct: async (id) => {
        return await request({ method: 'get', url: `/iot/product/get?id=` + id });
    },
    // 新增产品
    createProduct: async (data) => {
        return await request({ method: 'post', url: `/iot/product/create`, data });
    },
    // 修改产品
    updateProduct: async (data) => {
        return await request({ method: 'put', url: `/iot/product/update`, data });
    },
    // 删除产品
    deleteProduct: async (id) => {
        return await request({ method: 'delete', url: `/iot/product/delete?id=` + id });
    },
    // 导出产品 Excel
    exportProduct: async (params) => {
        return await request({ method: 'get', responseType: 'blob', url: `/iot/product/export-excel`, params });
    },
    // 更新产品状态
    updateProductStatus: async (id, status) => {
        return await request({ method: 'put', url: `/iot/product/update-status?id=` + id + `&status=` + status });
    },
    // 查询产品（精简）列表
    getSimpleProductList(deviceType) {
        return request({ method: 'get', url: '/iot/product/simple-list', params: { deviceType } });
    },
    // 根据 ProductKey 获取产品信息
    getProductByKey: async (productKey) => {
        return await request({ method: 'get', url: `/iot/product/get-by-key`, params: { productKey } });
    }
};
