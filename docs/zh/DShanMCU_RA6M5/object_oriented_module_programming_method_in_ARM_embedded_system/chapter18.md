# 第18章 GPT

本章目标

- 了解RA6M5处理器的GPT外设；
- 学会使用RASC配置GPT实现基本定时和PWM输出；

## 18.1 GPT简介

通用PWM定时器（GPT，Genera- PWM Timer）是RA MCU的一种32/16位的定时器外设。在GPT当中，可分为GPT32和GPT16，它们最主要的区别是计数器的位数不同。GPT32是32位的定时器，能计数的范围为：0~0xFFFF_FFFF； 而GPT16是16位的定时器，能计数的范围为：0~0xFFFF。

GPT模块可用于计数事件、测量外部输入信号、作为通用计时器并产生周期性中断、以及输出周期性PWM信号到GTIO引脚。GPT也可用于输出单个脉冲，但是注意这是通过软件来实现的，GPT硬件本身不支持输出单个脉冲（One-Shot）功能。当使用单个脉冲（One-Shot）模式时，必须要开启中断，在脉冲周期结束后在ISR中断服务函数中停止计时器。

RA MCU的GPT包括但不限于如下这些特征：

- 32位GPT有4个输入/输出通道；16位GPT有6个输入输出通道；
- 每个GPT的计数器支持向上计数、向下计数或者向上向下同时计数；
- 每个通道的时钟源都可以单独配置选择；
- 每个通道有2个引脚可用来输入输出；
- 每个通道有2个输出比较寄存器或者输入捕获寄存器；
- 每个通道的输出比较寄存器或输入捕获寄存器都有4个缓存寄存器；
- 在PWM模式下支持设置死区时间；
- 计数器的开始、停止、清除等动作可以由最多8个ELC事件响应，也可以由最多4个外部触发器相应；
- 支持生成控制无刷直流电机的PWM波；

RA MCU的GPT支持下表的这些功能：·

![image1](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image1.jpg)

![image2](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image2.jpg)

RA MCU的GPT引脚及其功能用途如下表：

![image3](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image3.jpg)

最后来看下GPT的系统框图：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image4.png" alt="image4" style="zoom:67%;" />

1. 计数器

GTCNT是GPT定时器模块内部的计数器，实际上，计数器是实现定时器外设的各种功能的基础。 因此，了解计数器的规格和功能非常重要。

对于RA6M5，共有10个GPT定时器（GPT0~9），而GPT又分为GPT32和GPT16。GPT32有4个（GPT0~3），计数器为32bit，在上图中用GPT320~GPT323来表示；而GPT16有6个（GPT4~9），计数器为16bit，在上图中用GPT164~GPT169来表示。

GPT的计数器支持递增计数，递减计数和递增/递减计数（即递增与递减计数轮流进行）。

2. 时钟源

GPT定时器的时钟输入可以选择内部的PCLKD分频后输入，或者选择通过GTETRGn引脚输入外部时钟。这两类中只能选择一个，若选择外部时钟输入则定时器不能对内部时钟输入进行计数。

- PCLKD / n（n = 1/2/4/8/16/32/64/256/1024）
- GTETRGA,GTETRGB,GTETRGC,GTETRGD（通过POEG）

注：PCLKD / 1表示的是不分频。

3. 周期设置

GTPR周期设置寄存器，是一个可读写的寄存器，用户可通过该寄存器设置计数器GTCNT的最大计数值，计数超过该值就会溢出，因此该值决定了计数器的计数周期。GTPR的有效位与GTCNT（16位或32位）相同。如果GTPR的有效大小为16位，则用户读取其高16位始终为0，并且对其高16位的写入作会被忽略。

GTPBR 周期设置缓冲寄存器，同样也是一个可读写的寄存器，用作GTPR的缓冲寄存器，GPT计数器每计数溢出一次，就会将GTPBR的值写入GTPR。GTPBR的有效大小也与GTCNT（16位或32位）相同。如果GTPBR的有效大小为16位，则用户读取其高16位始终为0，并且对其高16位的写入作会被忽略。

4. 控制寄存器

本书是面向对象的编程思想，不会基于寄存器直面底层硬件编程，且GPT的控制寄存器很多，本书不对GPT的寄存器做一一讲解。

5. 比较输出和输入捕获控制寄存器

