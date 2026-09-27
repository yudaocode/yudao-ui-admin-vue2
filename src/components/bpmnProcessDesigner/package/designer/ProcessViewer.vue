<template>
  <div :class="['my-process-designer', { 'process-viewer': isModernContract }]">
    <div class="my-process-designer__container">
      <div class="my-process-designer__canvas" ref="bpmn-canvas"></div>
    </div>

    <!--
      Vue3's viewer places the marker definitions in the rendered SVG.  Keep
      the definitions in the Vue2 template as well; addCustomDefs moves this
      node into bpmn-js' SVG after import. The node is only rendered for the
      modern `xml`/`view` contract so value-based definition previews remain
      unchanged.
    -->
    <defs v-if="isModernContract" ref="customDefs" class="process-viewer__defs">
      <marker
        id="sequenceflow-end-white-success"
        viewBox="0 0 20 20"
        refX="11"
        refY="10"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <path class="success-arrow" d="M 1 5 L 11 10 L 1 15 Z" />
      </marker>
      <marker
        id="conditional-flow-marker-white-success"
        viewBox="0 0 20 20"
        refX="-1"
        refY="10"
        markerWidth="10"
        markerHeight="10"
        orient="auto"
      >
        <path class="success-conditional" d="M 0 10 L 8 6 L 16 10 L 8 14 Z" />
      </marker>
    </defs>

    <!-- Vue3 approval-record contract rendered with Element UI's
         `visible.sync` syntax. -->
    <el-dialog
      v-if="isModernContract"
      :title="modernDialogTitle || '审批记录'"
      :visible.sync="modernDialogVisible"
      width="1000px"
      append-to-body
    >
      <el-table :data="modernSelectedTasks" size="mini" border>
        <el-table-column label="序号" type="index" width="50" align="center" />
        <el-table-column
          v-if="modernSelectedActivityType === 'bpmn:UserTask'"
          label="审批人"
          min-width="100"
          align="center"
        >
          <template slot-scope="scope">
            {{ getTaskUserName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column v-else label="发起人" min-width="100" align="center">
          <template slot-scope="scope">
            {{ getTaskUserName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="部门" min-width="100" align="center">
          <template slot-scope="scope">
            {{ getTaskDeptName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间" prop="createTime" min-width="140" align="center">
          <template slot-scope="scope">
            {{ formatViewerTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" prop="endTime" min-width="140" align="center">
          <template slot-scope="scope">
            {{ formatViewerTime(scope.row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="审批状态" prop="status" min-width="90" align="center">
          <template slot-scope="scope">
            {{ getTaskStatusLabel(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="modernSelectedActivityType === 'bpmn:UserTask'"
          label="审批建议"
          prop="reason"
          min-width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="耗时" prop="durationInMillis" width="100" align="center">
          <template slot-scope="scope">
            {{ formatViewerDuration(scope.row.durationInMillis) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- Zoom controls are part of the Vue3 viewer contract. -->
    <div v-if="isModernContract" class="process-viewer__zoom">
      <el-button-group>
        <el-button
          size="mini"
          icon="el-icon-minus"
          :disabled="defaultZoom <= 0.3"
          @click="processZoomOut()"
        />
        <el-button size="mini" class="process-viewer__zoom-value">
          {{ Math.floor(defaultZoom * 100) }}%
        </el-button>
        <el-button
          size="mini"
          icon="el-icon-plus"
          :disabled="defaultZoom >= 3.9"
          @click="processZoomIn()"
        />
        <el-button size="mini" icon="el-icon-refresh" @click="processReZoom()" />
      </el-button-group>
    </div>
  </div>
</template>

<script>
import BpmnViewer from "bpmn-js/lib/Viewer";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import DefaultEmptyXML from "./plugins/defaultEmpty";
import { formatPast2 } from '@/utils';

export default {
  name: "MyProcessViewer",
  componentName: "MyProcessViewer",
  props: {
    // Vue3's viewer contract. `default: undefined` is intentional: it lets
    // us distinguish a modern `<my-process-viewer :xml="..." :view="...">`
    // instance from the value-based preview.
    xml: {
      type: String,
      default: undefined
    },
    view: {
      type: Object,
      default: undefined
    },
    value: {  // BPMN XML 字符串
      type: String,
    },
    prefix: { // 使用哪个引擎
      type: String,
      default: "camunda",
    },
    activityData: { // 活动的数据。传递时，可高亮流程
      type: Array,
      default: () => [],
    },
    processInstanceData: { // 流程实例的数据。传递时，可展示流程发起人等信息
      type: Object,
    },
    taskData: { // 任务实例的数据。传递时，可展示 UserTask 审核相关的信息
      type: Array,
      default: () => [],
    }
  },
  computed: {
    // Keep the value-based API working while allowing the Vue3 `xml` API to
    // be consumed by the same component.  A view without XML is still a
    // modern instance (for example while the detail request is loading).
    isModernContract() {
      return this.xml !== undefined || this.view !== undefined;
    },
    effectiveXml() {
      return this.isModernContract ? this.xml : this.value;
    }
  },
  data() {
    return {
      xmlValue: '',
      activityList: [],
      processInstance: undefined,
      taskList: [],
      // Vue3 viewer state (kept in Options API form for Vue2.7).
      modernProcessInstance: undefined,
      modernTasks: [],
      modernDialogVisible: false,
      modernDialogTitle: undefined,
      modernSelectedActivityType: undefined,
      modernSelectedTasks: [],
      defaultZoom: 1,
      resizeObserver: null,
      importRequestId: 0,
      modernMarkers: [
        "success",
        "primary",
        "danger",
        "cancel",
        "condition-expression",
      // Clear value-based markers as well when a reused component switches from
        // the value/activityData API to the modern xml/view API.
        "highlight",
        "highlight-todo",
        "highlight-reject",
        "highlight-cancel",
        "highlight-back"
      ]
    };
  },
  mounted() {
    this.xmlValue = this.effectiveXml;
    this.activityList = this.activityData;
    // The detail page passes all viewer data before mount. The value-based
    // component's watchers are not `immediate`, so without copying these
    // props here the first render silently drops process/task metadata and
    // cannot paint task results or hover details until a later refresh.
    this.processInstance = this.processInstanceData;
    this.taskList = this.taskData;
    if (this.isModernContract) {
      this.setModernView(this.view);
    }
    // 初始化
    this.initBpmnModeler();
    this.createNewDiagram(this.xmlValue);
    this.$once("hook:beforeDestroy", () => {
      this.stopResizeObserver();
      if (this.bpmnModeler) this.bpmnModeler.destroy();
      this.$emit("destroy", this.bpmnModeler);
      this.bpmnModeler = null;
    });
    // 初始模型的监听器
    this.initModelListeners();
  },
  watch: {
    xml: function (newValue) {
      if (!this.isModernContract) return;
      this.xmlValue = newValue;
      this.createNewDiagram(newValue);
    },
    view: function (newView) {
      if (!this.isModernContract) return;
      this.setModernView(newView);
    },
    value: function (newValue) { // 在 xmlString 发生变化时，重新创建，从而绘制流程图
      if (this.isModernContract) return;
      this.xmlValue = newValue;
      this.createNewDiagram(this.xmlValue);
    },
    activityData: function (newActivityData) {
      if (this.isModernContract) return;
      this.activityList = newActivityData;
      this.createNewDiagram(this.xmlValue);
    },
    processInstanceData: function (newProcessInstanceData) {
      if (this.isModernContract) return;
      this.processInstance = newProcessInstanceData;
      this.createNewDiagram(this.xmlValue);
    },
    taskData: function (newTaskListData) {
      if (this.isModernContract) return;
      this.taskList = newTaskListData;
      this.createNewDiagram(this.xmlValue);
    }
  },
  methods: {
    initBpmnModeler() {
      if (this.bpmnModeler) return;
      this.bpmnModeler = new BpmnViewer({
        // MoveCanvas is included by the Vue3 viewer and is safe for the
        // bpmn-js 8.x runtime used by this Vue2 application.
        additionalModules: [MoveCanvasModule],
        container: this.$refs["bpmn-canvas"],
        bpmnRenderer: {
        }
      });
      if (this.bpmnModeler.on) {
        this.bpmnModeler.on('element.click', ({ element }) => {
          this.onModernElementSelect(element);
        });
      }
    },
    /* 创建新的流程图 */
    async createNewDiagram(xml) {
      if (!this.bpmnModeler) {
        return;
      }
      const requestId = ++this.importRequestId;
      // Do not manufacture an empty diagram for the modern detail contract:
      // Vue3 deliberately leaves the canvas empty until BPMN XML is returned.
      if (this.isModernContract && !xml) {
        this.clearModernCanvas();
        return;
      }
      // 将字符串转换成图显示出来
      let newId = `Process_${new Date().getTime()}`;
      let newName = `业务流程_${new Date().getTime()}`;
      let xmlString = xml || DefaultEmptyXML(newId, newName, this.prefix);
      try {
        // A modern view can be refreshed while the previous import is still
        // parsing.  Clearing first prevents stale markers and lets the latest
        // request own the canvas.
        if (this.isModernContract && this.bpmnModeler.clear) {
          this.bpmnModeler.clear();
        }
        // console.log(this.bpmnModeler.importXML);
        let { warnings } = await this.bpmnModeler.importXML(xmlString);
        if (requestId !== this.importRequestId) return;
        if (warnings && warnings.length) {
          warnings.forEach(warn => console.warn(warn));
        }
        // 高亮流程图
        if (this.isModernContract) {
          this.addCustomDefs();
          this.setModernView(this.view);
        } else {
          await this.highlightDiagram();
        }
        await this.fitViewport();
        if (this.isModernContract) {
          this.startResizeObserver();
        }
      } catch (e) {
        if (requestId === this.importRequestId) {
          console.error(e);
          if (this.isModernContract) this.clearModernCanvas();
        }
        // console.error(`[Process Designer Warn]: ${e?.message || e}`);
      }
    },
    async fitViewport() {
      if (this._isBeingDestroyed || this._isDestroyed) return;
      await this.$nextTick();
      if (this._isBeingDestroyed || this._isDestroyed) return;
      const canvasEl = this.$refs["bpmn-canvas"];
      if (!canvasEl) {
        return;
      }
      const { width, height } = canvasEl.getBoundingClientRect();
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        setTimeout(() => {
          if (!this._isBeingDestroyed && !this._isDestroyed) this.fitViewport();
        }, 100);
        return;
      }
      try {
        const canvas = this.bpmnModeler.get('canvas');
        canvas.zoom("fit-viewport", "auto");
        if (this.isModernContract) this.defaultZoom = 1;
      } catch (e) {
        // diagram-js can throw while a hidden tab is still measuring. Keep the
        // viewer usable and retry once after layout settles.
        setTimeout(() => {
          if (this._isBeingDestroyed || this._isDestroyed) return;
          try {
            const canvas = this.bpmnModeler && this.bpmnModeler.get('canvas');
            if (canvas) {
              canvas.zoom("fit-viewport", "auto");
              if (this.isModernContract) this.defaultZoom = 1;
            }
          } catch (ignore) {}
        }, 100);
      }
    },
    /** Stop the observer used by the Vue3 viewer contract. */
    stopResizeObserver() {
      if (this.resizeObserver && this.resizeObserver.disconnect) {
        this.resizeObserver.disconnect();
      }
      this.resizeObserver = null;
    },
    /**
     * Wait until a viewer mounted in a hidden tab receives a real size.  The
     * old viewer's one-shot fitViewport retry is retained; this observer is
     * only enabled for the modern `xml`/`view` API.
     */
    startResizeObserver() {
      this.stopResizeObserver();
      if (!this.isModernContract || !this.$refs["bpmn-canvas"] || !this.bpmnModeler) {
        return;
      }
      const canvasEl = this.$refs["bpmn-canvas"];
      const width = canvasEl.clientWidth;
      const height = canvasEl.clientHeight;
      if (width > 0 && height > 0) {
        this.processReZoom();
        return;
      }
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const rect = entry && entry.contentRect;
          if (rect && rect.width > 0 && rect.height > 0 && this.bpmnModeler) {
            this.processReZoom();
            this.stopResizeObserver();
            break;
          }
        }
      });
      this.resizeObserver.observe(canvasEl);
    },
    processReZoom() {
      this.defaultZoom = 1;
      try {
        const canvas = this.bpmnModeler && this.bpmnModeler.get('canvas');
        if (canvas) canvas.zoom('fit-viewport', 'auto');
      } catch (e) {
        // Hidden/just-destroyed tabs can briefly make diagram-js unavailable.
      }
    },
    processZoomIn(zoomStep = 0.1) {
      const nextZoom = Math.floor((this.defaultZoom * 100 + zoomStep * 100)) / 100;
      if (nextZoom > 4) return;
      this.defaultZoom = nextZoom;
      try {
        const canvas = this.bpmnModeler && this.bpmnModeler.get('canvas');
        if (canvas) canvas.zoom(nextZoom);
      } catch (e) {}
    },
    processZoomOut(zoomStep = 0.1) {
      const nextZoom = Math.floor((this.defaultZoom * 100 - zoomStep * 100)) / 100;
      if (nextZoom < 0.2) return;
      this.defaultZoom = nextZoom;
      try {
        const canvas = this.bpmnModeler && this.bpmnModeler.get('canvas');
        if (canvas) canvas.zoom(nextZoom);
      } catch (e) {}
    },
    clearModernCanvas() {
      this.stopResizeObserver();
      if (!this.isModernContract || !this.bpmnModeler) return;
      try {
        if (this.bpmnModeler.clear) this.bpmnModeler.clear();
      } catch (e) {}
      this.modernDialogVisible = false;
    },
    addCustomDefs() {
      if (!this.isModernContract || !this.bpmnModeler || !this.$refs.customDefs) return;
      try {
        const canvas = this.bpmnModeler.get('canvas');
        const svg = canvas && canvas._svg;
        if (svg && this.$refs.customDefs.parentNode !== svg) {
          svg.appendChild(this.$refs.customDefs);
        }
      } catch (e) {
        // Marker definitions are cosmetic; a renderer without an accessible
        // SVG should still leave the process diagram usable.
      }
    },
    /** Normalize and retain the instance view even while BPMN is loading. */
    setModernView(view) {
      if (!this.isModernContract) return;
      const nextView = view && typeof view === 'object' ? view : {};
      this.modernProcessInstance = nextView.processInstance || undefined;
      this.modernTasks = this.toTaskArray(nextView.tasks);
      // Keep these mirrors populated for consumers that still rely on the
      // value-based hover implementation. Marker rendering itself uses the
      // dedicated status arrays below.
      this.processInstance = this.modernProcessInstance;
      this.taskList = this.modernTasks;
      this.setModernProcessStatus(nextView);
    },
    toModernArray(value) {
      if (Array.isArray(value)) return value;
      if (value && typeof value !== 'string') {
        try {
          if (typeof Symbol !== 'undefined' && Symbol.iterator && typeof value[Symbol.iterator] === 'function') {
            return Array.from(value);
          }
        } catch (e) {
          return [];
        }
      }
      return value == null ? [] : [value];
    },
    toTaskArray(value) {
      if (Array.isArray(value)) return value.slice();
      if (value == null || typeof value === 'string') return [];
      try {
        if (typeof Symbol !== 'undefined' && Symbol.iterator && typeof value[Symbol.iterator] === 'function') {
          return Array.from(value);
        }
      } catch (e) {}
      return [];
    },
    getModernCanvas() {
      try {
        return this.bpmnModeler && this.bpmnModeler.get('canvas');
      } catch (e) {
        return null;
      }
    },
    getModernRegistry() {
      try {
        return this.bpmnModeler && this.bpmnModeler.get('elementRegistry');
      } catch (e) {
        return null;
      }
    },
    clearModernMarkers() {
      const canvas = this.getModernCanvas();
      const registry = this.getModernRegistry();
      if (!canvas || !registry) return;
      const markers = this.modernMarkers || [];
      try {
        registry.forEach(element => {
          markers.forEach(marker => canvas.removeMarker(element.id, marker));
        });
      } catch (e) {
        // A partially imported diagram may not expose all registry methods.
      }
    },
    addModernMarker(canvas, id, marker) {
      if (id == null || !canvas || !marker) return;
      try {
        canvas.addMarker(String(id), marker);
      } catch (e) {
        // Ignore stale IDs from an instance view that belongs to an older XML.
      }
    },
    /** Paint Vue3's finished / pending / rejected status marker arrays. */
    setModernProcessStatus(view) {
      if (!this.isModernContract) return;
      const nextView = view && typeof view === 'object' ? view : {};
      this.modernProcessInstance = nextView.processInstance || undefined;
      this.modernTasks = this.toTaskArray(nextView.tasks);
      if (!this.bpmnModeler || !this.$refs["bpmn-canvas"]) return;
      const canvas = this.getModernCanvas();
      const registry = this.getModernRegistry();
      if (!canvas || !registry) return;
      this.clearModernMarkers();

      this.toModernArray(nextView.finishedSequenceFlowActivityIds).forEach(id => {
        this.addModernMarker(canvas, id, 'success');
        try {
          const element = registry.get(String(id));
          if (element && element.businessObject && element.businessObject.conditionExpression) {
            this.addModernMarker(canvas, id, 'condition-expression');
          }
        } catch (e) {}
      });
      this.toModernArray(nextView.finishedTaskActivityIds).forEach(id => {
        this.addModernMarker(canvas, id, 'success');
      });
      this.toModernArray(nextView.unfinishedTaskActivityIds).forEach(id => {
        this.addModernMarker(canvas, id, 'primary');
      });
      this.toModernArray(nextView.rejectedTaskActivityIds).forEach(id => {
        this.addModernMarker(canvas, id, 'danger');
      });

      // End nodes are included in finished IDs by the backend for cancelled
      // and rejected instances; override that success marker as Vue3 does.
      const status = Number(this.modernProcessInstance && this.modernProcessInstance.status);
      if (status === 4 || status === 3) {
        let endNodes = [];
        try {
          endNodes = registry.filter(element => element.type === 'bpmn:EndEvent');
        } catch (e) {}
        endNodes.forEach(element => {
          this.addModernMarker(canvas, element.id, status === 4 ? 'cancel' : 'danger');
          try { canvas.removeMarker(element.id, 'success'); } catch (e) {}
        });
      }
    },
    onModernElementSelect(element) {
      if (!this.isModernContract || !element) return;
      const instance = this.modernProcessInstance || this.processInstance;
      if (!instance || (instance.id == null && instance.processInstanceId == null)) return;
      const activityType = element.type;
      this.modernSelectedActivityType = activityType;
      this.modernDialogTitle = undefined;
      this.modernSelectedTasks = [];
      if (activityType === 'bpmn:UserTask') {
        this.modernDialogTitle = element.businessObject && element.businessObject.name;
        this.modernSelectedTasks = this.modernTasks.filter(task =>
          task && (String(task.taskDefinitionKey) === String(element.id) || String(task.activityId) === String(element.id))
        );
        this.modernDialogVisible = true;
      } else if (activityType === 'bpmn:EndEvent' || activityType === 'bpmn:StartEvent') {
        this.modernDialogTitle = '审批信息';
        this.modernSelectedTasks = [{
          assigneeUser: instance.startUser,
          ownerUser: instance.startUser,
          createTime: instance.startTime || instance.createTime,
          endTime: instance.endTime,
          status: instance.status,
          durationInMillis: instance.durationInMillis
        }];
        this.modernDialogVisible = true;
      }
    },
    getTaskUserName(task) {
      const user = (task && (task.assigneeUser || task.ownerUser)) || {};
      return user.nickname || user.name || user.username || user.id || '';
    },
    getTaskDeptName(task) {
      const user = (task && (task.assigneeUser || task.ownerUser)) || {};
      return user.deptName || '';
    },
    formatViewerTime(value) {
      if (!value) return '';
      try {
        if (typeof this.parseTime === 'function') return this.parseTime(value);
      } catch (e) {}
      return value;
    },
    getTaskStatusLabel(status) {
      try {
        if (typeof this.getDictDataLabel === 'function' && this.DICT_TYPE) {
          return this.getDictDataLabel(this.DICT_TYPE.BPM_TASK_STATUS, status);
        }
      } catch (e) {}
      const labels = {
        0: '待审批',
        1: '审批中',
        2: '已通过',
        3: '已拒绝',
        4: '已取消',
        5: '已退回'
      };
      return labels[Number(status)] || status || '';
    },
    formatViewerDuration(value) {
      return formatPast2(value);
    },
    /* 高亮流程图 */
    // TODO 芋艿：如果多个 endActivity 的话，目前的逻辑可能有一定的问题。https://www.jdon.com/workflow/multi-events.html
    async highlightDiagram() {
      const activityList = this.activityList;
      if (activityList.length === 0) {
        return;
      }
      // 参考自 https://gitee.com/tony2y/RuoYi-flowable/blob/master/ruoyi-ui/src/components/Process/index.vue#L222 实现
      // 再次基础上，增加不同审批结果的颜色等等
      let canvas = this.bpmnModeler.get('canvas');
      let todoActivity = activityList.find(m => !m.endTime) // 找到待办的任务
      let endActivity = activityList[activityList.length - 1] // 获得最后一个任务
      // debugger
      // console.log(this.bpmnModeler.getDefinitions().rootElements[0].flowElements);
      this.bpmnModeler.getDefinitions().rootElements[0].flowElements?.forEach(n => {
        let activity = activityList.find(m => m.key === n.id) // 找到对应的活动
        if (!activity) {
          return;
        }
        if (n.$type === 'bpmn:UserTask' || n.$type === 'bpmn:CallActivity') { // 用户任务和子流程调用
          // 处理用户任务的高亮
          const task = this.taskList.find(m => m.id === activity.taskId); // 找到活动对应的 taskId
          if (!task) {
            return;
          }
          // 高亮任务
          canvas.addMarker(n.id, this.getResultCss(task.result));

          // 如果非通过，就不走后面的线条了
          if (task.result !== 2) {
            return;
          }
          // 处理 outgoing 出线
          const outgoing = this.getActivityOutgoing(activity);
          outgoing?.forEach(nn => {
            // debugger
            let targetActivity = activityList.find(m => m.key === nn.targetRef.id)
            // 如果目标活动存在，则根据该活动是否结束，进行【bpmn:SequenceFlow】连线的高亮设置
            if (targetActivity) {
              canvas.addMarker(nn.id, targetActivity.endTime ? 'highlight' : 'highlight-todo');
            } else if (nn.targetRef.$type === 'bpmn:ExclusiveGateway') { // TODO 芋艿：这个流程，暂时没走到过
              canvas.addMarker(nn.id, activity.endTime ? 'highlight' : 'highlight-todo');
              canvas.addMarker(nn.targetRef.id, activity.endTime ? 'highlight' : 'highlight-todo');
            } else if (nn.targetRef.$type === 'bpmn:EndEvent') { // TODO 芋艿：这个流程，暂时没走到过
              if (!todoActivity && endActivity.key === n.id) {
                canvas.addMarker(nn.id, 'highlight');
                canvas.addMarker(nn.targetRef.id, 'highlight');
              }
              if (!activity.endTime) {
                canvas.addMarker(nn.id, 'highlight-todo');
                canvas.addMarker(nn.targetRef.id, 'highlight-todo');
              }
            }
          });
        } else if (n.$type === 'bpmn:ExclusiveGateway') { // 排它网关
          // 设置【bpmn:ExclusiveGateway】排它网关的高亮
          canvas.addMarker(n.id, this.getActivityHighlightCss(activity));
          // 查找需要高亮的连线
          let matchNN = undefined;
          let matchActivity = undefined;
          n.outgoing?.forEach(nn => {
            let targetActivity = activityList.find(m => m.key === nn.targetRef.id);
            if (!targetActivity) {
              return;
            }
            // 特殊判断 endEvent 类型的原因，ExclusiveGateway 可能后续连有 2 个路径：
            //  1. 一个是 UserTask => EndEvent
            //  2. 一个是 EndEvent
            // 在选择路径 1 时，其实 EndEvent 可能也存在，导致 1 和 2 都高亮，显然是不正确的。
            // 所以，在 matchActivity 为 EndEvent 时，需要进行覆盖~~
            if (!matchActivity || matchActivity.type === 'endEvent') {
              matchNN = nn;
              matchActivity = targetActivity;
            }
          })
          if (matchNN && matchActivity) {
            canvas.addMarker(matchNN.id, this.getActivityHighlightCss(matchActivity));
          }
        } else if (n.$type === 'bpmn:ParallelGateway') { // 并行网关
          // 设置【bpmn:ParallelGateway】并行网关的高亮
          canvas.addMarker(n.id, this.getActivityHighlightCss(activity));
          n.outgoing?.forEach(nn => {
            // 获得连线是否有指向目标。如果有，则进行高亮
            const targetActivity = activityList.find(m => m.key === nn.targetRef.id)
            if (targetActivity) {
              canvas.addMarker(nn.id, this.getActivityHighlightCss(targetActivity)); // 高亮【bpmn:SequenceFlow】连线
              // 高亮【...】目标。其中 ... 可以是 bpm:UserTask、也可以是其它的。当然，如果是 bpm:UserTask 的话，其实不做高亮也没问题，因为上面有逻辑做了这块。
              canvas.addMarker(nn.targetRef.id, this.getActivityHighlightCss(targetActivity));
            }
          })
        } else if (n.$type === 'bpmn:StartEvent') { // 开始节点
          n.outgoing?.forEach(nn => { // outgoing 例如说【bpmn:SequenceFlow】连线
            // 获得连线是否有指向目标。如果有，则进行高亮
            let targetActivity = activityList.find(m => m.key === nn.targetRef.id);
            if (targetActivity) {
              canvas.addMarker(nn.id, 'highlight'); // 高亮【bpmn:SequenceFlow】连线
              canvas.addMarker(n.id, 'highlight'); // 高亮【bpmn:StartEvent】开始节点（自己）
            }
          });
        } else if (n.$type === 'bpmn:EndEvent') { // 结束节点
          if (!this.processInstance || this.processInstance.result === 1) {
            return;
          }
          canvas.addMarker(n.id, this.getResultCss(this.processInstance.result));
        } else if (n.$type === 'bpmn:ServiceTask'){ //服务任务
          if(activity.startTime>0 && activity.endTime===0){//进入执行，标识进行色
            canvas.addMarker(n.id, this.getResultCss(1));
          }
          if(activity.endTime>0){// 执行完成，节点标识完成色, 所有outgoing标识完成色。
            canvas.addMarker(n.id, this.getResultCss(2));
            const outgoing = this.getActivityOutgoing(activity)
            outgoing?.forEach(out=>{
              canvas.addMarker(out.id,this.getResultCss(2))
            })
          }
        }
      })
    },
    getActivityHighlightCss(activity) {
      return activity.endTime ? 'highlight' : 'highlight-todo';
    },
    getResultCss(result) {
      if (result === 1) { // 审批中
        return 'highlight-todo';
      } else if (result === 2) { // 已通过
        return 'highlight';
      } else if (result === 3) { // 不通过
        return 'highlight-reject';
      } else if (result === 4) { // 已取消
        return 'highlight-cancel';
      } else if (result === 5) { // 已退回
        return 'highlight-back';
      } else if (result === 6) { // 已委派
        return 'highlight-todo';
      }
      return '';
    },
    getActivityOutgoing(activity) {
      // 如果有 outgoing，则直接使用它
      if (activity.outgoing && activity.outgoing.length > 0) {
        return activity.outgoing;
      }
      // 如果没有，则遍历获得起点为它的【bpmn:SequenceFlow】节点们。原因是：bpmn-js 的 UserTask 拿不到 outgoing
      const flowElements = this.bpmnModeler.getDefinitions().rootElements[0].flowElements;
      const outgoing = [];
      flowElements.forEach(item => {
        if (item.$type !== 'bpmn:SequenceFlow') {
          return;
        }
        if (item.sourceRef.id === activity.key) {
          outgoing.push(item);
        }
      });
      return outgoing;
    },
    initModelListeners() {
      const EventBus = this.bpmnModeler.get("eventBus");
      const that = this;
      // 注册需要的监听事件
      EventBus.on('element.hover', function(eventObj) {
        let element = eventObj ? eventObj.element : null;
        that.elementHover(element);
      });
      EventBus.on('element.out', function(eventObj) {
        let element = eventObj ? eventObj.element : null;
        that.elementOut(element);
      });
    },
    // 流程图的元素被 hover
    elementHover(element) {
      if (!element || !this.bpmnModeler) return;
      this.element = element;
      !this.elementOverlayIds && (this.elementOverlayIds = {});
      !this.overlays && (this.overlays = this.bpmnModeler.get("overlays"));
      // 展示信息
      const activity = this.activityList.find(m => m.key === element.id);
      if (!activity) {
        return;
      }
      if (!this.elementOverlayIds[element.id] && element.type !== "bpmn:Process") {
        let html = `<div class="element-overlays">
            <p>Elemet id: ${element.id}</p>
            <p>Elemet type: ${element.type}</p>
          </div>`; // 默认值
        if (element.type === 'bpmn:StartEvent' && this.processInstance) {
          const startUser = this.processInstance.startUser || {};
          html = `<p>发起人：${startUser.nickname || startUser.name || this.processInstance.startUserNickname || ''}</p>
                  <p>部门：${startUser.deptName || ''}</p>
                  <p>创建时间：${this.parseTime(this.processInstance.createTime)}`;
        } else if (element.type === 'bpmn:UserTask' || element.type === 'bpmn:CallActivity') {
          // debugger
          let task = this.taskList.find(m => m.id === activity.taskId); // 找到活动对应的 taskId
          if (!task) {
            return;
          }
          const assignee = task.assigneeUser || task.ownerUser || {};
          html = `<p>审批人：${assignee.nickname || assignee.name || assignee.id || ''}</p>
                  <p>部门：${assignee.deptName || ''}</p>
                  <p>结果：${this.getDictDataLabel(this.DICT_TYPE.BPM_PROCESS_INSTANCE_RESULT, task.result)}</p>
                  <p>创建时间：${this.parseTime(task.createTime)}</p>`;
          if (task.endTime) {
            html += `<p>结束时间：${this.parseTime(task.endTime)}</p>`
          }
          if (task.reason) {
            html += `<p>审批建议：${task.reason}</p>`
          }
        } else if (element.type === 'bpmn:ServiceTask' && this.processInstance) {
          if(activity.startTime>0){
            html = `<p>创建时间：${this.parseTime(activity.startTime)}</p>`;
          }
          if(activity.endTime>0){
            html += `<p>结束时间：${this.parseTime(activity.endTime)}</p>`
          }
          console.log(html)
        } else if (element.type === 'bpmn:EndEvent' && this.processInstance) {
          html = `<p>结果：${this.getDictDataLabel(this.DICT_TYPE.BPM_PROCESS_INSTANCE_RESULT, this.processInstance.result)}</p>`;
          if (this.processInstance.endTime) {
            html += `<p>结束时间：${this.parseTime(this.processInstance.endTime)}</p>`
          }
        }
        this.elementOverlayIds[element.id] = this.overlays.add(element, {
          position: { left: 0, bottom: 0 },
          html: `<div class="element-overlays">${html}</div>`
        });
      }
    },
    // 流程图的元素被 out
    elementOut(element) {
      if (!element) return;
      if (this.overlays && this.overlays.remove) {
        this.overlays.remove({ element });
      }
      if (this.elementOverlayIds) this.elementOverlayIds[element.id] = null;
    },
  }
};
</script>

<style>

/** 处理中 */
.highlight-todo.djs-connection > .djs-visual > path {
  stroke: #1890ff !important;
  stroke-dasharray: 4px !important;
  fill-opacity: 0.2 !important;
}
.highlight-todo.djs-shape .djs-visual > :nth-child(1) {
  fill: #1890ff !important;
  stroke: #1890ff !important;
  stroke-dasharray: 4px !important;
  fill-opacity: 0.2 !important;
}

:deep(.highlight-todo.djs-connection > .djs-visual > path) {
  stroke: #1890ff !important;
  stroke-dasharray: 4px !important;
  fill-opacity: 0.2 !important;
  marker-end: url(#sequenceflow-end-_E7DFDF-_E7DFDF-803g1kf6zwzmcig1y2ulm5egr);
}
:deep(.highlight-todo.djs-shape .djs-visual > :nth-child(1)) {
  fill: #1890ff !important;
  stroke: #1890ff !important;
  stroke-dasharray: 4px !important;
  fill-opacity: 0.2 !important;
}

/** 通过 */
.highlight.djs-shape .djs-visual > :nth-child(1) {
  fill: green !important;
  stroke: green !important;
  fill-opacity: 0.2 !important;
}
.highlight.djs-shape .djs-visual > :nth-child(2) {
  fill: green !important;
}
.highlight.djs-shape .djs-visual > path {
  fill: green !important;
  fill-opacity: 0.2 !important;
  stroke: green !important;
}
.highlight.djs-connection > .djs-visual > path {
  stroke: green !important;
}

.highlight:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: green !important; /* color elements as green */
}

:deep(.highlight.djs-shape .djs-visual > :nth-child(1)) {
  fill: green !important;
  stroke: green !important;
  fill-opacity: 0.2 !important;
}
:deep(.highlight.djs-shape .djs-visual > :nth-child(2)) {
  fill: green !important;
}
:deep(.highlight.djs-shape .djs-visual > path) {
  fill: green !important;
  fill-opacity: 0.2 !important;
  stroke: green !important;
}
:deep(.highlight.djs-connection > .djs-visual > path) {
  stroke: green !important;
}

/** 不通过 */
.highlight-reject.djs-shape .djs-visual > :nth-child(1) {
  fill: red !important;
  stroke: red !important;
  fill-opacity: 0.2 !important;
}
.highlight-reject.djs-shape .djs-visual > :nth-child(2) {
  fill: red !important;
}
.highlight-reject.djs-shape .djs-visual > path {
  fill: red !important;
  fill-opacity: 0.2 !important;
  stroke: red !important;
}
.highlight-reject.djs-connection > .djs-visual > path {
  stroke: red !important;
}

.highlight-reject:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: red !important; /* color elements as green */
}

:deep(.highlight-reject.djs-shape .djs-visual > :nth-child(1)) {
  fill: red !important;
  stroke: red !important;
  fill-opacity: 0.2 !important;
}
:deep(.highlight-reject.djs-shape .djs-visual > :nth-child(2)) {
  fill: red !important;
}
:deep(.highlight-reject.djs-shape .djs-visual > path) {
  fill: red !important;
  fill-opacity: 0.2 !important;
  stroke: red !important;
}
:deep(.highlight-reject.djs-connection > .djs-visual > path) {
  stroke: red !important;
}

/** 已取消 */
.highlight-cancel.djs-shape .djs-visual > :nth-child(1) {
  fill: grey !important;
  stroke: grey !important;
  fill-opacity: 0.2 !important;
}
.highlight-cancel.djs-shape .djs-visual > :nth-child(2) {
  fill: grey !important;
}
.highlight-cancel.djs-shape .djs-visual > path {
  fill: grey !important;
  fill-opacity: 0.2 !important;
  stroke: grey !important;
}
.highlight-cancel.djs-connection > .djs-visual > path {
  stroke: grey !important;
}

.highlight-cancel:not(.djs-connection) .djs-visual > :nth-child(1) {
  fill: grey !important; /* color elements as green */
}

:deep(.highlight-cancel.djs-shape .djs-visual > :nth-child(1)) {
  fill: grey !important;
  stroke: grey !important;
  fill-opacity: 0.2 !important;
}
:deep(.highlight-cancel.djs-shape .djs-visual > :nth-child(2)) {
  fill: grey !important;
}
:deep(.highlight-cancel.djs-shape .djs-visual > path) {
  fill: grey !important;
  fill-opacity: 0.2 !important;
  stroke: grey !important;
}
:deep(.highlight-cancel.djs-connection > .djs-visual > path) {
  stroke: grey !important;
}
/**驳回 */
.highlight-back.djs-connection > .djs-visual > path {
  stroke: #FFBA00 !important;
  stroke-dasharray: 4px !important;
  fill-opacity: 0.2 !important;
}

.highlight-back.djs-shape .djs-visual > :nth-child(1) {
  fill: #FFBA00 !important;
  stroke: #FFBA00 !important;
  stroke-dasharray: 4px !important;
  fill-opacity: 0.2 !important;
}

:deep(.highlight-back.djs-connection > .djs-visual > path) {
  stroke: #FFBA00 !important;
  stroke-dasharray: 4px !important;
  fill-opacity: 0.2 !important;
  marker-end: url(#sequenceflow-end-_E7DFDF-_E7DFDF-803g1kf6zwzmcig1y2ulm5egr);
}

:deep(.highlight-back.djs-shape .djs-visual > :nth-child(1)) {
  fill: #FFBA00 !important;
  stroke: #FFBA00 !important;
  stroke-dasharray: 4px !important;
  fill-opacity: 0.2 !important;
}
.element-overlays {
  box-sizing: border-box;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  color: #fafafa;
  width: 200px;
}

/* Vue3 viewer skin. Keep these selectors global (the bpmn-js SVG is rendered
   outside Vue's scoped attribute tree) and retain the highlight-* selectors
   above for value/activityData callers. */
.process-viewer {
  position: relative;
  width: 100%;
  min-height: 560px;
  border: 1px solid #efefef;
  /* Match Vue3's designer theme so the detail canvas has the same visual
     grid even when the standalone theme stylesheet is not imported. */
  background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')
    repeat !important;
  overflow: auto;
}

.process-viewer .djs-tooltip-container,
.process-viewer .djs-overlay-container,
.process-viewer .djs-palette {
  display: none;
}

.process-viewer .my-process-designer__container,
.process-viewer .my-process-designer__canvas {
  width: 100%;
  min-height: 560px;
  height: 100%;
}

.process-viewer__defs {
  display: none;
}

.process-viewer__zoom {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 5;
}

.process-viewer__zoom-value {
  min-width: 58px;
  padding-left: 8px !important;
  padding-right: 8px !important;
}

.process-viewer .success-arrow {
  fill: #4eb819;
  stroke: #4eb819;
}

.process-viewer .success-conditional {
  fill: #fff;
  stroke: #4eb819;
}

.process-viewer .success.djs-connection > .djs-visual > path {
  stroke: #4eb819 !important;
}

.process-viewer .success.djs-shape .djs-visual > rect,
.process-viewer .success.djs-shape .djs-visual > circle {
  stroke: #4eb819 !important;
  fill: #4eb819 !important;
  fill-opacity: 0.15 !important;
}

.process-viewer .success.djs-shape .djs-visual > polygon,
.process-viewer .success.djs-shape .djs-visual > path:nth-child(2) {
  stroke: #4eb819 !important;
  fill: #4eb819 !important;
}

.process-viewer .primary.djs-shape .djs-visual > rect,
.process-viewer .primary.djs-shape .djs-visual > circle {
  stroke: #409eff !important;
  fill: #409eff !important;
  fill-opacity: 0.15 !important;
}

.process-viewer .primary.djs-shape .djs-visual > polygon {
  stroke: #409eff !important;
}

.process-viewer .danger.djs-shape .djs-visual > rect,
.process-viewer .danger.djs-shape .djs-visual > circle {
  stroke: #f56c6c !important;
  fill: #f56c6c !important;
  fill-opacity: 0.15 !important;
}

.process-viewer .danger.djs-shape .djs-visual > polygon {
  stroke: #f56c6c !important;
}

.process-viewer .cancel.djs-shape .djs-visual > rect,
.process-viewer .cancel.djs-shape .djs-visual > circle {
  stroke: #909399 !important;
  fill: #909399 !important;
  fill-opacity: 0.15 !important;
}

.process-viewer .cancel.djs-shape .djs-visual > polygon {
  stroke: #909399 !important;
}
</style>
