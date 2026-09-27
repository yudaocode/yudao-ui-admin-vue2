<template>
  <div class="panel-tab__content">
    <div class="element-property input-property">
      <div class="element-property__label">元素文档：</div>
      <div class="element-property__value">
        <el-input
          type="textarea"
          v-model="documentation"
          size="mini"
          resize="vertical"
          :autosize="{ minRows: 2, maxRows: 4 }"
          @input="updateDocumentation"
          @blur="updateDocumentation"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ElementOtherConfig",
  props: {
    id: String
  },
  data() {
    return {
      documentation: ""
    };
  },
  watch: {
    id: {
      immediate: true,
      handler: function(id) {
        if (id && id.length) {
          this.$nextTick(() => {
            const instances = typeof window !== 'undefined' ? window.bpmnInstances : null;
            const element = instances && (instances.elementRegistry && instances.elementRegistry.get(id) || instances.bpmnElement);
            const documentations = element && element.businessObject && element.businessObject.documentation;
            this.documentation = documentations && documentations.length ? documentations[0].text : "";
          });
        } else {
          this.documentation = "";
        }
      }
    }
  },
  methods: {
    updateDocumentation() {
      const instances = typeof window !== 'undefined' ? window.bpmnInstances : null;
      if (!instances || !instances.modeling || !instances.bpmnFactory || !this.id) return;
      (this.bpmnElement && this.bpmnElement.id === this.id) || (this.bpmnElement = instances.elementRegistry && instances.elementRegistry.get(this.id));
      if (!this.bpmnElement) return;
      const documentation = instances.bpmnFactory.create("bpmn:Documentation", { text: this.documentation });
      instances.modeling.updateProperties(this.bpmnElement, {
        documentation: [documentation]
      });
    }
  },
  beforeDestroy() {
    this.bpmnElement = null;
  }
};
</script>