这部分包含一个比较器和6个GTCCRx寄存器（x = A,B,C,D,E,F）。这6个GTCCRx寄存器的功能并不完全相同：

- GTCCRA和GTCCRB是用于输出比较和输入捕捉的寄存器。
- GTCCRC和GTCCRE可用作比较匹配寄存器，也可以分别作为GTCCRA和GTCCRB的缓冲寄存器（构成GTCCRA和GTCCRB的单缓冲寄存器）。
- GTCCRD和GTCCRF可用作比较匹配寄存器，也可以分别作为GTCCRC和GTCCRE的缓冲寄存器（构成GTCCRA和GTCCRB的双缓冲寄存器：即GTCCRC和GTCCRD作为GTCCRA的双缓冲，GTCCRE和 GTCCRF作为GTCCRB的双缓冲）。

比如，在普通的PWM输出模式下，比较器将计数器GTCNT与GTCCRA和GTCCRB进行比较，若匹配（比较结果相等），则根据GTIOR（Genera- PWM Timer I/O Contro- Register）寄存器的GTIOA[4:0]和GTIOB[4:0]的配置来切换GTIOCA和GTIOCB的输出电平。可以将GTIOCA和GTIOCB切换为低电平、高电平、或者反转电平。

6. 中断源

图中显示的是GPT0的中断请求信号，中断请求信号用于产生中断、或者通过ELC链接到其他模块。

GPT提供以下中断源：

- GTCCR输入捕捉/比较匹配
- GTCNT计数器上溢（超出GTPR设置的值）/下溢
- 周期计数功能完成

每个中断源都有自己的状态标志。当一个中断源信号产生时，相关的状态标志会被硬件自动设置为1。状态标志可以通过写入0来清除。需要注意的是，如果标志设置和标志清除同时发生，标志清除优先于标志设置。

7. GPT输入引脚

GTIOCnA和GTIOCnB是GPT的IO输入输出引脚，用于信号输出和输入捕获。它们还配备了噪声滤波器（Noise Filter），噪声滤波器以采样时钟对输入信号进行采样，并去除长度小于3个采样周期的脉冲。用户可设置是否启用噪声滤波器。

8. ELC输入事件

GPT可以执行以下操作以响应最多8个来自ELC的事件信号输入：

- 开始计数，停止计数，清除计数
- 递增计数，递减计数
- 进行一次输入捕获

9. 输出相位切换控制

输出相位切换（GPT_OPS）功能通过输出相位切换控制寄存器（OPSCR）进行控制，用于实现轻松控制无刷直流电机运行的功能。

需要注意的是：GPT_OPS功能在RA6M5中只有一个，并不是每个GPT定时器都对应有一个，也就是说通过该功能只能轻松控制一个直流无刷电机。

## 18.2 GPT模块的使用

在RASC中使用GPT模块根据应用场景分为两类：基本定时、有输入/输出需求。如果仅仅用作基本定时，那么只需要在RASC的“Stacks”中添加GPT模块即可；如果有输入输出需求的，例如输出PWM到某个引脚或者对某个波形进行捕获比较，那就需要去FSP的“Pins”中配置该引脚，然后再去“Stacks”中添加配置GPT模块。 

### 18.2.1 配置GPT模块

如果需要输出波形到某个引脚或者捕获比较某个引脚，建议先去RASC的“Pins”配置引脚。

1. 配置GPT引脚

在“Pins”中的“Peripherals”中找到“Timers:GPT”,根据硬件设计选择GPT通道和引脚，比如要使用PWM实现一个呼吸灯，LED的原理图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image5.png)

使用到的引脚是P400，此引脚支持的GPT复用通道在RA6M5数据手册中查看：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image6.png)

可以看到P400支持的GPT复用通道是GTIOC6A，也就是GPT通道6的A组引脚，那么就可以配置Pins了，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image7.png)

2. 添加GPT Stack

在FSP的“Stacks”中点击“New Stack”找到“Timers”，选择其中的“Timer,General PWM(r_gpt)”添加GPT模块，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image8.png)

接着根据使用场景配置GPT的Stack模块。GPT的Stack有3个大类需要配置：

- Common：通用配置，适配该外设所有的stack模块。对于GPT而言，通用配置需要设置的参数是：

  -  Parameter Checking：参数校验，在FSP库函数中判断参数是否合法，使用断言方式判断，默认不使能。
  -  Pin Output Support：GPT输出引脚是否使能，支持两种模式：使能和根据模块外部特征配置使能。默认使用“根据模块外部特征配置使能”，目的是不同的模块使用不同的配置实现定制化。
  -  Write Protect Enable：写保护，默认不使能。
  - Clock Source：时钟源，GPT默认选择PCLKD。

