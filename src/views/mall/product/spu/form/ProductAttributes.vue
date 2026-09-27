<template>
  <div>
    <el-col
      v-for="(item, index) in attributeList"
      :key="index"
    >
      <div>
        <span class="attribute-label">属性名：</span>
        <el-tag
          :closable="!isDetail"
          type="success"
          @close="handleCloseProperty(index)"
        >
          {{ item.name }}
        </el-tag>
      </div>
      <div class="attribute-values">
        <span class="attribute-label">属性值：</span>
        <el-tag
          v-for="(value, valueIndex) in item.values"
          :key="value.id"
          :closable="!isDetail"
          class="value-tag"
          @close="handleCloseValue(index, valueIndex)"
        >
          {{ value.name }}
        </el-tag>
        <el-select
          v-show="inputVisible(index)"
          :id="`input${index}`"
          ref="inputRefs"
          v-model="inputValue"
          :reserve-keyword="false"
          allow-create
          class="value-input"
          default-first-option
          filterable
          size="small"
          @blur="handleInputConfirm(index, item.id)"
          @change="handleInputConfirm(index, item.id)"
          @keyup.enter.native="handleInputConfirm(index, item.id)"
        >
          <el-option
            v-for="option in attributeOptions"
            :key="option.id"
            :label="option.name"
            :value="option.name"
          />
        </el-select>
        <el-button
          v-show="!inputVisible(index)"
          class="add-value"
          size="small"
          @click="showInput(index)"
        >
          + 添加
        </el-button>
      </div>
      <el-divider />
    </el-col>
  </div>
</template>

<script>
import { createPropertyValue, getPropertyValueSimpleList } from '@/api/mall/product/property'

export default {
  name: 'ProductAttributes',
  props: {
    propertyList: {
      type: Array,
      default: () => []
    },
    isDetail: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputValue: '',
      attributeIndex: null,
      attributeList: [],
      attributeOptions: []
    }
  },
  watch: {
    propertyList: {
      deep: true,
      immediate: true,
      handler(data) {
        if (data) this.attributeList = data
      }
    }
  },
  methods: {
    inputVisible(index) {
      return this.attributeIndex !== null && this.attributeIndex === index
    },
    handleCloseValue(index, valueIndex) {
      this.attributeList[index].values.splice(valueIndex, 1)
    },
    handleCloseProperty(index) {
      this.attributeList.splice(index, 1)
      this.$emit('success', this.attributeList)
    },
    async showInput(index) {
      this.attributeIndex = index
      this.$nextTick(() => {
        const input = this.$refs.inputRefs && this.$refs.inputRefs[index]
        if (input) input.focus()
      })
      await this.getAttributeOptions(this.attributeList[index].id)
    },
    async handleInputConfirm(index, propertyId) {
      if (this.inputValue) {
        const values = this.attributeList[index].values || []
        if (values.find(item => item.name === this.inputValue)) {
          this.$message.warning('已存在相同属性值，请重试')
          this.attributeIndex = null
          this.inputValue = ''
          return
        }

        const existValue = this.attributeOptions.find(item => item.name === this.inputValue)
        if (existValue) {
          values.push({ id: existValue.id, name: existValue.name })
          this.attributeList[index].values = values
          this.$emit('success', this.attributeList)
          this.attributeIndex = null
          this.inputValue = ''
          return
        }

        try {
          const response = await createPropertyValue({ propertyId, name: this.inputValue })
          values.push({ id: response.data, name: this.inputValue })
          this.attributeList[index].values = values
          this.$message.success(this.$t('common.createSuccess'))
          this.$emit('success', this.attributeList)
        } catch (error) {
          this.$message.error('添加失败，请重试')
        }
      }
      this.attributeIndex = null
      this.inputValue = ''
    },
    async getAttributeOptions(propertyId) {
      const response = await getPropertyValueSimpleList(propertyId)
      this.attributeOptions = response.data
    }
  }
}
</script>

<style scoped>
.attribute-label {
  color: #606266;
  margin-right: 8px;
}
.attribute-values {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 8px;
}
.value-tag {
  margin-right: 8px;
}
.value-input {
  width: 120px;
}
.add-value {
  margin-left: 4px;
}
</style>
