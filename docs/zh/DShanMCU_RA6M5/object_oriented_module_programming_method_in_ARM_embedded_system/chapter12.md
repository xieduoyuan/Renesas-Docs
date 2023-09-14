# 第12章 外部中断实验

本章目标

- 使用RASC快速配置GPIO的外部中断模式
- 学会使用GPIO的外部中断处理按键信息

## 12.1 ICU模块配置外部中断

本书《第10章 中断控制单元简介》中提到过：可以通过事件链接的方式，将ICU的中断事件连接到用户自定义的中断服务函数，由用户自定义处理该中断。外部中断自然也可以这样做，将按键的GPIO对应的外部中断链接到一个自定义的中断函数去，例如key_irq，在key_irq中对寄存器进行读写和清零、执行用户代码。

这样做有个好处是开发者可以高自由度地设计中断函数，对中断的处理具有极高的掌控力。但是却没有很好地利用RASC的配置功能。使用RASC配置ICU模块来使用中断，可以不关心底层寄存器的处理，只需要关心中断的触发方式和注册中断回调函数即可。

本书使用的方式就是使用RASC配置ICU模块来使用外部中断，获取按键状态。另外，本章会使用到Led和printf功能，请读者参考前面的章节将LED的GPIO和UART模块配置好。并且还会使用到滴答定时器的驱动函数，请读者将《第11章 SysTick》中关于滴答定时器的驱动文件hal_systick.c/.h移植到本工程。

### 12.1.1 配置ICU通道

本章需要配置的是ICU模块，在RASC中创建好工程之后，在配置界面的“Pins”中的“Peripherals”里找到“Input：ICU”，选中其中的“ICU0”，将“Operation Mode”从“Disable”改为“Enable”，然后选择IRQ的通道和使用的引脚，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-12/image1.png) 

在选择通道的时候需要根据硬件设计使用的IO来选择，例如本书使用的按键IO是P000，原理图如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-12/image2.png)  

P000对应的IRQ通道是哪一个呢？这个需要查看芯片的数据手册，在RA6M5的数据手册中，P000引脚使用的IRQ通道是6通道，如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-12/image3.png)  

所以在RASC的配置中选择的ICU0的IRQ06，并选择引脚为P000。

然后去RASC配置界面的“Stacks”里面添加ICU模块。在“New Stack”里面展开“Input”选中其中的“External IRQ(r_icu)”。如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-12/image4.png)  

最后去配置这个模块的通道和中断回调函数，先来看下配置结果：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-12/image5.png)  

主要配置的是图中圈出来的几个参数：

- 名称：建议和通道匹配；
- 通道：根据前文讲的配置选择，本书使用的是通道6；
- 触发方式：支持上升沿/下降沿/双边沿/低电平触发，根据硬件设计本书使用下降沿触发；
- 中断回调函数：用户自定义；
- 中断优先级：根据需求选择，本书使用的是12级优先级；

将上面的配置设置好之后就可以点击RASC的“Generate Project Content”生成工程了。

### 12.1.2 配置信息解读

使用RASC配置ICU后，生成了ICU的IRQ通道对应引脚配置信息和ICU本身的配置信息。以本章的实验“1201_icu_irq”为例。

1. 引脚配置信息

该信息会在1201_icu_irq\ra_gen\pin_data.c文件里生成。在RASC里配置的每一个引脚，都会在pin_data.c生成一个ioport_pin_cfg_t数组项，里面的内容跟配置时选择的参数一致。代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] =
{
      { .pin = BSP_IO_PORT_00_PIN_00, 
        .pin_cfg = ((uint32_t) IOPORT_CFG_IRQ_ENABLE
                  | (uint32_t) IOPORT_CFG_PORT_DIRECTION_INPUT) },
      ......（省略信息）
      { .pin = BSP_IO_PORT_04_PIN_00, 
        .pin_cfg = ((uint32_t) IOPORT_CFG_DRIVE_HIGH | (uint32_t) IOPORT_CFG_PORT_DIRECTION_OUTPUT |
                  (uint32_t) IOPORT_CFG_PORT_OUTPUT_LOW) },
};
```

- 第03~05行：将按键引脚P000配置为输入方向且使能IRQ；
- 第07~09行：将LED引脚P0400配置为输出方向且默认输出高电平；

2. ICU配置信息

ICU的配置信息分为两部分：ICU模块信息和ICU中断服务函数。

ICU模块信息会在1201_icu_irq\ra_gen\common_data.c文件里生成。在RASC里配置的IRQ通道、触发方式和中断服务函数等，都会在common_data.c生成一个external_irq_cfg_t结构体，里面的内容跟配置时选择的参数一致。代码如下：

```c
const external_irq_cfg_t g_external_irq6_cfg =
{ .channel = 6,
  .trigger = EXTERNAL_IRQ_TRIG_FALLING,
  ......（省略内容）
  .p_callback = ex_irq6_callback,
  ......（省略内容）
        };