- Module g_timer Timer,General PWM(r_gpt)：模块定制化配置，是本节配置的重点。
- Pins：引脚选择，如果有输入输出需求，会自动连接到前文配置的引脚。如果是多通道，需要选择配置。

3. 配置GPT Module

GPT的通道定制化Module配置有以下5类参数需要配置：

- General：常规配置

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image9.jpg" style="zoom:80%;" />

- OutPut：输出配置

此项是配置GPT输出功能的参数，例如占空比、引脚初始状态、空闲状态等，参数比较多，不一一列举，主要内容如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image10.png)

后文会配置此处的参数生成PWM来实现呼吸灯效果，那时会详细介绍这些参数。

- Input：输入配置

此项是配置GPT的输入捕获功能，需要配置触发捕获向上计数的源、触发向下计数的源、开始捕获触发源、停止捕获触发源等，详细内容见下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image11.png)

这些触发源都需要根据硬件设计选择。

- Interrupts：中断配置

此项配置GPT的中断回调函数和中断优先级，比如溢出中断优先级、输入捕获优先级等，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image12.png)

- Extra Features：外部特征配置

GPT的外部特征配置是指配置GPT输出引脚的使能、GPT计数的触发源、死区时间的设置等，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image13.png)

当GPT的使用更加精细，比如会和ADC搭配使用，需要生成复杂的PWM、三角PWM时，就需要对外部特征进行更加精细的，定制化的配置。

### 18.2.2 配置信息解读

使用RASC将GPT的stack模块配置好之后点击“Generate Project Content”生成工程，会在工程的pin_data.c中生成模块的引脚信息，在hal_data.c中生成模块的配置信息。

1. GPT的引脚信息

