import request from '@/utils/request';
// IoT 产品分类 API
export const ProductCategoryApi = {
    // 查询产品分类分页
    getProductCategoryPage: async (params) => {
        return await request({ method: 'get', url: `/iot/product-category/page`, params });
    },
    // 查询产品分类详情
    getProductCategory: async (id) => {
        return await request({ method: 'get', url: `/iot/product-category/get?id=` + id });
    },
    // 新增产品分类
    createProductCategory: async (data) => {
        return await request({ method: 'post', url: `/iot/product-category/create`, data });
    },
    // 修改产品分类
    updateProductCategory: async (data) => {
        return await request({ method: 'put', url: `/iot/product-category/update`, data });
    },
    // 删除产品分类
    deleteProductCategory: async (id) => {
        return await request({ method: 'delete', url: `/iot/product-category/delete?id=` + id });
    },
    /** 获取产品分类精简列表 */
    getSimpleProductCategoryList: () => {
        return request({ method: 'get', url: '/iot/product-category/simple-list' });
    }
};