```

- 第02行：选择通道；
- 第03行：设置触发方式；
- 第05行：注册中断回调函数；

而ICU中断服务函数注册是在vector_data.c里完成的，在这个文件中会定义一个中断向量表，代码如下：

```c
#if VECTOR_DATA_IRQ_COUNT > 0
    BSP_DONT_REMOVE const fsp_vector_t g_vector_table[BSP_ICU_VECTOR_MAX_ENTRIES] BSP_PLACE_IN_SECTION(BSP_SECTION_APPLICATION_VECTORS) =
    {
        [0] = sci_uart_rxi_isr, /* SCI7 RXI (Received data full) */
        [1] = sci_uart_txi_isr, /* SCI7 TXI (Transmit data empty) */
        [2] = sci_uart_tei_isr, /* SCI7 TEI (Transmit end) */
        [3] = sci_uart_eri_isr, /* SCI7 ERI (Receive error) */
        [4] = r_icu_isr, /* ICU IRQ6 (External pin interrupt 6) */
    };
    const bsp_interrupt_event_t g_interrupt_event_link_select[BSP_ICU_VECTOR_MAX_ENTRIES] =
    {
        [0] = BSP_PRV_IELS_ENUM(EVENT_SCI7_RXI), /* SCI7 RXI (Received data full) */
        [1] = BSP_PRV_IELS_ENUM(EVENT_SCI7_TXI), /* SCI7 TXI (Transmit data empty) */
        [2] = BSP_PRV_IELS_ENUM(EVENT_SCI7_TEI), /* SCI7 TEI (Transmit end) */
        [3] = BSP_PRV_IELS_ENUM(EVENT_SCI7_ERI), /* SCI7 ERI (Receive error) */
        [4] = BSP_PRV_IELS_ENUM(EVENT_ICU_IRQ6), /* ICU IRQ6 (External pin interrupt 6) */
    };
