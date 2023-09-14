# 第11章 SysTick

本章目标

- 了解滴答定时器的概念
- 学会配置滴答定时器和扩展驱动应用 

## 11.1 认识滴答定时器

SysTick定时器也被称为滴答定时器。在Cortex架构的处理器里，有一个24bit的向下计数定时器，它就是滴答定时器。它不是处理器之外的、跟GPIO等设备同等地位的设备，而是位于处理器内部的定时器。

对于Cortex-M33内核而言，它拥有2个滴答定时器：一个用于非安全系的滴答定时器，另一个用于安全系的滴答定时器。如果开发者不使用Cortex-M33的TrustZone的程序安全功能，那么只能使用一个非安全系的滴答定时器。

滴答定时器有4个寄存器用于控制和获取状态：

a) 控制和状态寄存器：SYST_CSR
b) 重载值寄存器：SYST_RVR
c) 当前计数值寄存器：SYST_CVR
d) 校验值寄存器：SYST_CALIB

使用滴答定时器就是对这几个寄存器进行配置让它按照指定的频率进行计数，本章会实现几个驱动函数为后续章节的外设驱动使用。

## 11.2 滴答定时器的配置

在配置滴答定时器前，首先应该要熟悉其工作机制，其工作机制有如下几条：

① 当使能了滴答定时器的计数后，滴答定时器将会从重载值向下计数到零，然后在下一个时钟周期从重载值寄存器读取重载值，在紧随的下一个时钟周期又开始向下计数。
② 如果给重载值寄存器RVR写入了一个‘0’，那么本次计数循环（也就是本次向下计数到0）后就会停止计数。
③ 当计数到0使，控制状态寄存器CSR的计数标志COUNTFLAG位会被置1.，当读取CSR寄存器时会将这一位清零。
④ 如果给当前计数值寄存器CVR写入一个值时，会更新CVR的值且会将COUNTFLAG清零；
⑤ 如果程序处于调试状态，当开发者暂停调试时，滴答定时器也会暂停计数；

可以看到，这几个机制中使用到的寄存器只有3个：CSR（Control and Status Register，控制和状态寄存器）、RVR（Reload Value Register，重载值寄存器）和CVR（Current Value Register，当前值寄存器）。接下来就着重认识下这3个寄存器，并且学会如何配置他们。

### 11.2.1 控制和状态寄存器SYST_CSR

控制状态寄存器各个位的描述如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-11/image1.png) 

- Bit0-ENABLE：计数器使能位；0-不使能计数器；1-使能计数器；
- Bit1-TICKINT：滴答定时器中断请求位；0-计数到0不产生中断请求；1-产生中断请求；
- Bit2-CLKSOURCE：滴答定时器的时钟选择位；0-使用外部基准时钟；1-使用处理器时钟；
- Bit16-COUONTFLAG：滴答定时器技术标志位，当计数到0时置1，如果没有读取CSR的话将会一直为1；

CSR寄存器上电复位默认值是0x00000000，一般情况下，程序是需要滴答定时器产生中断请求来判定滴答定时器计数到0的，所以TICKINT通常被设置为1；而时钟源的选择，惯用的是选择处理器时钟。所以在初始化的时候，一般将CSR的值设置为0x07。

### 11.2.2 重载值寄存器SYST_RVR

重载值寄存器虽然是一个32bit的寄存器，但是鉴于滴答定时器的设计只有24位的计数值，因而此寄存器只有低24bit有效，高8bit保留，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-11/image2.png) 

所谓重载值，就是指滴答定时器计数到0时，又重新从这个值开始向下计数。例如程序中需要滴答定时器从100开始向下计数，那么这里就将RVR的低24bit设置为‘100-1’，也就是十六进制的0x63,二进制的0110 0011，那么RVR寄存器的值就是下图这样：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-11/image3.png)  

### 11.2.3 当前计数值寄存器SYST_CVR

当前计数值寄存器CVR也是低24bit有效，用来表示滴答定时器当前的计数值，如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-11/image4.png)  

无论程序给此寄存器写入什么值，都会将此寄存器清零，并且会将计数标志位COUNTFLAG清零。

### 11.2.4 滴答定时器的初始化配置

滴答定时器还有一个校准寄存器CALIB，它是只读寄存器，无需操作。从Cortex-M33的调试手册中其对滴答定时器的各个寄存器总结如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-11/image5.png)  

那么开发者配置滴答定时器时，步骤如下：

① 选择抵达定时器的时钟源；
② 使能滴答定时器的中断请求；
③ 设置重载值；
④ 清零当前计数值；
⑤ 使能滴答定时器计数；

1. 初始化滴答定时器

在Cortex内核源文件的core_cmXX.h，比如core_cm33.h定义滴答定时器的初始化函数，代码如下：

