<template>
  <div class="panel-tab__content">
    <el-table :data="elementPropertyList" size="mini" max-height="240" border fit>
      <el-table-column label="序号" width="50px" type="index" />
      <el-table-column label="属性名" prop="name" min-width="100px" show-overflow-tooltip />
      <el-table-column label="属性值" prop="value" min-width="100px" show-overflow-tooltip />
      <el-table-column label="操作" width="90px">
        <template v-slot="{ row, $index }">
          <el-button size="mini" type="text" @click="openAttributesForm(row, $index)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button size="mini" type="text" style="color: #ff4d4f" @click="removeAttributes(row, $index)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="element-drawer__button">
      <el-button size="mini" type="primary" icon="el-icon-plus" @click="openAttributesForm(null, -1)">添加属性</el-button>
    </div>

    <el-dialog :visible.sync="propertyFormModelVisible" title="属性配置" width="600px" append-to-body destroy-on-close>
      <el-form :model="propertyForm" label-width="80px" size="mini" ref="attributeFormRef" @submit.native.prevent>
        <el-form-item label="属性名：" prop="name">
          <el-input v-model="propertyForm.name" clearable />
        </el-form-item>
        <el-form-item label="属性值：" prop="value">
          <el-input v-model="propertyForm.value" clearable />
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button size="mini" @click="propertyFormModelVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="saveAttribute">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "ElementProperties",
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: "prefix",
    width: "width"
  },
  data() {
    return {
      elementPropertyList: [],
      propertyForm: {},
      editingPropertyIndex: -1,
      propertyFormModelVisible: false
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.resetAttributesList();
      }
    }
  },
  methods: {
    resetAttributesList() {
      // The panel can mount before the modeler has finished importing XML.
      // Treat that first callback as a no-op; the id watcher will invoke this
      // again after the active element is available.
      const instances = typeof window !== 'undefined' ? window.bpmnInstances : null;
      if (!instances || !instances.bpmnElement) return;
      this.bpmnElement = instances.bpmnElement;
      const extensionValues = this.bpmnElement.businessObject?.extensionElements?.values || [];
      // Ignore malformed null entries from imported extension JSON.  Passing
      // one to moddle.create later makes an otherwise valid property edit
      // fail, while the current Vue3 implementation assumes every item is a
      // moddle object.
      this.otherExtensionList = extensionValues.filter(
        ex => ex && ex.$type !== `${this.prefix}:Properties`
      );
      this.bpmnElementProperties = extensionValues.filter(
        ex => ex && ex.$type === `${this.prefix}:Properties`
      );

      // 保存所有的 扩展属性字段
      this.bpmnElementPropertyList = this.bpmnElementProperties.reduce(
        (pre, current) => pre.concat(Array.isArray(current.values) ? current.values : []),
        []
      );
      // 复制 显示
      this.elementPropertyList = JSON.parse(JSON.stringify(this.bpmnElementPropertyList ?? []));
    },
    openAttributesForm(attr, index) {
      this.editingPropertyIndex = index;
      this.propertyForm = index === -1 ? {} : JSON.parse(JSON.stringify(attr));
      this.propertyFormModelVisible = true;
      this.$nextTick(() => {
        if (this.$refs["attributeFormRef"]) this.$refs["attributeFormRef"].clearValidate();
      });
    },
    removeAttributes(attr, index) {
      this.$confirm("确认移除该属性吗？", "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      })
        .then(() => {
          const instances = typeof window !== 'undefined' ? window.bpmnInstances : null;
          if (!instances || !instances.moddle || !this.bpmnElementPropertyList) return;
          this.elementPropertyList.splice(index, 1);
          this.bpmnElementPropertyList.splice(index, 1);
          // 新建一个属性字段的保存列表
          const propertiesObject = instances.moddle.create(`${this.prefix}:Properties`, {
            values: this.bpmnElementPropertyList
          });
          this.updateElementExtensions(propertiesObject);
          this.resetAttributesList();
        })
        .catch(() => console.info("操作取消"));
    },
    saveAttribute() {
      const { name, value } = this.propertyForm;
      const instances = typeof window !== 'undefined' ? window.bpmnInstances : null;
      if (!instances || !instances.moddle || !instances.modeling || !this.bpmnElement || !this.bpmnElementPropertyList) return;
      console.log(this.bpmnElementPropertyList);
      if (this.editingPropertyIndex !== -1) {
        instances.modeling.updateModdleProperties(this.bpmnElement, this.bpmnElementPropertyList[this.editingPropertyIndex], {
          name,
          value
        });
      } else {
        // 新建属性字段
        const newPropertyObject = instances.moddle.create(`${this.prefix}:Property`, { name, value });
        // 新建一个属性字段的保存列表
        const propertiesObject = instances.moddle.create(`${this.prefix}:Properties`, {
          values: this.bpmnElementPropertyList.concat([newPropertyObject])
        });
        this.updateElementExtensions(propertiesObject);
      }
      this.propertyFormModelVisible = false;
      this.resetAttributesList();
    },
    updateElementExtensions(properties) {
      const instances = typeof window !== 'undefined' ? window.bpmnInstances : null;
      if (!instances || !instances.bpmnElement || !instances.moddle || !instances.modeling) return;
      const extensions = instances.moddle.create("bpmn:ExtensionElements", {
        values: this.otherExtensionList.concat([properties])
      });
      instances.modeling.updateProperties(this.bpmnElement, {
        extensionElements: extensions
      });
    }
  }
};
</script>