#endif
```

- 第04~07行：注册UART通信的中断服务函数；
- 第08行：注册ICU的中断服务函数；
- 第10~17行：链接中断服务函数表；

本章需要了解的是ICU的中断服务函数r_icu_isr的实现，其源码如下：

```c
void r_icu_isr (void)
{
    /* Save context if RTOS is used */
    FSP_CONTEXT_SAVE

    IRQn_Type             irq    = R_FSP_CurrentIrqGet();
    icu_instance_ctrl_t * p_ctrl = (icu_instance_ctrl_t *) R_FSP_IsrContextGet(irq);

    bool level_irq = false;
    if (EXTERNAL_IRQ_TRIG_LEVEL_LOW == R_ICU->IRQCR_b[p_ctrl->channel].IRQMD)
    {
        level_irq = true;
    }
    else
    {
        /* Clear the IR bit before calling the user callback so that if an edge is detected while the ISR is active
         * it will not be missed. */
        R_BSP_IrqStatusClear(irq);
    }

    if ((NULL != p_ctrl) && (NULL != p_ctrl->p_callback))
    {
#if BSP_TZ_SECURE_BUILD
    ......（省略内容）
#else
        /* Set data to identify callback to user, then call user callback. */
        external_irq_callback_args_t args;
        args.channel   = p_ctrl->channel;
        args.p_context = p_ctrl->p_context;
        p_ctrl->p_callback(&args);
#endif
    }
    ......（省略内容）
}
```

- 第06~07行：获取中断信息；
- 第18行：清除中断；
- 第27~29行：记录中断信息，它将作为参数传递给中断服务函数；
- 第30行：执行该中断的回调函数

### 1.1.3 中断回调函数

中断回调函数的原型已经在common_data.h中进行了声明，需要用户在自己的程序中实现它，其原型代码如下：

```c
void ex_irq6_callback(external_irq_callback_args_t *p_args);
```

其参数类型是external_irq_callback_args_t结构体指针，这个结构体的原型如下：

```c
typedef struct st_external_irq_callback_args
{
    /** Placeholder for user data. Set in @ref external_irq_api_t::open function in @ref external_irq_cfg_t. */
    void const * p_context;
    uint32_t     channel;  ///< The physical hardware channel that caused the interrupt.
} external_irq_callback_args_t;
```

这个结构体仅表明外部中断的内容（context）和通道（channel），而context在初始化时被设置为NULL，没有使用。因而能使用的只有通道值：用来判定发生了哪个通道的中断。

例如本章的实验就是：在中断回调函数中发现发生了按键中断后，使用滴答定时器消除抖动，代码如下：

```c
static volatile uint32_t uwPressTick = 0;
void ex_irq6_callback(external_irq_callback_args_t * p_args)
{
    if(p_args->channel == 6)    // 按键的GPIO的ICU通道是6
    {
        uwPressTick = HAL_GetTick() + 100;
    }
}
```

消除抖动的原理在后续章节讲解。

### 12.1.4 API接口及其用法

在路径1201_icu_irq/ra/fsp/inc/api/r_external_irq_api.h中定义了ICU模块的接口，它定义了一个结构体类型external_irq_api_t，内容如下：

```c
typedef struct st_external_irq_api
{
    fsp_err_t (* open)(external_irq_ctrl_t * const p_ctrl, 
                       external_irq_cfg_t const * const p_cfg);
    fsp_err_t (* enable)(external_irq_ctrl_t * const p_ctrl);
    fsp_err_t (* disable)(external_irq_ctrl_t * const p_ctrl);
    fsp_err_t (* callbackSet)(external_irq_ctrl_t * const p_api_ctrl,
                              void (* p_callback)(external_irq_callback_args_t *),
                              void const * const p_context,
                             external_irq_callback_args_t * const p_callback_memory);
    fsp_err_t (* close)(external_irq_ctrl_t * const p_ctrl);
} external_irq_api_t;
```

在具体的C文件中，需要定义一个external_irq_api_t结构体变量，比如在r_icu.c里实现了如下结构体变量的定义：

```c
const external_irq_api_t g_external_irq_on_icu =
{
    .open        = R_ICU_ExternalIrqOpen,
    .enable      = R_ICU_ExternalIrqEnable,
    .disable     = R_ICU_ExternalIrqDisable,
    .callbackSet = R_ICU_ExternalIrqCallbackSet,
    .close       = R_ICU_ExternalIrqClose,
};
```

要使用ICU的控制接口，可以调用结构体g_external_irq_on_icu里的各个函数指针，也可以直接调用r_icu.c里实现的各个函数。

1. 打开/关闭外部中断

外部中断open函数用于配置外部中断的类型、设置回调函数、设置通道等，函数原型如下：

```c
fsp_err_t (* open)(external_irq_ctrl_t * const p_ctrl, external_irq_cfg_t const * const p_cfg);
```

实现如下：

```c
fsp_err_t R_ICU_ExternalIrqOpen (external_irq_ctrl_t * const p_api_ctrl, 
                                 external_irq_cfg_t const * const p_cfg)
{
    icu_instance_ctrl_t * p_ctrl = (icu_instance_ctrl_t *) p_api_ctrl;
    ......（省略内容）
    p_ctrl->irq = p_cfg->irq;	// 中断类型
    ......（省略内容）
    /* Initialize control block. */
    p_ctrl->p_callback = p_cfg->p_callback;
    p_ctrl->p_context  = p_cfg->p_context;
    p_ctrl->channel    = p_cfg->channel;
    ......（省略内容）
    p_ctrl->open = ICU_OPEN;

    return FSP_SUCCESS;
}
```

open函数的第一个参数是external_irq_ctrl_t类型的，和前面的许多外设一样，这是一个void类型的结构体：

```c
typedef void external_irq_ctrl_t;
```

open函数的第二个参数是external_irq_cfg_t的，这个结构体描述了外部中断的通道、优先级、终端类型、触发方式等，代码如下：

```c
typedef struct st_external_irq_cfg
{
    uint8_t                 channel;   ///< Hardware channel used.
    uint8_t                 ipl;       ///< Interrupt priority
    IRQn_Type               irq;       ///< NVIC interrupt number assigned to this instance
    external_irq_trigger_t  trigger;   ///< Trigger setting.
    external_irq_pclk_div_t pclk_div;  ///< Digital filter clock divisor setting.
    bool filter_enable;                ///< Digital filter enable/disable setting.

    /** Callback provided external input trigger occurs. */
    void (* p_callback)(external_irq_callback_args_t * p_args);

    /** Placeholder for user data.  Passed to the user callback in @ref external_irq_callback_args_t. */
    void const * p_context;
    void const * p_extend;             ///< External IRQ hardware dependent configuration.
} external_irq_cfg_t;
```

关闭外部中断close函数则比较简单，FSP在里面禁止中断，代码如下：

```c
fsp_err_t R_ICU_ExternalIrqClose (external_irq_ctrl_t * const p_api_ctrl)
{
    icu_instance_ctrl_t * p_ctrl = (icu_instance_ctrl_t *) p_api_ctrl;
	......（省略内容）
    /* Cleanup. Disable interrupt */
    if (p_ctrl->irq >= 0)
    {
        /* Disable the interrupt, and then clear the interrupt pending bits and interrupt status. */
        R_BSP_IrqDisable(p_ctrl->irq);
        R_FSP_IsrContextSet(p_ctrl->irq, NULL);
    }
    p_ctrl->open = 0U;
    return FSP_SUCCESS;
}
```

- 第09行：失能中断；
- 第12行：将open标志清零；

开发者调用open函数来初始化外部中断、注册中断回调函数，但是需要注意的是，open函数并没有使能中断。可以参考下面的代码打开中断：

```c
fsp_err_t err = g_external_irq6.p_api->open(g_external_irq6.p_ctrl, 
                                            g_external_irq6.p_cfg);
