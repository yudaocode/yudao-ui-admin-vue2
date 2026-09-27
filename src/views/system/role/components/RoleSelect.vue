<template>
  <el-select
    v-model="innerValue"
    :multiple="multiple"
    :disabled="disabled"
    :clearable="clearable"
    filterable
    :loading="loading"
    :placeholder="placeholder"
    @change="handleChange"
  >
    <el-option
      v-for="item in roleList"
      :key="item.id"
      :label="item.name"
      :value="item.id"
    />
  </el-select>
</template>
<script>
import { getSimpleRoleList } from "@/api/system/role";
export default {
  name: "RoleSelect",
  props: {
    value: { type: [Number, Array], default: undefined },
    modelValue: { type: [Number, Array], default: undefined },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: true },
    placeholder: { type: String, default: "请选择角色" },
  },
  data() {
    return {
      loading: false,
      roleList: [],
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
    getSimpleRoleList()
      .then((response) => {
        this.roleList = response.data;
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
