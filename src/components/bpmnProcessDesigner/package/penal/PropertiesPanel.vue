<template>
  <div class="process-panel__container" :style="{ width: `${this.width}px` }">
    <el-collapse v-model="activeTab">
      <el-collapse-item name="base">
        <div slot="title" class="panel-tab__title"><i class="el-icon-info"></i>常规</div>
        <element-base-info :id-edit-disabled="idEditDisabled" :business-object="elementBusinessObject" :type="elementType"
                           :model="model" />
      </el-collapse-item>
      <el-collapse-item name="condition" v-if="elementType === 'Process'" key="message">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-comment"></i>消息与信号</div>
        <signal-and-massage />
      </el-collapse-item>
      <el-collapse-item name="condition" v-if="conditionFormVisible" key="condition">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-promotion"></i>流转条件</div>
        <flow-condition :business-object="elementBusinessObject" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="condition" v-if="formVisible" key="form">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-order"></i>表单</div>
<!--        <element-form :id="elementId" :type="elementType" />-->
        友情提示：使用 <router-link target="_blank" :to="{path:'/bpm/manager/form'}"><el-link type="danger">流程表单</el-link> </router-link>
        替代，提供更好的表单设计功能
      </el-collapse-item>
      <el-collapse-item name="task" v-if="isTaskCollapseItemShow(elementType)" key="task">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-claim"></i>{{ getTaskCollapseItemName(elementType) }}</div>
        <element-task :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="multiInstance" v-if="elementType.indexOf('Task') !== -1" key="multiInstance">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-help"></i>多实例</div>
        <element-multi-instance :id="elementId" :business-object="elementBusinessObject" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="listeners" key="listeners">
        <div slot="title" class="panel-tab__title"><i class="el-icon-message-solid"></i>执行监听器</div>
        <element-listeners :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="taskListeners" v-if="elementType === 'UserTask'" key="taskListeners">
        <div slot="title" class="panel-tab__title"><i class="el-icon-message-solid"></i>任务监听器</div>
        <user-task-listeners :id="elementId" :type="elementType" />
      </el-collapse-item>
      <el-collapse-item name="extensions" key="extensions">
        <div slot="title" class="panel-tab__title"><i class="el-icon-circle-plus"></i>扩展属性</div>
        <element-properties :id="elementId" :type="elementType" />
      </el-collapse-item>
      <!-- These extensions are Flowable-specific.  Activiti/Camunda
           descriptors intentionally do not declare them; mounting the
           editor for those prefixes would make bpmn-moddle throw on
           `moddle.create('camunda:ApproveType')`. -->
      <el-collapse-item v-if="supportsFlowableCustomConfig" name="customConfig" key="customConfig">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-tools"></i>自定义配置</div>
        <element-custom-config
          :id="elementId"
          :type="elementType"
          :business-object="elementBusinessObject"
          :key="elementId"
        />
      </el-collapse-item>
      <el-collapse-item
        v-if="elementType === 'IntermediateCatchEvent'"
        name="timeEvent"
        key="timeEvent"
      >
        <div slot="title" class="panel-tab__title"><i class="el-icon-time"></i>时间事件</div>
        <time-event-config :business-object="elementBusinessObject" :key="elementId" />
      </el-collapse-item>
      <el-collapse-item name="other" key="other">
        <div slot="title" class="panel-tab__title"><i class="el-icon-s-promotion"></i>其他</div>
        <element-other-config :id="elementId" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script>
import ElementBaseInfo from "./base/ElementBaseInfo";
import ElementOtherConfig from "./other/ElementOtherConfig";
import ElementTask from "./task/ElementTask";
import ElementMultiInstance from "./multi-instance/ElementMultiInstance";
import FlowCondition from "./flow-condition/FlowCondition";
import SignalAndMassage from "./signal-message/SignalAndMessage";
import ElementListeners from "./listeners/ElementListeners";
import ElementProperties from "./properties/ElementProperties";
import ElementForm from "./form/ElementForm";
import UserTaskListeners from "./listeners/UserTaskListeners";
import ElementCustomConfig from "./custom-config/ElementCustomConfig";
import TimeEventConfig from "./time-event-config/TimeEventConfig";
import { getForm } from "@/api/bpm/form";
import { BpmModelFormType } from "@/utils/constants";
/**
 * 侧边栏
 * @Author MiyueFE
 * @Home https://github.com/miyuesc
 * @Date 2021年3月31日18:57:51
 */
