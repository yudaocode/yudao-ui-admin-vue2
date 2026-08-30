<template>
  <div class="panel-tab__content">
    <el-form size="mini" label-width="90px" @submit.native.prevent>
      <!-- 与 Vue3 参照一致：该高级开关暂未接入业务运行时，保留模型字段但不展示。 -->
      <el-form-item label="异步延续" style="display: none">
        <el-checkbox v-model="taskConfigForm.asyncBefore" label="异步前" @change="changeTaskAsync" />
        <el-checkbox v-model="taskConfigForm.asyncAfter" label="异步后" @change="changeTaskAsync" />
        <el-checkbox v-model="taskConfigForm.exclusive" v-if="taskConfigForm.asyncAfter || taskConfigForm.asyncBefore" label="排除" @change="changeTaskAsync" />
      </el-form-item>
      <component :is="witchTaskComponent" v-bind="$props" />
    </el-form>
  </div>
</template>

<script>
import UserTask from "./task-components/UserTask";
import ScriptTask from "./task-components/ScriptTask";
import ReceiveTask from "./task-components/ReceiveTask";
import ServiceTask from "./task-components/ServiceTask";
import CallActivity from "./task-components/CallActivity";

export default {
  name: "ElementTaskConfig",
  components: { UserTask, ScriptTask, ReceiveTask, ServiceTask, CallActivity },
  props: {
    id: String,
    type: String
  },
  data() {
    return {
      taskConfigForm: {
        asyncAfter: false,
        asyncBefore: false,
        exclusive: false
      },
      bpmnElement: null,
      witchTaskComponent: "",
      installedComponent: {
        // 手工任务与普通任务一致，不需要其他配置
        // 接收消息任务，需要在全局下插入新的消息实例，并在该节点下的 messageRef 属性绑定该实例
        // 发送任务、服务任务、业务规则任务共用一个相同配置
        UserTask: "UserTask", // 用户任务配置
        ScriptTask: "ScriptTask", // 脚本任务配置
        ReceiveTask: "ReceiveTask", // 消息接收任务
        ServiceTask: "ServiceTask", // 服务任务
        SendTask: "ServiceTask", // 发送任务沿用服务任务配置
        BusinessRuleTask: "ServiceTask", // 业务规则任务沿用服务任务配置
        CallActivity: "CallActivity" // 调用活动
      }
    };
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.bpmnElement = window.bpmnInstances && window.bpmnInstances.bpmnElement;
        this.taskConfigForm.asyncBefore = !!(this.bpmnElement && this.bpmnElement.businessObject && this.bpmnElement.businessObject.asyncBefore);
        this.taskConfigForm.asyncAfter = !!(this.bpmnElement && this.bpmnElement.businessObject && this.bpmnElement.businessObject.asyncAfter);
        this.taskConfigForm.exclusive = !!(this.bpmnElement && this.bpmnElement.businessObject && this.bpmnElement.businessObject.exclusive);
      }
    },
    type: {
      immediate: true,
      handler() {
        this.witchTaskComponent = this.installedComponent[this.type] || "";
      }
    }
  },
  methods: {
    changeTaskAsync() {
      if (!this.taskConfigForm.asyncBefore && !this.taskConfigForm.asyncAfter) {
        this.taskConfigForm.exclusive = false;
      }
      if (!window.bpmnInstances || !window.bpmnInstances.modeling || !this.bpmnElement) return;
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        ...this.taskConfigForm
      });
    }
  }
};
</script>
