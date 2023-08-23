# 第25章 看门狗定时器-WDT

本章目标

- 了解A6M5处理器的看门狗定时器及其工作原理；
- 学会使用RASC配置看门狗定时器、使用其接口函数；

## 25.1 RA6M5的WDT外设

### 25.1.1 WDT的特性

一般来说，看门狗也叫看门狗定时器，从本质上面来看，其实它就是一个计数器，在使用的时候，需要给它一个数值，随后看门狗的计数器根据计数方向开始累计，在看门狗的计数器达到预设的数值之前，可以进行重置看门狗计数器的操作，也就是俗称的“喂狗”。如果没有在计数器发生溢出之前喂狗的话，看门狗就会产生复位请求或者不可屏蔽中断请求(NMI-Non Maskable Interrupt)，这会导致系统重启。

瑞萨RA6M5处理器的看门狗定时器的特性见下表：

![image1](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-25/image1.jpg)

看门狗时钟来自外部时钟电路PCLKB，PCLKB最大的时钟频率是50MHz，可以使用RASC配置PCLKB，也可调用CGC的接口函数设置PCLKB。


### 25.1.2 WDT的系统框图

WDT的系统框图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-25/image2.png)

1. 两套机制

RA6M5的WDT模块，有两种工作模式：“Auto start mode”（自动启动模式）、“Register start mode”（寄存器启动模式）。这两种模式有各自的寄存器，WDT工作于某种模式时，另一种模式的寄存器都无法访问。
上电后，WDT使用哪种工作模式？这由OFS0寄存器的[WDTSTRT]位决定：OFS0寄存器位于Flash上，出厂时默认为0xFFFFFFFF，也可以在生产时写入合适的数值。OFS0寄存器的值等于0xFFFFFFFF时，WDT的工作模式为“寄存器启动”，也就是上电后WDT是不工作的。

2. 时钟源

WDT的时钟来自PCLKB，经过分频后进入WDT。
两种模式下，都有各自的寄存器用于设置时钟的分频系数：“Auto start mode”（自动启动模式）下使用OFS0寄存器的WDTCKS[3:0]位；register start mode”（寄存器启动模式）下使用WDTCR寄存器的CKS[3:0]位。不同的取值，对应不同的分频系数。有这几种分频系数：4、64、128、512、2048、8192。

3. 14位递减计数器

看门狗的计数器是一个14位的递减计数器，它的初始值有4种选择：1024、4096、8192或16384。通过OFS0或WDTCR中的TOPS[1：0]位来选择初始值。
当看门狗被启动后，它就在分频得到的时钟下，从初始值递减。当计数值到达0时，可以发出复位信号，或者发出NMI中断请求。

4. WDT输出及中断请求

看门狗计数溢出时，有两种处理方式：第一种是是直接复位整个系统，第二种是触发一个NMI中断，在中断函数里执行用户代码。
第一种处理方式，通常用来避免程序进入死循环，避免程序跑飞。
第二种处理方式，在中断服务函数里记录出错时的重要信息，比如记录重要的数据、记录发生错误时的环境。

5. 输出到时钟控制电路
当复位中断选择位(WDTRCR.RSTIRQS)在寄存器启动模式下或WDT复位时设置为1时，或当WDT复位选项功能选择寄存器0(OFS0)中的中断请求选择位(OFS0.WDTRSTIRQS)在自启动模式时设置为1时 当看门狗向下计数器下溢或者发生刷新错误时，输出1个周期计数的复位信号到时钟控制电路。

6. 事件信号输出

当复位中断选择位(WDTRCR.RSTIRQS)在寄存器启动模式下或WDT复位时设置为0时，或当WDT复位选项功能选择寄存器0(OFS0)中的中断请求选择位(OFS0.WDTRSTIRQS)在自启动模式时设置为0时， 当看门狗向下计数器下溢或者发生刷新错误时，产生中断(WDT_NMIUNDF)信号，此信号产生的中断用于不可屏蔽中断，也就是事件输出信号。

### 25.1.3WDT 的启动模式

瑞萨RA6M5处理器的WDT有两种启动模式：自启动模式和寄存器启动模式。

1. 自启动模式

当WDT启动方式选择位(OFS0.wdtstrt)为0时，WDT将被设置为自启动方式，关闭WDT控制寄存器(WDTCR)、WDT复位控制寄存器(WDTRCR)、WDT计数停止控制寄存器(WDTCSTPR)，使能OFS0寄存器的设置。

