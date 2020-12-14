<template>
 <div>

     <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>


        <el-row>
                <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
        </el-row>

        <tree-table class="treeTable" :data="catelist" :columns="columns" :expand-type="false" :selection-type="false" show-index 
        index-text=" " border :show-row-hover="false">
            <template slot="isok" scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_deleted === false"  style="color: lightgreen;"></i>
                <i class="el-icon-error" v-else style="color:red"></i>
            </template>

            <template slot="order" scope="scope">
          <el-tag size="medium " v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag type="success" size="medium " v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" size="medium " v-else>三级</el-tag>
            </template>

        <template slot="opt" scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="small" @click="edit(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="small" @click="remove(scope.row)">删除</el-button>
        </template>
        </tree-table>

 <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="querInfo.pagenum"
      :page-sizes="[3, 5, 10, 15]"
      :page-size="querInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    </el-card>

<el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%"
  @close="addCateDialogClosed">
  <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
  <el-form-item label="分类名称：" prop="cat_name">
    <el-input v-model="addCateForm.cat_name"></el-input>
  </el-form-item>
  <el-form-item label="父级分类：">
    <el-cascader :options="parentCateList" 
    :props="cascaderProps" clearable v-model="selectedKeys"
     @change="parentCateChanged"> 
    </el-cascader>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
</el-dialog>

<el-dialog
  title="修改分类"
  :visible.sync="classificationVisible"
  width="50%"
  @close="editDialogClosed"
>
  <el-form :model="editForm" :rules="editFormRules" ref="editRuleForm" label-width="100px">
  <el-form-item label="分类名称" prop="cat_name">
    <el-input v-model="editForm.cat_name"></el-input>
  </el-form-item>
</el-form>

  <span slot="footer" class="dialog-footer">
    <el-button @click="classificationVisible = false">取 消</el-button>
    <el-button type="primary" @click="editTo">确 定</el-button>
  </span>
</el-dialog>



 </div>
</template>
 
<script>
export default {
 name: '',
 data () {
 return {
    querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
    },
    catelist: [],
    total: 0,
    columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
     addCateDialogVisible: false,
    parentCateList: [],
    addCateForm:{
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
    },
    addCateFormRules:{
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
    },
    cascaderProps:{
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        checkStrictly : true,
        expandTrigger : 'hover'
   },
    selectedKeys: [],
    classificationVisible:false,
    editForm:{},
    editFormRules:{
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ] 
    }
 }
 },
 created(){
     this.getCateList()
 },
 methods:{
    async getCateList() {
        const { data : res } = await this.$http.get('categories',{
            params : this.querInfo
        })
        if(res.meta.status !== 200) return this.$message.error('获取商品分类失败！')
        this.catelist = res.data.result
        this.total = res.data.total
     },
     handleSizeChange(newSize){
         this.querInfo.pagesize = newSize
         this.getCateList()
     },
     handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
     showAddCateDialog(){
        this.getParentCateList()
        this.addCateDialogVisible  = true
    },
    async getParentCateList(){
        const { data: res } = await this.$http.get('categories', {
            params: { type: 3 }
        }) 
        if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      this.parentCateList = res.data
    },
    parentCateChanged(){
       if(this.selectedKeys.length > 0){
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
         return
       }else{
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0 
       }
    },
    addCate(){
        this.$refs.addCateFormRef.validate(async valid =>{
            if(!valid) return
       const { data : res } = await this.$http.post('categories',this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.addCateDialogVisible = false
        this.$message.success('添加分类成功！')
        this.getCateList()
        })
    },
    addCateDialogClosed(){
      this.$refs.addCateFormRef.resetFields() 
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    async edit(info){
        const { data : res } = await this.$http.get('categories/'+info.cat_id)
        if(res.meta.status!==200) return this.$message.error('无法编辑操作')
        this.editForm = res.data
        this.classificationVisible = true
    },
    async editTo(){
        const { data : res} = await this.$http.put('categories/'+this.editForm.cat_id,{
            cat_name:this.editForm.cat_name
        })
        if(res.meta.status!==200) return this.$message.error('编辑失败')
        this.$message.success('编辑成功')
        this.getCateList()
        this.classificationVisible = false
    },
    editDialogClosed(){
        this.editForm = {}
    },
    async remove(info){
        const res = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err=>err)
        if(res !== 'confirm' ) return this.$message.info('已取消删除')
        const { data } = await this.$http.delete('categories/'+ info.cat_id)
        if( data.meta.status !== 200 ) return this.$message.error('删除分类失败！')
        this.$message.success('删除分类成功！')
        this.getCateList()       
    }
 }
}
</script>
 
<style scoped>
 .treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>