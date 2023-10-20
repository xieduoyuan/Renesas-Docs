# 第5章 创建FreeRTOS工程

本章目标

- 学会使用RASC创建一个基于freertos的工程；
- 学会使用RASC创建freertos任务，体验RTOS的多任务调度；

## 5.1 创建基于FreeRTOS的工程

本节源码为“0501_freertos”。

使用RASC工具创建基于freertos的MDK工程非常的简单快捷，在前文创建MDK工程《3.5.1 使用RASC创建MDK工程》的最后一步那里，在“RTOS Selection”中选择“FreeRTOS(v10.4.6+fsp.4.3.0)”即可，如下图所示：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-5/image1.png"  /> 

接下来会默认勾选“FreeRTOS-Minimal-Static Allocation”：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-5/image2.png)  

到这一步后直接点击下方的“Finish”即可创建一个带有FreeRTOS的RA6M5 MDK工程了。

## 5.2 FreeRTOS初体验

本节源码为“0501_freertos”。

### 5.2.1 新建线程

在RASC中新建线程非常简单，在其配置界面的“Stacks”中右侧界面的“Threads”处点击“New Thread”，即可新建一个FreeRTOS的线程，也就是任务，如下图所示：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-5/image3.png)  

上图中已经添加了两个线程“log_thread”和“led_thread”。

### 5.2.2 添加堆分配算法模块

添加完线程之后还需要添加堆分配算法，FreeRTOS支持5种堆算法：heap1~heap5。本实验选择的是heap4，首先选中任意一个FreeRTOS线程，比如“led_thread”，然后点击配置界面的“New Stack”，找到“RTOS”后选择要使用的算法即可，如下图所示：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-5/image4.png)  

FreeRTOS中，只能选择一种堆算法。虽然上图里是在“led_thread”中为它选择了某个堆算法，但是这个堆算法不是“属于”某个线程，而是属于整个FreeRTOS的。你不能在另一线程里选择另一种堆算法。

### 5.2.3 配置FreeRTOS通用参数

要使用FreeRTOS，需要配置内核相关的许多参数，比如时钟基准，时钟频率，任务栈大小，分配内存时使用静态分配还是动态分配等等，这些参数在FSP种点击任意一个FreeRTOS线程即可看到关于内核的通用参数配置，然后根据自己的实际需求进行设置：

1. Common-General

在此处设置RTOS内核的Tick时钟频率、任务最大优先级等参数。如下图所示，图中①②③用来设置FreeRTOS的调度机制（后面会详细讲解）：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-5/image5.png" style="zoom:80%;" />  

2. Common-Memory Allocation

在此处设置内存分配相关的参数，比如是否支持静态内存分配、堆的大小，如下图所示：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-5/image6.png" style="zoom:75%;" />  

3. 其它通用参数

还有很多参数，比如是否支持任务通知、互斥量等等，FreeRTOS是一个可以高度定制的内核，要想弄清楚这些参数，需要对它比较熟悉。

### 5.2.4 配置线程参数

对于某个线程，需要设置它的名称、栈大小、优先级等参数，如下图所示：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-5/image7.png)  

### 5.2.5 驱动程序

本实验使用串口和LED，它们的使用方法可以参考《第4章 模块使用说明》。

### 5.2.6 任务程序

1. LED任务

在LED的任务入口函数中，本实验先对LED设备进行初始化，然后每隔300ms改变一次LED的状态以实现闪烁效果，代码如下：

```c
#include "led_thread.h"
#include "drv_gpio.h"
#include "hal_data.h"
/* LedThread entry function */
/* pvParameters contains TaskHandle_t */
void led_thread_entry(void * pvParameters)
{
    FSP_PARAMETER_NOT_USED(pvParameters);

    /* TODO: add your own code here */
    struct IODev *pLedDev = IOGetDecvice("UserLed");
    if(NULL != pLedDev)
        pLedDev->Init(pLedDev);
    bool state = false;
    while(1)
    {
        pLedDev->Write(pLedDev, state);
        state = !state;
        vTaskDelay(300);
    }
}
```

需要注意的是这里使用的是RTOS内核的延时函数，它让当前任务进入阻塞状态，让出处理器资源。

2. 串口打印任务程

在串口打印任务的入口函数中，首先初始化了串口，然后每隔100ms计数一次并打印出来，代码如下：

```c
#include "log_thread.h"
#include "drv_uart.h"
#include "hal_data.h"
#include <stdio.h>
/* LogThread entry function */
/* pvParameters contains TaskHandle_t */
void log_thread_entry(void * pvParameters)
{
    FSP_PARAMETER_NOT_USED(pvParameters);

    /* TODO: add your own code here */
    
    UARTDrvInit();
    
    uint32_t count = 0;
    while(1)
    {
        printf("\r\nLog: %d\r\n", count++);
        vTaskDelay(100);
    }
}
```

### 5.2.7 FreeRTOS启动分析

FreeRTOS的启动过程，看main函数即可。创建2个任务后，启动调度器。代码如下：

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

- 第07~22行：创建了一个计数型信号量；
- 第25~26行：创建任务；
- 第29行：开启FreeRTOS的调度器，如果开启成功则不会走到30行的“return 0”；

对于RASC创建的FreeRTOS工程，它不会调用hal_entry()函数。

### 5.2.8 测试结果

将编译出来的二进制可执行文件烧录到板子上运行，可以观察到LED在闪烁，而且串口在打印如下图这样的信息：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-5/image8.png)  

