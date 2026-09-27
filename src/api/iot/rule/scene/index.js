import request from '@/utils/request';
// IoT 场景联动 API
export const RuleSceneApi = {
    // 查询场景联动分页
    getRuleScenePage: async (params) => {
        return await request({ method: 'get', url: `/iot/scene-rule/page`, params });
    },
    // 查询场景联动详情
    getRuleScene: async (id) => {
        return await request({ method: 'get', url: `/iot/scene-rule/get?id=` + id });
    },
    // 新增场景联动
    createRuleScene: async (data) => {
        return await request({ method: 'post', url: `/iot/scene-rule/create`, data });
    },
    // 修改场景联动
    updateRuleScene: async (data) => {
        return await request({ method: 'put', url: `/iot/scene-rule/update`, data });
    },
    // 修改场景联动
    updateRuleSceneStatus: async (id, status) => {
        return await request({ method: 'put',
            url: `/iot/scene-rule/update-status`,
            data: {
                id,
                status
            }
        });
    },
    // 删除场景联动
    deleteRuleScene: async (id) => {
        return await request({ method: 'delete', url: `/iot/scene-rule/delete?id=` + id });
    },
    // 获取场景联动简单列表
    getSimpleRuleSceneList: async () => {
        return await request({ method: 'get', url: `/iot/scene-rule/simple-list` });
    }
};
