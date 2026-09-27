<template>
  <div class="magic-cube-editor">
    <table class="cube-table">
      <tbody>
        <tr v-for="(rowCubes, row) in cubes" :key="row">
          <td
            v-for="(cube, col) in rowCubes"
            :key="col"
            :class="['cube', { active: cube.active }]"
            :style="{ width: cubeSize + 'px', height: cubeSize + 'px' }"
            @click="handleCubeClick(row, col)"
            @mouseenter="handleCellHover(row, col)"
          >
            <i class="el-icon-plus" />
          </td>
        </tr>
      </tbody>
      <div
        v-for="(hotArea, index) in hotAreas"
        :key="index"
        class="hot-area"
        :style="{
          top: cubeSize * hotArea.top + 'px',
          left: cubeSize * hotArea.left + 'px',
          height: cubeSize * hotArea.height + 'px',
          width: cubeSize * hotArea.width + 'px'
        }"
        @click="handleHotAreaSelected(hotArea, index)"
        @mouseover="exitHotAreaSelectMode"
      >
        <div
          v-if="selectedHotAreaIndex === index && hotArea.width && hotArea.height"
          class="btn-delete"
          @click.stop="handleDeleteHotArea(index)"
        >
          <i class="el-icon-error" />
        </div>
        <span v-if="hotArea.width">{{ `${hotArea.width}×${hotArea.height}` }}</span>
      </div>
    </table>
  </div>
</template>

<script>
import { createRect, isContains, isOverlap } from './util'

export default {
  name: 'MagicCubeEditor',
  props: {
    value: {
      type: Array,
      required: true
    },
    rows: {
      type: Number,
      default: 4
    },
    cols: {
      type: Number,
      default: 4
    },
    cubeSize: {
      type: Number,
      default: 75
    }
  },
  data() {
    return {
      cubes: [],
      hotAreas: [],
      hotAreaBeginCube: undefined,
      selectedHotAreaIndex: 0
    }
  },
  watch: {
    rows: {
      immediate: true,
      handler() {
        this.initCubes()
      }
    },
    cols() {
      this.initCubes()
    },
    value: {
      immediate: true,
      handler(value) {
        this.hotAreas = value || []
      }
    }
  },
  methods: {
    initCubes() {
      const cubes = []
      if (this.rows && this.cols) {
        for (let row = 0; row < this.rows; row += 1) {
          cubes[row] = []
          for (let col = 0; col < this.cols; col += 1) {
            cubes[row].push({ x: col, y: row, active: false })
          }
        }
      }
      this.cubes = cubes
    },
    isHotAreaSelectMode() {
      return Boolean(this.hotAreaBeginCube)
    },
    handleCubeClick(currentRow, currentCol) {
      const currentCube = this.cubes[currentRow][currentCol]
      if (!this.isHotAreaSelectMode()) {
        this.hotAreaBeginCube = currentCube
        this.hotAreaBeginCube.active = true
        return
      }
      this.hotAreas.push(createRect(this.hotAreaBeginCube, currentCube))
      this.exitHotAreaSelectMode()
      const hotAreaIndex = this.hotAreas.length - 1
      this.handleHotAreaSelected(this.hotAreas[hotAreaIndex], hotAreaIndex)
      this.emitUpdateModelValue()
    },
    handleCellHover(currentRow, currentCol) {
      if (!this.isHotAreaSelectMode()) return
      const currentSelectedArea = createRect(
        this.hotAreaBeginCube,
        this.cubes[currentRow][currentCol]
      )
      for (const hotArea of this.hotAreas) {
        if (isOverlap(hotArea, currentSelectedArea)) {
          this.exitHotAreaSelectMode()
          return
        }
      }
      this.eachCube((x, y, cube) => {
        cube.active = isContains(currentSelectedArea, cube)
      })
    },
    handleDeleteHotArea(index) {
      this.hotAreas.splice(index, 1)
      this.exitHotAreaSelectMode()
      this.emitUpdateModelValue()
    },
    emitUpdateModelValue() {
      this.$emit('input', this.hotAreas)
    },
    handleHotAreaSelected(hotArea, index) {
      this.selectedHotAreaIndex = index
      this.$emit('hotAreaSelected', hotArea, index)
    },
    exitHotAreaSelectMode() {
      this.eachCube((x, y, cube) => {
        if (cube.active) cube.active = false
      })
      this.hotAreaBeginCube = undefined
    },
    eachCube(callback) {
      for (let x = 0; x < this.cubes.length; x += 1) {
        for (let y = 0; y < this.cubes[x].length; y += 1) {
          callback(x, y, this.cubes[x][y])
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.magic-cube-editor {
  position: relative;
}

.cube-table {
  position: relative;
  border-spacing: 0;
  border-collapse: collapse;
}

.cube {
  color: #909399;
  text-align: center;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
}

.cube.active {
  background: #ecf5ff;
}

.hot-area {
  position: absolute;
  display: flex;
  color: #409eff;
  cursor: pointer;
  background: #d9ecff;
  border: 1px solid #409eff;
  border-spacing: 0;
  border-collapse: collapse;
  box-sizing: border-box;
  align-items: center;
  justify-content: center;
}

.btn-delete {
  position: absolute;
  top: -8px;
  right: -8px;
  z-index: 1;
  display: flex;
  width: 16px;
  height: 16px;
  background-color: #fff;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
}
</style>
