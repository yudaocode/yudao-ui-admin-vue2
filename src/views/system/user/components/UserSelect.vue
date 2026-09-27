<template>
  <el-select
    v-model="innerValue"
    :disabled="disabled"
    :clearable="clearable"
    filterable
    :loading="loading"
    :placeholder="placeholder"
    @change="handleChange"
  >
    <el-option
      v-for="item in userList"
      :key="item.id"
      :label="item.nickname"
      :value="item.id"
      ><span>{{ item.nickname }}</span
      ><span v-if="item.deptName" style="float: right; color: #999">{{
        item.deptName
      }}</span></el-option
    >
  </el-select>
</template>
<script>
import { getSimpleUserList } from "@/api/system/user";
export default {
  name: "UserSelect",
  props: {
    value: { type: [Number, String], default: undefined },
    modelValue: { type: [Number, String], default: undefined },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: "请选择用户" },
  },
  data() {
    return {
      loading: false,
      userList: [],
      innerValue: this.value !== undefined ? this.value : this.modelValue,
    };
  },
  watch: {
    value(value) {
      this.innerValue = value;
    },
    modelValue(value) {
      if (this.value === undefined) this.innerValue = value;
    },
  },
  created() {
    this.loading = true;
    getSimpleUserList()
      .then((response) => {
        this.userList = response.data;
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    handleChange(value) {
      this.$emit("input", value);
      this.$emit("update:modelValue", value);
      this.$emit("change", value);
    },
  },
};
</script>