假设需要使用GPT往P400引脚输出PWM控制LED，使用RASC配置GPT的通道且指定引脚后，生成的工程中的pin_data.c中的g_bsp_pin_cfg_data[]数组就会添加该引脚的配置信息，代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
    ......（省略内容）
    {.pin = BSP_IO_PORT_04_PIN_00,
    .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
              | (uint32_t) IOPORT_PERIPHERAL_GPT1)
    },
};
```

2. GPT的模块配置信息

GPT模块的配置信息在hal_data.c中以timer_cfg_t类型的结构体变量表示，代码如下：

```c
const timer_cfg_t g_timer6_cfg =
{
    .mode                = TIMER_MODE_PERIODIC,
    /* Actual period: 0.001 seconds. Actual duty: 50%. */ 
    .period_counts = (uint32_t) 0x186a0, 
    .duty_cycle_counts = 0xc350, 
    .source_div = (timer_source_div_t)0,
    .channel             = 6,
    .p_callback          = gpt_timer6_callback,
    /** If NULL then do not add & */
#if defined(NULL)
    .p_context           = NULL,
#else
    .p_context           = &NULL,
#endif
    .p_extend            = &g_timer6_extend,
    .cycle_end_ipl       = (10),
#if defined(VECTOR_NUMBER_GPT2_COUNTER_OVERFLOW)
    .cycle_end_irq       = VECTOR_NUMBER_GPT2_COUNTER_OVERFLOW,
#else
    .cycle_end_irq       = FSP_INVALID_VECTOR,
#endif
};
```

- 第03行：mode表示GPT的类型，此处是周期型；
- 第05~06行：表示输出PWM的周期和占空比；
- 第08行：表示使用的GPT的通道；
- 第09行：表示GPT的中断回调函数；

在程序中使用GPT的open函数打开GPT设备的时，就会使用这些配置信息初始化GPT。

### 18.2.3 中断回调函数

使用RASC配置生成工程后，配置的中断回调函数会在hal_data.h中声明，代码如下：

```c
#ifndef gpt_timer6_callback
void gpt_timer6_callback(timer_callback_args_t * p_args);
#endif
```

用户需要在自己的程序中实现这个中断回调函数，例如：

```c
void gpt_timer6_callback(timer_callback_args_t *p_args)
{
    /* TODO: add your own code here */
}
```

用户可以根据中断回调函数的参数timer_callback_args_t的成员进行定制处理，这个结构体的原型长这样：

```c
typedef struct st_timer_callback_args
{
    /** Placeholder for user data.  Set in @ref timer_api_t::open function in @ref timer_cfg_t. */
    void const  * p_context;
    timer_event_t event;               ///< The event can be used to identify what caused the callback.

    /** Most recent capture, only valid if event is TIMER_EVENT_CAPTURE_A or TIMER_EVENT_CAPTURE_B. */
        uint32_t capture;
} timer_callback_args_t;
```

最常用的就是其中的定时器事件成员timer_event_t，它支持的事件如下：

```c
/** Events that can trigger a callback function */
typedef enum e_timer_event
{
    TIMER_EVENT_CYCLE_END, ///< Requested timer delay has expired or timer has wrapped around
    TIMER_EVENT_CREST = TIMER_EVENT_CYCLE_END, ///< Timer crest event (counter is at a maximum, triangle-wave PWM only)
    TIMER_EVENT_CAPTURE_A,                    ///< A capture has occurred on signal A
    TIMER_EVENT_CAPTURE_B,                    ///< A capture has occurred on signal B
    TIMER_EVENT_TROUGH,      ///< Timer trough event (counter is 0, triangle-wave PWM only
} timer_event_t;
```

比如用户可以判断事件是否为TIMER_EVENT_CYCLE_END，它表示计数到指定周期了才进入的中断：

```c
if(p_args->event == TIMER_EVENT_CYCLE_END)
{
}
```

### 18.2.4 API接口及其用法

GPT模块供用户使用的API在r_timer_api.h中定义：

```c
typedef struct st_timer_api
{
    fsp_err_t (* open)(timer_ctrl_t * const p_ctrl, 
                       timer_cfg_t const * const p_cfg);
    fsp_err_t (* start)(timer_ctrl_t * const p_ctrl);
    fsp_err_t (* stop)(timer_ctrl_t * const p_ctrl);
    fsp_err_t (* reset)(timer_ctrl_t * const p_ctrl);
    fsp_err_t (* enable)(timer_ctrl_t * const p_ctrl);
    fsp_err_t (* disable)(timer_ctrl_t * const p_ctrl);
    fsp_err_t (* periodSet)(timer_ctrl_t * const p_ctrl, 
                            uint32_t const period);
    fsp_err_t (* dutyCycleSet)(timer_ctrl_t * const p_ctrl, 
                               uint32_t const duty_cycle_counts, 
                               uint32_t const pin);
    fsp_err_t (* infoGet)(timer_ctrl_t * const p_ctrl, 
                          timer_info_t * const p_info);
    fsp_err_t (* statusGet)(timer_ctrl_t * const p_ctrl, 
                            timer_status_t * const p_status);
    fsp_err_t (* callbackSet)(timer_ctrl_t * const p_api_ctrl, 
                              void (* p_callback)(timer_callback_args_t *),
                              void const * const p_context, 
                              timer_callback_args_t * const p_callback_memory);
    fsp_err_t (* close)(timer_ctrl_t * const p_ctrl);
} timer_api_t;
```

接下来看下这些API的用法。

1. 打开GPT设备

```c
fsp_err_t (* open)(timer_ctrl_t * const p_ctrl, 
                   timer_cfg_t const * const p_cfg);
```

- p_ctrl：timer_ctrl_t结构体指针参数，本质是一个void类型的参数，指向st_gpt_instance_ctrl类型变量；
- p_cfg：timer_cfg_t结构体指针参数，在程序中会指向在hal_data.c中定义的g_timer6_cfg静态全局变量；

用户在程序中可以参考如下代码使用此函数：

```c
fsp_err_t err = g_timer6.p_api->open(g_timer0.p_ctrl, g_timer6.p_cfg);
if(FSP_SUCCESS != err)
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
```

2. 开启/停止GPT计数

- GPT开始计数

```c
fsp_err_t (* start)(timer_ctrl_t * const p_ctrl);
```

- GPT停止计数

```c
fsp_err_t (* stop)(timer_ctrl_t * const p_ctrl);
```

必须要在GPT打开状态下使用这两个函数，用户可以参考如下代码在自己的程序中使用这两个函数：

```c
err = g_timer6.p_api->start(g_timer6.p_ctrl);
if(FSP_SUCCESS != err)
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    
err = g_timer6.p_api->stop(g_timer6.p_ctrl);
if(FSP_SUCCESS != err)
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
```

3. 重置GPT计数值

```c
fsp_err_t (* reset)(timer_ctrl_t * const p_ctrl);
```

如果GPT是向上计数，使用此函数会将计数器的值重置为0；如果是向下计数，使用此函数会将计数器的值重置为设定的周期值。

4. 使能/失能GPT的输入捕获

- 使能GPT输入捕获

```c
fsp_err_t (* enable)(timer_ctrl_t * const p_ctrl);
```

- 失能GPT输入捕获

```c
    fsp_err_t (* disable)(timer_ctrl_t * const p_ctrl);
