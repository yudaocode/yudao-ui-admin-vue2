import UserTaskCustomConfig from './components/UserTaskCustomConfig.vue'
import BoundaryEventTimer from './components/BoundaryEventTimer.vue'

// Keep the map keyed by the same bpmn-js type suffixes and component field as
// the Vue3 panel.  `componet` is the established local map property used by
// the upstream designer (the spelling is part of that local contract).
export const CustomConfigMap = {
  UserTask: {
    name: '用户任务',
    componet: UserTaskCustomConfig
  },
  BoundaryEventTimerEventDefinition: {
    name: '定时边界事件(非中断)',
    componet: BoundaryEventTimer
  }
}
