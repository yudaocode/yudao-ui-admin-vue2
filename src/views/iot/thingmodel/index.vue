<template>
<div class="iot-vue2-root">

  <div class="iot-content-wrap">
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="功能类型" prop="name">
        <el-select
          v-model="queryParams.type"
          class="!w-240px"
          clearable
          placeholder="请选择功能类型"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.IOT_THING_MODEL_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          v-hasPermi="[`iot:thing-model:create`]"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          添加功能
        </el-button>
        <el-button v-hasPermi="[`iot:thing-model:query`]" plain type="success" @click="openTSL">
          TSL
        </el-button>
      </el-form-item>
    </el-form>
  </div>

  <!-- 列表 -->
  <div class="iot-content-wrap">
    <el-tabs>
      <el-table v-loading="loading" :data="list" :show-overflow-tooltip="true" :stripe="true">
        <el-table-column align="center" label="功能类型" prop="type">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.IOT_THING_MODEL_TYPE" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="功能名称" prop="name" />
        <el-table-column align="center" label="标识符" prop="identifier" />
        <el-table-column align="center" label="数据类型" prop="identifier">
          <template #default="{ row }">
            {{ getDataTypeOptionsLabel(row.property?.dataType) ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column align="left" label="数据定义" prop="identifier">
          <template #default="{ row }">
            <DataDefinition :data="row" />
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template #default="scope">
            <el-button
              v-hasPermi="[`iot:thing-model:update`]"
             
              type="text"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-button class="iot-text-danger"
              v-hasPermi="['iot:thing-model:delete']"
             
              type="text"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <Pagination
        :limit.sync="queryParams.pageSize"
        :page.sync="queryParams.pageNo"
        :total="total"
        @pagination="getList"
      />
    </el-tabs>
  </div>

  <!-- 表单弹窗：添加/修改 -->
  <ThingModelForm ref="formRef" @success="getList" />
  <ThingModelTSL ref="tslRef" />

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { useIotI18n } from '@/views/iot/utils/ui';
import IotIcon from '@/views/iot/components/IotIcon.vue';
import { ref, reactive, onMounted, inject } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { ThingModelApi } from '@/api/iot/thingmodel';
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict';
import ThingModelForm from './ThingModelForm.vue';
import ThingModelTSL from './ThingModelTSL.vue';
import { getDataTypeOptionsLabel, IOT_PROVIDE_KEY } from '@/views/iot/utils/constants';
import { DataDefinition } from './components';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTThingModel' },
    components: {
        Icon: IotIcon,
        DataDefinition,
        ThingModelForm,
        ThingModelTSL,
    },
    __name: 'index',
    setup(__props, { expose: __expose }) {
        __expose();
        const { t } = useIotI18n(); // 国际化
        const message = createIotMessage(); // 消息弹窗
        const loading = ref(true); // 列表的加载中
        const list = ref([]); // 列表的数据
        const total = ref(0); // 列表的总页数
        const queryParams = reactive({
            pageNo: 1,
            pageSize: 10,
            type: undefined,
            productId: -1
        });
        const product = inject(IOT_PROVIDE_KEY.PRODUCT); // 注入产品信息
        /** 查询列表 */
        const getList = async () => {
            loading.value = true;
            try {
                queryParams.productId = product?.value?.id || -1;
                const data = (await ThingModelApi.getThingModelPage(queryParams)).data;
                list.value = data.list;
                total.value = data.total;
            }
            finally {
                loading.value = false;
            }
        };
        /** 搜索按钮操作 */
        const handleQuery = () => {
            queryParams.pageNo = 1;
            getList();
        };
        /** 添加/修改操作 */
        const formRef = ref();
        const openForm = (type, id) => {
            formRef.value.open(type, id);
        };
        /** 展示物模型 TSL */
        const tslRef = ref();
        const openTSL = () => {
            tslRef.value?.open();
        };
        /** 删除按钮操作 */
        const handleDelete = async (id) => {
            try {
                // 删除的二次确认
                await message.delConfirm();
                // 发起删除
                (await ThingModelApi.deleteThingModel(id)).data;
                message.success(t('common.delSuccess'));
                // 刷新列表
                await getList();
            }
            catch { }
        };
        /** 初始化 **/
        onMounted(() => {
            getList();
        });
        const __returned__ = { Icon: IotIcon, t, message, loading, list, total, queryParams, product, getList, handleQuery, formRef, openForm, tslRef, openTSL, handleDelete, get DICT_TYPE() { return DICT_TYPE; }, get getIntDictOptions() { return getIntDictOptions; }, ThingModelForm, ThingModelTSL, get getDataTypeOptionsLabel() { return getDataTypeOptionsLabel; }, get DataDefinition() { return DataDefinition; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
