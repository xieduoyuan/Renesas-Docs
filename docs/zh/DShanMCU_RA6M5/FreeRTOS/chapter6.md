# 第6章 FreeRTOS源码概述

## 6.1 FreeRTOS目录结构

以源码“0501_freertos”为例，它的FreeRTOS的目录如下:

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-6/image1.png" style="zoom:67%;" /> 

主要涉及3个目录：

- ra\aws\FreeRTOS\FreeRTOS\Source：存放的是FreeRTOS的核心文件
- ra_gen：从main.c可以看到创建任务的函数调用过程
- src：使用RASC创建任务时，在src目录下生成任务的入口函数

## 6.2 核心文件

FreeRTOS的最核心文件只有2个：

- FreeRTOS/Source/tasks.c
- FreeRTOS/Source/list.c

其他文件的作用也一起列表如下：

| **FreeRTOS/Source/下的文件** | **作用**                                      |
| ---------------------------- | --------------------------------------------- |
| tasks.c                      | 必需，任务操作                                |
| list.c                       | 必须，列表                                    |
| queue.c                      | 基本必需，提供队列操作、信号量(semaphore)操作 |
| timer.c                      | 可选，software timer                          |
| event_groups.c               | 可选，提供event group功能                     |

## 6.3 移植时涉及的文件

移植FreeRTOS时涉及的文件放在“ra\fsp\src\rm_freertos_port”目录下，里面有2个文件：

- port.c
- portmacro.h

FreeRTOS已经支持绝大多数的芯片，本课程不涉及FreeRTOS的移植。

## 6.4 头文件相关

### 6.4.1 头文件目录

FreeRTOS需要3个头文件目录：

- FreeRTOS本身的头文件：ra\aws\FreeRTOS\FreeRTOS\Source\include
- 移植时用到的头文件：ra\fsp\src\rm_freertos_port\portmacro.h 
- 含有配置文件FreeRTOSConfig.h的目录：ra_cfg\aws

### 6.4.2 头文件

列表如下：

| **头文件**       | **作用**                                                     |
| ---------------- | ------------------------------------------------------------ |
| FreeRTOSConfig.h | FreeRTOS的配置文件，比如选择调度算法：configUSE_PREEMPTION 每个工程都必定含有FreeRTOSConfig.h |
| FreeRTOS.h       | 使用FreeRTOS API函数时，必须包含此文件。 在FreeRTOS.h之后，再去包含其他头文件，比如： task.h、queue.h、semphr.h、event_group.h |

## 6.5 内存管理

文件在“ra\aws\FreeRTOS\FreeRTOS\Source\portable\MemMang”下，“portable”意味着你可以提供自己的函数。

FreeRTOS提供了5个文件，对应内存管理的5种方法，在《第7章 内存管理》里详细介绍。

## 6.6 工程入口

从ra_gen\main.c的main函数，可以看到任务的创建、启动，源码如下：

```c
 int main(void)
 {
     g_fsp_common_thread_count = 0;
     g_fsp_common_initialized = false;

     /* Create semaphore to make sure common init is done before threads start running. */
     g_fsp_common_initialized_semaphore =
     #if configSUPPORT_STATIC_ALLOCATION
     xSemaphoreCreateCountingStatic(
     #else
     xSemaphoreCreateCounting(
     #endif
         256,
         1
         #if configSUPPORT_STATIC_ALLOCATION
         , &g_fsp_common_initialized_semaphore_memory
         #endif
     );

     if (NULL == g_fsp_common_initialized_semaphore) {
         rtos_startup_err_callback(g_fsp_common_initialized_semaphore, 0);
     }

     /* Init RTOS tasks. */
     led_thread_create();
     log_thread_create();

     /* Start the scheduler. */
     vTaskStartScheduler();
     return 0;
 }
```

第25、26行分别创建led任务、log任务，第29行启动调度器。

## 6.7 数据类型和编程规范

### 6.7.1 数据类型

每个移植的版本都含有自己的 **portmacro.h** 头文件，里面定义了2个数据类型：

- TickType_t： 
  - FreeRTOS配置了一个周期性的时钟中断：Tick Interrupt
  - 每发生一次中断，中断次数累加，这被称为tick count
  - tick count这个变量的类型就是TickType_t
  - TickType_t可以是16位的，也可以是32位的
  - FreeRTOSConfig.h中定义configUSE_16_BIT_TICKS时，TickType_t就是uint16_t
  - 否则TickType_t就是uint32_t

对于32位架构，建议把TickType_t配置为uint32_t

- BaseType_t：      
  - 这是该架构最高效的数据类型
  -  32位架构中，它就是uint32_t
  - 16位架构中，它就是uint16_t
  -  8位架构中，它就是uint8_t
  -  BaseType_t通常用作简单的返回值的类型，还有逻辑值，比如 **pdTRUE/pdFALSE**

### 61.7.2 变量名

变量名有前缀：

| **变量名前缀** | **含义**                                                     |
| -------------- | ------------------------------------------------------------ |
| c              | char                                                         |
| s              | int16_t，short                                               |
| l              | int32_t，long                                                |
| x              | BaseType_t， 其他非标准的类型：结构体、task handle、queue handle等 |
| u              | unsigned                                                     |
| p              | 指针                                                         |
| uc             | uint8_t，unsigned char                                       |
| pc             | char指针                                                     |

### 6.7.3 函数名

函数名的前缀有2部分：返回值类型、在哪个文件定义。

| **函数名前缀**    | **含义**                                   |
| ----------------- | ------------------------------------------ |
| vTaskPrioritySet  | 返回值类型：void 在task.c中定义            |
| xQueueReceive     | 返回值类型：BaseType_t 在queue.c中定义     |
| pvTimerGetTimerID | 返回值类型：pointer to void 在tmer.c中定义 |

### 6.7.4 宏的名

宏的名字是大小，可以添加小写的前缀。前缀是用来表示：宏在哪个文件中定义。

| **宏的前缀**                      | **含义：在哪个文件里定义** |
| --------------------------------- | -------------------------- |
| port (比如portMAX_DELAY)          | portable.h或portmacro.h    |
| task (比如taskENTER_CRITICAL())   | task.h                     |
| pd (比如pdTRUE)                   | projdefs.h                 |
| config (比如configUSE_PREEMPTION) | FreeRTOSConfig.h           |
| err (比如errQUEUE_FULL)           | projdefs.h                 |

通用的宏定义如下：

| **宏**  | **值** |
| ------- | ------ |
| pdTRUE  | 1      |
| pdFALSE | 0      |
| pdPASS  | 1      |
| pdFAIL  | 0      |

 