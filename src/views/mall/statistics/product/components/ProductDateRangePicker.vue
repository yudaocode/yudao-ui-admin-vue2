<template>
  <div class="product-date-range-picker">
    <el-radio-group
      v-model="shortcutDays"
      size="small"
      @change="handleShortcutDaysChange"
    >
      <el-radio-button :label="1">昨天</el-radio-button>
      <el-radio-button :label="7">最近7天</el-radio-button>
      <el-radio-button :label="30">最近30天</el-radio-button>
    </el-radio-group>
    <el-date-picker
      v-model="times"
      type="daterange"
      value-format="yyyy-MM-dd HH:mm:ss"
      format="yyyy-MM-dd"
      :default-time="['00:00:00', '23:59:59']"
      :picker-options="pickerOptions"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      unlink-panels
      class="product-date-range-picker__calendar"
      @change="handleDateRangeChange"
    />
  </div>
</template>

<script>
function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(String(value).replace(/-/g, '/'))
  if (Number.isNaN(date.getTime())) return ''
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
    ' ' + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':')
}

function createRange(start, end) {
  return [
    new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0),
    new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59)
  ]
}

function buildRecentRange(days) {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - Number(days))
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
  return createRange(start, end)
}

function toFormattedRange(range) {
  return [formatDateTime(range[0]), formatDateTime(range[1])]
}

function createPickerOptions() {
  return {
    shortcuts: [
      {
        text: '昨天',
        onClick(picker) {
          picker.$emit('pick', buildRecentRange(1))
        }
      },
      {
        text: '最近7天',
        onClick(picker) {
          picker.$emit('pick', buildRecentRange(7))
        }
      },
      {
        text: '本月',
        onClick(picker) {
          const today = new Date()
          const start = new Date(today.getFullYear(), today.getMonth(), 1)
          const end = today.getDate() === 1
            ? today
            : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          picker.$emit('pick', createRange(start, end))
        }
      },
      {
        text: '最近30天',
        onClick(picker) {
          picker.$emit('pick', buildRecentRange(30))
        }
      },
      {
        text: '最近1年',
        onClick(picker) {
          const today = new Date()
          const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
          const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)
          picker.$emit('pick', createRange(start, end))
        }
      }
    ]
  }
}

export default {
  name: 'ProductDateRangePicker',
  data() {
    return {
      shortcutDays: 7,
      times: [],
      pickerOptions: createPickerOptions()
    }
  },
  mounted() {
    this.handleShortcutDaysChange(this.shortcutDays)
  },
  methods: {
    handleShortcutDaysChange(days) {
      this.times = toFormattedRange(buildRecentRange(days))
      this.emitChange()
    },
    handleDateRangeChange(times) {
      this.shortcutDays = null
      this.times = Array.isArray(times)
        ? times.slice(0, 2).map(formatDateTime)
        : []
      this.emitChange()
    },
    emitChange() {
      this.$emit('change', this.times.slice())
    }
  }
}
</script>

<style lang="scss" scoped>
.product-date-range-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.product-date-range-picker__calendar {
  width: 260px;
}

@media (max-width: 640px) {
  .product-date-range-picker,
  .product-date-range-picker__calendar {
    width: 100%;
  }

  .product-date-range-picker {
    justify-content: flex-start;
  }
}
</style>
