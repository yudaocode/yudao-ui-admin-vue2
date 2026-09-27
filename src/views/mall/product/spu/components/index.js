import SkuList from './SkuList.vue'

/** 获得商品的规格列表 - 商品相关的公共函数 */
export function getPropertyList(spu) {
  const properties = []
  if (spu.specType) {
    (spu.skus || []).forEach(sku => {
      (sku.properties || []).forEach(({ propertyId, propertyName, valueId, valueName }) => {
        if (!properties.some(item => item.id === propertyId)) {
          properties.push({ id: propertyId, name: propertyName, values: [] })
        }
        const property = properties.find(item => item.id === propertyId)
        if (!property.values.some(value => value.id === valueId)) {
          property.values.push({ id: valueId, name: valueName })
        }
      })
    })
  }
  return properties
}

export { SkuList }
