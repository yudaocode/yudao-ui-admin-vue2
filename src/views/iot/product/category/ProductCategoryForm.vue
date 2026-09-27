<template>
<div class="iot-vue2-root">

  <el-dialog :title="dialogTitle" :visible.sync="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="分类名字" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名字" />
      </el-form-item>
      <el-form-item label="分类排序" prop="sort">
        <el-input v-model="formData.sort" placeholder="请输入分类排序" />
      </el-form-item>
      <el-form-item label="分类状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="分类描述" prop="description">
        <el-input type="textarea" v-model="formData.description" placeholder="请输入分类描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { useIotI18n } from '@/views/iot/utils/ui';
import { ref, reactive } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict';
import { ProductCategoryApi } from '@/api/iot/product/category';
import { CommonStatusEnum } from '@/utils/constants';
/** IoT 产品分类 表单 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'ProductCategoryForm' },
    __name: 'ProductCategoryForm',
    emits: ['success'],
    setup(__props, { expose: __expose, emit: __emit }) {
        const { t } = useIotI18n(); // 国际化
        const message = createIotMessage(); // 消息弹窗
        const dialogVisible = ref(false); // 弹窗的是否展示
        const dialogTitle = ref(''); // 弹窗的标题
        const formLoading = ref(false); // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
        const formType = ref(''); // 表单的类型：create - 新增；update - 修改
        const formData = ref({
            id: undefined,
            name: undefined,
            sort: 0,
            status: CommonStatusEnum.ENABLE,
            description: undefined
        });
        const formRules = reactive({
            name: [{ required: true, message: '分类名字不能为空', trigger: 'blur' }],
            status: [{ required: true, message: '分类状态不能为空', trigger: 'blur' }],
            sort: [{ required: true, message: '分类排序不能为空', trigger: 'blur' }]
        });
        const formRef = ref(); // 表单 Ref
        /** 打开弹窗 */
        const open = async (type, id) => {
            dialogVisible.value = true;
            dialogTitle.value = t('action.' + type);
            formType.value = type;
            resetForm();
            // 修改时，设置数据
            if (id) {
                formLoading.value = true;
                try {
                    formData.value = (await ProductCategoryApi.getProductCategory(id)).data;
                }
                finally {
                    formLoading.value = false;
                }
            }
        };
        __expose({ open }); // 提供 open 方法，用于打开弹窗
        /** 提交表单 */
        const emit = __emit; // 定义 success 事件，用于操作成功后的回调
        const submitForm = async () => {
            // 校验表单
            await formRef.value.validate();
            // 提交请求
            formLoading.value = true;
            try {
                const data = formData.value;
                if (formType.value === 'create') {
                    (await ProductCategoryApi.createProductCategory(data)).data;
                    message.success(t('common.createSuccess'));
                }
                else {
                    (await ProductCategoryApi.updateProductCategory(data)).data;
                    message.success(t('common.updateSuccess'));
                }
                dialogVisible.value = false;
                // 发送操作成功的事件
                emit('success');
            }
            finally {
                formLoading.value = false;
            }
        };
        /** 重置表单 */
        const resetForm = () => {
            formData.value = {
                id: undefined,
                name: undefined,
                sort: 0,
                status: CommonStatusEnum.ENABLE,
                description: undefined
            };
            formRef.value?.resetFields();
        };
        const __returned__ = { t, message, dialogVisible, dialogTitle, formLoading, formType, formData, formRules, formRef, open, emit, submitForm, resetForm, get getIntDictOptions() { return getIntDictOptions; }, get DICT_TYPE() { return DICT_TYPE; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>

