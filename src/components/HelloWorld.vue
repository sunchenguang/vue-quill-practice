<template>
  <div class="hello">
    <el-alert
      title=""
      type="warning"
      description=""
    >
      <div v-html="alertHtml"></div>
    </el-alert>

    <Editor
      v-model="content"
    ></Editor>
  </div>
</template>

<script>
import Editor from './Editor'
export default {
  name: 'HelloWorld',
  components: {
    Editor
  },
  data () {
    return {
      content: 'aa <a href="http://www.baidu.com" target="_blank">你好</a>',
      alertHtml: '公告：当前所有的研发项目，默认使用“持续交付”流程，请纯前端项目，或不适用该流程项目的负责人，在启动项目前进行手动关闭。 详情参考\n' +
        '      <a href="https://doc.qima-inc.com/pages/viewpage.action?pageId=50303675#space-menu-link-content" target="_blank">《持续交付平台使用手册》</a>'
    }
  },
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
