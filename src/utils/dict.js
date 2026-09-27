/**
 * Created by 芋道源码
 *
 * 数据字典工具类
 */
import store from '@/store'

export const DICT_TYPE = {
  USER_TYPE: 'user_type',
  COMMON_STATUS: 'common_status',
  TERMINAL: 'terminal',
  DATE_INTERVAL: 'date_interval', // 数据间隔

  // ========== SYSTEM 模块 ==========
  SYSTEM_USER_SEX: 'system_user_sex',
  SYSTEM_MENU_TYPE: 'system_menu_type',
  SYSTEM_ROLE_TYPE: 'system_role_type',
  SYSTEM_DATA_SCOPE: 'system_data_scope',
  SYSTEM_NOTICE_TYPE: 'system_notice_type',
  SYSTEM_LOGIN_TYPE: 'system_login_type',
  SYSTEM_LOGIN_RESULT: 'system_login_result',
  SYSTEM_SMS_CHANNEL_CODE: 'system_sms_channel_code',
  SYSTEM_SMS_TEMPLATE_TYPE: 'system_sms_template_type',
  SYSTEM_SMS_SEND_STATUS: 'system_sms_send_status',
  SYSTEM_SMS_RECEIVE_STATUS: 'system_sms_receive_status',
  SYSTEM_ERROR_CODE_TYPE: 'system_error_code_type',
  SYSTEM_OAUTH2_GRANT_TYPE: 'system_oauth2_grant_type',
  SYSTEM_MAIL_SEND_STATUS: 'system_mail_send_status',
  SYSTEM_NOTIFY_TEMPLATE_TYPE: 'system_notify_template_type',
  SYSTEM_SOCIAL_TYPE: 'system_social_type',

  // ========== INFRA 模块 ==========
  INFRA_BOOLEAN_STRING: 'infra_boolean_string',
  INFRA_REDIS_TIMEOUT_TYPE: 'infra_redis_timeout_type',
  INFRA_JOB_STATUS: 'infra_job_status',
  INFRA_JOB_LOG_STATUS: 'infra_job_log_status',
  INFRA_API_ERROR_LOG_PROCESS_STATUS: 'infra_api_error_log_process_status',
  INFRA_CONFIG_TYPE: 'infra_config_type',
  INFRA_CODEGEN_TEMPLATE_TYPE: 'infra_codegen_template_type',
  INFRA_CODEGEN_FRONT_TYPE: 'infra_codegen_front_type',
  INFRA_CODEGEN_SCENE: 'infra_codegen_scene',
  INFRA_FILE_STORAGE: 'infra_file_storage',
  INFRA_OPERATE_TYPE: 'infra_operate_type',

  // ========== BPM 模块 ==========
  BPM_MODEL_CATEGORY: 'bpm_model_category',
  BPM_MODEL_TYPE: 'bpm_model_type',
  BPM_MODEL_FORM_TYPE: 'bpm_model_form_type',
  BPM_TASK_ASSIGN_RULE_TYPE: 'bpm_task_assign_rule_type',
  BPM_TASK_CANDIDATE_STRATEGY: 'bpm_task_candidate_strategy',
  BPM_PROCESS_INSTANCE_STATUS: 'bpm_process_instance_status',
  BPM_PROCESS_INSTANCE_RESULT: 'bpm_process_instance_result',
  BPM_TASK_STATUS: 'bpm_task_status',
  BPM_COMMENT_TYPE: 'bpm_comment_type',
  BPM_TASK_ASSIGN_SCRIPT: 'bpm_task_assign_script',
  BPM_OA_LEAVE_TYPE: 'bpm_oa_leave_type',
  BPM_PROCESS_LISTENER_TYPE: 'bpm_process_listener_type',
  BPM_PROCESS_LISTENER_VALUE_TYPE: 'bpm_process_listener_value_type',

  // ========== PAY 模块 ==========
  PAY_CHANNEL_WECHAT_VERSION: 'pay_channel_wechat_version', // 微信渠道版本

  PAY_CHANNEL_CODE: 'pay_channel_code', // 支付渠道编码类型
  PAY_ORDER_STATUS: 'pay_order_status', // 商户支付订单状态
  PAY_REFUND_STATUS: 'pay_refund_status', // 退款订单状态
  PAY_NOTIFY_STATUS: 'pay_notify_status', // 商户支付回调状态
  PAY_NOTIFY_TYPE: 'pay_notify_type', // 商户支付回调状态
  PAY_TRANSFER_TYPE: 'pay_transfer_type', // 转账订单类型
  PAY_TRANSFER_STATUS: 'pay_transfer_status', // 转账订单状态

  // ========== MP 模块 ==========
  MP_AUTO_REPLY_REQUEST_MATCH: 'mp_auto_reply_request_match', // 自动回复请求匹配类型
  MP_MESSAGE_TYPE: 'mp_message_type', // 消息类型

  // ========== MALL - PRODUCT 模块 ==========
  PRODUCT_SPU_STATUS: 'product_spu_status', // 商品 SPU 状态

  // ========== MALL - ORDER 模块 ==========
  TRADE_AFTER_SALE_STATUS: 'trade_after_sale_status', // 售后 - 状态
  TRADE_AFTER_SALE_WAY: 'trade_after_sale_way', // 售后 - 方式
  TRADE_AFTER_SALE_TYPE: 'trade_after_sale_type', // 售后 - 类型
  TRADE_ORDER_TYPE: 'trade_order_type', // 订单 - 类型
  TRADE_ORDER_STATUS: 'trade_order_status', // 订单 - 状态
  TRADE_DELIVERY_TYPE: 'trade_delivery_type', // 订单 - 配送方式
  TRADE_ORDER_ITEM_AFTER_SALE_STATUS: 'trade_order_item_after_sale_status', // 订单项 - 售后状态

  // ========== MALL - PROMOTION 模块 ==========
  PROMOTION_DISCOUNT_TYPE: 'promotion_discount_type', // 优惠类型
  PROMOTION_PRODUCT_SCOPE: 'promotion_product_scope', // 营销的商品范围
  PROMOTION_COUPON_TEMPLATE_VALIDITY_TYPE: 'promotion_coupon_template_validity_type', // 优惠劵模板的有限期类型
  PROMOTION_COUPON_STATUS: 'promotion_coupon_status', // 优惠劵的状态
  PROMOTION_COUPON_TAKE_TYPE: 'promotion_coupon_take_type', // 优惠劵的领取方式
  PROMOTION_ACTIVITY_STATUS: 'promotion_activity_status', // 优惠活动的状态
  PROMOTION_CONDITION_TYPE: 'promotion_condition_type', // 营销的条件类型枚举
  PROMOTION_BANNER_POSITION: 'promotion_banner_position', // Banner 展示位置

  // ========== CRM 模块 ==========
  CRM_CUSTOMER_INDUSTRY: 'crm_customer_industry',
  CRM_CUSTOMER_LEVEL: 'crm_customer_level',
  CRM_CUSTOMER_SOURCE: 'crm_customer_source',
  CRM_PRODUCT_UNIT: 'crm_product_unit',
  CRM_PRODUCT_STATUS: 'crm_product_status',
  CRM_PERMISSION_LEVEL: 'crm_permission_level',
  CRM_AUDIT_STATUS: 'crm_audit_status',
  CRM_FOLLOW_UP_TYPE: 'crm_follow_up_type',
  CRM_RECEIVABLE_RETURN_TYPE: 'crm_receivable_return_type',

  // ========== MEMBER 模块 ==========
  MEMBER_POINT_BIZ_TYPE: 'member_point_biz_type',
  MEMBER_EXPERIENCE_BIZ_TYPE: 'member_experience_biz_type',

  // ========== ERP 模块 ==========
  ERP_AUDIT_STATUS: 'erp_audit_status',
  ERP_STOCK_RECORD_BIZ_TYPE: 'erp_stock_record_biz_type',

  // ========== AI 模块（可选） ==========
  AI_PLATFORM: 'ai_platform',
  AI_MODEL_TYPE: 'ai_model_type',
  AI_MCP_CLIENT_NAME: 'ai_mcp_client_name',
  AI_IMAGE_STATUS: 'ai_image_status',
  AI_MUSIC_STATUS: 'ai_music_status',
  AI_GENERATE_MODE: 'ai_generate_mode',
  AI_WRITE_TYPE: 'ai_write_type',
  AI_WRITE_LENGTH: 'ai_write_length',
  AI_WRITE_FORMAT: 'ai_write_format',
  AI_WRITE_TONE: 'ai_write_tone',
  AI_WRITE_LANGUAGE: 'ai_write_language',

  // ========== IM 模块 ==========
  IM_CHANNEL_MATERIAL_TYPE: 'im_channel_material_type',
  IM_CONTENT_TYPE: 'im_content_type',
  IM_MESSAGE_STATUS: 'im_message_status',
  IM_MESSAGE_RECEIPT_STATUS: 'im_message_receipt_status',
  IM_FRIEND_STATUS: 'im_friend_status',
  IM_FRIEND_ADD_SOURCE: 'im_friend_add_source',
  IM_FRIEND_REQUEST_HANDLE_RESULT: 'im_friend_request_handle_result',
  IM_GROUP_STATUS: 'im_group_status',
  IM_GROUP_MEMBER_ROLE: 'im_group_member_role',
  IM_GROUP_ADD_SOURCE: 'im_group_add_source',
  IM_GROUP_REQUEST_HANDLE_RESULT: 'im_group_request_handle_result',
  IM_RTC_CALL_MEDIA_TYPE: 'im_rtc_call_media_type',
  IM_RTC_CALL_CONVERSATION_TYPE: 'im_rtc_call_conversation_type',
  IM_RTC_CALL_STATUS: 'im_rtc_call_status',
  IM_RTC_CALL_END_REASON: 'im_rtc_call_end_reason',
  IM_RTC_PARTICIPANT_ROLE: 'im_rtc_participant_role',
  IM_RTC_PARTICIPANT_STATUS: 'im_rtc_participant_status',

  // ========== IOT - 物联网模块 ==========
  IOT_NET_TYPE: 'iot_net_type', // IOT 联网方式
  IOT_PRODUCT_STATUS: 'iot_product_status', // IOT 产品状态
  IOT_PRODUCT_DEVICE_TYPE: 'iot_product_device_type', // IOT 产品设备类型
  IOT_PROTOCOL_TYPE: 'iot_protocol_type', // IOT 协议类型
  IOT_SERIALIZE_TYPE: 'iot_serialize_type', // IOT 序列化类型
  IOT_LOCATION_TYPE: 'iot_location_type', // IOT 定位类型
  IOT_DEVICE_STATE: 'iot_device_state', // IOT 设备状态
  IOT_THING_MODEL_TYPE: 'iot_thing_model_type', // IOT 产品功能类型
  IOT_THING_MODEL_UNIT: 'iot_thing_model_unit', // IOT 物模型单位
  IOT_RW_TYPE: 'iot_rw_type', // IOT 读写类型
  IOT_DATA_SINK_TYPE_ENUM: 'iot_data_sink_type_enum', // IoT 数据流转目的类型
  IOT_RULE_SCENE_TRIGGER_TYPE_ENUM: 'iot_rule_scene_trigger_type_enum', // IoT 场景流转的触发类型枚举
  IOT_RULE_SCENE_ACTION_TYPE_ENUM: 'iot_rule_scene_action_type_enum', // IoT 规则场景的触发类型枚举
  IOT_ALERT_LEVEL: 'iot_alert_level', // IoT 告警级别
  IOT_ALERT_RECEIVE_TYPE: 'iot_alert_receive_type', // IoT 告警接收类型
  IOT_OTA_TASK_DEVICE_SCOPE: 'iot_ota_task_device_scope', // IoT OTA任务设备范围
  IOT_OTA_TASK_STATUS: 'iot_ota_task_status', // IOT OTA 任务状态
  IOT_OTA_TASK_RECORD_STATUS: 'iot_ota_task_record_status', // IOT OTA 记录状态
  IOT_MODBUS_MODE: 'iot_modbus_mode', // IOT Modbus 工作模式
  IOT_MODBUS_FRAME_FORMAT: 'iot_modbus_frame_format', // IOT Modbus 帧格式

  // ========== MES - 制造执行系统模块 ==========
  MES_MD_ITEM_OR_PRODUCT: 'mes_md_item_or_product', // MES 物料产品标识
  MES_CLIENT_TYPE: 'mes_client_type', // MES 客户类型
  MES_VENDOR_LEVEL: 'mes_vendor_level', // MES 供应商级别
  MES_CAL_HOLIDAY_TYPE: 'mes_cal_holiday_type', // MES 假期类型
  MES_CAL_SHIFT_TYPE: 'mes_cal_shift_type', // MES 轮班方式
  MES_CAL_SHIFT_METHOD: 'mes_cal_shift_method', // MES 倒班方式
  MES_CAL_CALENDAR_TYPE: 'mes_cal_calendar_type', // MES 班组类型
  MES_CAL_PLAN_STATUS: 'mes_cal_plan_status', // MES 排班计划状态
  MES_TM_TOOL_STATUS: 'mes_tm_tool_status', // MES 工具状态
  MES_TM_MAINTEN_TYPE: 'mes_tm_mainten_type', // MES 保养维护类型
  MES_DV_MACHINERY_STATUS: 'mes_dv_machinery_status', // MES 设备状态
  MES_DV_SUBJECT_TYPE: 'mes_dv_subject_type', // MES 点检保养项目类型
  MES_INDICATOR_TYPE: 'mes_indicator_type', // MES 检测项类型
  MES_QC_RESULT_TYPE: 'mes_qc_result_type', // MES 质检结果值类型
  MES_DEFECT_LEVEL: 'mes_defect_level', // MES 缺陷等级
  MES_PRO_WORK_ORDER_STATUS: 'mes_pro_work_order_status', // MES 生产工单状态
  MES_PRO_WORK_ORDER_SOURCE_TYPE: 'mes_pro_work_order_source_type', // MES 工单来源类型
  MES_PRO_WORK_ORDER_TYPE: 'mes_pro_work_order_type', // MES 工单类型
  MES_QC_TYPE: 'mes_qc_type', // MES 质检方案类型
  MES_PRO_LINK_TYPE: 'mes_pro_link_type', // MES 工序关系类型
  MES_PRO_TASK_STATUS: 'mes_pro_task_status', // MES 生产任务状态
  MES_TIME_UNIT_TYPE: 'mes_time_unit_type', // MES 时间单位
  MES_ORDER_STATUS: 'mes_order_status', // MES 单据状态
  MES_QC_CHECK_RESULT: 'mes_qc_check_result', // MES 检测结果
  MES_QC_SOURCE_DOC_TYPE: 'mes_qc_source_doc_type', // MES 来源单据类型
  MES_IPQC_TYPE: 'mes_ipqc_type', // MES IPQC 检验类型
  MES_DV_CYCLE_TYPE: 'mes_dv_cycle_type', // MES 点检保养周期类型
  MES_DV_CHECK_PLAN_STATUS: 'mes_dv_check_plan_status', // MES 点检保养方案状态
  MES_MAINTEN_RECORD_STATUS: 'mes_mainten_record_status', // MES 保养记录状态
  MES_MAINTEN_STATUS: 'mes_mainten_status', // MES 保养结果
  MES_DV_REPAIR_STATUS: 'mes_dv_repair_status', // MES 维修工单状态
  MES_DV_REPAIR_RESULT: 'mes_dv_repair_result', // MES 维修结果
  MES_DV_CHECK_RECORD_STATUS: 'mes_dv_check_record_status', // MES 点检记录状态
  MES_DV_CHECK_RESULT: 'mes_dv_check_result', // MES 点检结果
  MES_PRO_FEEDBACK_STATUS: 'mes_pro_feedback_status', // MES 生产报工状态
  MES_PRO_FEEDBACK_TYPE: 'mes_pro_feedback_type', // MES 生产报工类型
  MES_PRO_FEEDBACK_CHANNEL: 'mes_pro_feedback_channel', // MES 生产报工途径
  MES_PRO_ANDON_STATUS: 'mes_pro_andon_status', // MES 安灯处置状态
  MES_PRO_ANDON_LEVEL: 'mes_pro_andon_level', // MES 安灯级别
  MES_PRO_WORK_RECORD_TYPE: 'mes_pro_work_record_type', // MES 上下工状态类型
  MES_RQC_TYPE: 'mes_rqc_type', // MES 退货检验类型
  MES_WM_ARRIVAL_NOTICE_STATUS: 'mes_wm_arrival_notice_status',
  MES_WM_ITEM_RECEIPT_STATUS: 'mes_wm_item_receipt_status',
  MES_WM_TRANSFER_STATUS: 'mes_wm_transfer_status',
  MES_WM_TRANSFER_TYPE: 'mes_wm_transfer_type',
  MES_WM_STOCK_TAKING_TYPE: 'mes_wm_stock_taking_type',
  MES_WM_STOCK_TAKING_TASK_STATUS: 'mes_wm_stock_taking_task_status',
  MES_WM_STOCK_TAKING_LINE_STATUS: 'mes_wm_stock_taking_task_line_status',
  MES_WM_STOCK_TAKING_PLAN_PARAM_TYPE: 'mes_wm_stock_taking_plan_param_type',
  MES_WM_OUTSOURCE_RECPT_STATUS: 'mes_wm_outsource_recpt_status',
  MES_WM_PRODUCT_ISSUE_STATUS: 'mes_wm_product_issue_status',
  MES_WM_PRODUCT_PRODUCE_STATUS: 'mes_wm_product_produce_status',
  MES_WM_RETURN_VENDOR_STATUS: 'mes_wm_return_vendor_status',
  MES_WM_QUALITY_STATUS: 'mes_wm_quality_status',
  MES_WM_RETURN_ISSUE_STATUS: 'mes_wm_return_issue_status',
  MES_WM_RETURN_ISSUE_TYPE: 'mes_wm_return_issue_type',
  MES_WM_PRODUCT_RECPT_STATUS: 'mes_wm_product_receipt_status',
  MES_WM_RETURN_SALES_STATUS: 'mes_wm_return_sales_status',
  MES_WM_PRODUCT_SALES_STATUS: 'mes_wm_product_sales_status',
  MES_WM_SALES_NOTICE_STATUS: 'mes_wm_sales_notice_status',
  MES_WM_MISC_ISSUE_TYPE: 'mes_wm_misc_issue_type',
  MES_WM_MISC_ISSUE_STATUS: 'mes_wm_misc_issue_status',
  MES_WM_MISC_RECEIPT_TYPE: 'mes_wm_misc_receipt_type',
  MES_WM_MISC_RECEIPT_STATUS: 'mes_wm_misc_receipt_status',
  MES_WM_OUTSOURCE_RECEIPT_STATUS: 'mes_wm_outsource_receipt_status',
  MES_WM_OUTSOURCE_ISSUE_STATUS: 'mes_wm_outsource_issue_status',
  MES_WM_BARCODE_FORMAT: 'mes_wm_barcode_format',
  MES_WM_BARCODE_BIZ_TYPE: 'mes_wm_barcode_biz_type',
  MES_WM_PACKAGE_STATUS: 'mes_wm_package_status',
  MES_MD_AUTO_CODE_PART_TYPE: 'mes_md_auto_code_part_type',
  MES_MD_AUTO_CODE_PADDED_METHOD: 'mes_md_auto_code_padded_method',
  MES_MD_AUTO_CODE_CYCLE_METHOD: 'mes_md_auto_code_cycle_method',

  // ========== WMS 模块（可选） ==========
  WMS_MERCHANT_TYPE: 'merchant_type',
  WMS_ORDER_TYPE: 'wms_order_type', // WMS 单据类型
  WMS_ORDER_STATUS: 'wms_order_status', // WMS 单据状态
  WMS_RECEIPT_ORDER_TYPE: 'wms_receipt_order_type', // WMS 入库单类型
  WMS_SHIPMENT_ORDER_TYPE: 'wms_shipment_order_type', // WMS 出库单类型

  // ========== PMS - 项目管理模块 ==========
  PMS_PROJECT_TYPE: 'pms_project_type', // PMS 项目类型
  PMS_PROJECT_STATUS: 'pms_project_status', // PMS 项目状态
  PMS_PROJECT_LEVEL: 'pms_project_level', // PMS 项目优先级
  PMS_PROJECT_GROUP_TYPE: 'pms_project_group_type', // PMS 项目分组类型
  PMS_PROJECT_SCENE_TYPE: 'pms_project_scene_type', // PMS 项目列表场景
  PMS_PROJECT_SORT_TYPE: 'pms_project_sort_type', // PMS 项目排序类型
  PMS_PROJECT_MEMBER_LEVEL: 'pms_project_member_level', // PMS 项目成员权限级别
  PMS_ITERATION_STATUS: 'pms_iteration_status', // PMS 迭代状态
  PMS_WORK_ITEM_TYPE: 'pms_work_item_type', // PMS 工作项类型
  PMS_WORK_ITEM_STATUS_TYPE: 'pms_work_item_status_type', // PMS 工作项语义状态
  PMS_WORK_ITEM_LIFECYCLE_STATUS: 'pms_work_item_lifecycle_status', // PMS 工作项生命周期状态
  PMS_WORK_ITEM_PRIORITY: 'pms_work_item_priority', // PMS 工作项优先级
  PMS_WORK_ITEM_DEFECT_TYPE: 'pms_work_item_defect_type', // PMS 工作项缺陷类型
  PMS_KNOWLEDGE_OBJECT_TYPE: 'pms_knowledge_object_type', // PMS 知识对象类型
  PMS_KNOWLEDGE_DOCUMENT_TYPE: 'pms_knowledge_document_type', // PMS 知识文档类型
  PMS_KNOWLEDGE_DOCUMENT_STATUS: 'pms_knowledge_document_status', // PMS 知识文档状态
  PMS_KNOWLEDGE_CONTENT_LEVEL: 'pms_knowledge_content_level', // PMS 知识内容协作等级
  PMS_KNOWLEDGE_GROUP_TYPE: 'pms_knowledge_group_type', // PMS 知识库分组类型
  PMS_KNOWLEDGE_LIBRARY_MEMBER_LEVEL: 'pms_knowledge_library_member_level', // PMS 知识库成员等级

  // ========== OA - 办公自动化模块 ==========
  OA_ATTENDANCE_TYPE: 'oa_attendance_type', // OA 考勤类型
  OA_ATTENDANCE_STATUS: 'oa_attendance_status', // OA 考勤状态
  OA_TRANSPORT_TYPE: 'oa_transport_type', // OA 交通方式
  OA_EXPENSE_TYPE: 'oa_expense_type', // OA 费用类型
  OA_REIMBURSE_STATUS: 'oa_reimburse_status', // OA 报销状态
  OA_PAY_STATUS: 'oa_pay_status', // OA 支付状态
  OA_SEAL_STATUS: 'oa_seal_status', // OA 印章台账状态
  OA_SEAL_TYPE: 'oa_seal_type', // OA 印章类型
  OA_SEAL_CATEGORY: 'oa_seal_category', // OA 印章分类
  OA_SEAL_APPLY_TYPE: 'oa_seal_apply_type', // OA 用印类型
  OA_SEAL_USE_MODE: 'oa_seal_use_mode', // OA 用印方式
  OA_SEAL_USE_STATUS: 'oa_seal_use_status', // OA 用印状态
  OA_SUPPLY_USE_TYPE: 'oa_supply_use_type', // OA 用品使用类型
  OA_SUPPLY_PICKUP_METHOD: 'oa_supply_pickup_method', // OA 用品领取方式
  OA_SUPPLY_MANAGE_TYPE: 'oa_supply_manage_type', // OA 用品管理类型
  OA_SUPPLY_ITEM_STATUS: 'oa_supply_item_status', // OA 用品明细状态
  OA_SUPPLY_CATEGORY: 'oa_supply_category', // OA 用品类别
  OA_APPLY_URGENCY: 'oa_apply_urgency', // OA 申请紧急程度
  OA_OVERTIME_TYPE: 'oa_overtime_type', // OA 加班类型
  OA_LEAVE_TYPE: 'oa_leave_type', // OA 请假类型
  OA_EXPENSE_TYPE: 'oa_expense_type', // OA 费用类型
  OA_REIMBURSEMENT_PAYMENT_METHOD: 'oa_reimbursement_payment_method', // OA 报销方式
  OA_PRIORITY: 'oa_priority', // OA 优先级
  OA_SCHEDULE_TYPE: 'oa_schedule_type', // OA 日程类型
  OA_PLAN_TYPE: 'oa_plan_type', // OA 计划类型
  OA_PLAN_STATUS: 'oa_plan_status', // OA 计划状态
  OA_WORK_REPORT_TYPE: 'oa_work_report_type', // OA 工作汇报类型
  OA_WORK_REPORT_STATUS: 'oa_work_report_status', // OA 工作汇报状态
  OA_NOTE_TYPE: 'oa_note_type', // OA 笔记类型
  OA_DISCUSSION_TYPE: 'oa_discussion_type', // OA 讨论类型
  OA_TASK_TYPE: 'oa_task_type', // OA 任务类型
  OA_TASK_STATUS: 'oa_task_status', // OA 任务状态
  OA_ANNOUNCEMENT_TYPE: 'oa_announcement_type', // OA 公告类型
  OA_MEETING_ROOM_TYPE: 'oa_meeting_room_type', // OA 会议室类型
  OA_MEETING_ROOM_STATUS: 'oa_meeting_room_status', // OA 会议室状态
  OA_MEETING_ROOM_EQUIPMENT: 'oa_meeting_room_equipment', // OA 会议室设备
  OA_MEETING_ROOM_BOOKING_SCOPE: 'oa_meeting_room_booking_scope', // OA 会议室预定范围
  OA_MEETING_ROOM_REMINDER_TYPE: 'oa_meeting_room_reminder_type', // OA 会议室提醒方式
  OA_MEETING_ROOM_USE_STATUS: 'oa_meeting_room_use_status', // OA 会议室使用状态
  OA_OFFICIAL_DOC_SECRET_LEVEL: 'oa_official_doc_secret_level', // OA 公文密级
  OA_OFFICIAL_DOC_URGENCY_LEVEL: 'oa_official_doc_urgency_level', // OA 公文紧急程度
  OA_OFFICIAL_DOC_PUBLIC_CATEGORY: 'oa_official_doc_public_category', // OA 公文公开类别
  OA_OFFICIAL_DOC_SEPARATOR_TYPE: 'oa_official_doc_separator_type', // OA 公文模板分隔线
  OA_OFFICIAL_DOC_HANDLE_STATUS: 'oa_official_doc_handle_status', // OA 公文办理状态
  OA_OFFICIAL_DOC_RECEIVE_TYPE: 'oa_official_doc_receive_type', // OA 公文收文类型
  OA_VEHICLE_CATEGORY: 'oa_vehicle_category', // OA 车辆类型
  OA_VEHICLE_STATUS: 'oa_vehicle_status', // OA 车辆状态
  OA_VEHICLE_RETURN_STATUS: 'oa_vehicle_return_status', // OA 还车状态
  OA_FILE_CATEGORY: 'oa_file_category', // OA 云盘文件分类
  OA_FILE_SUBJECT_TYPE: 'oa_file_subject_type', // OA 云盘共享主体类型
  OA_FILE_PERMISSION_LEVEL: 'oa_file_permission_level', // OA 云盘权限级别

  // ========== FMS 模块 ==========
  FMS_ACCOUNT_USER_LEVEL: 'fms_account_user_level',
  FMS_SUBJECT_CATEGORY: 'fms_subject_category',
  FMS_DEBIT_CREDIT_DIRECTION: 'fms_debit_credit_direction',
  FMS_FINANCE_INDICATOR_TYPE: 'fms_finance_indicator_type',
  FMS_SUBJECT_TYPE: 'fms_subject_type',
  FMS_AUXILIARY_TYPE: 'fms_auxiliary_type',
  FMS_VOUCHER_STATUS: 'fms_voucher_status',
  FMS_VOUCHER_TIDY_TYPE: 'fms_voucher_tidy_type',
  FMS_FORMULA_RULE: 'fms_formula_rule',
  FMS_REPORT_TYPE: 'fms_report_type',
  FMS_REPORT_PERIOD_TYPE: 'fms_report_period_type',
  FMS_LEDGER_BALANCE_MODE: 'fms_ledger_balance_mode',
  FMS_ACCOUNTING_STANDARD: 'fms_accounting_standard',
  FMS_CLOSING_TYPE: 'fms_closing_type',
  FMS_CLOSING_TIME_TYPE: 'fms_closing_time_type',
  FMS_CLOSING_VOUCHER_TYPE: 'fms_closing_voucher_type',
  FMS_CLOSING_TEMPLATE_CATEGORY: 'fms_closing_template_category',

  // ========== HRM - 人力资源模块 ==========
  HRM_EMPLOYEE_ENTRY_STATUS: 'hrm_employee_entry_status', // HRM 员工入职状态
  HRM_EMPLOYEE_STATUS: 'hrm_employee_status', // HRM 员工状态
  HRM_EMPLOYEE_TYPE: 'hrm_employee_type', // HRM 聘用形式
  HRM_EMPLOYEE_EDUCATION: 'hrm_employee_education', // HRM 员工学历
  HRM_RECRUIT_POST_STATUS: 'hrm_recruit_post_status', // HRM 招聘职位状态
  HRM_RECRUIT_JOB_NATURE: 'hrm_recruit_job_nature', // HRM 招聘工作性质
  HRM_RECRUIT_WORK_TIME: 'hrm_recruit_work_time', // HRM 招聘工作经验
  HRM_RECRUIT_POST_EDUCATION: 'hrm_recruit_post_education', // HRM 招聘职位学历要求
  HRM_RECRUIT_SALARY_UNIT: 'hrm_recruit_salary_unit', // HRM 招聘薪资单位
  HRM_RECRUIT_EMERGENCY_LEVEL: 'hrm_recruit_emergency_level', // HRM 招聘紧急程度
  HRM_RECRUIT_CANDIDATE_STATUS: 'hrm_recruit_candidate_status', // HRM 招聘候选人状态
  HRM_RECRUIT_CANDIDATE_EDUCATION: 'hrm_recruit_candidate_education', // HRM 招聘候选人学历
  HRM_RECRUIT_INTERVIEW_TYPE: 'hrm_recruit_interview_type', // HRM 招聘面试方式
  HRM_RECRUIT_INTERVIEW_RESULT: 'hrm_recruit_interview_result', // HRM 招聘面试结果
  HRM_ATTENDANCE_CLOCK_TYPE: 'hrm_attendance_clock_type', // HRM 打卡类型
  HRM_ATTENDANCE_CLOCK_SOURCE: 'hrm_attendance_clock_source', // HRM 打卡来源
  HRM_ATTENDANCE_CLOCK_STATUS: 'hrm_attendance_clock_status', // HRM 打卡状态
  HRM_ATTENDANCE_HOLIDAY_TYPE: 'hrm_attendance_holiday_type', // HRM 考勤节假日类型
  HRM_ATTENDANCE_LEAVE_TYPE: 'hrm_attendance_leave_type', // HRM 请假类型
  HRM_ATTENDANCE_YES_NO: 'hrm_attendance_yes_no', // HRM 考勤是否
  HRM_ATTENDANCE_LATE_EARLY_DEDUCT_METHOD: 'hrm_attendance_late_early_deduct_method', // HRM 迟到早退扣款方式
  HRM_ATTENDANCE_ABSENTEEISM_DEDUCT_METHOD: 'hrm_attendance_absenteeism_deduct_method', // HRM 旷工扣款方式
  HRM_ATTENDANCE_MISSCARD_DEDUCT_METHOD: 'hrm_attendance_misscard_deduct_method', // HRM 缺卡扣款方式
  HRM_SALARY_CHANGE_REASON: 'hrm_salary_change_reason', // HRM 薪资调整原因
  HRM_SALARY_CHANGE_TYPE: 'hrm_salary_change_type', // HRM 薪资档案状态
  HRM_SALARY_CHANGE_RECORD_STATUS: 'hrm_salary_change_record_status', // HRM 薪资调整记录状态
  HRM_SALARY_MONTH_STATUS: 'hrm_salary_month_status', // HRM 工资表状态
  HRM_SALARY_TAX_TYPE: 'hrm_salary_tax_type', // HRM 薪资计税类型
  HRM_SALARY_OPTION_TYPE: 'hrm_salary_option_type', // HRM 薪资项类型
  HRM_SALARY_SLIP_READ_STATUS: 'hrm_salary_slip_read_status', // HRM 工资条阅读状态
  HRM_SALARY_YES_NO: 'hrm_salary_yes_no', // HRM 薪资是否
  HRM_INSURANCE_SCHEME_TYPE: 'hrm_insurance_scheme_type', // HRM 社保方案类型
  HRM_INSURANCE_PROJECT_TYPE: 'hrm_insurance_project_type', // HRM 社保项目类型
  HRM_INSURANCE_MONTH_STATUS: 'hrm_insurance_month_status', // HRM 社保表状态
  HRM_INSURANCE_EMP_STATUS: 'hrm_insurance_emp_status', // HRM 参保状态
  HRM_PERFORMANCE_PLAN_STATUS: 'hrm_performance_plan_status', // HRM 绩效计划状态
  HRM_PERFORMANCE_STAGE_STATUS: 'hrm_performance_stage_status', // HRM 绩效阶段状态
  HRM_PERFORMANCE_ASSESSMENT_STAGE_STATUS: 'hrm_performance_assessment_stage_status', // HRM 绩效考核阶段处理状态
  HRM_PERFORMANCE_APPEAL_STATUS: 'hrm_performance_appeal_status', // HRM 绩效申诉状态
  HRM_PERFORMANCE_SCORE_CALCULATION: 'hrm_performance_score_calculation', // HRM 绩效计分方式
  HRM_PERFORMANCE_UPPER_LIMIT_TYPE: 'hrm_performance_upper_limit_type', // HRM 绩效上限类型
  HRM_PERFORMANCE_YES_NO: 'hrm_performance_yes_no' // HRM 绩效是否
}

