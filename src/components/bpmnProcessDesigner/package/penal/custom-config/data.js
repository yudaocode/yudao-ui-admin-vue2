import UserTaskCustomConfig from './components/UserTaskCustomConfig.vue'
import BoundaryEventTimer from './components/BoundaryEventTimer.vue'

// Keep the map keyed by the same bpmn-js type suffixes as the Vue3 panel.
// `componet` is retained for wire compatibility with the upstream map typo;
// ElementCustomConfig also accepts `component` for future entries.
export const CustomConfigMap = {
  UserTask: {
    name: '用户任务',
    componet: UserTaskCustomConfig,
    component: UserTaskCustomConfig
  },
  BoundaryEventTimerEventDefinition: {
    name: '定时边界事件(非中断)',
    componet: BoundaryEventTimer,
    component: BoundaryEventTimer
  }
}
