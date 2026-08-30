<template>
  <div class="panel-tab__content">
    <div class="panel-tab__content--title">
      <span><i class="el-icon-menu" style="margin-right: 8px; color: #555555"></i>消息列表</span>
      <el-button size="mini" type="primary" icon="el-icon-plus" @click="openModel('message')">创建新消息</el-button>
    </div>
    <el-table :data="messageList" size="mini" border>
      <el-table-column type="index" label="序号" width="60px" />
      <el-table-column label="消息ID" prop="id" max-width="300px" show-overflow-tooltip />
      <el-table-column label="消息名称" prop="name" max-width="300px" show-overflow-tooltip />
      <el-table-column label="操作" width="110px">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="openEditModel('message', scope.row, scope.$index)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button type="text" size="mini" style="color: #ff4d4f" @click="removeObject('message', scope.row)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="panel-tab__content--title" style="padding-top: 8px; margin-top: 8px; border-top: 1px solid #eeeeee">
      <span><i class="el-icon-menu" style="margin-right: 8px; color: #555555"></i>信号列表</span>
      <el-button size="mini" type="primary" icon="el-icon-plus" @click="openModel('signal')">创建新信号</el-button>
    </div>
    <el-table :data="signalList" size="mini" border>
      <el-table-column type="index" label="序号" width="60px" />
      <el-table-column label="信号ID" prop="id" max-width="300px" show-overflow-tooltip />
      <el-table-column label="信号名称" prop="name" max-width="300px" show-overflow-tooltip />
      <el-table-column label="操作" width="110px">
        <template v-slot="scope">
          <el-button type="text" size="mini" @click="openEditModel('signal', scope.row, scope.$index)">编辑</el-button>
          <el-divider direction="vertical" />
          <el-button type="text" size="mini" style="color: #ff4d4f" @click="removeObject('signal', scope.row)">移除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="modelVisible" :title="modelConfig.title" :close-on-click-modal="false" width="400px" append-to-body destroy-on-close>
      <el-form :model="modelObjectForm" size="mini" label-width="90px" @submit.native.prevent>
        <el-form-item :label="modelConfig.idLabel">
          <el-input v-model="modelObjectForm.id" clearable />
        </el-form-item>
        <el-form-item :label="modelConfig.nameLabel">
          <el-input v-model="modelObjectForm.name" clearable />
        </el-form-item>
      </el-form>
      <template slot="footer">
        <el-button size="mini" @click="modelVisible = false">取 消</el-button>
        <el-button size="mini" type="primary" @click="addNewObject">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: "SignalAndMassage",
  data() {
    return {
      signalList: [],
      messageList: [],
      modelVisible: false,
      modelType: "",
      modelObjectForm: {},
      rootElements: [],
      messageIdMap: {},
      signalIdMap: {},
      editingIndex: -1
    };
  },
  computed: {
    modelConfig() {
      const editing = this.editingIndex !== -1;
      if (this.modelType === "message") {
        return { title: editing ? "编辑消息" : "创建消息", idLabel: "消息ID", nameLabel: "消息名称" };
      } else {
        return { title: editing ? "编辑信号" : "创建信号", idLabel: "信号ID", nameLabel: "信号名称" };
      }
    }
  },
  mounted() {
    this.initDataList();
  },
  methods: {
    initDataList() {
      const instances = window.bpmnInstances
      if (!instances || !instances.modeler) return
      this.rootElements = instances.modeler.getDefinitions().rootElements || [];
      this.messageIdMap = {};
      this.signalIdMap = {};
      this.messageList = [];
      this.signalList = [];
      this.rootElements.forEach(el => {
        if (el.$type === "bpmn:Message") {
          this.messageIdMap[el.id] = true;
          this.messageList.push({ ...el });
        }
        if (el.$type === "bpmn:Signal") {
          this.signalIdMap[el.id] = true;
          this.signalList.push({ ...el });
        }
      });
    },
    openModel(type) {
      this.modelType = type;
      this.editingIndex = -1;
      this.modelObjectForm = {
        id: this.generateStandardId(type),
        name: ""
      };
      this.modelVisible = true;
    },
    generateStandardId(type) {
      const prefix = type === "message" ? "Message_" : "Signal_";
      return `${prefix}${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    },
    openEditModel(type, row, index) {
      this.modelType = type;
      this.editingIndex = index;
      this.modelObjectForm = { id: row.id, name: row.name || "" };
      this.modelVisible = true;
    },
    addNewObject() {
      const objectId = String(this.modelObjectForm.id || '').trim()
      if (!objectId) {
        return this.$message.error("ID 不能为空");
      }
      this.modelObjectForm.id = objectId
      this.modelObjectForm.name = String(this.modelObjectForm.name || '').trim()
      const instances = window.bpmnInstances
      if (!instances || !instances.moddle) return this.$message.error('流程设计器尚未初始化')
      if (this.modelType === "message") {
        if (this.editingIndex !== -1) {
          const target = this.messageList[this.editingIndex];
          const root = this.rootElements.find(el => el.$type === "bpmn:Message" && el.id === target.id);
          if (this.hasRootIdConflict(objectId, root)) {
            return this.$message.error("该消息已存在，请修改id后重新保存")
          }
          if (root) {
            const oldId = root.id
            root.id = objectId;
            this.syncRootIdClaim(root, oldId)
            root.name = this.modelObjectForm.name;
            this.updateRootReferences(root, oldId)
          }
        } else if (this.hasRootIdConflict(objectId, null)) {
          return this.$message.error("该消息已存在，请修改id后重新保存");
        } else {
          const messageRef = instances.moddle.create("bpmn:Message", this.modelObjectForm);
          this.rootElements.push(messageRef);
          this.claimRootId(messageRef)
        }
      } else {
        if (this.editingIndex !== -1) {
          const target = this.signalList[this.editingIndex];
          const root = this.rootElements.find(el => el.$type === "bpmn:Signal" && el.id === target.id);
          if (this.hasRootIdConflict(objectId, root)) {
            return this.$message.error("该信号已存在，请修改id后重新保存")
          }
          if (root) {
            const oldId = root.id
            root.id = objectId;
            this.syncRootIdClaim(root, oldId)
            root.name = this.modelObjectForm.name;
            this.updateRootReferences(root, oldId)
          }
        } else if (this.hasRootIdConflict(objectId, null)) {
          return this.$message.error("该信号已存在，请修改id后重新保存");
        } else {
          const signalRef = instances.moddle.create("bpmn:Signal", this.modelObjectForm);
          this.rootElements.push(signalRef);
          this.claimRootId(signalRef)
        }
      }
      this.modelVisible = false;
      this.saveChanges();
      this.initDataList();
    },
    hasRootIdConflict(objectId, currentRoot) {
      if (!objectId) return false
      const instances = window.bpmnInstances
      const moddle = instances && instances.moddle
      const assigned = moddle && moddle.ids && moddle.ids.assigned(objectId)
      if (assigned && assigned !== currentRoot) return true
      const visited = []
      let conflict = false
      const visit = (value) => {
        if (conflict || !value || typeof value !== 'object' || visited.indexOf(value) !== -1) return
        visited.push(value)
        if (value !== currentRoot && value.id === objectId && value.$type) {
          conflict = true
          return
        }
        if (Array.isArray(value)) {
          value.forEach(visit)
          return
        }
        Object.keys(value).forEach((key) => {
          if (key !== '$model' && key !== '$parent') visit(value[key])
        })
      }
      const registry = instances && instances.elementRegistry
      if (registry && registry.forEach) registry.forEach((element) => visit(element && element.businessObject))
      const modeler = instances && instances.modeler
      if (modeler && modeler.getDefinitions) visit(modeler.getDefinitions())
      return conflict
    },
    claimRootId(root) {
      const ids = window.bpmnInstances && window.bpmnInstances.moddle && window.bpmnInstances.moddle.ids
      if (ids && root && root.id) ids.claim(root.id, root)
    },
    syncRootIdClaim(root, oldId) {
      const ids = window.bpmnInstances && window.bpmnInstances.moddle && window.bpmnInstances.moddle.ids
      if (!ids || !root) return
      if (oldId && ids.assigned(oldId) === root) ids.unclaim(oldId)
      if (root.id) ids.claim(root.id, root)
    },
    updateRootReferences(root, oldId) {
      if (!root || !oldId || oldId === root.id) return
      const instances = window.bpmnInstances
      const registry = instances && instances.elementRegistry
      const visited = []
      const visit = (value) => {
        if (!value || typeof value !== 'object' || visited.indexOf(value) !== -1) return
        visited.push(value)
        if (Array.isArray(value)) {
          value.forEach(visit)
          return
        }
        Object.keys(value).forEach((key) => {
          if (key === '$model' || key === '$parent') return
          const child = value[key]
          // bpmn-moddle normally stores references as the root object.  A few
          // imported legacy models retain the old id as a string/object clone;
          // normalize those references so an id edit cannot leave stale refs.
          if (key === 'messageRef' || key === 'signalRef') {
            if (child === root || child === oldId || (child && child.id === oldId)) {
              value[key] = root
              return
            }
          }
          visit(child)
        })
      }
      if (registry && registry.forEach) registry.forEach((element) => visit(element && element.businessObject))
      this.rootElements.forEach(visit)
    },
    removeObject(type, row) {
      this.$confirm(`确认移除该${type === "message" ? "消息" : "信号"}吗？`, "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      }).then(() => {
        const targetType = type === "message" ? "bpmn:Message" : "bpmn:Signal";
        const index = this.rootElements.findIndex(el => el.$type === targetType && el.id === row.id);
        if (index !== -1) {
          const target = this.rootElements[index]
          if (this.isRootReferenced(target)) {
            this.$message.warning(`该${type === "message" ? "消息" : "信号"}仍被流程节点引用，不能移除`)
            return
          }
          this.rootElements.splice(index, 1);
          const ids = window.bpmnInstances && window.bpmnInstances.moddle && window.bpmnInstances.moddle.ids
          if (ids && ids.assigned(target.id) === target) ids.unclaim(target.id)
        }
        this.saveChanges();
        this.initDataList();
        this.$message.success("移除成功");
      }).catch(() => {});
    },
    isRootReferenced(root) {
      const instances = window.bpmnInstances
      const registry = instances && instances.elementRegistry
      if (!root || !registry || !registry.forEach) return false
      const visited = []
      const contains = (value, propertyKey) => {
        if (!value || typeof value !== 'object') return false
        // `rootElements` necessarily contains the root object itself.  Do
        // not mistake that ownership entry for a messageRef/signalRef; only
        // references from another model element should block removal.
        if (value === root) return propertyKey !== 'rootElements'
        if ((propertyKey === 'messageRef' || propertyKey === 'signalRef') &&
          (value === root.id || (value && value.id === root.id))) return true
        if (visited.indexOf(value) !== -1) return false
        visited.push(value)
        if (Array.isArray(value)) return value.some((item) => contains(item, propertyKey))
        return Object.keys(value).some((key) => {
          if (key === '$model' || key === '$parent') return false
          return contains(value[key], key)
        })
      }
      let referenced = false
      registry.forEach((element) => {
        if (!referenced && element && contains(element.businessObject)) referenced = true
      })
      const modeler = instances && instances.modeler
      if (!referenced && modeler && modeler.getDefinitions) {
        visited.length = 0
        referenced = contains(modeler.getDefinitions())
      }
      return referenced
    },
    saveChanges() {
      const modeler = window.bpmnInstances && window.bpmnInstances.modeler;
      if (!modeler) return;
      try {
        const canvas = modeler.get("canvas");
        const rootElement = canvas.getRootElement();
        const eventBus = modeler.get("eventBus");
        if (eventBus) {
          eventBus.fire("root.added", { element: rootElement });
          eventBus.fire("elements.changed", { elements: [rootElement] });
        }
        const commandStack = modeler.get("commandStack");
        if (commandStack && commandStack._stack) {
          commandStack.execute("element.updateProperties", { element: rootElement, properties: {} });
        }
      } catch (error) {
        // Keep the in-memory model change even when optional redraw hooks are absent.
      }
    }
  }
};
</script>
