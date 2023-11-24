<template>
  <el-form ref="genInfoForm" :model="formData" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item prop="templateType">
          <span slot="label">生成模板</span>
          <el-select v-model="formData.templateType">
            <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_CODEGEN_TEMPLATE_TYPE)"
                :key="parseInt(dict.value)" :label="dict.label" :value="parseInt(dict.value)"/>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="templateType">
          <span slot="label">前端类型</span>
          <el-select v-model="formData.frontType">
            <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_CODEGEN_FRONT_TYPE)"
                       :key="parseInt(dict.value)" :label="dict.label" :value="parseInt(dict.value)"/>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="scene">
          <span slot="label">生成场景</span>
          <el-select v-model="formData.scene">
            <el-option v-for="dict in this.getDictDatas(DICT_TYPE.INFRA_CODEGEN_SCENE)"
                       :key="parseInt(dict.value)" :label="dict.label" :value="parseInt(dict.value)"/>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            上级菜单
            <el-tooltip content="分配到指定菜单下，例如 系统管理" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <treeselect :append-to-body="true" v-model="formData.parentMenuId" :options="menus"
                      :normalizer="normalizer" :show-count="true" placeholder="请选择系统菜单" />
        </el-form-item>
      </el-col>

<!--      <el-col :span="12">-->
<!--        <el-form-item prop="packageName">-->
<!--          <span slot="label">-->
<!--            生成包路径-->
<!--            <el-tooltip content="生成在哪个java包下，例如 com.ruoyi.system" placement="top">-->
<!--              <i class="el-icon-question"></i>-->
<!--            </el-tooltip>-->
<!--          </span>-->
<!--          <el-input v-model="formData.packageName" />-->
<!--        </el-form-item>-->
<!--      </el-col>-->

      <el-col :span="12">
        <el-form-item prop="moduleName">
          <span slot="label">
            模块名
            <el-tooltip content="模块名，即一级目录，例如 system、infra、tool 等等" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="formData.moduleName" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="businessName">
          <span slot="label">
            业务名
            <el-tooltip content="业务名，即二级目录，例如 user、permission、dict 等等" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="formData.businessName" />
        </el-form-item>
      </el-col>

<!--      <el-col :span="12">-->
<!--        <el-form-item prop="businessPackage">-->
<!--          <span slot="label">-->
<!--            业务包-->
<!--            <el-tooltip content="业务包，自定义二级目录。例如说，我们希望将 dictType 和 dictData 归类成 dict 业务" placement="top">-->
<!--              <i class="el-icon-question"></i>-->
<!--            </el-tooltip>-->
<!--          </span>-->
<!--          <el-input v-model="formData.businessPackage" />-->
<!--        </el-form-item>-->
<!--      </el-col>-->

      <el-col :span="12">
        <el-form-item prop="className">
          <span slot="label">
            类名称
            <el-tooltip content="类名称（首字母大写），例如SysUser、SysMenu、SysDictData 等等" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="formData.className" />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="classComment">
          <span slot="label">
            类描述
            <el-tooltip content="用作类描述，例如 用户" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="formData.classComment" />
        </el-form-item>
      </el-col>

      <el-col :span="24" v-if="formData.genType === '1'">
        <el-form-item prop="genPath">
          <span slot="label">
            自定义路径
            <el-tooltip content="填写磁盘绝对路径，若不填写，则生成到当前Web项目下" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="formData.genPath">
            <el-dropdown slot="append">
              <el-button type="primary">
                最近路径快速选择
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="formData.genPath = '/'">恢复默认的生成基础路径</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </el-input>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 树表信息 -->
    <el-row v-if="formData.templateType == 2">
      <el-col :span="24">
        <h4 class="form-header">树表信息</h4>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="treeParentColumnId">
          <template #label>
            <span>
              父编号字段
              <el-tooltip content="树显示的父编码字段名， 如：parent_Id" placement="top">
                <Icon icon="ep:question-filled" />
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="formData.treeParentColumnId" placeholder="请选择">
            <el-option
              v-for="(column, index) in columns"
              :key="index"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="treeNameColumnId">
          <template #label>
            <span>
              树名称字段
              <el-tooltip content="树节点的显示名称字段名， 如：dept_name" placement="top">
                <Icon icon="ep:question-filled" />
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="formData.treeNameColumnId" placeholder="请选择">
            <el-option
              v-for="(column, index) in columns"
              :key="index"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 主表信息 -->
    <el-row v-if="formData.templateType == 15">
      <el-col :span="24">
        <h4 class="form-header">主表信息</h4>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="masterTableId">
          <template #label>
            <span>
              关联的主表
              <el-tooltip content="关联主表（父表）的表名， 如：system_user" placement="top">
                <Icon icon="ep:question-filled" />
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="formData.masterTableId" placeholder="请选择">
            <el-option
              v-for="(table0, index) in tables"
              :key="index"
              :label="table0.tableName + '：' + table0.tableComment"
              :value="table0.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="subJoinColumnId">
          <template #label>
            <span>
              子表关联的字段
              <el-tooltip content="子表关联的字段， 如：user_id" placement="top">
                <Icon icon="ep:question-filled" />
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="formData.subJoinColumnId" placeholder="请选择">
            <el-option
              v-for="(column, index) in columns"
              :key="index"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.id"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item prop="subJoinMany">
          <template #label>
            <span>
              关联关系
              <el-tooltip content="主表与子表的关联关系" placement="top">
                <Icon icon="ep:question-filled" />
              </el-tooltip>
            </span>
          </template>
          <el-radio-group v-model="formData.subJoinMany" placeholder="请选择">
            <el-radio :label="true">一对多</el-radio>
            <el-radio :label="false">一对一</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { getCodegenTableList } from "@/api/infra/codegen";

export default {
  name: "GenInfoForm",
  components: { Treeselect },
  props: {
    formData: {
      type: Object,
      default: null
    },
    columns:{
      type: Array,
      default: []
    },
    menus: {
      type: Array,
      default: []
    },
  },
  data() {
    return {
      rules: {
        templateType: [ { required: true, message: "请选择生成模板", trigger: "blur" }],
        frontType: [ { required: true, message: "请选择前端类型", trigger: "blur" }],
        scene: [ { required: true, message: "请选择生成场景", trigger: "blur" }],
        moduleName: [ { required: true, message: "请输入生成模块名", trigger: "blur" }],
        businessName: [ { required: true, message: "请输入生成业务名", trigger: "blur" }],
        businessPackage: [ { required: true, message: "请输入生成业务包", trigger: "blur" }],
        className: [ { required: true, message: "请输入生成类名称", trigger: "blur" }],
        classComment: [ { required: true, message: "请输入生成类描述", trigger: "blur" }],
        masterTableId: [ { required: true, message: "请选择关联的主表", trigger: "blur" }],
        subJoinColumnId: [ { required: true, message: "请选择子表关联的字段", trigger: "blur" }],
        subJoinMany: [ { required: true, message: "请选择关联关系", trigger: "blur" }],
        treeParentColumnId: [ { required: true, message: "请选择父编号字段", trigger: "blur" }],
        treeNameColumnId: [ { required: true, message: "请选择树名称字段", trigger: "blur" }]
      },
      tables:[] // 表定义列表
    };
  },
  watch: {
    formData: {
      handler(val){
        // 加载表列表
        if (val.dataSourceConfigId >= 0) {
          getCodegenTableList(val.dataSourceConfigId).then(res=>{
            this.tables = res.data
          })
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      };
    }
  }
};
</script>
