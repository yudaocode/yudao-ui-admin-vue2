<template>
  <div class="branch-node-wrapper">
    <div class="branch-node-container">
      <div
        v-if="readonly"
        class="branch-node-readonly"
        :class="`${useTaskStatusClass(currentNode && currentNode.activityStatus)}`"
      >
        <span class="iconfont icon-inclusive icon-size inclusive"></span>
      </div>
      <el-button v-else class="branch-node-add" color="#345da2" @click="addCondition" plain>
        添加条件
      </el-button>
      <div
        class="branch-node-item"
        v-for="(item, index) in currentNode.conditionNodes"
        :key="index"
      >
        <template v-if="index == 0">
          <div class="branch-line-first-top"> </div>
          <div class="branch-line-first-bottom"></div>
        </template>
        <template v-if="index + 1 == (currentNode.conditionNodes || []).length">
          <div class="branch-line-last-top"></div>
          <div class="branch-line-last-bottom"></div>
        </template>
        <div class="node-wrapper">
          <div class="node-container">
            <div
              class="node-box"
              :class="[
                { 'node-config-error': !item.showText },
                `${useTaskStatusClass(item.activityStatus)}`
              ]"
            >
              <div class="branch-node-title-container">
                <div v-if="!readonly && showInputs[index]">
                  <input
                    type="text"
                    class="editable-title-input"
                    @blur="blurEvent(index)"
                    v-mountedFocus
                    v-model="item.name"
                  />
                </div>
                <div v-else class="branch-title" @click="clickEvent(index)"> {{ item.name }} </div>
              </div>
              <div class="branch-node-content" @click="conditionNodeConfig(item.id)">
                <div class="branch-node-text" :title="item.showText" v-if="item.showText">
                  {{ item.showText }}
                </div>
                <div class="branch-node-text" v-else>
                  {{ NODE_DEFAULT_TEXT.get(NodeType.CONDITION_NODE) }}
                </div>
              </div>
              <div
                class="node-toolbar"
                v-if="!readonly && index + 1 !== (currentNode.conditionNodes || []).length"
              >
                <div class="toolbar-icon">
                  <svg-icon
                    color="#0089ff"
                    icon-class="ep:circle-close-filled"
                    :size="18"
                    @click="deleteCondition(index)"
                  />
                </div>
              </div>
              <div
                class="branch-node-move move-node-left"
                v-if="!readonly && index != 0 && index + 1 !== (currentNode.conditionNodes || []).length"
                @click="moveNode(index, -1)"
              >
                <svg-icon icon-class="ep:arrow-left" />
              </div>

              <div
                class="branch-node-move move-node-right"
                v-if="
                  !readonly &&
                  currentNode.conditionNodes &&
                  index < currentNode.conditionNodes.length - 2
                "
                @click="moveNode(index, 1)"
              >
                <svg-icon icon-class="ep:arrow-right" />
              </div>
            </div>
            <NodeHandler :child-node.sync="item.childNode" :current-node="item" />
          </div>
        </div>
        <ConditionNodeConfig :node-index="index" :condition-node="item" :ref="item.id" />
        <!-- 递归显示子节点  -->
        <ProcessNodeTree
          v-if="item && item.childNode"
          :parent-node="item"
          :flow-node.sync="item.childNode"
          @find:recursive-find-parent-node="recursiveFindParentNode"
        />
      </div>
    </div>
    <NodeHandler
      v-if="currentNode"
      :child-node.sync="currentNode.childNode"
      :current-node="currentNode"
    />
  </div>
</template>

<script setup>
import { ref, inject, watch, getCurrentInstance } from 'vue'
import NodeHandler from '../NodeHandler.vue'
import ProcessNodeTree from '../ProcessNodeTree.vue'
import {
  NodeType,
  ConditionType,
  DEFAULT_CONDITION_GROUP_VALUE,
  NODE_DEFAULT_TEXT
} from '../consts'
import { useTaskStatusClass } from '../node'
import { getDefaultInclusiveConditionNodeName } from '../utils'
import { generateUUID, deepClone } from '@/utils'
import ConditionNodeConfig from '../nodes-config/ConditionNodeConfig.vue'
const { proxy } = getCurrentInstance()
const props = defineProps({
  flowNode: {
    type: Object,
    required: true
  }
})
// 定义事件，更新父组件
const emits = defineEmits(['update:modelValue', 'find:parentNode', 'find:recursiveFindParentNode'])
// 是否只读
const readonly = inject('readonly')

const currentNode = ref(props.flowNode)

watch(
  () => props.flowNode,
  (newValue) => {
    currentNode.value = newValue
  }
)

const showInputs = ref([])
// 失去焦点
const blurEvent = (index) => {
  showInputs.value[index] = false
  const conditionNode = currentNode.value.conditionNodes?.[index]
  conditionNode.name =
    conditionNode.name ||
    getDefaultInclusiveConditionNodeName(index, conditionNode.conditionSetting?.defaultFlow)
}

// 点击条件名称
const clickEvent = (index) => {
  showInputs.value[index] = true
}

const conditionNodeConfig = (nodeId) => {
  if (readonly) {
    return
  }
  const conditionNode = proxy.$refs[nodeId][0]
  conditionNode.open()
}

// 新增条件
const addCondition = () => {
  const conditionNodes = currentNode.value.conditionNodes
  if (conditionNodes) {
    const len = conditionNodes.length
    let lastIndex = len - 1
    const conditionData = {
      id: 'Flow_' + generateUUID(),
      name: '包容条件' + len,
      showText: '',
      type: NodeType.CONDITION_NODE,
      childNode: undefined,
      conditionNodes: [],
      conditionSetting: {
        defaultFlow: false,
        conditionType: ConditionType.RULE,
        conditionGroups: deepClone(DEFAULT_CONDITION_GROUP_VALUE)
      }
    }
    conditionNodes.splice(lastIndex, 0, conditionData)
  }
}

// 删除条件
const deleteCondition = (index) => {
  const conditionNodes = currentNode.value.conditionNodes
  if (conditionNodes) {
    conditionNodes.splice(index, 1)
    if (conditionNodes.length == 1) {
      const childNode = currentNode.value.childNode
      // 更新此节点为后续孩子节点
      emits('update:modelValue', childNode)
    }
  }
}

// 移动节点
const moveNode = (index, to) => {
  // -1 ：向左  1： 向右
  if (currentNode.value.conditionNodes) {
    currentNode.value.conditionNodes[index] = currentNode.value.conditionNodes.splice(
      index + to,
      1,
      currentNode.value.conditionNodes[index]
    )[0]
  }
}
// 递归从父节点中查询匹配的节点
const recursiveFindParentNode = (nodeList, node, nodeType) => {
  if (!node || node.type === NodeType.START_USER_NODE) {
    return
  }
  if (node.type === nodeType) {
    nodeList.push(node)
  }
  // 条件节点比较特殊。需要调用其父节点条件分支节点继续查找
  emits('find:parentNode', nodeList, nodeType)
}
</script>

<style lang="scss" scoped></style>
