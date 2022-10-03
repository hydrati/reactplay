import { useEffect, useSignal } from './reactive/functional'
import {
  useDelegate,
  useEvent,
  useInsertText,
  useStyle,
  useFragment,
  useTemplate,
} from './web'

// 创建一个模板
const tmpl0 = useTemplate(`<button><!0>`, 4)
// const tmpl0 = h('button', null, h(Comment, null, '0'))

function Count() {
  // 创建一个 Signal
  const count = useSignal(0)

  // 点击事件监听器
  const handleClick = () => count.set((x) => x + 1)

  // 从模板创建一个元素
  const el = tmpl0()

  // 执行副作用
  useEffect(
    // 构建一个文本插入副作用
    useInsertText(
      el, // 目标元素
      count, // 取值器
      0 // 目标占位符
    )
  )

  // 设置样式
  useEffect(
    useStyle(el, () =>
      count.value % 2 === 0 ? { color: 'black' } : { color: 'green' }
    )
  )

  // 设置事件监听器
  useEvent(el, 'click', handleClick)

  // 委托事件
  useDelegate(el, 'click')

  // 返回元素
  return el
}

document.querySelector('#app')?.append(useFragment(Count))