在复位状态下，WDT寄存器中的选项功能选择寄存器0(OFS0)的设置值如下:

- 时钟分频比
- 窗口起始和结束位置
- 超时时间
- 复位输出或中断请求
- 在睡眠模式时计数器停止控制

2. 寄存器启动模式

当WDT的启动模式选择位[OFS0.WDTSTRT]被置为1时，WDT将被设置为寄存器启动模式，此模式生效后再对寄存器OFS0的设置就不会再生效了，也就是不能在程序正常运行过程中修改WDT的启动模式了。

在寄存器启动模式下，WDT的控制寄存器[WDTCR]、复位控制寄存器[WDTRCR]和计数停止控制寄存器[WDTCSTPR]将会被使能允许设置。
复位后按照下面的步骤设置WDT：

- 在WDTCR寄存器中设置WDT的时钟分频比；
- 在WDTCR寄存器中设置窗口监测的开始和结束位置；
- 在WDTCR寄存器中设置超时周期；
- 在WDTRCR寄存器中配置重置输出或中断请求输出
- 在WDTCSTPR寄存器中控制WDT从计数运行态到休眠态的转换；

此后，只要计数器在允许刷新的时间段内刷新，计数器的值就会在每次刷新时重置，并继续向下计数。只要计数继续，WDT就不输出复位信号。但是，如果由于程序失控而导致下计数器无法更新，或者由于计数器在刷新允许的时间之外刷新而发生刷新错误，WDT将输出复位信号或不可屏蔽的中断请求(WDT_NMIUNDF)。可以在WDT复位中断请求选择位(WDTRCR.RSTIRQS)中选择复位输出或中断请求输出。

### 25.1.4 WDT的工作原理

1. 计算看门狗超时时间（以PCLKB=50MHz为例）

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-25/image3.jpg" alt="image3" style="zoom: 67%;" />

2. 窗口监测

在RA6M5的用户手册中给出了一个窗口监测的示例，其窗口期条件如下：

- WDT是自启动模式
- 使能了WDT的中断请求；
- 使能了NMI中断，当向下计数或刷新失败事件发生后会触发NMI中断；
- 窗口监测的起始位置是超时时间的75%位置，如果超时时间周期值是1000，那么窗口起始位置就是计数值为750的时刻；
- 窗口监测的结束位置是25%位置，如果超时时间周期值是1000，那么窗口结束位置就是计数值为250的时刻；

那么WDT在各个时刻刷新定时器的表现如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-25/image4.png" style="zoom:67%;" />

总结下来就是：

- 在窗口期内刷新看门狗会让WDT计数器重新计数且不会触发任何事件或中断；
- 在没有到窗口期起始位置刷新会触发刷新错误事件并发生中断请求触发NMI中断；
- 在超过窗口结束位置但是计数没有溢出期间刷新会触发刷新错误时间并发生中断请求触发NMI中断；
- 如果WDT计数溢出了都没有刷新定时器，那么会触发技术溢出事件，触发NMI中断；

也就是说，如果使用了窗口监测，只有在窗口期刷新定时器才会让系统正常运行，否则都会触发NMI中断。

## 25.2WDT 模块的使用
### 25.2.1 模块配置

1. 添加WDT Stack

在FSP配置界面的“Stacks”中添加WDT Stack的步骤如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-25/image5.png)

2. 配置WDT Stack

首先需要去设置WDT的启动方式，在FSP配置界面的BSP中找到“RA6M5 Family”，点开“OFS0 register settings”，再点开“WDT”，展开的选项就是配置WDT的参数了，如下图所示;

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-25/image7.png)

- Start Mode Select：WDT启动模式选择
  1.1 Automatically activate WDT after a reset (自启动)
  1.2 Stop WDT after a reset (寄存器启动)

- Timeout Period:WDT计数周期值
  1.1 1024 cycles
  1.2 4096 cycles
  1.3 8192 cycles
  1.4 16384 cycles

- Clock Frequency Division Ratio:WDT时钟分频系数（4/64/128/512/2048/8192）

- Window End Position:窗口监测结束位置，默认0%，没有结束位置

- Window Start Position:窗口监测开始位置，默认100%，没有开始位置

