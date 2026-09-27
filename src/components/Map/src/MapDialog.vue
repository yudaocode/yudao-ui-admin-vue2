<!-- 地图选择弹窗组件：基于百度地图 GL 实现 -->
<template>
  <el-dialog
    title="百度地图"
    :visible.sync="dialogVisible"
    append-to-body
    @opened="handleDialogOpened"
    @closed="handleDialogClosed"
  >
    <div class="map-dialog-content">
      <!-- 第一行：位置搜索 -->
      <el-form label-width="80px">
        <el-form-item label="定位位置">
          <el-select
            v-model="state.address"
            class="map-dialog-control"
            clearable
            filterable
            remote
            reserve-keyword
            placeholder="可输入地址查询经纬度"
            :remote-method="autoSearch"
            :loading="state.loading"
            @change="handleAddressSelect"
          >
            <el-option
              v-for="item in state.mapAddressOptions"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <!-- 第二行：坐标显示 -->
        <el-form-item label="当前坐标">
          <div class="map-dialog-coordinate">
            <span>经度: {{ state.longitude || '-' }}</span>
            <span>纬度: {{ state.latitude || '-' }}</span>
          </div>
        </el-form-item>
      </el-form>
      <!-- 第三行：地图 -->
      <div v-if="state.mapContainerReady" ref="mapContainer" class="map-dialog-map" />
      <div v-else class="map-dialog-map map-dialog-loading">
        <span>地图加载中...</span>
      </div>
    </div>
    <span slot="footer">
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { loadBaiduMapSdk } from './utils'

export default {
  name: 'MapDialog',
  data() {
    return {
      dialogVisible: false,
      initLongitude: undefined,
      initLatitude: undefined,
      state: {
        lonLat: '', // 经纬度字符串，格式为 "经度,纬度"
        address: '', // 地址信息
        loading: false, // 地址搜索加载状态
        latitude: '', // 纬度
        longitude: '', // 经度
        map: null, // 百度地图实例
        mapAddressOptions: [], // 地址搜索选项
        mapMarker: null, // 地图标记点
        geocoder: null, // 地理编码器实例
        mapContainerReady: false // 地图容器是否准备好
      }
    }
  },
  methods: {
    /** 打开弹窗 */
    open(longitude, latitude) {
      this.initLongitude = longitude
      this.initLatitude = latitude
      this.state.longitude = longitude ? String(longitude) : ''
      this.state.latitude = latitude ? String(latitude) : ''
      this.state.address = ''
      this.state.mapAddressOptions = []
      this.dialogVisible = true
    },
    /** 弹窗打开动画完成后初始化地图 */
    async handleDialogOpened() {
      // 先显示地图容器
      this.state.mapContainerReady = true
      // 等待下一个 DOM 更新周期，确保地图容器已渲染
      await this.$nextTick()
      try {
        // 加载百度地图 SDK
        await loadBaiduMapSdk()
        this.initMapInstance()
      } catch (error) {
        this.state.mapContainerReady = false
        this.$message.error(error.message)
      }
    },
    /** 弹窗关闭后清理地图 */
    handleDialogClosed() {
      // 销毁地图实例
      if (this.state.map) {
        if (this.state.map.destroy) {
          this.state.map.destroy()
        }
        this.state.map = null
      }
      this.state.mapMarker = null
      this.state.geocoder = null
      this.state.mapContainerReady = false
    },
    /** 初始化地图实例 */
    initMapInstance() {
      if (!this.$refs.mapContainer) {
        return
      }
      // 初始化地图和地理编码器
      this.initMap()
      this.initGeocoder()
      // 监听地图点击事件
      this.state.map.addEventListener('click', e => {
        const point = e.latlng
        this.state.lonLat = point.lng + ',' + point.lat
        this.regeoCode(this.state.lonLat)
      })
      // 如果有初始经纬度，加载标记点
      if (this.initLongitude && this.initLatitude) {
        const lonLat = `${this.initLongitude},${this.initLatitude}`
        this.regeoCode(lonLat)
      }
    },
    /** 初始化地图 */
    initMap() {
      this.state.map = new window.BMapGL.Map(this.$refs.mapContainer)
      this.state.map.centerAndZoom(new window.BMapGL.Point(116.404, 39.915), 11)
      this.state.map.enableScrollWheelZoom()
      this.state.map.disableDoubleClickZoom()
      this.state.map.addControl(new window.BMapGL.NavigationControl())
      this.state.map.addControl(new window.BMapGL.ScaleControl())
      this.state.map.addControl(new window.BMapGL.ZoomControl())
    },
    /** 初始化地理编码器 */
    initGeocoder() {
      this.state.geocoder = new window.BMapGL.Geocoder()
    },
    /** 搜索地址 */
    autoSearch(queryValue) {
      if (!queryValue) {
        this.state.mapAddressOptions = []
        return
      }
      this.state.loading = true
      // noinspection JSUnusedGlobalSymbols
      const localSearch = new window.BMapGL.LocalSearch(this.state.map, {
        onSearchComplete: results => {
          this.state.loading = false
          const temp = []
          if (results && results._pois) {
            results._pois.forEach(p => {
              const point = p.point
              if (point && point.lng && point.lat) {
                temp.push({
                  name: p.title,
                  value: point.lng + ',' + point.lat
                })
              }
            })
          }
          this.state.mapAddressOptions = temp
        }
      })
      localSearch.search(queryValue)
    },
    /** 处理地址选择 */
    handleAddressSelect(value) {
      if (value) {
        this.regeoCode(value)
      }
    },
    /** 添加标记点 */
    setMarker(lnglat) {
      if (!lnglat) {
        return
      }
      if (this.state.mapMarker !== null) {
        this.state.map.removeOverlay(this.state.mapMarker)
      }
      const point = new window.BMapGL.Point(lnglat[0], lnglat[1])
      this.state.mapMarker = new window.BMapGL.Marker(point)
      this.state.map.addOverlay(this.state.mapMarker)
      this.state.map.centerAndZoom(point, 16)
    },
    /** 经纬度转地址、添加标记点 */
    regeoCode(lonLat) {
      if (!lonLat) {
        return
      }
      const lnglat = lonLat.split(',')
      if (lnglat.length !== 2) {
        return
      }
      this.state.longitude = lnglat[0]
      this.state.latitude = lnglat[1]
      const point = new window.BMapGL.Point(lnglat[0], lnglat[1])
      this.state.map.centerAndZoom(point, 16)
      this.setMarker(lnglat)
      this.getAddress(lnglat)
    },
    /** 根据经纬度获取地址信息 */
    getAddress(lnglat) {
      const point = new window.BMapGL.Point(lnglat[0], lnglat[1])
      this.state.geocoder.getLocation(point, result => {
        if (result && result.address) {
          this.state.address = result.address
        }
      })
    },
    /** 确认选择 */
    handleConfirm() {
      if (this.state.longitude && this.state.latitude) {
        this.$emit('confirm', {
          longitude: this.state.longitude,
          latitude: this.state.latitude,
          address: this.state.address
        })
      }
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.map-dialog-content,
.map-dialog-control {
  width: 100%;
}

.map-dialog-coordinate {
  display: flex;
  align-items: center;
  gap: 16px;
}

.map-dialog-map {
  width: 100%;
  height: 400px;
  margin-top: 10px;
}

.map-dialog-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}
</style>
