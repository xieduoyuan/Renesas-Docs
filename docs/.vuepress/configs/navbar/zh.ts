import type { NavbarConfig } from '@vuepress/theme-default'
import { version } from '../meta.js'

export const navbarZh: NavbarConfig = [
  {
    text: 'ARM嵌入式系统中面向对象的模块编程方法',
    link: '/zh/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/',
  },
  {
    text: 'e2studio+DAP开发',
    link: '/zh/DShanMCU_RA6M5/e2studio_use_dap/chapter1.md',
  },
  {
    text: 'LVGL移植专题',
    link: '/zh/DShanMCU_RA6M5/lvgl_port_special_tutorial/chapter1.md',
  },
  {
    text: `瑞萨系列`,
    children: [
      {
        text: 'DShanMCU-RA6M5开发板',
        link: 'https://item.taobao.com/item.htm?id=728461040949',
      },
    ],
  },
]
