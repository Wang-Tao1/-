<template>
 <div class="">
   <el-button type="info" @click="logout">按钮</el-button>
 </div>
</template>
 
<script>
export default {
 name: 'Home',
 methods:{
   logout(){
     window.sessionStorage.clear()
     this.$router.push('/login')
   }
 }
}
</script>
 
<style scoped>
 
</style>