```c
__STATIC_INLINE uint32_t SysTick_Config(uint32_t ticks)
{
  if ((ticks - 1UL) > SysTick_LOAD_RELOAD_Msk)
  {
    return (1UL);                       /* Reload value impossible */
  }
  SysTick->LOAD  = (uint32_t)(ticks - 1UL);              /* set reload register */
  NVIC_SetPriority (SysTick_IRQn, (1UL << __NVIC_PRIO_BITS) - 1UL); /* set Priority for Systick Interrupt */
  SysTick->VAL   = 0UL;          /* Load the SysTick Counter Value */
  SysTick->CTRL  = SysTick_CTRL_CLKSOURCE_Msk |
                   SysTick_CTRL_TICKINT_Msk   |
                   SysTick_CTRL_ENABLE_Msk; /* Enable SysTick IRQ and SysTick Timer */
  return (0UL);                  /* Function successful */
}
```

开发者只需要在自己的代码中调用此函数，传入一个指定的重载值即可，例如下面这个代码：

```c
fsp_err_t SystickInit(void)
{
	/* 获取处理器时钟uwSysclk */
    uint32_t uwSysclk= R_BSP_SourceClockHzGet(FSP_PRIV_CLOCK_PLL);
    /* 技术周期为uwSysclk/1000 */
    if(SysTick_Config(uwSysclk/1000) != 0)
    {
        return FSP_ERR_ASSERTION;
    }
    /* Return function status */
    return FSP_SUCCESS;
}
```

如上初始化滴答定时器后，它的计数时钟频率就是处理器的系统主频![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml21652\wps186.jpg)，

在此频率下向下计数![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml21652\wps187.jpg)个数后触发中断，也就是每秒钟触发1000次中断，换算公式如下：

![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml21652\wps188.jpg) 

假如![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml21652\wps189.jpg)，那么传入给SysTick_Config函数的值就是200K，滴答定时器就会以200MHz的频率从200K往0开始递减，递减为0时触发一次中断，中断触发频率就是![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml21652\wps190.jpg)。

2. 实现滴答定时器的中断服务函数

当滴答定时器计数到0时，会触发中断，中断服务函数SysTick_Handler被调用，这个函数需要开发者实现，比如给一个全局变量递增1，参考如下代码：

```c
volatile  uint32_t dwTick = 0;
void SysTick_Handler(void)
{
    dwTick += 1;
}
```

## 11.3 基于SysTick的扩展应用

本实验会用到板载LED外设和printf功能，请读者参考本书《第5章 GPIO输入输出》和《第7章 UART》来配置LED的GPIO和UART模块，并且移植drv_uart.c和drv_config.h到本节实验的工程“1101_systick_delay”中。

在上一小节已经初始化了滴答定时器、实现了中断服务函数。本节在此基础上实现一个ms级别的延时函数（因为初始化设置的滴答定时器是1KHz的中断触发频率）。参考如下代码：

```c
#define HAL_MAX_DELAY      0xFFFFFFU
void HAL_Delay(uint32_t dwTime)
{
    uint32_t dwStart = dwTick;
    uint32_t dwWait = dwTime;

    /* Add a freq to guarantee minimum wait */
    if (dwWait < HAL_MAX_DELAY)
    {
        dwWait += (uint32_t)(1);
    }

    while((dwTick - dwStart) < dwWait)
    {
    }
}
```

- 第10行：在延时值基础上加1；
- 第13行：滴答定时器中断服务函数中的递增变量dwTick减去此延时函数调用时刻的dwStart，即滴答定时器触发“dwTick- dwStart”次后大于等于延时时长后才退出函数；

为什么dwWait要先加1？这是因为执行HAL_Delay函数时必定是在2次滴答定时器中断之间，距离下一次中断的时间必定小于1ms。比如传入的dwTime等于2时，实际延时的时间是大于1ms、小于2ms。第10行里让dwWait值加1，目的是使得延时能满足下限：“至少延时dwWait毫秒”。

还可以读取dwTick获取系统运行时间/时刻，例如以下代码：

```c
uint32_t HAL_GetTick(void)
{
	return dwTick;
}
```

## 11.4 测试程序

本书测试滴答定时器的方法是：使用基于滴答定时器的延时函数来闪烁LED，并且打印延时前后的tick值。代码如下：

```c
void SystickAppTest(void)
{
    uint8_t ucCount = 5;
    uint32_t dwLastTick = 0, dwCurtick = 0;
    bsp_io_level_t nLevel = false;
    
    while(ucCount--)
    {
        dwLastTick = HAL_GetTick();
        HAL_Delay(1000);
        dwCurtick = HAL_GetTick();
```

## 11.5 上机实验

本实验将滴答定时器的驱动在hal_systick.c中实现，在hal_systick.h中声明；测试函数在app_systick.c中实现，在app.h中声明；最后在hal_entry.c中调用初始化函数和测试函数，代码如下：

```c
#include "app.h"
#include "hal_systick.h"
#include "drv_uart.h"
#include "hal_data.h"

void hal_entry(void)
{
    /* TODO: add your own code here */
    SystickInit();
    UARTDrvInit();
    
    SystickAppTest();
}
```

将程序编译出来的二进制可执行文件烧录到处理器中运行可以得到如下图的结果：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-11/image6.png)  

开发板上LED间隔1s改变状态。