```

  如果用户使用了GPT的输入捕获功能的话，在需要对引脚的信号进行捕获时需要使能捕获功能；如果想要停止捕获则调用disable。

5. 设置GPT的计数周期值

```c
    fsp_err_t (* periodSet)(timer_ctrl_t * const p_ctrl, 
                        uint32_t const period);
```

如果要改变定时器的计数周期，可以调用此函数，在下一次重新计数开始生效。

6. 设置GPT输出PWM的占空比

```c
fsp_err_t (* dutyCycleSet)(timer_ctrl_t * const p_ctrl, 
                           uint32_t const duty_cycle_counts, 
                           uint32_t const pin);
```

在PWM驱动应用中，可以使用此函数来修改占空比。用户可以参考如下代码来使用这个函数：

```c
fsp_err_t err = g_timer6.p_api->dutyCycleSet(g_timer6.p_ctrl, gPulse, GPT_IO_PIN_GTIOCA);
if(FSP_SUCCESS != err)
printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
```

此函数最后一个参数是指GPT的输出通道，而不是指IO引脚。

7. 关闭GPT设备

```c
fsp_err_t (* close)(timer_ctrl_t * const p_ctrl);
```

## 18.3 GPT的基本定时功能

本节实验会使用到串口打印以及滴答定时器，请将前文的drv_uart.c/.h和hal_systick.c/.h移植到本次实验中。

### 18.3.1 设计目的

实现一个基于硬件定时器的延时函数，最小延时时间为1us。同时利用滴答定时器辅助验证，通过串口打印调试结果。

### 18.3.2 GPT模块配置

本次实验只用到了GPT的基本定时计数功能，没有使用到比较输出或捕获输出，因而仅添加了stack模块，没有配置Pins。GPT Stack模块的Module配置如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image14.png)


虽然配置的时候选择的周期和单位是1us，但是在实际使用中可以改变这个值，所以Period和Period Unit在配置时其实可以选任意值。

另外，基于本次实验的目的，本书将定时器设置为one-shot模式，每次延时只需要计数器完成一次周期计数溢出。

### 18.3.3 驱动程序

1. 初始化

```c
void GPTDrvInit(void)
{
    fsp_err_t err = g_timer0.p_api->open(g_timer0.p_ctrl, g_timer0.p_cfg);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
}
```

初始化函数比较简单，仅仅只是调用GPT的open函数打开设备。

2. 中断回调函数和溢出等待函数

```c
static void GPTDrvWaitOverflow(void);
static volatile bool gGPTOverflow = false;
/* Callback function */
void gpt_timer0_callback(timer_callback_args_t *p_args)
{
    /* TODO: add your own code here */
    if(p_args->event == TIMER_EVENT_CYCLE_END)
        gGPTOverflow = true;
}