if(FSP_SUCCESS == err)
{
	printf("Success to open Key device: %s!\r\n", _iodev->DevInfo.name);
}
```

2. 使能/失能外部中断

使能和禁止外部中断的函数比较简单，只需要传入一个外部中断接口控制结构体external_irq_ctrl_t类型的参数即可，原型如下：

```c
fsp_err_t (* enable)(external_irq_ctrl_t * const p_ctrl);
fsp_err_t (* disable)(external_irq_ctrl_t * const p_ctrl);
```

这两个函数的实现也特别简单：

```c
fsp_err_t R_ICU_ExternalIrqEnable (external_irq_ctrl_t * const p_api_ctrl)
{
    icu_instance_ctrl_t * p_ctrl = (icu_instance_ctrl_t *) p_api_ctrl;
    ......（省略内容）
    /* Clear the interrupt status and Pending bits, before the interrupt is enabled. */
    R_BSP_IrqEnable(p_ctrl->irq);
    return FSP_SUCCESS;
}

fsp_err_t R_ICU_ExternalIrqDisable (external_irq_ctrl_t * const p_api_ctrl)
{
    icu_instance_ctrl_t * p_ctrl = (icu_instance_ctrl_t *) p_api_ctrl;
    ......（省略内容）
    /* Disable the interrupt, and then clear the interrupt pending bits and interrupt status. */
    R_BSP_IrqDisable(p_ctrl->irq);
    return FSP_SUCCESS;
}
```

- 第06行：调用内联函数R_BSP_IrqEnable使能中断；
- 第15行：调用内联函数R_BSP_IrqDisable失能中断；

开发者可以参考如下代码来使能外部中断：

```c
fsp_err_t err = g_external_irq6.p_api->enable(g_external_irq6.p_ctrl);
if(FSP_SUCCESS == err)
    printf("Success to enable %s's irq!\r\n", _iodev->DevInfo.name);
