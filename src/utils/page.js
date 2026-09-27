const MAX_PAGE_SIZE = 200

/** 自动翻页加载完整列表；requestPage 返回 Vue2 API 的原始响应。 */
export async function getAllPageItems(requestPage) {
  const result = []
  let pageNo = 1
  let total = 0
  do {
    const response = await requestPage(pageNo, MAX_PAGE_SIZE)
    const page = response.data
    result.push(...page.list)
    total = page.total
    if (page.list.length === 0) break
    pageNo++
  } while (result.length < total)
  return result
}
