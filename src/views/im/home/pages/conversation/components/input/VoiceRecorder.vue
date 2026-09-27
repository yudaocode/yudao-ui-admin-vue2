<template>
<!--
    语音录制面板
    - 三态机：idle 未录 / recording 录制中 / preview 试听阶段
    - 录制完成后可试听、重录或发送
    - 需浏览器支持 MediaRecorder（HTTPS 或 localhost）
    - 仅 idle 状态点击外部会关闭，避免录制 / 试听阶段被误关丢内容
  -->
  <div
    v-if="visible"
    ref="rootRef"
    class="im-popover-arrow absolute z-100 w-80 p-4 rounded-md bg-[var(--el-bg-color)] shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
    @click.stop
  >
    <div class="flex flex-col items-center gap-3">
      <!-- 计时：录制时累加；试听阶段定格在最终时长 -->
      <div class="text-[28px] font-medium tabular-nums text-[var(--el-text-color-primary)]">
        {{ timerText }}
      </div>

      <!-- 状态文案 -->
      <div class="text-13px text-[var(--el-text-color-secondary)]">
        <span v-if="status === 'idle'">点击下方按钮开始录制</span>
        <span v-else-if="status === 'recording'">录制中，最长 {{ maxDuration }} 秒</span>
        <span v-else>录制完成，可试听后发送</span>
      </div>

      <!-- idle / recording 阶段：脉冲圆点；preview 阶段：原生音频播放器 -->
      <div
        v-if="status !== 'preview'"
        class="w-12 h-12 rounded-full bg-[var(--el-border-color)]"
        :class="{ 'im-voice-recorder__pulse bg-[#f56c6c]': status === 'recording' }"
      ></div>
      <audio v-else :src="previewUrl" controls class="w-full"></audio>
    </div>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-2 mt-3">
      <template v-if="status === 'idle'">
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button size="small" type="primary" @click="startRecord">开始录制</el-button>
      </template>
      <template v-else-if="status === 'recording'">
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button size="small" type="primary" @click="stopRecord">停止录制</el-button>
      </template>
      <template v-else>
        <el-button size="small" @click="handleCancel">取消</el-button>
        <el-button size="small" @click="restart">重新录制</el-button>
        <el-button size="small" type="primary" @click="handleSend">发送</el-button>
      </template>
    </div>
  </div>