static void GPTDrvWaitOverflow(void)
{
    while(!gGPTOverflow);
    gGPTOverflow = false;
}
```

- 第02行：定义一个bool类型的标志位来表示定时器计数是否溢出，在中断回调函数中它被赋值为true，在等待函数中它被赋值为false；
- 第07行：判断的定时器中断事件是周期结束事件，表示一次周期性的计数完成触发的中断；

3. 微秒延时函数

```c
void GPTDrvUDelay(unsigned int time)
{
    fsp_err_t err = g_timer0.p_api->periodSet(g_timer0.p_ctrl, time*100);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);

    err = g_timer0.p_api->reset(g_timer0.p_ctrl);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);

    err = g_timer0.p_api->start(g_timer0.p_ctrl);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);

    GPTDrvWaitOverflow();
}
```

- 第03行：根据参数和定时器的时钟频率计算周期值，定时器的时钟频率是100MHz，要计数达到1us的时间就需要以100MHz的频率计数100下。因而要实现以n微秒，就需要给定时器设置n*100个计数周期值。
- 第07行：复位计数器的计数值，本次选择的是向上计数，复位后计数器的计数值会归零；
- 第11行：开启定时器计数，因为本次使用的是one-shot模式，当定时器计数time*100次后会自动停止；

### 18.3.4 测试程序

```c
void GPTAppTest(void)
{
    SystickInit();
    UARTDrvInit();
    GPTDrvInit();
    
    {
        uint32_t lastTick = HAL_GetTick();
        GPTDrvUDelay(1000000);    // delay 1ms
        uint32_t curTick = HAL_GetTick();
        printf("Last    Tick: %d\r\n", (int)lastTick);
        printf("Current Tick: %d\r\n", (int)curTick);
        printf("Passed  Tick: %d\r\n", (int)(curTick - lastTick));
    }
}
```

- 第08行：获取us延时函数调用前的滴答定时器时刻；
- 第09行：延时1000,000us也就是1s，因为使用的是滴答定时器辅助验证，延时函数需要大于1ms；
- 第10行：获取us延时函数调用后的滴答定时器时刻；
- 第13行：打印出两次时刻的差值计算us延时函数的实际耗时；

### 18.3.5 测试结果

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image15.png)

可以看到滴答定时器走过的tick数为1000，也就是耗时1s，和实验预期一致。

## 18.4 PWM实现呼吸灯

本节实验会使用到串口打印以及滴答定时器，请将前文的drv_uart.c/.h和hal_systick.c/.h移植到本次实验中。

### 18.4.1 设计目的

使用GPT输出PWM，通过调节PWM的占空比来改变LED的亮度，通过设计合理的周期值来达到适宜的呼吸灯效果。

### 18.4.2 硬件连接

LED的原理图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image5.png)

在前文已经分析过P400可以复用做GPT通道6的输出IO。

### 18.4.3 GPT模块配置

在FSP中对GPT6模块的配置如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image16.png)

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-18/image17.png)

1. 通道：6
2. 模式：周期型，周期值：1kHz
3. 初始占空比：50%
4. 中断回调函数：gpt_timer6_callback

### 18.4.4 驱动程序

1. 初始化

本次实验的初始化程序如下：

```c
void GptPWMDrvInit(void)
{
    fsp_err_t err = g_timer6.p_api->open(g_timer6.p_ctrl, g_timer6.p_cfg);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);

    err = g_timer6.p_api->infoGet(g_timer6.p_ctrl, &gTimerInfo);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    gPeriod = gTimerInfo.period_counts;
    gStep = gPeriod/1500;
    
    err = g_timer6.p_api->start(g_timer6.p_ctrl);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
}
```

- 第03行：使用open函数初始化GPT6的配置；
- 第07行：获取GPT6的初始配置，最重要的是获取到周期数值；
- 第11行：根据周期数值和预期的呼吸灯效果，设计为逐渐加强和逐渐减弱的时间都为1.5s；
- 第13行：开启定时器计数；

2. 中断回调函数

   本次实验以1kHz频率触发溢出中断，每次中断都要修改PWM的占空比来达到LED亮度的增强和减弱，代码如下：

```c
void gpt_timer6_callback(timer_callback_args_t *p_args)
{
    /* TODO: add your own code here */
    if(p_args->event == TIMER_EVENT_CYCLE_END)
    {
        if(gDir)
            gPulse -= gStep;
        else
            gPulse += gStep;
        if(gPulse <= 0)
            gDir = false;
        else if(gPulse >= gPeriod)
            gDir = true;
        fsp_err_t err = g_timer6.p_api->dutyCycleSet(g_timer6.p_ctrl, gPulse, GPT_IO_PIN_GTIOCA);
        if(FSP_SUCCESS != err)
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    }
}
```

- 第04行：判断触发中断的是否是周期性计数溢出触发的；
- 第06~13行：根据占空比的数值决定本次是处于亮度增强期还是减弱期，如果是增强期则增加占空比，否则减小占空比；
- 第14行：调用函数修改PWM的占空比；

### 18.4.5 测试结果

本次实验需要在实际硬件上验证。在本书配套的开发板上运行此程序可以发现LED以大约1.5s的时间从暗状态逐渐增强到最亮，然后又花1.5s的时间逐渐减弱到暗状态。

 
