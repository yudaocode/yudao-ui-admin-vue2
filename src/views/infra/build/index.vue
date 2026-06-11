<template>
  <div class="app-container">
    <!-- 表单设计器 -->
    <div class="fc-designer-wrapper">
      <fc-designer class="my-designer" ref="designer" :config="designerConfig">
        <template slot="handle">
          <el-button size="small" type="primary" plain @click="showJson">生成JSON</el-button>
          <el-button size="small" type="success" plain @click="showOption">生成Options</el-button>
          <el-button size="small" type="danger" plain @click="showTemplate">生成组件</el-button>
        </template>
      </fc-designer>
    </div>

    <!-- 弹窗：表单预览 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="800px" append-to-body>
      <div v-if="dialogVisible">
        <el-button style="float: right" @click="copy">复制</el-button>
        <el-scrollbar style="height: 560px">
          <pre><code class="hljs">{{ formDataText }}</code></pre>
        </el-scrollbar>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import formCreate from '@form-create/element-ui'
import { useFormCreateDesigner } from '@/components/FormCreate/src/useFormCreateDesigner'

export default {
  name: 'InfraBuild',
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
      dialogTitle: '',
      // 表单的类型：0 - 生成 JSON；1 - 生成 Options；2 - 生成组件
      formType: -1,
      // 表单数据
      formData: ''
    };
  },
  computed: {
    // 预览文本：JSON / Options 序列化为字符串，组件直接展示模板字符串
    formDataText() {
      if (this.formType === 2) {
        return this.formData;
      }
      if (typeof this.formData === 'string') {
        return this.formData;
      }
      return JSON.stringify(this.formData, null, 2);
    }
  },
  mounted() {
    this.$nextTick(() => {
      useFormCreateDesigner(this.$refs.designer);
    });
  },
  methods: {
    /** 打开弹窗 */
    openModel(title) {
      this.dialogVisible = true;
      this.dialogTitle = title;
    },
    /** 生成 JSON */
    showJson() {
      this.openModel('生成 JSON');
      this.formType = 0;
      this.formData = this.$refs.designer.getRule();
    },
    /** 生成 Options */
    showOption() {
      this.openModel('生成 Options');
      this.formType = 1;
      this.formData = this.$refs.designer.getOption();
    },
    /** 生成组件 */
    showTemplate() {
      this.openModel('生成组件');
      this.formType = 2;
      this.formData = this.makeTemplate();
    },
    makeTemplate() {
      const rule = this.$refs.designer.getRule();
      const opt = this.$refs.designer.getOption();
      return `<template>
  <form-create
    v-model="fApi"
    :rule="rule"
    :option="option"
    @submit="onSubmit"
  ></form-create>
</template>
<script>
import formCreate from '@form-create/element-ui'
export default {
  data() {
    return {
      fApi: {},
      rule: formCreate.parseJson('${formCreate.toJson(rule).replace(/\\/g, '\\\\')}'),
      option: formCreate.parseJson('${JSON.stringify(opt)}')
    }
  },
  methods: {
    onSubmit(formData) {
      // todo 提交表单
    }
  }
}
<\/script>`;
    },
    /** 复制 */
    copy() {
      const textToCopy = this.formDataText;
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        this.$modal.msgSuccess('复制成功');
      } catch (e) {
        this.$modal.msgError('复制失败');
      }
      document.body.removeChild(textarea);
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
