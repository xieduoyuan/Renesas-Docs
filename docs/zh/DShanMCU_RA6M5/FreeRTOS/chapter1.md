# 第1章 课程介绍

## 1.1 课程内容

嵌入式软件工程师的学习路线一般是：单片机、RTOS、Linux。当你掌握单片机开发后，如果要进一步提升编程水平，建议学习RTOS（Real Time Operating System，实时操作系统）。

有很多优秀的RTOS，比如FreeRTOS、RT-Thread、UCOS等等。FreeRTOS使用范围最广泛，RT-Thread生态丰富，UCOS是收费的并且很少使用了。

对于初学者，建议先学习FreeRTOS。只要学会了任意一款RTOS，肯定就会使用其他RTOS了。

百问网基于瑞萨RA6M5开发板编写了《ARM嵌入式系统中面向对象的模块编程方法》，它是裸机开发，不涉及RTOS。我们在它的基础上编写本书，讲解FreeRTOS。

所以，本课程会涉及如下内容：

• 讲解FreeRTOS的常用API：理论、用法
• 选择合适的硬件模块，展示这些API的实例
• 实现合适的小项目，展示工作中的编程方法
• 深入讲解FreeRTOS内部源码

## 1.2 硬件平台

本课程基于百问网“DshanMCU-RA6M5”进行开发，它由4部分组成：RA6M5核心板、LCD、扩展底板、各类模块。如下图所示：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-1/image1.png)

RA6M5自带DAP调试器，所以只需要一个核心板即可学习本课程。