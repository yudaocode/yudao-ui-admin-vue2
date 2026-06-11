<template>
  <div class="process-design-step">
    <el-alert
      v-if="!modelData.key || !modelData.name"
      title="请先完善流程标识和流程名称"
      type="warning"
      :closable="false"
      show-icon
    />

    <template v-else-if="modelData.type === BpmModelType.SIMPLE">
      <SimpleProcessDesigner
        ref="simpleDesigner"
        v-model="modelData.simpleModel"
        :model-name="modelData.name"
        :model-form-id="modelData.formId"
        :model-form-type="modelData.formType"
        :start-user-ids="modelData.startUserIds"
        :start-dept-ids="modelData.startDeptIds"
        @success="handleSimpleSave"
      />
    </template>

    <template v-else>
      <div class="bpmn-designer-wrapper">
        <my-process-designer
          v-if="modelData.bpmnXml !== undefined"
          ref="processDesigner"
          v-model="modelData.bpmnXml"
          v-bind="controlForm"
          keyboard
          @init-finished="initModeler"
          @save="handleBpmnSave"
        />
        <my-properties-panel
          v-if="modeler"
          :bpmn-modeler="modeler"
          :prefix="controlForm.prefix"
          class="process-panel"
          :model="modelData"
        />
      </div>
    </template>
  </div>
</template>

<script>
import translations from '@/components/bpmnProcessDesigner/src/translations'
import CustomContentPadProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/content-pad'
import CustomPaletteProvider from '@/components/bpmnProcessDesigner/package/designer/plugins/palette'
import { BpmModelFormType, BpmModelType } from '@/utils/constants'
import { SimpleProcessDesigner } from '@/components/SimpleProcessDesignerV2/src'

function escapeXml(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function createDefaultBpmnXml(key, name) {
  const processId = escapeXml(key || 'Process')
  const processName = escapeXml(name || '流程')
  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="${processId}" name="${processName}" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1" name="开始">
      <bpmn2:outgoing>Flow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:userTask id="Activity_1" name="审批">
      <bpmn2:incoming>Flow_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:endEvent id="EndEvent_1" name="结束">
      <bpmn2:incoming>Flow_2</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn2:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="EndEvent_1" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="392" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="392" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`
}

export default {
  name: 'BpmModelProcessDesign',
  components: {
    SimpleProcessDesigner
  },
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      BpmModelType,
      BpmModelFormType,
      modeler: null,
      translationsSelf: translations,
      controlForm: {
        simulation: true,
        labelEditing: false,
        labelVisible: false,
        prefix: 'flowable',
        headerButtonSize: 'mini',
        additionalModel: [CustomContentPadProvider, CustomPaletteProvider]
      }
    }
  },
  computed: {
    modelData: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('input', value)
      }
    }
  },
  watch: {
    'modelData.type': {
      immediate: true,
      handler() {
        this.initProcessData()
      }
    },
    'modelData.key'() {
      this.initProcessData()
    },
    'modelData.name'() {
      this.initProcessData()
    }
  },
  methods: {
    initProcessData() {
      if (this.modelData.type === BpmModelType.BPMN && this.modelData.bpmnXml === undefined && this.modelData.key && this.modelData.name) {
        this.$set(this.modelData, 'bpmnXml', createDefaultBpmnXml(this.modelData.key, this.modelData.name))
      }
      if (this.modelData.type === BpmModelType.SIMPLE && !this.modelData.simpleModel) {
        this.$set(this.modelData, 'simpleModel', undefined)
      }
    },
    initModeler(modeler) {
      setTimeout(() => {
        this.modeler = modeler
      }, 10)
    },
    handleBpmnSave(bpmnXml) {
      this.$set(this.modelData, 'bpmnXml', bpmnXml)
      this.$message.success('BPMN 流程图已保存到当前模型')
    },
    handleSimpleSave(simpleModel) {
      this.$set(this.modelData, 'simpleModel', simpleModel)
    },
    async validate() {
      if (this.modelData.type === BpmModelType.SIMPLE) {
        if (this.$refs.simpleDesigner) {
          const data = await this.$refs.simpleDesigner.getCurrentFlowData()
          if (data) {
            this.$set(this.modelData, 'simpleModel', data)
          }
        }
        if (!this.modelData.simpleModel) {
          throw new Error('请设计仿真流程')
        }
        return
      }
      if (!this.modelData.bpmnXml) {
        throw new Error('请设计 BPMN 流程')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.process-design-step {
  min-height: 600px;
}

.bpmn-designer-wrapper {
  position: relative;
  height: calc(100vh - 230px);
  min-height: 620px;
}

.my-process-designer {
  height: 100%;
}

.process-panel__container {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
}
</style>