</template>
<script>
import { defineComponent as _defineComponent } from 'vue';
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue';
import { useMessage } from '@/views/im/utils/messageUi';
import { formatSeconds } from '@/utils/formatTime';
const __sfc__ = /*@__PURE__*/_defineComponent({
  ...{
    name: 'ImVoiceRecorder'
  },
  __name: 'VoiceRecorder',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    maxDuration: {
      type: Number,
      required: false,
      default: 60
    }
  },
  emits: ["update:modelValue", "send"],
  setup(__props, {
    expose: __expose,
    emit: __emit
  }) {
    __expose();
    const props = __props;
    const emit = __emit;
    const message = useMessage();
    const visible = computed({
      get: () => props.modelValue,
      set: v => emit('update:modelValue', v)
    });
    const rootRef = ref(null);

    /** 录制状态机：未开始 / 录制中 / 完成可试听 */
    const status = ref('idle');
    const duration = ref(0);
    const previewUrl = ref('');
    let mediaRecorder = null;
    let mediaStream = null;
    let timer = null;
    let recordedBlob = null;
    let recordedMimeType = '';
    let recordedExtension = 'webm';
    let recordOwner = null;
    let disposed = false;
    const VOICE_MIME_TYPE_OPTIONS = [{
      mimeType: 'audio/webm;codecs=opus',
      extension: 'webm'
    }, {
      mimeType: 'audio/webm',
      extension: 'webm'
    }, {
      mimeType: 'audio/mp4',
      extension: 'm4a'
    }, {
      mimeType: 'audio/ogg;codecs=opus',
      extension: 'ogg'
    }];

    /** 计时器展示文案：mm:ss */
    const timerText = computed(() => formatSeconds(duration.value));

    /** 仅在面板可见时挂全局点击监听；关闭时同步重置录制资源 */
    watch(visible, v => {
      if (v) {
        document.addEventListener('click', handleDocumentClick);
      } else {
        document.removeEventListener('click', handleDocumentClick);
        resetAll();
      }
    });

    /** 点击面板外部：仅 idle 状态自动关闭，避免录制 / 试听阶段被误关丢数据 */
    function handleDocumentClick(e) {
      if (!props.modelValue || !rootRef.value) {
        return;
      }
      if (rootRef.value.contains(e.target)) {
        return;
      }
      if (status.value !== 'idle') {
        return;
      }
      visible.value = false;
    }

    /** 开始录制：申请麦克风 + 启动 MediaRecorder + 启动每秒计时 */
    async function startRecord() {
      if (!navigator.mediaDevices?.getUserMedia) {
        message.error('当前浏览器不支持录音（需要 HTTPS 或 localhost）');
        return;
      }
      const owner = {};
      recordOwner = owner;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        if (disposed || !visible.value || recordOwner !== owner) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        mediaStream = stream;
      } catch {
        if (recordOwner !== owner) {
          return;
        }
        recordOwner = null;
        message.error('无法获取麦克风权限');
        return;
      }
      const voiceMimeType = getSupportedVoiceMimeType();
      if (!voiceMimeType) {
        recordOwner = null;
        message.error('当前浏览器不支持录音格式');
        cleanupStream();
        return;
      }
      const chunks = [];
      const recorder = new MediaRecorder(mediaStream, {
        mimeType: voiceMimeType.mimeType
      });
      mediaRecorder = recorder;
      recorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      });
      recorder.addEventListener('stop', () => {
        if (recordOwner !== owner || mediaRecorder !== recorder) {
          return;
        }
        recordOwner = null;
        mediaRecorder = null;
        recordedMimeType = voiceMimeType.mimeType;
        recordedExtension = voiceMimeType.extension;
        recordedBlob = new Blob(chunks, {
          type: recordedMimeType
        });
        previewUrl.value = URL.createObjectURL(recordedBlob);
        status.value = 'preview';
      });
      recorder.start();
      status.value = 'recording';
      duration.value = 0;
      timer = setInterval(() => {
        duration.value++;
        if (duration.value >= props.maxDuration) {
          stopRecord();
        }
      }, 1000);
    }

    /** 停止录制：进入 preview 阶段，由用户决定重录或发送；< 1s 视为误触，直接 warning + 回 idle 不进 preview */
    function stopRecord() {
      if (duration.value < 1) {
        message.warning('录音时间太短');
        resetAll();
        return;
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      cleanupStream();
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    /** 重新录制：丢掉当前预览，回到 idle 等待再次点击开始 */
    function restart() {
      clearPreview();
      duration.value = 0;
      status.value = 'idle';
    }

    /** 发送：把 blob + 时长上抛父级，由父级负责上传 */
    function handleSend() {
      if (!recordedBlob) {
        return;
      }
      emit('send', {
        blob: recordedBlob,
        duration: duration.value,
        extension: recordedExtension,
        mimeType: recordedMimeType
      });
      visible.value = false;
    }

    /** 取消：关闭面板，watch 内统一走 resetAll */
    function handleCancel() {
      visible.value = false;
    }

    /** 全量重置：录制流 / 计时 / 预览资源全部清掉 */
    function resetAll() {
      recordOwner = null;
      const recorder = mediaRecorder;
      mediaRecorder = null;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      cleanupStream();
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      recordedMimeType = '';
      recordedExtension = 'webm';
      duration.value = 0;
      status.value = 'idle';
      clearPreview();
    }

    /** 释放预览音频：撤销 ObjectURL 并清空 blob */
    function clearPreview() {
      recordedBlob = null;
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = '';
      }
    }

    /** 关闭麦克风采集：停止所有 track，浏览器顶栏录音指示熄灭 */
    function cleanupStream() {
      mediaStream?.getTracks().forEach(t => t.stop());
      mediaStream = null;
    }

    /** 查询浏览器支持的录音格式 */
    function getSupportedVoiceMimeType() {
      if (typeof MediaRecorder === 'undefined') {
        return undefined;
      }
      return VOICE_MIME_TYPE_OPTIONS.find(item => MediaRecorder.isTypeSupported(item.mimeType));
    }
    onMounted(() => {
      if (props.modelValue) {
        document.addEventListener('click', handleDocumentClick);
      }
    });
    onBeforeUnmount(() => {
      disposed = true;
      resetAll();
    });
    onUnmounted(() => {
      document.removeEventListener('click', handleDocumentClick);
    });
    const __returned__ = {
      props,
      emit,
      message,
      visible,
      rootRef,
      status,
      duration,
      previewUrl,
      get mediaRecorder() {
        return mediaRecorder;
      },
      set mediaRecorder(v) {
        mediaRecorder = v;
      },
      get mediaStream() {
        return mediaStream;
      },
      set mediaStream(v) {
        mediaStream = v;
      },
      get timer() {
        return timer;
      },
      set timer(v) {
        timer = v;
      },
      get recordedBlob() {
        return recordedBlob;
      },
      set recordedBlob(v) {
        recordedBlob = v;
      },
      get recordedMimeType() {
        return recordedMimeType;
      },
      set recordedMimeType(v) {
        recordedMimeType = v;
      },
      get recordedExtension() {
        return recordedExtension;
      },
      set recordedExtension(v) {
        recordedExtension = v;
      },
      get recordOwner() {
        return recordOwner;
      },
      set recordOwner(v) {
        recordOwner = v;
      },
      get disposed() {
        return disposed;
      },
      set disposed(v) {
        disposed = v;
      },
      VOICE_MIME_TYPE_OPTIONS,
      timerText,
      handleDocumentClick,
      startRecord,
      stopRecord,
      restart,
      handleSend,
      handleCancel,
      resetAll,
      clearPreview,
      cleanupStream,
      getSupportedVoiceMimeType
    };
    Object.defineProperty(__returned__, '__isScriptSetup', {
      enumerable: false,
      value: true
    });
    return __returned__;
  }
});
export default __sfc__;
</script>
<style scoped>

/* 底部小三角：指向触发图标，仿微信 PC 气泡指针；left 偏移对应语音按钮（工具栏 4th icon） */
.im-popover-arrow::after {
  position: absolute;
  top: calc(100% - 1px);
  left: 110px;
  border-color: var(--el-bg-color) transparent transparent transparent;
  border-style: solid;
  border-width: 6px 6px 0;
  content: '';
  filter: drop-shadow(0 2px 2px rgb(0 0 0 / 8%));
}

/* 录音中的脉冲呼吸动画；@keyframes 必须 CSS 定义 */
.im-voice-recorder__pulse {
  animation: im-voice-pulse 1s infinite;
}

@keyframes im-voice-pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(245 108 108 / 60%);
  }

  70% {
    box-shadow: 0 0 0 20px rgb(245 108 108 / 0%);
  }

  100% {
    box-shadow: 0 0 0 0 rgb(245 108 108 / 0%);
  }
}
</style>
