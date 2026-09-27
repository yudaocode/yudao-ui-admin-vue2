<template>
<div class="iot-vue2-root">

  <el-dialog :visible.sync="dialogVisible" title="设备导入" width="400">
    <el-upload
      ref="uploadRef"
      :file-list="fileList"
      :on-change="handleFileChange"
      :action="importUrl + '?updateSupport=' + updateSupport"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      accept=".xlsx, .xls"
      drag
    >
      <Icon icon="ep:upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            是否更新已经存在的设备数据
          </div>
          <span>仅允许导入 xls、xlsx 格式文件。</span>
          <el-link
            :underline="false"
            style="font-size: 12px; vertical-align: baseline"
            type="primary"
            @click="importTemplate"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </el-dialog>

</div>
</template>
<script>
import '@/views/iot/styles/vue2.css';
import { createIotMessage } from '@/views/iot/utils/ui';
import IotIcon from '@/views/iot/components/IotIcon.vue';
import { ref, nextTick } from 'vue';
import { defineComponent as _defineComponent } from 'vue';
import { DeviceApi } from '@/api/iot/device/device';
import { getAccessToken, getTenantId } from '@/utils/auth';
import download from '@/plugins/download';
export default /*@__PURE__*/ _defineComponent({
    ...{ name: 'IoTDeviceImportForm' },
    components: {
        Icon: IotIcon,
    },
    __name: 'DeviceImportForm',
    emits: ['success'],
    setup(__props, { expose: __expose, emit: __emit }) {
        const message = createIotMessage(); // 消息弹窗
        const dialogVisible = ref(false); // 弹窗的是否展示
        const formLoading = ref(false); // 表单的加载中
        const uploadRef = ref();
        const importUrl = process.env.VUE_APP_BASE_API + '/admin-api/iot/device/import';
        const uploadHeaders = ref(); // 上传 Header 头
        const fileList = ref([]); // 文件列表
        const updateSupport = ref(0); // 是否更新已经存在的设备数据
        /** 打开弹窗 */
        const open = () => {
            dialogVisible.value = true;
            updateSupport.value = 0;
            fileList.value = [];
            resetForm();
        };
        __expose({ open }); // 提供 open 方法，用于打开弹窗
        /** 文件选择变化：Element UI 的 el-upload 不支持 file-list 双向绑定，需手动同步（对齐源 v-model:file-list） */
        const handleFileChange = (file, files) => {
            fileList.value = files;
        };
        /** 提交表单 */
        const submitForm = async () => {
            if (fileList.value.length === 0) {
                message.error('请上传文件');
                return;
            }
            // 提交请求
            uploadHeaders.value = {
                Authorization: 'Bearer ' + getAccessToken(),
                'tenant-id': getTenantId()
            };
            formLoading.value = true;
            uploadRef.value.submit();
        };
        /** 文件上传成功 */
        const emits = __emit;
        const submitFormSuccess = (response) => {
            if (response.code !== 0) {
                message.error(response.msg);
                formLoading.value = false;
                return;
            }
            // 拼接提示语
            const data = response.data;
            let text = '上传成功数量：' + data.createDeviceNames.length + ';';
            for (const deviceName of data.createDeviceNames) {
                text += '< ' + deviceName + ' >';
            }
            text += '更新成功数量：' + data.updateDeviceNames.length + ';';
            for (const deviceName of data.updateDeviceNames) {
                text += '< ' + deviceName + ' >';
            }
            text += '更新失败数量：' + Object.keys(data.failureDeviceNames).length + ';';
            for (const deviceName in data.failureDeviceNames) {
                text += '< ' + deviceName + ': ' + data.failureDeviceNames[deviceName] + ' >';
            }
            message.alert(text);
            formLoading.value = false;
            dialogVisible.value = false;
            // 发送操作成功的事件
            emits('success');
        };
        /** 上传错误提示 */
        const submitFormError = () => {
            message.error('上传失败，请您重新上传！');
            resetForm();
        };
        /** 重置表单 */
        const resetForm = async () => {
            // 重置上传状态和文件
            formLoading.value = false;
            await nextTick();
            uploadRef.value?.clearFiles();
        };
        /** 文件数超出提示 */
        const handleExceed = () => {
            message.error('最多只能上传一个文件！');
        };
        /** 下载模板操作 */
        const importTemplate = async () => {
            const res = await DeviceApi.importDeviceTemplate();
            download.excel(res, '设备导入模版.xls');
        };
        const __returned__ = { Icon: IotIcon, message, dialogVisible, formLoading, uploadRef, importUrl, uploadHeaders, fileList, updateSupport, open, handleFileChange, submitForm, emits, submitFormSuccess, submitFormError, resetForm, handleExceed, importTemplate };
        Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
        return __returned__;
    }
});

</script>
