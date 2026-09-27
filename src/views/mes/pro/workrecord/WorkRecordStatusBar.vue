<!-- 我的工作站 - 上下工状态栏 -->
<template>
  <div class="status-bar"><div class="status-left"><strong>我的工作站</strong><el-divider direction="vertical" /><template v-if="isClockIn"><el-tag
                            type="success"
                            effect="plain"
                          ><i class="el-icon-check" /> {{ myWorkstation.workstationCode }} - {{ myWorkstation.workstationName }}</el-tag><span class="clock-time">上工时间：{{ formatDate(myWorkstation.clockInTime) }}</span></template><el-tag
                            v-else
                            type="info"
                            effect="plain"
                          >当前未上工</el-tag></div>
    <div><el-popover
      v-if="!isClockIn"
      v-model="clockInPopoverVisible"
      placement="bottom-end"
      width="320"
      trigger="click"
    ><el-button
      slot="reference"
      type="success"
      plain
      icon="el-icon-video-play"
    >上工</el-button><div><p class="popover-title">选择工作站</p><md-workstation-select
      v-model="selectedWorkstationId"
      placeholder="请选择工作站"
    /><div class="popover-actions"><el-button
      size="mini"
      @click="clockInPopoverVisible = false"
    >取消</el-button><el-button
      size="mini"
      type="success"
      :disabled="!selectedWorkstationId"
      @click="handleClockIn"
    >确认上工</el-button></div></div></el-popover><el-button
      v-if="isClockIn"
      type="danger"
      plain
      icon="el-icon-video-pause"
      @click="handleClockOut"
    >下工</el-button></div>
  </div>
</template>

<script>
import { formatDate } from '@/utils/formatTime'
import { ProWorkRecordApi } from '@/api/mes/pro/workrecord'
import MdWorkstationSelect from '@/views/mes/md/workstation/components/MdWorkstationSelect.vue'
import { MesProWorkRecordTypeEnum } from '@/views/mes/utils/constants'

export default {
  name: 'WorkRecordStatusBar', components: { MdWorkstationSelect },
  data() { return { myWorkstation: null, clockInPopoverVisible: false, selectedWorkstationId: undefined } },
  computed: { isClockIn() { return this.myWorkstation && this.myWorkstation.type === MesProWorkRecordTypeEnum.CLOCK_IN } },
  created() { this.loadMyWorkstation() },
  methods: {
    formatDate,
    async loadMyWorkstation() { const response = await ProWorkRecordApi.getMyWorkRecord(); this.myWorkstation = response.data },
    async handleClockIn() { if (!this.selectedWorkstationId) return; try { await ProWorkRecordApi.clockInWorkRecord(this.selectedWorkstationId); this.$modal.msgSuccess('上工成功'); this.clockInPopoverVisible = false; this.selectedWorkstationId = undefined; await this.loadMyWorkstation(); this.$emit('change') } catch (error) { /* request error is surfaced globally */ } },
    async handleClockOut() { try { await this.$modal.confirm('确认下工当前工作站？'); await ProWorkRecordApi.clockOutWorkRecord(); this.$modal.msgSuccess('下工成功'); await this.loadMyWorkstation(); this.$emit('change') } catch (error) { /* canceled or request failure */ } }
  }
}
</script>

<style scoped>.status-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 16px; border: 1px solid #ebeef5; border-radius: 8px; background: #f5f7fa; }.status-left { display: flex; align-items: center; gap: 8px; }.clock-time { margin-left: 4px; color: #909399; font-size: 13px; }.popover-title { margin: 0 0 8px; font-weight: bold; }.popover-actions { margin-top: 12px; text-align: right; }</style>