- Reset Interrupt Request:选择触发复位的中断请求（NMI或Reset）

- Stop Control：停止对WDT控制的条件
  1.1 Counting continues
  1.2 Stop counting when entering Sleep mode

在此处选择了WDT的启动方式，而在BSP中对于WDT的例如超时周期等参数不会在代码中生效，其它的这些参数会在WDT Stack中配置生效，例如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-25/image7.png)

- Register Start NMI Support：在寄存器启动方式下是否要NMI中断使能配置位；
- Name：WDT模块在代码中的设备名称；
- Reser Control：产生复位的控制条件，可以选择“NMI Generated”或“Reset Output”;
- NMI Callback：NMI中断服务函数会调用的中断回调函数名；

### 25.2.2 配置信息解读

在RASC中配置WDT并生成工程后，会在hal_data.c中生成表示WDT设备的wdt_instance_t结构体常量g_wdt：

```c
const wdt_instance_t g_wdt =
{
    .p_ctrl        = &g_wdt_ctrl,
    .p_cfg         = &g_wdt_cfg,
    .p_api         = &g_wdt_on_wdt
};
```

- p_ctrl：wdt_ctrl_t类型指针成员，用来记录设备状态，记录一些重要信息（比如回调函数）；
- p_cfg：指向WDT的配置结构体，这个结构体的数值来自在RASC中对WDT的配置，代码如下：

```c
const wdt_cfg_t g_wdt_cfg =
{
    .timeout = WDT_TIMEOUT_16384,
    .clock_division = WDT_CLOCK_DIVISION_8192,
    .window_start = WDT_WINDOW_START_100,
    .window_end = WDT_WINDOW_END_0,
    .reset_control = WDT_RESET_CONTROL_NMI,
    .stop_control = WDT_STOP_CONTROL_ENABLE,
    .p_callback = nmi_callback,
};
```

p_api：指向了一个wdt_api_t结构体，这个结构体在r_wdt.c中实现，它封装了WDT设备的接口函数，代码如下：

```c
const wdt_api_t g_wdt_on_wdt =
{
    .open        = R_WDT_Open,
    .refresh     = R_WDT_Refresh,
    .statusGet   = R_WDT_StatusGet,
    .statusClear = R_WDT_StatusClear,
    .counterGet  = R_WDT_CounterGet,
    .timeoutGet  = R_WDT_TimeoutGet,
    .callbackSet = R_WDT_CallbackSet,
};
```

### 25.2.3 中断回调函数

在RASC中配置了WDT的中断回调函数名字后，会在hal_data.h中声明此回调函数：

```c
#ifndef nmi_callback
void nmi_callback(wdt_callback_args_t * p_args);
#endif
```

用户需要去实现这个回调函数，例如：

```c
void nmi_callback(wdt_callback_args_t * p_args)
{
    (void)p_args;
}
```

### 25.2.4 API接口及其用法

前文已经说过，在FSP库函数中是使用wdt_api_t结构体来封装了WDT的操作方法，原型如下：

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

瑞萨在r_wdt.c中实现了一个wdt_api_t结构体。下面介绍这些接口函数的用法。

1. 打开WDT设备

```c
fsp_err_t (* open)(wdt_ctrl_t * const p_ctrl, wdt_cfg_t const * const p_cfg);
```

- p_ctrl：wdt的控制参数，只是用来记录设备的状态以及一些信息；
- p_cfg：wdt的配置参数；

用户可以使用以下代码来初始化WDT：

```c
fsp_err_t err = g_wdt.p_api->open(g_wdt.p_ctrl, g_wdt.p_cfg);
assert(FSP_SUCCESS == err);
```

2. 刷新WDT设备

```c
fsp_err_t (* refresh)(wdt_ctrl_t * const p_ctrl);
```

- p_ctrl：wdt的控制参数

此函数会更新WDT的14位计数器，让它从初始值开始递减；

用户可以参考以下代码刷新WDT：

```c
fsp_err_t err = g_wdt.p_api->refresh(g_wdt.p_ctrl);
assert(FSP_SUCCESS == err);
```

3. 获取WDT的状态

```c
fsp_err_t (* statusGet)(wdt_ctrl_t * const p_ctrl, wdt_status_t * const p_status);
```

- p_status：WDT状态，它是wdt_status_t枚举类型，原型如下：

