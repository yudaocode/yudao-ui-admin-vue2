import request from '@/utils/request';
import { isEmpty } from '@/utils/is';
// IoT 产品物模型 API
export const ThingModelApi = {
    // 查询产品物模型分页
    getThingModelPage: async (params) => {
        return await request({ method: 'get', url: `/iot/thing-model/page`, params });
    },
    // 获得产品物模型列表
    getThingModelList: async (params) => {
        return await request({ method: 'get', url: `/iot/thing-model/list`, params });
    },
    // 获得产品物模型 TSL
    getThingModelTSLByProductId: async (productId) => {
        return await request({ method: 'get',
            url: `/iot/thing-model/get-tsl?productId=${productId}`
        });
    },
    // 查询产品物模型详情
    getThingModel: async (id) => {
        return await request({ method: 'get', url: `/iot/thing-model/get?id=` + id });
    },
    // 新增产品物模型
    createThingModel: async (data) => {
        return await request({ method: 'post', url: `/iot/thing-model/create`, data });
    },
    // 修改产品物模型
    updateThingModel: async (data) => {
        return await request({ method: 'put', url: `/iot/thing-model/update`, data });
    },
    // 删除产品物模型
    deleteThingModel: async (id) => {
        return await request({ method: 'delete', url: `/iot/thing-model/delete?id=` + id });
    }
};
/** 公共校验规则 */
export const ThingModelFormRules = {
    name: [
        { required: true, message: '功能名称不能为空', trigger: 'blur' },
        {
            pattern: /^[\u4e00-\u9fa5a-zA-Z0-9][\u4e00-\u9fa5a-zA-Z0-9\-_/\.]{0,29}$/,
            message: '支持中文、大小写字母、日文、数字、短划线、下划线、斜杠和小数点，必须以中文、英文或数字开头，不超过 30 个字符',
            trigger: 'blur'
        }
    ],
    type: [{ required: true, message: '功能类型不能为空', trigger: 'blur' }],
    identifier: [
        { required: true, message: '标识符不能为空', trigger: 'blur' },
        {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/,
            message: '支持大小写字母、数字和下划线，必须以字母开头，不超过 32 个字符',
            trigger: 'blur'
        },
        {
            validator: (_, value) => {
                const reservedKeywords = ['set', 'get', 'post', 'property', 'event', 'time', 'value'];
                if (reservedKeywords.includes(value)) {
                    return Promise.reject(new Error('set, get, post, property, event, time, value 是系统保留字段，不能用于标识符定义'));
                }
                if (/^\d+$/.test(value)) {
                    return Promise.reject(new Error('标识符不能是纯数字'));
                }
                return Promise.resolve();
            },
            trigger: 'blur'
        }
    ],
    'property.dataSpecs.childDataType': [{ required: true, message: '元素类型不能为空' }],
    'property.dataSpecs.size': [
        { required: true, message: '元素个数不能为空' },
        {
            validator: (_, value) => {
                if (isEmpty(value)) {
                    return Promise.reject(new Error('元素个数不能为空'));
                }
                if (isNaN(Number(value))) {
                    return Promise.reject(new Error('元素个数必须是数字'));
                }
                return Promise.resolve();
            },
            trigger: 'blur'
        }
    ],
    'property.dataSpecs.length': [
        { required: true, message: '请输入文本字节长度', trigger: 'blur' },
        {
            validator: (_, value) => {
                if (isEmpty(value)) {
                    return Promise.reject(new Error('文本长度不能为空'));
                }
                if (isNaN(Number(value))) {
                    return Promise.reject(new Error('文本长度必须是数字'));
                }
                return Promise.resolve();
            },
            trigger: 'blur'
        }
    ],
    'property.accessMode': [{ required: true, message: '请选择读写类型', trigger: 'change' }]
};
/** 校验布尔值名称 */
export const validateBoolName = (_, value) => {
    if (isEmpty(value)) {
        return Promise.reject(new Error('布尔值名称不能为空'));
    }
    // 检查开头字符
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9]/.test(value)) {
        return Promise.reject(new Error('布尔值名称必须以中文、英文字母或数字开头'));
    }
    // 检查整体格式
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9][a-zA-Z0-9\u4e00-\u9fa5_-]*$/.test(value)) {
        return Promise.reject(new Error('布尔值名称只能包含中文、英文字母、数字、下划线和短划线'));
    }
    // 检查长度（一个中文算一个字符）
    if (value.length > 20) {
        return Promise.reject(new Error('布尔值名称长度不能超过 20 个字符'));
    }
    return Promise.resolve();
};
