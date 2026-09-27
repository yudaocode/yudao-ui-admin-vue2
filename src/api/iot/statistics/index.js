import request from '@/utils/request';
// IoT 数据统计 API
export const StatisticsApi = {
    // 查询全局的数据统计
    getStatisticsSummary: async () => {
        return await request({ method: 'get',
            url: `/iot/statistics/get-summary`
        });
    },
    // 获取设备消息的数据统计
    getDeviceMessageSummaryByDate: async (params) => {
        return await request({ method: 'get',
            url: `/iot/statistics/get-device-message-summary-by-date`,
            params
        });
    }
};
