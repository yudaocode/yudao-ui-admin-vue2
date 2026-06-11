<template>
  <div class="app-container">
    <!-- 表单设计器 -->
    <div class="fc-designer-wrapper">
      <fc-designer class="my-designer" ref="designer" :config="designerConfig">
        <template slot="handle">
          <el-button size="small" type="success" plain @click="handleSave">
            <i class="el-icon-plus" /> 保存
          </el-button>
        </template>
      </fc-designer>
    </div>

    <!-- 表单保存的弹窗 -->
    <el-dialog title="保存表单" :visible.sync="dialogVisible" width="600px" append-to-body>
      <el-form ref="form" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="表单名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入表单名" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio v-for="dict in this.getDictDatas(DICT_TYPE.COMMON_STATUS)"
                      :key="dict.value" :label="parseInt(dict.value)">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" :disabled="formLoading" @click="submitForm">确 定</el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createForm, updateForm, getForm } from "@/api/bpm/form";
import { CommonStatusEnum } from "@/utils/constants";
import { encodeConf, encodeFields, setConfAndFields } from "@/utils/formCreate";
import { useFormCreateDesigner } from "@/components/FormCreate/src/useFormCreateDesigner";

export default {
  name: "BpmFormEditor",
  data() {
    return {
      // 表单设计器配置
      designerConfig: {
        switchType: [], // 是否可以切换组件类型,或者可以相互切换的字段
        autoActive: true, // 是否自动选中拖入的组件
        useTemplate: false, // 是否生成 vue2 语法的模板组件
        formOptions: {
          form: {
            labelWidth: '100px' // 设置默认的 label 宽度为 100px
          }
        },
        fieldReadonly: false, // 配置 field 是否可以编辑
        hiddenDragMenu: false, // 隐藏拖拽操作按钮
        hiddenDragBtn: false, // 隐藏拖拽按钮
        hiddenMenu: [], // 隐藏部分菜单
        hiddenItem: [], // 隐藏部分组件
        hiddenItemConfig: {}, // 隐藏组件的部分配置项
        disabledItemConfig: {}, // 禁用组件的部分配置项
        showSaveBtn: false, // 是否显示保存按钮
        showConfig: true, // 是否显示右侧的配置界面
        showBaseForm: true, // 是否显示组件的基础配置表单
        showControl: true, // 是否显示组件联动
        showPropsForm: true, // 是否显示组件的属性配置表单
        showEventForm: true, // 是否显示组件的事件配置表单
        showValidateForm: true, // 是否显示组件的验证配置表单
        showFormConfig: true, // 是否显示表单配置
        showInputData: true, // 是否显示录入按钮
        showDevice: true, // 是否显示多端适配选项
        appendConfigData: [] // 定义渲染规则所需的 formData
      },
      // 弹窗
      dialogVisible: false,
      formLoading: false,
      // 表单保存参数
      formData: {
        id: undefined,
        name: '',
        status: CommonStatusEnum.ENABLE,
        remark: ''
      },
      formRules: {
        name: [{ required: true, message: "表单名不能为空", trigger: "blur" }],
        status: [{ required: true, message: "开启状态不能为空", trigger: "blur" }]
      }
    };
  },
  created() {
    const formId = this.$route.query.formId;
    if (formId) {
      getForm(formId).then(response => {
        const data = response.data;
        this.formData = {
          id: data.id,
          name: data.name,
          status: data.status,
          remark: data.remark
        };
        // 设置设计器的表单配置与字段
        this.$nextTick(() => {
          setConfAndFields(this.$refs.designer, data.conf, data.fields);
        });
      });
    }
  },
  mounted() {
    this.$nextTick(() => {
      useFormCreateDesigner(this.$refs.designer);
    });
  },
  methods: {
    /** 点击保存，打开弹窗 */
    handleSave() {
      this.dialogVisible = true;
    },
    /** 提交表单 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (!valid) {
          return;
        }
        this.formLoading = true;
        const data = {
          ...this.formData,
          conf: encodeConf(this.$refs.designer), // 表单配置
          fields: encodeFields(this.$refs.designer) // 表单字段
        };
        const promise = data.id
          ? updateForm(data)
          : createForm(data);
        promise.then(() => {
          this.$modal.msgSuccess(data.id ? "修改成功" : "新增成功");
          this.dialogVisible = false;
          this.formLoading = false;
          // 关闭当前标签页并返回列表
          this.$tab.closeOpenPage({ path: "/bpm/manager/form" });
        }).catch(() => {
          this.formLoading = false;
        });
      });
    }
  }
};
</script>

<style lang="scss">
.fc-designer-wrapper {
  height: calc(100vh - 120px);

  .my-designer {
    height: 100%;

    ._fc-l,
    ._fc-m,
    ._fc-r {
      border-top: none;
    }

    /* 加宽右侧「组件配置/表单配置」面板，避免字段标签被裁剪 */
    ._fc-r {
      width: 380px !important;
    }
  }
}
</style>
