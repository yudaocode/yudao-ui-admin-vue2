<template>
  <div class="operate-log-v2">
    <el-timeline>
      <el-timeline-item
        v-for="(log, index) in logList"
        :key="index"
        :timestamp="parseTime(log.createTime)"
        placement="top"
      >
        <div class="el-timeline-right-content">
          <el-tag class="mr-10" type="success">{{ log.userName }}</el-tag>
          {{ log.action }}
        </div>
        <template slot="dot">
          <span :style="{ backgroundColor: getUserTypeColor(log.userType) }" class="dot-node-style">
            {{ getUserTypeLabel(log.userType) }}
          </span>
        </template>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
/**
 * OperateLogV2 某个记录的操作日志时间线（主要用于 CRM 客户、商机等详情界面）
 * 对齐 Vue3 版本契约：props.logList，消费方通过 getOperateLogPage（@/api/system/operateLog）加载
 */
import { DICT_TYPE, getDictDataLabel, getDictObj } from '@/utils/dict'

export default {
  name: 'OperateLogV2',
  props: {
    // 操作日志列表
    logList: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    parseTime(time) {
      return this.$parseTime ? this.$parseTime(time) : (time || '')
    },
    getUserTypeLabel(type) {
      const label = getDictDataLabel(DICT_TYPE.USER_TYPE, type)
      return label ? String(label).charAt(0) : ''
    },
    /** 获得 userType 颜色 */
    getUserTypeColor(type) {
      const dict = getDictObj(DICT_TYPE.USER_TYPE, type)
      switch (dict && dict.colorType) {
        case 'success':
          return '#67C23A'
        case 'info':
          return '#909399'
        case 'warning':
          return '#E6A23C'
        case 'danger':
          return '#F56C6C'
      }
      return '#409EFF'
    }
  }
}
</script>

<style lang="scss" scoped>
.mr-10 {
  margin-right: 10px;
}

// 时间线样式调整
.operate-log-v2 ::v-deep .el-timeline {
  margin: 10px 0 0 110px;

  .el-timeline-item__wrapper {
    position: relative;
    top: -20px;

    .el-timeline-item__timestamp {
      position: absolute !important;
      top: 10px;
      left: -150px;
    }
  }

  .el-timeline-right-content {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 30px;
    padding: 10px;
    background-color: #fff;

    &::before {
      position: absolute;
      top: 10px;
      left: -3px; /* 尖角指向时间线圆点 */
      border-color: transparent #fff transparent transparent; /* 尖角颜色，左侧朝向 */
      border-style: solid;
      border-width: 8px; /* 调整尖角大小 */
      content: ''; /* 必须设置 content 属性 */
    }
  }
}

.dot-node-style {
  position: absolute;
  left: -5px;
  display: flex;
  width: 20px;
  height: 20px;
  font-size: 10px;
  color: #fff;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
}
</style>
