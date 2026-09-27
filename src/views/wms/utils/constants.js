export const OrderStatusEnum = { PREPARE: 0, FINISHED: 4, CANCELED: 5 }
export const OrderTypeEnum = { RECEIPT: 1, SHIPMENT: 2, MOVEMENT: 3, CHECK: 4 }
export const OrderUpdateStatusList = [OrderStatusEnum.PREPARE]
export const OrderDeleteStatusList = [OrderStatusEnum.PREPARE, OrderStatusEnum.CANCELED]

export const MerchantTypeEnum = { CUSTOMER: 1, SUPPLIER: 2, CUSTOMER_SUPPLIER: 3 }
export const SupplierMerchantTypeList = [MerchantTypeEnum.SUPPLIER, MerchantTypeEnum.CUSTOMER_SUPPLIER]
export const CustomerMerchantTypeList = [MerchantTypeEnum.CUSTOMER, MerchantTypeEnum.CUSTOMER_SUPPLIER]

export function generateWmsCode(prefix = '') {
  let result = ''
  for (let index = 0; index < 8; index++) result += Math.floor(Math.random() * 10).toString()
  return prefix + result
}