export default {
  name: "MyPropertiesPanel",
  components: {
    UserTaskListeners,
    ElementForm,
    ElementProperties,
    ElementListeners,
    SignalAndMassage,
    FlowCondition,
    ElementMultiInstance,
    ElementTask,
    ElementOtherConfig,
    ElementBaseInfo,
    ElementCustomConfig,
    TimeEventConfig
  },
  componentName: "MyPropertiesPanel",
  props: {
    bpmnModeler: Object,
    prefix: {
      type: String,
      default: "camunda"
    },
    width: {
      type: Number,
      default: 480
    },
    idEditDisabled: {
      type: Boolean,
      default: false
    },
    model: Object, // 流程模型的数据
  },
  provide() {
    return {
      prefix: this.prefix,
      width: this.width,
      formFields: this.formFieldsRef,
      formType: this.formTypeRef
    };
  },
  data() {
    return {
      activeTab: "base",
      elementId: "",
      elementType: "",
      elementBusinessObject: {}, // 元素 businessObject 镜像，提供给需要做判断的组件使用
      conditionFormVisible: false, // 流转条件设置
      formVisible: false, // 表单配置
      // Vue3 provides these refs from the model editor. Keep the same
      // injection contract in Vue2 so field-permission custom config can
      // consume the selected process form without coupling to the parent.
      formFieldsRef: { value: [] },
      formTypeRef: {
        value: this.model && this.model.formType !== undefined
          ? this.model.formType
          : BpmModelFormType.NORMAL
      },
      formFieldsRequestId: 0,
      formFieldsLastId: undefined,
      formFieldsLastType: undefined,
      // Keep the Vue3 task-collapse routing in Vue2.  CallActivity does not
      // contain the word "Task", so an indexOf("Task") check would silently
      // hide its dedicated panel.
      taskComponentNames: {
        UserTask: "用户任务",
        ServiceTask: "服务任务",
        ScriptTask: "脚本任务",
        ReceiveTask: "接收任务",
        SendTask: "发送任务",
        BusinessRuleTask: "业务规则任务",
        CallActivity: "调用活动"
      }
    };
  },
  computed: {
    supportsFlowableCustomConfig() {
      return this.prefix === "flowable";
    }
  },
  watch: {
    elementId: {
      handler() {
        this.activeTab = "base";
      }
    },
    model: {
      deep: true,
      immediate: true,
      handler(value) {
        const formId = value && value.formId
        const formType = value && value.formType
        this.formTypeRef.value = formType === undefined ? BpmModelFormType.NORMAL : formType
        if (formId === this.formFieldsLastId && formType === this.formFieldsLastType) return
        this.formFieldsLastId = formId
        this.formFieldsLastType = formType
        this.loadModelFormFields(formId, formType)
      }
    }
  },
  created() {
    this.initModels();
  },
  methods: {
    isTaskCollapseItemShow(type) {
      return !!this.taskComponentNames[type];
    },
    getTaskCollapseItemName(type) {
      return this.taskComponentNames[type] || "任务";
    },
    async loadModelFormFields(formId, formType) {
      const requestId = ++this.formFieldsRequestId;
      if (!formId || Number(formType) !== BpmModelFormType.NORMAL) {
        this.formFieldsRef.value = [];
        return;
      }
      try {
        const response = await getForm(formId);
        if (requestId !== this.formFieldsRequestId) return;
        const data = response && response.data !== undefined ? response.data : response;
        this.formFieldsRef.value = data && Array.isArray(data.fields) ? data.fields : [];
      } catch (error) {
        if (requestId !== this.formFieldsRequestId) return;
        this.formFieldsRef.value = [];
        // Keep failures visible in the console; the BPMN editor itself can
        // still be used and existing FieldsPermission extensions are kept.
        // eslint-disable-next-line no-console
        console.error('[bpmn] failed to load process form fields', error);
      }
    },
    initModels() {
      // 初始化 modeler 以及其他 moddle
      if (!this.bpmnModeler) {
        // 避免加载时 流程图 并未加载完成
        this.timer = setTimeout(() => this.initModels(), 10);
        return;
      }
      if (this.timer) clearTimeout(this.timer);
      window.bpmnInstances = {
        modeler: this.bpmnModeler,
        modeling: this.bpmnModeler.get("modeling"),
        moddle: this.bpmnModeler.get("moddle"),
        eventBus: this.bpmnModeler.get("eventBus"),
        bpmnFactory: this.bpmnModeler.get("bpmnFactory"),
        elementFactory: this.bpmnModeler.get("elementFactory"),
        elementRegistry: this.bpmnModeler.get("elementRegistry"),
        replace: this.bpmnModeler.get("replace"),
        selection: this.bpmnModeler.get("selection")
      };
      this.getActiveElement();
    },
    getActiveElement() {
      // 初始第一个选中元素 bpmn:Process
      this.initFormOnChanged(null);
      this.bpmnModeler.on("import.done", e => {
        this.initFormOnChanged(null);
      });
      // 监听选择事件，修改当前激活的元素以及表单
      this.bpmnModeler.on("selection.changed", ({ newSelection }) => {
        this.initFormOnChanged(newSelection[0] || null);
      });
      this.bpmnModeler.on("element.changed", ({ element }) => {
        // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
        if (element && element.id === this.elementId) {
          this.initFormOnChanged(element);
        }
      });
    },
    // 初始化数据
    initFormOnChanged(element) {
      let activatedElement = element;
      if (!activatedElement) {
        activatedElement =
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Process") ??
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Collaboration");
      }
      if (!activatedElement) return;
      console.log(`
              ----------
      select element changed:
                id:  ${activatedElement.id}
              type:  ${activatedElement.businessObject.$type}
              ----------
              `);
      console.log("businessObject: ", activatedElement.businessObject);
      window.bpmnInstances.bpmnElement = activatedElement;
      this.bpmnElement = activatedElement;
      this.elementId = activatedElement.id;
      this.elementType = activatedElement.type.split(":")[1] || "";
      this.elementBusinessObject = JSON.parse(JSON.stringify(activatedElement.businessObject));
      this.conditionFormVisible = !!(
        this.elementType === "SequenceFlow" &&
        activatedElement.source &&
        activatedElement.source.type.indexOf("StartEvent") === -1
      );
      this.formVisible = this.elementType === "UserTask" || this.elementType === "StartEvent";
    },
  },
  beforeDestroy() {
    if (this.timer) clearTimeout(this.timer);
    // Do not clear a newer designer instance that may have replaced this
    // panel while the old component was being torn down.
    if (window.bpmnInstances && window.bpmnInstances.modeler === this.bpmnModeler) {
      window.bpmnInstances = null;
    }
  }
};
</script>
