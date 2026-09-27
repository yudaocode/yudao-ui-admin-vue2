const required = { required: true, message: '该项为必填项' }

export const rules = {
  spuId: [required],
  name: [required],
  startTime: [required],
  endTime: [required],
  sort: [required],
  configIds: [required],
  totalLimitCount: [required],
  singleLimitCount: [required],
  totalStock: [required]
}
