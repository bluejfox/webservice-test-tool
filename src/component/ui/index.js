import Element from 'setaria-ui'
import locale from 'setaria-ui/lib/locale/lang/zh-CN'
import 'setaria-ui/lib/theme-default/index.css'
import Util from '../../model/Util'
import LoadingIndicator from './package/LoadingIndicator'
import Notice from './package/Notice'

const COMPONENTS = {
  LoadingIndicator,
  Notice
}

function install (Vue) {
  /* istanbul ignore if */
  if (install.installed) return
  // 使用中文语言加载Element UI
  Element.install(Vue, locale)
  // 修改ElemengUI控件的命名空间
  Object.keys(Element).forEach((key) => {
    const component = Element[key]
    let componentName = Element[key].name
    if (!Util.isEmpty(componentName) && componentName.indexOf('El') === 0) {
      componentName = `Ume${componentName.substring(2)}`
      // 查找组件是否已被定制化
      const customUI = Object.keys(COMPONENTS).find(item => item.name === componentName)
      // 当前组件没有被定制化的场合
      if (!customUI) {
        // 加载原生组件
        Vue.component(componentName, component)
      }
    }
  })
  // 加载自定义组件
  Object.keys(COMPONENTS).forEach((key) => {
    const component = COMPONENTS[key]
    // 加载组件
    Vue.component(component.name, component)
  })
}

/* istanbul ignore if */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

const UI = Object.assign({}, Element, {
  install,
  LoadingIndicator,
  Notice
})
export default UI