```c
typedef enum e_wdt_status
{
    WDT_STATUS_NO_ERROR                    = 0, ///< No status flags set.
    WDT_STATUS_UNDERFLOW_ERROR             = 1, ///< Underflow flag set.
    WDT_STATUS_REFRESH_ERROR               = 2, ///< Refresh error flag set. Refresh outside of permitted window.
    WDT_STATUS_UNDERFLOW_AND_REFRESH_ERROR = 3, ///< Underflow and refresh error flags set.
} wdt_status_t;
```

4. 清除WDT的状态

```c
fsp_err_t (* statusClear)(wdt_ctrl_t * const p_ctrl, const wdt_status_t status);
```

5. 获取WDT当前的计数值

```c
fsp_err_t (* counterGet)(wdt_ctrl_t * const p_ctrl, uint32_t * const p_count);
```

只要没有发生溢出中断或者刷新错误中断，用户就可以调用此函数获取WDT当前的计数值，p_count是一个输出参数，里面记录有得到的计数值。

6. 获取WDT的超时周期值

```c
fsp_err_t (* timeoutGet)(wdt_ctrl_t * const p_ctrl, 
                         wdt_timeout_values_t * const p_timeout);
```

只要没有发生溢出中断或者刷新错误中断，用户就可以调用此函数获取WDT当前的超时周期值，p_timeout是一个输出参数。里面记录有超时周期值。

## 25.3 看门狗实验

### 25.3.1 设计目的

让用户学会使用瑞萨RA6M5的WDT，并观察是否刷新看门狗的现象。

### 25.3.2 硬件连接

本实验会用到板载串口和按键，请读者参考前文配置。

### 25.3.3 驱动程序

1. 初始化WDT

调用open函数即可初始化WDT，再调用刷新函数refresh以触发WDT开始计数：

```c
void WDTDrvInit(void)
{
    /* 在自启动模式下，复位后WDT会理解开始计数 */
    fsp_err_t err = g_wdt.p_api->open(g_wdt.p_ctrl, g_wdt.p_cfg);
    assert(FSP_SUCCESS == err);
    /* 如果是寄存器启动方式，在刷新WDT后才会才是计数 */
    err = g_wdt.p_api->refresh(g_wdt.p_ctrl);
    assert(FSP_SUCCESS == err);
}
```

2. 刷新WDT

刷新WDT比较简单，直接调用其refresh函数即可：

```c
void WDTDrvRefresh(void)
{
    fsp_err_t err = g_wdt.p_api->refresh(g_wdt.p_ctrl);
    assert(FSP_SUCCESS == err);
}
```

3. NMI中断回调函数

在RASC中使能了WDT的NMI中断，需要自己实现NMI回调函数，代码如下：

```c
__WEAK void DataSaveProcess(void)
{
}
void nmi_callback(wdt_callback_args_t * p_args)
{
    (void)p_args;
    printf("\r\nWarning!Do your most important save working!!\r\n");
    DataSaveProcess();
```

4. 使用按键刷新定时器

在按键消抖处理后，刷新看门狗定时器，代码如下：

```c
void KeyProcessEvents(void)
{
    struct IODev *ptLedDev = IOGetDecvice("UserLed");
    struct IODev *ptKeyDev = IOGetDecvice("UserKey");
    ptLedDev->Write(ptLedDev, !ptKeyDev->Read(ptKeyDev));
    WDTDrvRefresh();
}
```

### 25.3.4 测试程序

在本次实验中，初始化了各个外设后，主循环中不用做任何事情，所有的操作都是在中断中完成的：

- 按键中断
- 滴答定时器消除按键抖动
- NMI中断处理用户的紧急事件

测试函数代码如下：

```c
void WDTAppTest(void)
{
    SystickInit();
    UARTDrvInit();
    
    struct IODev *ptdev = IOGetDecvice("UserKey");
    if(NULL != ptdev)
        ptdev->Init(ptdev);
    ptdev = IOGetDecvice("UserLed");
    if(NULL != ptdev)
        ptdev->Init(ptdev);
    WDTDrvInit();
    
    while(1)
    {
        /* The code that is watched by iwdt */
    }
}
```

### 25.3.5 测试结果

将编译出来的二进制可执行文件烧录到板子上并运行，如果不按按键的话会得到例如下图这样的打印信息：

![image8](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-25/image8.png)
