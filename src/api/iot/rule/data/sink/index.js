import request from '@/utils/request';
/** 数据流转目的类型 */
export const IotDataSinkTypeEnum = {
    HTTP: 1,
    TCP: 2,
    WEBSOCKET: 3,
    MQTT: 10,
    DATABASE: 20,
    REDIS_STREAM: 21,
    ROCKETMQ: 30,
    RABBITMQ: 31,
    KAFKA: 32
};
// 数据流转目的 API
export const DataSinkApi = {
    // 查询数据流转目的分页
    getDataSinkPage: async (params) => {
        return await request({ method: 'get', url: `/iot/data-sink/page`, params });
    },
    // 查询数据流转目的详情
    getDataSink: async (id) => {
        return await request({ method: 'get', url: `/iot/data-sink/get?id=` + id });
    },
    // 新增数据流转目的
    createDataSink: async (data) => {
        return await request({ method: 'post', url: `/iot/data-sink/create`, data });
    },
    // 修改数据流转目的
    updateDataSink: async (data) => {
        return await request({ method: 'put', url: `/iot/data-sink/update`, data });
    },
    // 删除数据流转目的
    deleteDataSink: async (id) => {
        return await request({ method: 'delete', url: `/iot/data-sink/delete?id=` + id });
    },
    // 查询数据流转目的（精简）列表
    getDataSinkSimpleList() {
        return request({ method: 'get', url: '/iot/data-sink/simple-list' });
    }
};
