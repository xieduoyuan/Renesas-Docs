import type { NavbarConfig } from '@vuepress/theme-default'
import { version } from '../meta.js'

export const navbarZh: NavbarConfig = [
  {
    text: 'ARM嵌入式系统中面向对象的模块编程方法',
    link: '/zh/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/',
  },
  {
    text: 'e2studio+DAP开发',
    link: '/zh/DShanMCU_RA6M5/e2studio_use_dap/',
  },
  {
    text: 'LVGL移植专题',
    link: '/zh/DShanMCU_RA6M5/lvgl_port_special_tutorial/',
  },
  {
    text: 'FreeRTOS入门与工程实践-基于瑞萨RA6M5',
    link: '/zh/DShanMCU_RA6M5/FreeRTOS/',
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
  {
    text: `关于我们`,
    children: [
      {
        text: '淘宝店铺',
        link: 'https://100ask.taobao.com',
      },
      {
        text: '在线学习平台',
        link: 'https://www.100ask.net',
      },
      {
        text: '答疑交流社区',
        link: 'https://forums.100ask.net',
      },
      {
        text: '哔哩哔哩',
        link: 'https://space.bilibili.com/275908810',
      },
    ],
  },
  
]