/**
 * 获取 dictType 对应的数据字典数组
 *
 * @param dictType 数据类型
 * @returns {*|Array} 数据字典数组
 */
export function getDictDatas(dictType) {
  return store.getters.dict_datas[dictType] || []
}

export function getIntDictOptions(dictType) {
  return getDictDatas(dictType).map(dict => Object.assign({}, dict, { value: Number(dict.value) }))
}

export function getBoolDictOptions(dictType) {
  return getDictDatas(dictType).map(dict => Object.assign({}, dict, { value: String(dict.value) === 'true' }))
}

export function getStrDictOptions(dictType) {
  return getDictDatas(dictType).map(dict => Object.assign({}, dict, { value: dict.value + '' }))
}

/**
 * 获取 dictType 对应的数据字典数组
 *
 * @param dictType 数据类型
 * @param values 数组、单个元素
 * @returns {*|Array} 数据字典数组
 */
export function getDictDatas2(dictType, values) {
  if (values === undefined) {
    return []
  }
  // 如果是单个元素，则转换成数组
  if (!Array.isArray(values)) {
    values = [this.value]
  }
  // 获得字典数据
  const results = []
  for (const value of values) {
    const dict = getDictData(dictType, value)
    if (dict) {
      results.push(dict)
    }
  }
  return results
}

export function getDictData(dictType, value) {
  // 获取 dictType 对应的数据字典数组
  const dictDatas = getDictDatas(dictType)
  if (!dictDatas || dictDatas.length === 0) {
    return ''
  }
  // 获取 value 对应的展示名
  value = value + '' // 强制转换成字符串，因为 DictData 小类数值，是字符串
  for (const dictData of dictDatas) {
    if (dictData.value === value) {
      return dictData
    }
  }
  return undefined
}

export function getDictDataLabel(dictType, value) {
  const dict = getDictData(dictType, value)
  return dict ? dict.label : ''
}

export function getDictObj(dictType, value) {
  return getDictDatas(dictType).find(dict => dict.value === value + '')
}

/**
 * 获得字典数据的文本展示
 *
 * 保持与 Vue3 的字典工具公共 API 一致。
 *
 * @param dictType 字典类型
 * @param value 字典数据的值
 * @return 字典名称
 */
export function getDictLabel(dictType, value) {
  let dictLabel = ''
  getDictDatas(dictType).forEach(dict => {
    if (dict.value === value + '') {
      dictLabel = dict.label
    }
  })
  return dictLabel
}
