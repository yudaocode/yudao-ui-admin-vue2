<template>
<div class="iot-vue2-root">

  <el-dialog :visible.sync="dialogVisible" title="升级任务详情" width="1200px" append-to-body>
    <!-- 任务信息 -->
    <div class="iot-content-wrap">
      <el-descriptions :column="3" v-loading="taskLoading" border>
        <el-descriptions-item label="任务编号">{{ task.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ task.name }}</el-descriptions-item>
        <el-descriptions-item label="升级范围">
          <dict-tag :type="DICT_TYPE.IOT_OTA_TASK_DEVICE_SCOPE" :value="task.deviceScope" />
        </el-descriptions-item>
        <el-descriptions-item label="任务状态">
          <dict-tag :type="DICT_TYPE.IOT_OTA_TASK_STATUS" :value="task.status" />
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ task.createTime ? formatDate(task.createTime) : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="任务描述" :span="3">
          {{ task.description }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 任务升级设备统计 -->
    <div class="iot-content-wrap">
      <el-row :gutter="20" class="py-20px" v-loading="taskStatisticsLoading">
        <el-col :span="6">
          <div class="text-center p-20px border border-solid border-gray-200 rounded bg-gray-50">
            <div class="text-32px font-bold mb-8px text-blue-500">
              {{ Object.values(taskStatistics).reduce((sum, count) => sum + (count || 0), 0) || 0 }}
            </div>
            <div class="text-14px text-gray-600">升级设备总数</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="text-center p-20px border border-solid border-gray-200 rounded bg-gray-50">
            <div class="text-32px font-bold mb-8px text-gray-400">
              {{ taskStatistics[IoTOtaTaskRecordStatusEnum.PENDING.value] || 0 }}
            </div>
            <div class="text-14px text-gray-600">待推送</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="text-center p-20px border border-solid border-gray-200 rounded bg-gray-50">
            <div class="text-32px font-bold mb-8px text-blue-400">
              {{ taskStatistics[IoTOtaTaskRecordStatusEnum.PUSHED.value] || 0 }}
            </div>
            <div class="text-14px text-gray-600">已推送</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="text-center p-20px border border-solid border-gray-200 rounded bg-gray-50">
            <div class="text-32px font-bold mb-8px text-yellow-500">
              {{ taskStatistics[IoTOtaTaskRecordStatusEnum.UPGRADING.value] || 0 }}
            </div>
            <div class="text-14px text-gray-600">正在升级</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="text-center p-20px border border-solid border-gray-200 rounded bg-gray-50">
            <div class="text-32px font-bold mb-8px text-green-500">
              {{ taskStatistics[IoTOtaTaskRecordStatusEnum.SUCCESS.value] || 0 }}
            </div>
            <div class="text-14px text-gray-600">升级成功</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="text-center p-20px border border-solid border-gray-200 rounded bg-gray-50">
            <div class="text-32px font-bold mb-8px text-red-500">
              {{ taskStatistics[IoTOtaTaskRecordStatusEnum.FAILURE.value] || 0 }}
            </div>
            <div class="text-14px text-gray-600">升级失败</div>
          </div>
        </el-col>
        <el-col :span="3">
          <div class="text-center p-20px border border-solid border-gray-200 rounded bg-gray-50">
            <div class="text-32px font-bold mb-8px text-gray-400">
              {{ taskStatistics[IoTOtaTaskRecordStatusEnum.CANCELED.value] || 0 }}
            </div>
            <div class="text-14px text-gray-600">升级取消</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 设备管理 -->
    <div class="iot-content-wrap">
      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="mb-15px">
        <el-tab-pane v-for="tab in statusTabs" :key="tab.key" :label="tab.label" :name="tab.key" />
      </el-tabs>
      <!-- Tab 内容 -->
      <div v-for="tab in statusTabs" :key="tab.key" v-show="activeTab === tab.key">
        <!-- 设备列表 -->
        <el-table
          v-loading="recordLoading"
          :data="recordList"
          :stripe="true"
          :show-overflow-tooltip="true"
        >
          <el-table-column label="设备名称" align="center" prop="deviceName" />
          <el-table-column label="当前版本" align="center" prop="fromFirmwareVersion" />
          <el-table-column label="升级状态" align="center" prop="status" width="120">
            <template #default="scope">
              <dict-tag :type="DICT_TYPE.IOT_OTA_TASK_RECORD_STATUS" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column label="升级进度" align="center" prop="progress" width="120">
            <template #default="scope"> {{ scope.row.progress }}% </template>
          </el-table-column>
          <el-table-column label="状态描述" align="center" prop="description" />
          <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="80">
            <template #default="scope">
              <el-button class="iot-text-danger"
                v-if="
                  [
                    IoTOtaTaskRecordStatusEnum.PENDING.value,
                    IoTOtaTaskRecordStatusEnum.PUSHED.value,
                    IoTOtaTaskRecordStatusEnum.UPGRADING.value
                  ].includes(scope.row.status)
                "
               
                type="text"
                @click="handleCancelUpgrade(scope.row)"
                v-hasPermi="['iot:ota-task-record:cancel']"
              >
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <Pagination
          :total="recordTotal"
          :page.sync="queryParams.pageNo"
          :limit.sync="queryParams.pageSize"
          @pagination="getRecordList"
        />
      </div>
    </div>
  </el-dialog>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import { defineComponent as _defineComponent } from 'vue';
import { ref, reactive, computed } from 'vue';
import Pagination from '@/components/Pagination/index.vue';
import { IoTOtaTaskApi } from '@/api/iot/ota/task';
import { IoTOtaTaskRecordApi } from '@/api/iot/ota/task/record';
import { DICT_TYPE } from '@/utils/dict';
import { IoTOtaTaskRecordStatusEnum } from '@/views/iot/utils/constants';
import { formatDate } from '@/utils/formatTime';
/** OTA 任务详情组件 */
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'OtaTaskDetail' },
    components: {
        Pagination,
    },
    __name: 'OtaTaskDetail',
    emits: ['success'],
    setup(__props, { expose: __expose, emit: __emit }) {
        const message = createIotMessage(); // 消息弹窗
        const dialogVisible = ref(false); // 弹窗的是否展示
        const taskId = ref(); // 任务编号
        const taskLoading = ref(false); // 任务加载状态
        const task = ref({}); // 任务信息
        const taskStatisticsLoading = ref(false); // 任务统计加载状态
        const taskStatistics = ref({}); // 任务统计数据
        const recordLoading = ref(false); // 记录列表加载状态
        const recordList = ref([]); // 记录列表数据
        const recordTotal = ref(0); // 记录总数
        const queryParams = reactive({
            pageNo: 1,
            pageSize: 10,
            taskId: undefined,
            status: undefined
        }); // 查询参数
        const activeTab = ref(''); // 当前激活的标签页
        /** 状态标签配置 */
        const statusTabs = computed(() => {
            const tabs = [{ key: '', label: '全部设备' }];
            Object.values(IoTOtaTaskRecordStatusEnum).forEach((status) => {
                tabs.push({
                    key: status.value.toString(),
                    label: status.label
                });
            });
            return tabs;
        });
        /** 获取任务详情 */
        const getTaskInfo = async () => {
            if (!taskId.value) {
                return;
            }
            taskLoading.value = true;
            try {
                task.value = (await IoTOtaTaskApi.getOtaTask(taskId.value)).data;
            }
            finally {
                taskLoading.value = false;
            }
        };
        /** 获取统计数据 */
        const getStatistics = async () => {
            if (!taskId.value) {
                return;
            }
            taskStatisticsLoading.value = true;
            try {
                taskStatistics.value = (await IoTOtaTaskRecordApi.getOtaTaskRecordStatusStatistics(undefined, taskId.value)).data;
            }
            finally {
                taskStatisticsLoading.value = false;
            }
        };
        /** 获取升级记录列表 */
        const getRecordList = async () => {
            if (!taskId.value) {
                return;
            }
            recordLoading.value = true;
            try {
                queryParams.taskId = taskId.value;
                const data = (await IoTOtaTaskRecordApi.getOtaTaskRecordPage(queryParams)).data;
                recordList.value = data.list;
                recordTotal.value = data.total || 0;
            }
            finally {
                recordLoading.value = false;
            }
        };
        /** 切换标签 */
        const handleTabClick = (tab) => {
            const tabKey = tab.paneName;
            activeTab.value = tabKey;
            queryParams.pageNo = 1;
            queryParams.status = activeTab.value === '' ? undefined : parseInt(tabKey);
            getRecordList();
        };
        /** 取消升级 */
        const emit = __emit; // 定义 success 事件，用于操作成功后的回调
        const handleCancelUpgrade = async (record) => {
            try {
                await message.confirm('确认要取消该设备的升级任务吗？');
                (await IoTOtaTaskRecordApi.cancelOtaTaskRecord(record.id)).data;
                message.success('取消成功');
                // 刷新数据
                await getRecordList();
                await getStatistics();
                await getTaskInfo();
                // 通知父组件刷新数据
                emit('success');
            }
            catch (error) {
                console.error('取消升级失败', error);
            }
        };
        /** 打开弹窗 */
        const open = (id) => {
            taskId.value = id;
            dialogVisible.value = true;
            // 重置数据
            activeTab.value = '';
            queryParams.pageNo = 1;
            queryParams.status = undefined;
            // 加载数据
            getTaskInfo();
            getStatistics();
            getRecordList();
        };
        /** 暴露方法 */
        __expose({ open });
        const __returned__ = { message, dialogVisible, taskId, taskLoading, task, taskStatisticsLoading, taskStatistics, recordLoading, recordList, recordTotal, queryParams, activeTab, statusTabs, getTaskInfo, getStatistics, getRecordList, handleTabClick, emit, handleCancelUpgrade, open, Pagination, get DICT_TYPE() { return DICT_TYPE; }, get IoTOtaTaskRecordStatusEnum() { return IoTOtaTaskRecordStatusEnum; }, get formatDate() { return formatDate; } };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
