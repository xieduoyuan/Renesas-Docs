# 第26章 独立看门狗定时器-IWDT

本章目标

- 了解A6M5处理器的看门狗定时器及其工作原理；
- 学会使用RASC配置看门狗定时器，使用其接口函数；

## 26.1 RA6M5的WDT外设

### 26.1.1 WDT的特性

IWDT (Independent Watchdog Timer)由一个14位的向下计数器组成，可以将应用程序从错误中恢复处理（比如重启系统）。应用程序必须在允许的计数窗口内进行刷新计时器，如果计数器下溢了，IWDT将复位MCU或生成不可屏蔽中断(NMI)。

瑞萨RA6M5处理器的看门狗定时器的特性见下表：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-26/image1.jpg)

独立看门狗的时钟源是一个独立的时钟IWDTCLK，PCLKB最大的时钟频率是15kHz，可以使用RASC在BSP中设置IWDTCLK的分频系数。

### 26.1.2 IWDT的系统框图

IWDT的系统框图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-26/image2.png)

### 26.1.3 IWDT和WDT的异同

1. 差异点

瑞萨RA6M5的独立看门狗（IWDT）与看门狗（WDT）的不同点如下：

- 时钟源不一样，WDT使用外部时钟电路作为时钟源，而IWDT自带时钟源；
- WDT有寄存器启动和自启动两种模式，IWDT只有自启动这一种模式；

2. 相同点

独立看门狗（IWDT）与看门狗（WDT）也有很多相似点，主要如下：

- 都可以选择复位的范围（窗口值）；
- 都可以设置在睡眠模式下是否启动；
- 都可以设置NMI中断和复位重启；

26.1.4 IWDT的工作原理

1. 超时时间计算

以IWDTCLK=15kHz为例，假设对IWDT进行了以下配置：

- 分频系数位256
- 超时时间周期为2048cycles

那么IWDT的超时时间为：

![image3](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-26/image3.jpg)

2. 运行状态分析

在“Option Function Select Register 0”寄存器中，对于IWDT有一个模式选择位[OFS0.IWDTSTRT]：它被写为0时，IWDT的自动启动模式被使能；写为1就是关闭IWDT的计数。

只有在复位状态下，以下对IWDT在OFS0中的设置才会有效：

- 配置OFS0.IWDTCKS[3:0]来配置IWDT的时钟分频系数；
- 配置OFS0.IWDTRPSS[1:0]和OFS0.IWDTRPES[1:0]来设置IWDT的窗口监测始末位置；
- 配置OFS0.IWDTTOPS[1:0]来设置IWDT的超时周期值cycles；
- 配置OFS0.IWDTRSTIRQS来使能IWDT的重置输出和中断请求；

当复位状态结束后，IWDT的计数器将会立刻向下计数。在RA6M5的用户手册中展示了一个IWDT的窗口刷新例图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-26/image4.png)

总结下来就是：

- 在窗口期内刷新看门狗会让IWDT计数器重新计数且不会触发任何事件或中断；
- 在没有到窗口期起始位置刷新会触发刷新错误事件，并触发NMI中断；
- 在超过窗口结束位置但是计数没有溢出期间刷新，会触发刷新错误事件，并触发NMI中断；
- 如果IWDT计数溢出了，会触发技术溢出事件，触发NMI中断；

也就是说，如果使用了窗口监测，只有在窗口期刷新定时器才会让系统正常运行，否则都会触发NMI中断。

## 26.2 IWDT模块的使用

### 26.2.1 模块配置

1. 添加IWDT Stack

在FSP的Stacks中添加IWDT模块的步骤如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-26/image5.png)

2. 在BSP中配置IWDT

从前文对IWDT的工作原理分析中可以看到，对于IWDT的所有操作都是在OFS0寄存器中进行配置的，而OFS0是在BSP板块里面的“RA6F5 Family”中，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-26/image6.png)

- Start Mode Select：IWDT启动模式选择

1.1 IWDT is automatically activated after a reset (Autostart mode)(自启动)
1.2 IWDT is Disabled

- Timeout Period:IWDT计数周期值

1.1 128 cycles
1.2 512 cycles
1.3 1024 cycles
1.4 2048 cycles

- Dedicated Clock Frequency Divisor:IWDT时钟分频系数（1/16/32/64/128/256）,默认128；
- Window End Position:窗口监测结束位置，默认0%，没有结束位置
- Window Start Position:窗口监测开始位置，默认100%，没有开始位置
- Reset Interrupt Request:选择使能触发复位的中断请求（NMI或Reset）
- Stop Control：停止对WDT控制的条件

1.1 Stop counting when in Sleep, Snooze mode, or Software Standby
1.2 Counting continues (Note: Device will not enter Deep Standby Mode when selected. Device will enter Software Standby Mode)

如果用户选择使用了NMI中断，还需要去RASC的Stacks中找到IWDG Stack模块，设置NMI的中断回调函数名，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-26/image7.png)

### 26.2.2 配置信息解读

在RASC中配置IWDT并生成工程后，会在hal_data.c中生成结构体全局常量g_iwdt，它被用来表示IWDT设备，代码如下：

```c
const wdt_instance_t g_wdt =
{
    .p_ctrl        = &g_iwdt_ctrl,
    .p_cfg         = &g_iwdt_cfg,
    .p_api         = &g_wdt_on_iwdt
};
```

- p_ctrl：iwdt_instance_ctrl_t类型指针成员，用来记录设备状态，记录一些重要信息（比如回调函数）；
- p_cfg：指向IWDT的配置结构体，这个结构体的数值来自在RASC中对IWDT的配置，代码如下：

