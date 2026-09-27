<!-- MES 条码详情 -->
<template>
  <el-dialog
    title="查看条码"
    :visible.sync="dialogVisible"
    width="500px"
    append-to-body
  >
    <div class="barcode-panel"><barcode
      v-if="barcodeData.content"
      ref="barcode"
      :content="barcodeData.content"
      :format="barcodeData.format"
      :width="400"
      :height="150"
    /><el-empty
      v-else
      description="暂无条码数据"
    /></div>
    <el-descriptions
      :column="1"
      border
    >
      <el-descriptions-item label="条码格式"><dict-tag
        v-if="barcodeData.format"
        :type="BARCODE_FORMAT"
        :value="barcodeData.format"
      /></el-descriptions-item>
      <el-descriptions-item label="业务类型"><dict-tag
        v-if="barcodeData.bizType"
        :type="BARCODE_BIZ_TYPE"
        :value="barcodeData.bizType"
      /></el-descriptions-item>
      <el-descriptions-item label="条码内容"><el-tooltip
        :content="barcodeData.content"
        placement="top"
      ><span class="ellipsis">{{ barcodeData.content }}</span></el-tooltip></el-descriptions-item>
      <el-descriptions-item label="业务编码">{{ barcodeData.bizCode || '-' }}</el-descriptions-item><el-descriptions-item label="业务名称">{{ barcodeData.bizName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态"><dict-tag
        v-if="barcodeData.status !== undefined"
        :type="DICT_TYPE.COMMON_STATUS"
        :value="barcodeData.status"
      /></el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(barcodeData.createTime) }}</el-descriptions-item>
    </el-descriptions>
    <span slot="footer"><el-button
      v-if="!barcodeData.content"
      type="warning"
      icon="el-icon-magic-stick"
      @click="handleGenerate"
    >生成</el-button><el-button
      type="primary"
      icon="el-icon-printer"
      @click="handlePrint"
    >打印</el-button><el-button
      icon="el-icon-download"
      @click="handleDownload"
    >下载</el-button><el-button @click="dialogVisible = false">关 闭</el-button></span>
  </el-dialog>
</template>
<script>
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { WmBarcodeApi } from '@/api/mes/wm/barcode'
import Barcode from './Barcode.vue'
const BARCODE_FORMAT = 'mes_wm_barcode_format'
const BARCODE_BIZ_TYPE = 'mes_wm_barcode_biz_type'
export default {
  name: 'BarcodeDetail', components: { Barcode },
  data() { return { DICT_TYPE, BARCODE_FORMAT, BARCODE_BIZ_TYPE, dialogVisible: false, barcodeData: {}} },
  methods: {
    formatDate,
    open(row) { this.dialogVisible = true; this.barcodeData = { ...row } },
    async openByBusiness(bizId, bizType, bizCode, bizName) { this.dialogVisible = true; try { const data = (await WmBarcodeApi.getBarcodeByBusiness(bizType, bizId)).data; if (data) this.barcodeData = { ...data }; else { this.barcodeData = { bizType, bizId, bizCode, bizName, content: '' }; this.$modal.msgWarning('未找到对应条码数据') } } catch (error) { this.barcodeData = { bizType, bizId, bizCode, bizName, content: '' }; this.$modal.msgError('加载条码数据失败') } },
    getBase64() { return this.$refs.barcode && this.$refs.barcode.getImageBase64() },
    escapeHtml(value) { return String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])) },
    handlePrint() { const base64 = this.getBase64(); if (!base64) return this.$modal.msgWarning('条码生成失败，无法打印'); const printWindow = window.open('', '_blank'); if (!printWindow) return this.$modal.msgError('无法打开打印窗口，请检查浏览器设置'); const data = this.barcodeData; printWindow.document.write('<!doctype html><html><head><meta charset="UTF-8"><title>打印条码</title><style>body{font-family:Arial;padding:20px}.print{text-align:center}.info{text-align:left;font-size:12px}</style></head><body><div class="print"><img src="' + base64 + '" alt="条码"><div class="info"><p><strong>业务编码:</strong> ' + this.escapeHtml(data.bizCode) + '</p><p><strong>业务名称:</strong> ' + this.escapeHtml(data.bizName) + '</p><p><strong>条码内容:</strong> ' + this.escapeHtml(data.content) + '</p></div></div></body></html>'); printWindow.document.close(); printWindow.onload = () => setTimeout(() => printWindow.print(), 500) },
    handleDownload() { const base64 = this.getBase64(); if (!base64) return this.$modal.msgWarning('条码生成失败，无法下载'); const link = document.createElement('a'); link.href = base64; link.download = 'barcode_' + (this.barcodeData.bizCode || 'unknown') + '_' + Date.now() + '.png'; document.body.appendChild(link); link.click(); document.body.removeChild(link); this.$modal.msgSuccess('下载成功') },
    async handleGenerate() { const { bizType, bizId, bizCode, bizName } = this.barcodeData; if (!bizType || !bizId) return this.$modal.msgWarning('缺少业务类型或业务编号，无法生成条码'); try { await WmBarcodeApi.createBarcode({ bizType, bizId, bizCode: bizCode || '', bizName: bizName || '' }); this.$modal.msgSuccess('条码生成成功'); const data = (await WmBarcodeApi.getBarcodeByBusiness(bizType, bizId)).data; if (data) this.barcodeData = { ...data } } catch (error) { this.$modal.msgError(error && error.message ? error.message : '条码生成失败，请重试') } }
  }
}
</script>
<style scoped>.barcode-panel { display: flex; align-items: center; justify-content: center; min-height: 200px; padding: 20px; margin-bottom: 20px; background: #f5f7fa; border-radius: 4px; }.ellipsis { display: inline-block; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }</style>