```

## 12.2 中断获取按键状态实验

### 12.2.1 硬件连接

本章实验使用的是板载按键，其GPIO是P000，原理图如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-12/image6.PNG" style="zoom:150%;" />  

从图中可知，当按键被按下时P000直接接地，呈现低电平；按键松开后P000被R15上拉到VDD，呈现高电平。

### 12.2.2 按键的驱动解析

按键按下和松开后，电平的变化并不是立即从高电平跳变到低电平和从低电平跳变到高电平，中间是会有一段的抖动的，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-12/image7.png" style="zoom:150%;" />  

开发者需要避开抖动期，在按键稳定时再获取按键状态。

### 12.2.3 按键的驱动程序

1. 中断回调函数

在中断回调函数中更新按键按下时刻T+100，代码如下：

```c
static volatile uint32_t uwPressTick= 0;
void ex_irq6_callback(external_irq_callback_args_t * p_args)
{
    if(p_args->channel == 6)    // 按键的GPIO的ICU通道是6
    {
        uwPressTick = HAL_GetTick() + 100;
    }
}
```

对于机械按键，用户按下一次，它的机械开关可能震动多次、触发多次中断。消除抖动的原理为：发生中断时不要即刻处理，而是“推迟处理”。在第6行那里，发生中断时更新uwPressTick为“当前时间+100”。比如在短时间内发生了20次震动，导致20次中断，uwPressTick被更新、推迟20次，当机械震动停止后，最后一次中断更新的uwPressTick不再变化。当SysTick的dwTick到达uwPressTick时，再执行用户程序。这样，20次中断只导致执行1次用户程序，这就消除了抖动。

2. IO对象封装

本实验将LED和按键统一封装为一种GPIO设备对象，用一个结构体IODev表示该设备，在结构体中实现对设备的描述、初始化和读写。结构体代码如下：

```c
typedef struct IODev{
    char         *name;
    int          (*Init)(struct IODev *ptDev);
    int          (*Write)(struct IODev *ptDev, IODevState_t level);
    IODevState_t (*Read)(struct IODev *ptDev);
}IODev, *PIODev;
```

IO设备的电平状态有高低电平两类，IODevState_t枚举类型如下：

```c
typedef enum{
    LowLevel,
    HighLevel,
    ErrLevel = -1
}IODevState_t;
```

3. 外部中断初始化

本章实验是使用按键控制LED，所以需要初始化按键并使能它的中断，也要初始化LED的GPIO，代码如下：

```c
static int IODrvInit(struct IODev *ptdev)
{
    if(ptdev->name == NULL)     return -1;
    /* 初始化按键对应的外部中断且使能 */
    if(strcmp(ptdev->name, "UserKey") == 0)
    {
        fsp_err_t err = g_external_irq6.p_api->open(g_external_irq6.p_ctrl, 
                                                    g_external_irq6.p_cfg);
        if(FSP_SUCCESS != err)
        {
            printf("Failed to open Key device: %s!\r\n", ptdev->name);
            return -1;
        }
        err = g_external_irq6.p_api->enable(g_external_irq6.p_ctrl);
        if(FSP_SUCCESS == err)
            printf("Success to enable %s's irq!\r\n", ptdev->name);
        else
        {
            printf("Failed to enable %s's irq!\r\n", ptdev->name);
            return -1;
        }
    }
    /* 初始化LED灯GPIO */
    if(strcmp(ptdev->name, "UserLed") == 0)
    {
        fsp_err_t err = g_ioport.p_api->open(g_ioport.p_ctrl, g_ioport.p_cfg);
        if(FSP_ERR_ALREADY_OPEN == err)
        {
            printf("Error. GPIOs are already open and init.\r\n");
            return -1;
        }
        else if(FSP_SUCCESS == err)
            printf("Success to open Led device: %s!\r\n", ptdev->name);
    }
    return 0;
}
```

- 第08~15行：如果打开按键GPIO的外部中断成功了，才去使能这个外部中断；
- 第26~36行：初始化LED的GPIO；

4. 按键抖动处理

在中断回调函数中更新uwPressTick为“当前时间+100”，意图在100ms之后再处理。谁来处理？在SysTick中断函数里处理，代码如下：

```c
void SysTick_Handler(void)
{
    dwTick += 1;
    extern void KeyProcessJitter(uint32_t tick);
    KeyProcessJitter(dwTick);
}
```

l 第03行：让dwTick累加1；
l 第05行：调用KeyProcessJitter函数处理按键

关键在于KeyProcessJitter函数，此函数在每个SysTick中断中都被调用，但是只有dwTick值等于uwPressTick时才操作LED：

```c
static volatile IODevState_t gLedLevel = HighLevel;
void KeyProcessJitter(uint32_t tick)
{
    if(tick == uwPressTick)
    {
        gLedDev.Write(&gLedDev, gLedLevel);
        gLedLevel = !gLedLevel;
    }        
}
```

### 12.2.4 测试程序

因为是在中断中处理的按键和改变LED状态，因而本次实验无需在main中编写测试代码。

### 12.2.5 上机实验

在hal_entry()函数中初始化滴答定时器、UART、按键设备和LED设备即可，当按键按下时中断服务函数被调用。han_entry()函数代码如下：

```c
#include "drv_uart.h"
#include "drv_gpio.h"
#include "hal_systick.h"
#include "hal_data.h"
#include <stdio.h>
void hal_entry(void)
{
    /* TODO: add your own code here */
    SystickInit();
    UARTDrvInit();
    IODev *ptKeyDev = IOGetDecvice("UserKey");
    if(NULL == ptKeyDev)
    {
        printf("Failed to get UserKey!\r\n");
        return;
    }
    IODev *ptLedDev = IOGetDecvice("UserLed");
    if(NULL == ptLedDev)
    {
        printf("Failed to get UserLed!\r\n");
        return;
    }
    if(ptKeyDev->Init(ptKeyDev) !=0)    return;
    if(ptLedDev->Init(ptLedDev) !=0)    return;
}
```

将编译出来的二进制可执行文件烧录到芯片中运行，使用串口调试助手观察打印信息，在开发板上按下按键可以控制LED。