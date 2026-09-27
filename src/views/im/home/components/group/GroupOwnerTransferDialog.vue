<template>

  <!--
    转让群主：选 1 位新群主 → 二次确认 → transferGroupOwner
    - dialog 壳本组件持有；选择 UI 委托 GroupMemberPickerPanel
    - 当前用户从候选里隐藏（不能转给自己）
    - maxSize=1 限定单选
    - 对外接口：ref + open({ groupId, members, hideIds }) + emit reload()
  -->
  <el-dialog
    :visible.sync="visible"
    title="选择新群主"
    width="700px"
    :close-on-click-modal="false"
    class="im-picker-dialog"
  >
    <div class="h-[480px]">
      <GroupMemberPickerPanel
        :selected-ids="selectedIds"
        @update:selectedIds="selectedIds = $event"
        :members="members"
        :hide-ids="hideIds"
        :max-size="1"
      />
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="selectedIds.length === 0"
        @click="handleOk"
      >
        确定
      </el-button>
    </template>
  </el-dialog>

</template>
<script>
import { defineComponent as _defineComponent } from 'vue';
import { computed, ref } from 'vue';
import { useMessage } from '@/views/im/utils/messageUi';
import { transferGroupOwner } from '@/api/im/group';
import GroupMemberPickerPanel from '../picker/GroupMemberPickerPanel.vue';
export default /*#__PURE__*/_defineComponent({
  components: {
    GroupMemberPickerPanel
  },
  __name: 'GroupOwnerTransferDialog',
  setup(__props, {
    expose,
    emit
  }) {
    const message = useMessage();
    const visible = ref(false);
    const submitting = ref(false);
    const groupId = ref(0);
    const members = ref([]);
    const hideIds = ref([]);
    const selectedIds = ref([]);
    expose({
      /** 打开转让群主弹窗：reset → 灌参 → visible=true */
      open(opts) {
        groupId.value = opts.groupId;
        members.value = opts.members;
        hideIds.value = opts.hideIds ? [...opts.hideIds] : [];
        selectedIds.value = [];
        submitting.value = false;
        visible.value = true;
      }
    });

    /** 选中的新群主对象（取数组首项） */
    const newOwner = computed(() => {
      if (selectedIds.value.length === 0) {
        return undefined;
      }
      return members.value.find(member => member.userId === selectedIds.value[0]);
    });

    /** 二次确认转让：转让后旧群主降为普通成员，无法撤销 */
    async function handleOk() {
      const targetGroupId = groupId.value;
      const newOwnerUserId = newOwner.value?.userId;
      const newOwnerName = newOwner.value?.showName;
      if (!targetGroupId || !newOwnerUserId) {
        return;
      }
      try {
        await message.confirm(`确定将群主转让给 ${newOwnerName}？转让后你将变为普通成员，无法撤销。`, '确认转让群主');
      } catch {
        return;
      }
      submitting.value = true;
      try {
        await transferGroupOwner({
          id: targetGroupId,
          newOwnerUserId
        });
        message.success('群主转让成功');
        emit('reload');
        visible.value = false;
      } catch (error) {
        console.warn('[IM GroupOwnerTransferDialog] 转让群主失败', error);
      } finally {
        submitting.value = false;
      }
    }
    const __returned__ = {
      emit,
      message,
      visible,
      submitting,
      groupId,
      members,
      hideIds,
      selectedIds,
      newOwner,
      handleOk,
      GroupMemberPickerPanel
    };
    Object.defineProperty(__returned__, '__isScriptSetup', {
      enumerable: false,
      value: true
    });
    return __returned__;
  }
});
</script>
<style scoped lang="scss">

@use '../picker/picker-dialog' as picker;

/* :deep 穿透 el-dialog 内部类；复用 picker 公共 mixin */
.im-picker-dialog {
  @include picker.styles;
}

</style>
