/** 执行前端批量操作，并提示成功和失败数量。 */
export async function executeHrmBatch(vm, requests) {
  const results = await Promise.allSettled(requests)
  const successCount = results.filter(result => result.status === 'fulfilled').length
  const failureCount = results.length - successCount
  const content = `操作完成：成功 ${successCount} 个，失败 ${failureCount} 个`
  if (failureCount === 0) {
    vm.$modal.msgSuccess(content)
  } else if (successCount > 0) {
    vm.$modal.msgWarning(content)
  } else {
    vm.$modal.msgError(content)
  }
  return successCount > 0
}