```c
const wdt_cfg_t g_iwdt_cfg =
{
    .timeout = 0,
    .clock_division = 0,
    .window_start = 0,
    .window_end = 0,
    .reset_control = 0,
    .stop_control = 0,
    .p_callback = nmi_callback,
};
```

- p_api：指向了一个wdt_api_t结构体，这个结构体在r_iwdt.c中实现，它封装了IWDT设备的接口函数，代码如下：

```c
const wdt_api_t g_wdt_on_iwdt =
{
    .open        = R_IWDT_Open,
    .refresh     = R_IWDT_Refresh,
    .statusGet   = R_IWDT_StatusGet,
    .statusClear = R_IWDT_StatusClear,
    .counterGet  = R_IWDT_CounterGet,
    .timeoutGet  = R_IWDT_TimeoutGet,
    .callbackSet = R_IWDT_CallbackSet,
};
```

### 26.2.3 中断回调函数

在RASC中配置了IWDT的中断回调函数名字，会在hal_data.h中声明此回调函数：

```c
#ifndef nmi_callback
void nmi_callback(wdt_callback_args_t * p_args);
#endif
```

用户需要实现这个回调函数，例如：

```c
void nmi_callback(wdt_callback_args_t * p_args)
{
    (void)p_args;
}
```

### 26.2.4 API接口及其用法

前文已经说过，在FSP库函数中是使用wdt_api_t结构体来封装IWDT的操作方法，原型如下：

```c
typedef struct st_wdt_api
{
    fsp_err_t (* open)(wdt_ctrl_t * const p_ctrl, wdt_cfg_t const * const p_cfg);
    fsp_err_t (* refresh)(wdt_ctrl_t * const p_ctrl);
    fsp_err_t (* statusGet)(wdt_ctrl_t * const p_ctrl, wdt_status_t * const p_status);
    fsp_err_t (* statusClear)(wdt_ctrl_t * const p_ctrl, const wdt_status_t status);
    fsp_err_t (* counterGet)(wdt_ctrl_t * const p_ctrl, uint32_t * const p_count);
    fsp_err_t (* timeoutGet)(wdt_ctrl_t * const p_ctrl, 
                             wdt_timeout_values_t * const p_timeout);
    fsp_err_t (* callbackSet)(wdt_ctrl_t * const p_api_ctrl, 
                              void (* p_callback)(wdt_callback_args_t *),
                              void const * const p_context, 
                              wdt_callback_args_t * const p_callback_memory);
} wdt_api_t;
```

瑞萨在r_iwdt.c中实现一个wdt_api_t结构体，IWDT和WDT共用一套操作接口，读者请参考《25.2.4 API接口及其用法》了解这些函数的用法。

## 26.3 独立看门狗定时器实验

### 26.3.1 设计目的

让用户学会使用瑞萨RA6M5的IWDT，并观察是否刷新看门狗的现象。

### 26.3.2 硬件连接

本实验会用到板载串口和按键，请读者参考前文配置。

### 26.3.3 驱动程序

1. 初始化IWDT

调用open函数即可初始化IWDT，并启动它，代码如下：

```c
void IWDTDrvInit(void)
{
    fsp_err_t err = g_iwdt.p_api->open(g_iwdt.p_ctrl, g_iwdt.p_cfg);
    assert(FSP_SUCCESS == err);
}
```

2. 刷新IWDT

刷新IWDT比较简单，直接调用其refresh函数即可：

```c
void IWDTDrvRefresh(void)
{
    fsp_err_t err = g_iwdt.p_api->refresh(g_iwdt.p_ctrl);
    assert(FSP_SUCCESS == err);
}
```

3. NMI中断回调函数

在RASC中使能了IWDT的NMI中断，需要自己实现NMI回调函数，代码如下：

```c
__WEAK void DataSaveProcess(void)
{
}
void nmi_callback(wdt_callback_args_t * p_args)
{
    (void)p_args;
    printf("\r\nWarning!Do your most important save working!!\r\n");
    DataSaveProcess();
}
```

4. 按键刷新定时器

在按键消抖处理后，刷新看门狗定时器，代码如下：

```c
void KeyProcessEvents(void)
{
    struct IODev *ptLedDev = IOGetDecvice("UserLed");
    struct IODev *ptKeyDev = IOGetDecvice("UserKey");
    ptLedDev->Write(ptLedDev, ptKeyDev->Read(ptKeyDev));
    IWDTDrvRefresh();
}
```

### 26.3.4 测试程序

在本次实验中，初始化了各个外设后，主循环中不用做任何事情，所有的操作都是在中断中完成的：

- 按键中断
- 滴答定时器消除按键抖动
- NMI中断处理用户的紧急事件

测试函数代码如下：

```c
void IWDTAppTest(void)
{
    SystickInit();
    UARTDrvInit();
    
    struct IODev *ptdev = IOGetDecvice("UserKey");
    if(NULL != ptdev)
        ptdev->Init(ptdev);
    ptdev = IOGetDecvice("UserLed");
    if(NULL != ptdev)
        ptdev->Init(ptdev);
    
    IWDTDrvInit();
    
    while(1)
    {
        /* The code that is watched by iwdt */
    }
}
```

### 26.3.5 测试结果

将编译出来的二进制可执行文件烧录到板子上并运行，如果不按按键的话会得到例如下图这样的打印信息：

![image8](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-26/image8.jpg)


