<template>
  <div class="hello">
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
