// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import UI from './component/ui'
import ErrorHandler from './model/ErrorHandler'
import Util from './model/Util'

// 加载公用UI控件
Vue.use(UI)
// 生产环境的场合
if (Util.isProdunctionEnv()) {
  // 不显示Vue日志和警告
  Vue.config.silent = true
  // 不显示Vue产品信息
  Vue.config.productionTip = false
}

function handleAppError (error, source) {
  // 取得错误内容
  const errorMessage = ErrorHandler.handleError(error, source)
  // 显示错误
  UI.Notice.showMessage(errorMessage)
}

Vue.config.errorHandler = handleAppError
window.onerror = handleAppError

/* eslint-disable no-new */
new Vue({
  el: '#main',
  template: '<App/>',
  components: { App },
  methods: {
    /**
     * 对错误进行整理并显示错误消息
     * @param  {*} error 错误对象
     */
    handleError (error) {
      handleAppError(error)
    }
  }
})
