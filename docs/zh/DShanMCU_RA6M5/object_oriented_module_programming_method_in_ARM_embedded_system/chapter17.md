# 第17章 CAN FD 模块

本章目标

- 使用 RASC 快速配置 CAN FD 模块
- 学会使用 CAN FD 的 API 进行通信

## 17.1 RA6M5 的 CAN FD

### 17.1.1 CAN FD 模块简介

对于瑞萨的 RA6M5 处理器，它的 CAN FD 有如下特征：

1. 兼容性CAN2.0和CAN FD；
2. 通信速率在1Mbps~8Mbps；
3. 模块时钟50MHz；
4. 有两个通信通道，每通道 4-16 个传输消息缓冲区（TX MB）；
5. 支持标准帧11bit的ID和扩展帧29bit的ID；
6. 个全局接收消息缓冲区（RX MB），2-8个全局接收 FIFO（RX FIFO）；
7. 可以单独将每个筛选规则配置为根据以下条件接受邮件；

- 编号
- 标准或扩展ID（IDE 位）
- 数据或远程帧（RTR 位）
- ID/IDE/RTR掩码
- 最小DLC（数据长度）值

对于CAN FD的中断，分为可配置的全局RX FIFO中断、信道TX中断、全局错误中断和通道错误中断，其中又进行了如下细分：

1. 可配置的全局 RX FIFO 中断
- 可单独配置每个 FIFO
- 在接收到特定深度或每收到一条消息触发中断

2. 全局错误中断
- 数据链路校验
- 邮件丢失
- FD 有效负载溢出

3. 通道错误中断
- 总线错误
- 警告错误
- 被动错误
- 总线断开
- 总线断开恢复
- 超载
- 总线锁
- 仲裁损失
- 传输中止

### 17.1.2 CAN FD系统框图

RA6M5的CAN FD外设的系统框图如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images1.png" style="zoom: 50%;" />

1. CAN的通道和时钟：

RA6M5的CAN有两个通道CAN0和CAN1，其通信引脚对应框图中的CTX0/1和CRX0/1，这两个通道的CAN使用各自独立的通信速率。

CANFDCLK和CANMCLK为CAN-FD 模块的输入时钟，可以选择其一，经过波特率预分频器（Baud rate prescaler）进行分频后输入到CAN协议控制器（Protoco- controller）。 该输入时钟对于计算CAN波特率非常重要。

2. CAN的相关寄存器

RA6M5的CAN具有很多个寄存器，大致分为控制寄存器、状态寄存器、过滤器寄存器、错误寄存器、FIFO寄存器和发送消息队列寄存器。这些寄存器总数特别多，且本书是基于FSP库进行的面向对象的编程，而直接控制寄存器驱动外设十分的复杂，是面向过程的编程思想，与本书的中心主旨相悖，所以请读者自行阅读手册查阅寄存器信息。

3. 过滤器

接收过滤器（Acceptance filter）和接收过滤器列表（AFL，Acceptance filter list）用于实现CAN的接收过滤功能。而对于使用CAN来说，接收过滤功能至关重要，使用CAN就绕不过CAN外设模块中的接收过滤器，后面在代码中需要手动配置接收过滤器列表（AFL，Acceptance filter list）。

4. CAN的中断

中断生成器（Interrupt generator）用于生成CAN相关的中断信号，包含如下信号：

- 成功接收并存到RX FIFO中断
- 全局错误中断
- 通道相关的传输中断
- 通道错误中断
- 从COM FIFO成功接收中断

另外，两个CAN通道的CRX引脚可用于产生通道唤醒中断信号：通道唤醒中断（CRX0、CRX1）。

### 17.1.3  通信速率

CAN FD的波特率基础计算公式如下：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images2.jpg" style="zoom:67%;" />

通过手册中关于DLL_CLOCK和对Bit Timing的说明和计算，上述公式可以换算成为下面这个公式：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images3.jpg" style="zoom: 67%;" />

各参数取值范围见下表：

![image4](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images4.jpg)

用户需要根据应用场景需求计算表中的参数值，在FSP中填入这些值后生成对应代码使得CAN FD的通信速率满足需求。

但是实际上，在RASC中配置的时候用户在Bitrate|Automatic中填入预期的波特率时，生成代码自动计算这些数值。

### 17.1.4CAN FD的测试模式

1. 监听模式

SO11898-1推荐一种可选的总线监控模式。在此模式下，CAN通道能够接收有效的数据帧和有效的远程帧。但是，它只在CAN总线上发送隐性位，不允许发送显性位。如果CAN引擎需要发送显性位（ACK位、过载标志、活动错误标志），则该位在内部路由，以便CAN引擎将其监控为显性。外部TX引脚保持隐性状态。

该模式可用于波特率检测。在此模式下，如果发生总线错误并启用了中断，则会产生错误中断。在此模式下，不允许从该通道的任何正常TX消息缓冲区或TX/GW FIFO请求传输。

注意：如果消息存储在GWFIFO或路由TXQ中，请确保发送通道不处于监听模式，以便不会从GW FIFO或路由TXQ请求此通道的传输。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images5.png" style="zoom:50%;" />

2. 外部环回测试

在自检模式0中，CAN引擎将自己发送的消息视为通过CAN收发器接收到的消息，并将它们存储到其接收消息缓冲区中。为了独立于外部激励，引擎会生成自己的确认位。此测试可用于CAN收发器测试，并且RX/TX引脚应连接到收发器。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images6.png" alt="images6" style="zoom:50%;" />

3. 内部环回测试

在自检模式1中，CAN引擎将自己发送的消息视为接收的消息，并将它们存储到接收缓冲区中。此模式用于自检功能。为了独立于外部刺激，CAN引擎生成自己的确认位。在这种模式下，CAN引擎执行从TX内部到RX内部的内部反馈。CAN引擎忽略外部RX输入的实际值。外部TX引脚仅输出隐性位。RX/TX引脚不需要连接到CAN总线或任何外部设备。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images7.png" style="zoom: 50%;" />

## 17.2CAN FD模块的使用

### 17.2.1配置CAN FD模块

配置CAN FD模块步骤：
- 使能时钟
- 配置引脚
- 配置模块的Stack

对于CAN FD的Stack，分为两项：Common和Module。

Common是针对于CAN FD模块而言的通用参数；Module是针对于CAN FD的某个通道而言的特定的参数。CAN FD有两个通道CAN FD0和CAN FD1，Common配置的就是CAN FD0和CAN FD1共用的参数，而如果两个通道都使用了，则会有两个Module，用户需要去CAN FD0和CAN FD1各自的Module中定制配置这两个通道的通信参数。

1. 使能CAN FD的时钟

CAN FD模块的时钟默认是没有使能的，用户需要在FSP的“Clocks”里面选择PLL2的时钟源和CAN FD的时钟源，以及设置预分频系数得到CAN FD的时钟频率，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images8.png" style="zoom: 67%;" />

本书选择的PLL2时钟源是内部晶振，经过2分频和24分频后得到240MHz的PLL2总线时钟，而CAN FD的时钟源选择的是PLL2的时钟也就是240Mhz，然后经6分频后得到40MHz的CAN FD时钟。

2. 配置Pins

在FSP的“Pins”中选择“Peripherals”里的“Connectivity:CANFD”，根据硬件设计选择使用的通道，本书使用的是CANFD0，然后再去使能、选择引脚，配置如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images9.png)

引脚选择的是P401和P402，本书配套的开发板使用的就是这两个引脚，原理图如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images10.png" style="zoom:67%;" />

3. 添加CAN FD的Stack模块

配置CAN FD的Stack前，需要先去RASC配置界面的“Stacks”中添加CAN FD的Stack，步骤如下图所示：

![images11](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images11.png)

添加完成后可以看到CAN FD的Stack属性配置界面如下：

![images12](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images12.png)

4. 配置Stack Common

CAN FD模块的通用参数类型如下图所示：

![images13](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images13.png)

其中Global Error Interupt、Reception和Flexible Data还会细分设置具体的参数，这些参数的作用见下表：

![images12](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images14.jpg)

![images15](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images15.jpg)

5. 配置Stack Module

CAN FD的通道配置参数如下图所示：

![images16](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images16.png)

参数较多，本书将会挑选其中需要重点关注的几个参数进行讲解，其它的参数读者可以在RASC的CAN FD的Stack中点击蓝色感叹号进入查看阅读，如下图所示：

![images17](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images17.png)

![images18](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images18.png)

本书主要介绍以下几个参数：

1. General|Name:CAN FD模块在代码中的名称，需要满足C语言字符串的定义要求，默认为g_canfd0；
2. General|Channel：CAN FD模块的通道，范围0~1；
3. Bitrate|Automatic|Nominal Rate (bps)：波特率标称值，默认500000bps；
4. Bitrate|Automatic|FD Data Rate (bps)：数据波特率值，默认2000000bps；
5. Bitrate|Manual|Nominal|Prescaler (divisor)：标称波特率时钟分频系数，默认1；
6. Bitrate|Manual|Nominal|Time Segment 1 (Tq)：标称波特率的Segment1，默认29；
7. Bitrate|Manual|Nominal|Time Segment 2 (Tq)：标称波特率的Segment2，默认10；
8. Bitrate|Manual|Nominal|Sync Jump Width (Tq)：标称波特率的Sync Jump Width,默认4；

这样计算出来的标称波特率值就是：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images19.jpg" alt="images19" style="zoom:67%;" />

9. Bitrate|Manual|Data|Prescaler (divisor)：数据波特率时钟分频系数，默认1；

10. Bitrate|Manual|Data|Time Segment 1 (Tq)：标称波特率的Segment1，默认5；

11. Bitrate|Manual|Data|Time Segment 2 (Tq)：标称波特率的Segment2，默认2；

12. Bitrate|Manual|Data|Sync Jump Width (Tq)：标称波特率的Sync Jump Width，默认1；

这样计算出来的数据波特率值就是：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images20.jpg" alt="images20" style="zoom:67%;" />

13. Interrupts|Callback：CAN FD通信的中断回调函数，本书取名为canfd0_callback，适配于CAN FD的通道0；

14. Interrupts|Channel Interrupt Priority Level：CAN FD通信的中断优先级，默认为Priority 12；

15. Transmit Interrupts|TXMB x：CAN FD发送使用的消息缓存中断使能，本书选择的是使能TXMB 0；

配置好CAN FD的时钟、Pins和Stacks后，在RASC中点击“Generate Project Content”生成工程代码，随后去代码中了解CAN FD的配置及其API。

### 17.2.2 中断回调函数

在RASC中设置的中断回调函数后，生成代码在hal_data.h中，它只是一个声明：

```c
#ifndef canfd0_callback
void canfd0_callback(can_callback_args_t * p_args);
#endif
```

中断回调函数的形参can_callback_args_t的原型如下：

```c
typedef struct st_can_callback_args
{
    uint32_t    channel;               ///< Device channel number.
    can_event_t event;                 ///< Event code.
    uint32_t    error;                 ///< Error code.
    union
    {
        uint32_t mailbox;              ///< Mailbox number of interrupt source.
        uint32_t buffer;               ///< Buffer number of interrupt source.
    };
    void const * p_context;            ///< Context provided to user during callback.
    can_frame_t  frame;                ///< Received frame data.
} can_callback_args_t;
```

可能用户更关心的是event成员和frame成员。event帮助用户了解触发中断的原因是什么，frame帮助用户获得接收到的数据帧信息。

CAN FD支持的触发中断的事件有这些：

```c
typedef enum e_can_event
{
    CAN_EVENT_ERR_WARNING          = 0x0002, ///< Error Warning event.
    CAN_EVENT_ERR_PASSIVE          = 0x0004, ///< Error Passive event.
    CAN_EVENT_ERR_BUS_OFF          = 0x0008, ///< Bus Off event.
    CAN_EVENT_BUS_RECOVERY         = 0x0010, ///< Bus Off Recovery event.
    CAN_EVENT_MAILBOX_MESSAGE_LOST = 0x0020, ///< Mailbox has been overrun.
    CAN_EVENT_ERR_BUS_LOCK         = 0x0080, ///< Bus lock detected (32 consecutive dominant bits).
    CAN_EVENT_ERR_CHANNEL          = 0x0100, ///< Channel error has occurred.
    CAN_EVENT_TX_ABORTED           = 0x0200, ///< Transmit abort event.
    CAN_EVENT_RX_COMPLETE          = 0x0400, ///< Receive complete event.
    CAN_EVENT_TX_COMPLETE          = 0x0800, ///< Transmit complete event.
    CAN_EVENT_ERR_GLOBAL           = 0x1000, ///< Global error has occurred.
    CAN_EVENT_TX_FIFO_EMPTY        = 0x2000, ///< Transmit FIFO is empty.
    CAN_EVENT_FIFO_MESSAGE_LOST    = 0x4000, ///< Receive FIFO overrun.
} can_event_t;
```

用户可以参考以下代码设计CAN FD通信的中断回调函数：

```c
void canfd0_callback(can_callback_args_t *p_args)
{
    /* TODO: add your own code here */
    switch(p_args->event)
    {
        case CAN_EVENT_TX_COMPLETE:
        {
            gCANFDTxCplt = true;
            break;
        }
        case CAN_EVENT_RX_COMPLETE:
        {
            memcpy(&gRxFrame, &p_args->frame, sizeof(can_frame_t));
            gCANFDRxCplt = true;
            break;
        }
        default:break;
    }
}
```

- 第06、11行：判断触发中断是发送完成事件还是接收完成事件；
- 第08行：如果是发送完成，则将标志位置true；
- 第13、14行：如果是接收完成，则将接收到的数据copy到自定义的变量中，并且将接收完成标志置true；

### 17.2.3 配置信息解读

RASC生成的CAN配置信息有3种：时钟配置信息、引脚配置信息、CANFD模块本身的配置信息。

1. 时钟配置参数

所有的时钟参数配置都在bsp_clock_cfg.h中定义，包括本章CAN FD模块的时钟，此文件代码如下：
```c
/* generated configuration header file - do not edit */
#ifndef BSP_CLOCK_CFG_H_
#define BSP_CLOCK_CFG_H_
......(省略内容)
#define BSP_CFG_XTAL_HZ (24000000) /* XTAL 24000000Hz */
#define BSP_CFG_HOCO_FREQUENCY (2) /* HOCO 20MHz */
#define BSP_CFG_PLL_SOURCE (BSP_CLOCKS_SOURCE_CLOCK_HOCO) /* PLL Src: HOCO */
......(省略内容)
#define BSP_CFG_PLL2_SOURCE (BSP_CLOCKS_SOURCE_CLOCK_HOCO) /* PLL2 Src: HOCO */
#define BSP_CFG_PLL2_DIV (BSP_CLOCKS_PLL_DIV_2) /* PLL2 Div /2 */
#define BSP_CFG_PLL2_MUL BSP_CLOCKS_PLL_MUL(24U,0U) /* PLL2 Mul x24.0 */
#define BSP_CFG_CLOCK_SOURCE (BSP_CLOCKS_SOURCE_CLOCK_PLL) /* Clock Src: PLL */
......(省略内容)
#define BSP_CFG_CANFDCLK_SOURCE (BSP_CLOCKS_SOURCE_CLOCK_PLL2) /* CANFDCLK Src: PLL2 */
......(省略内容)
#define BSP_CFG_CANFDCLK_DIV (BSP_CLOCKS_CANFD_CLOCK_DIV_6) /* CANFDCLK Div /6 */
......
#endif /* BSP_CLOCK_CFG_H_ */
```

- 第07行：定义PLL的时钟源为HOCO；
- 第09行：定义PLL2的时钟源为HOCO；
- 第10~11行：定义PLL2的分频系数为2，倍频系数为24；
- 第12行：定义系统时钟源为PLL；
- 第14行：定义CAN FD的时钟源是PLL2；
- 第16行：定义CAN FD的分频系数为6；

2. 引脚配置信息

CANFD涉及的引脚，它们的配置信息在工程的pin_data.c中生成。在RASC里配置的每一个引脚，都会在pin_data.c生成一个ioport_pin_cfg_t数组项，里面的内容跟配置时选择的参数一致。代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
    ......(省略内容)
    {.pin = BSP_IO_PORT_04_PIN_01,
     .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
               | (uint32_t) IOPORT_PERIPHERAL_CAN)
    },
    {.pin = BSP_IO_PORT_04_PIN_02,
     .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
               | (uint32_t) IOPORT_PERIPHERAL_CAN)
    },
    ......(省略内容)
};
```

3. 模块配置信息

CAN FD的模块配置信息在hal_data.c中，它是一个can_cfg_t类型的全局结构体，名为g_canfd0_cfg，如下：

```c
const can_cfg_t g_canfd0_cfg =
{
    .channel                = 0,
    .p_bit_timing           = &g_canfd0_bit_timing_cfg,
    .p_callback             = canfd0_callback,
    .p_extend               = &g_canfd0_extended_cfg,
    .p_context              = NULL,
    .ipl                    = (12),
#if defined(VECTOR_NUMBER_CAN0_TX)
    .tx_irq             = VECTOR_NUMBER_CAN0_TX,
#else
    .tx_irq             = FSP_INVALID_VECTOR,
#endif
#if defined(VECTOR_NUMBER_CAN0_CHERR)
    .error_irq             = VECTOR_NUMBER_CAN0_CHERR,
#else
    .error_irq             = FSP_INVALID_VECTOR,
#endif
};
```

此结构体囊括了CAN FD的通道值、中断回调函数、时间特性参数配置和扩展参数配置，其中时间特性和扩展参数同样在hal_data.c中用结构体can_bit_timing_cfg_t和结构体canfd_extended_cfg_t定义的全局变量表示。

在hal_data.c中定义了两种时间特性：标称时间特性和数据时间特性，对应于前文的标称波特率和数据波特率，这两个时间特性在代码中是这样表示的：

```c
can_bit_timing_cfg_t g_canfd0_bit_timing_cfg =
{
    /* Actual bitrate: 500000 Hz. Actual sample point: 75 %. */
    .baud_rate_prescaler = 1,
    .time_segment_1 = 59,
    .time_segment_2 = 20,
    .synchronization_jump_width = 4
};

#if BSP_FEATURE_CANFD_FD_SUPPORT
can_bit_timing_cfg_t g_canfd0_data_timing_cfg =
{
    /* Actual bitrate: 2000000 Hz. Actual sample point: 75 %. */
    .baud_rate_prescaler = 1,
    .time_segment_1 = 14,
    .time_segment_2 = 5,
    .synchronization_jump_width = 1
};
#endif
```

从这段代码中可以看到，在FSP的CAN FD Stack模块中配置的

- l Bitrate|Manual|Nominal|Prescaler (divisor)：标称波特率时钟分频系数，默认1；
- l Bitrate|Manual|Nominal|Time Segment 1 (Tq)：标称波特率的Segment1，默认29；
- l Bitrate|Manual|Nominal|Time Segment 2 (Tq)：标称波特率的Segment2，默认10；
- l Bitrate|Manual|Nominal|Sync Jump Width (Tq)：标称波特率的Sync Jump Width,默认4；
- l Bitrate|Manual|Data|Prescaler (divisor)：数据波特率时钟分频系数，默认1；
- l Bitrate|Manual|Data|Time Segment 1 (Tq)：标称波特率的Segment1，默认5；
- l Bitrate|Manual|Data|Time Segment 2 (Tq)：标称波特率的Segment2，默认2；
- l Bitrate|Manual|Data|Sync Jump Width (Tq)：标称波特率的Sync Jump Width，默认1；
- 这些参数并没有实际生成到代码中，而是根据一下参数自动计算了baud_rate_prescaler、time_segment_1和time_segment_2以及synchronization_jump_width的值;
- l Bitrate|Automatic|Nominal Rate (bps)：波特率标称值，默认500000bps；
- l Bitrate|Automatic|FD Data Rate (bps)：数据波特率值，默认2000000bps；

所以用户要配置波特率，最方便的方法就是去Bitrate|Automati中设置波特率。

扩展参数中配置的就是CAN FD的数据波特率配置和全局配置，代码如下：
```c
canfd_extended_cfg_t g_canfd0_extended_cfg =
{
    .p_afl              = p_canfd0_afl,
    .txmb_txi_enable    = ((1ULL << 0) |  0ULL),
    .error_interrupts   = ( 0U),
#if BSP_FEATURE_CANFD_FD_SUPPORT
    .p_data_timing      = &g_canfd0_data_timing_cfg,
#else
    .p_data_timing      = NULL,
#endif
    .delay_compensation = (1),
    .p_global_cfg       = &g_canfd_global_cfg,
};
```

全局配置参数设置的就是CAN FD通信的中断优先级、错误帧格式、接收FIFO等的配置，代码如下：

```c
canfd_global_cfg_t g_canfd_global_cfg =
{
    .global_interrupts = CANFD_CFG_GLOBAL_ERR_SOURCES,
    .global_config     = (CANFD_CFG_TX_PRIORITY 
                        | CANFD_CFG_DLC_CHECK 
                        | (BSP_CFG_CANFDCLK_SOURCE == BSP_CLOCKS_SOURCE_CLOCK_MAIN_OSC ? R_CANFD_CFDGCFG_DCS_Msk : 0U) 
                        | CANFD_CFG_FD_OVERFLOW),
    .rx_mb_config      = (CANFD_CFG_RXMB_NUMBER | (CANFD_CFG_RXMB_SIZE << R_CANFD_CFDRMNB_RMPLS_Pos)),
    .global_err_ipl = CANFD_CFG_GLOBAL_ERR_IPL,
    .rx_fifo_ipl    = CANFD_CFG_RX_FIFO_IPL,
    .rx_fifo_config    =
    {
......（省略内容）
#if !BSP_FEATURE_CANFD_LITE
......（省略内容）
#endif
    },
};
#endif

最后，在hal_data.c中定义了一个can_instance_t类型的全局结构体g_canfd0，它容纳了控制结构体、配置结构体、接口结构体，如下：

```c
const can_instance_t g_canfd0 =
{
    .p_ctrl        = &g_canfd0_ctrl,
    .p_cfg         = &g_canfd0_cfg,
    .p_api         = &g_canfd_on_canfd
};
```

### 17.2.4 API接口及其用法

CAN FD设备的操作方法函数在r_can_api.h中定义：

```c
typedef struct st_can_api
{
    fsp_err_t (* open)(can_ctrl_t * const p_ctrl, 
                       can_cfg_t const * const p_cfg);
    fsp_err_t (* write)(can_ctrl_t * const p_ctrl, 
                       uint32_t buffer_number, 
                       can_frame_t * const p_frame);
    fsp_err_t (* read)(can_ctrl_t * const p_ctrl, 
                       uint32_t buffer_number, 
                       can_frame_t * const p_frame);
    fsp_err_t (* close)(can_ctrl_t * const p_ctrl);
    fsp_err_t (* modeTransition)(can_ctrl_t * const p_api_ctrl, 
                                 can_operation_mode_t operation_mode,
                                 can_test_mode_t test_mode);
    fsp_err_t (* infoGet)(can_ctrl_t * const p_ctrl, 
                          can_info_t * const p_info);
    fsp_err_t (* callbackSet)(can_ctrl_t * const p_api_ctrl, 
                              void (* p_callback)(can_callback_args_t *),
                              void const * const p_context, 
                              can_callback_args_t * const p_callback_memory);
} can_api_t;
```

这些函数，会在r_canfd.c中实现，它们都被放入一个体can_api_t结构体里：
```c
const can_api_t g_canfd_on_canfd =
{
    .open           = R_CANFD_Open,
    .close          = R_CANFD_Close,
    .write          = R_CANFD_Write,
    .read           = R_CANFD_Read,
    .modeTransition = R_CANFD_ModeTransition,
    .infoGet        = R_CANFD_InfoGet,
    .callbackSet    = R_CANFD_CallbackSet,
};
```
下面就来看下这些操作函数的用法。

1. 打开CAN FD设备
```c
fsp_err_t (* open)(can_ctrl_t * const p_ctrl, 
                  can_cfg_t const * const p_cfg);
```
此函数用于初始化CAN FD设备：
```c
fsp_err_t err = g_canfd0.p_api->open(g_canfd0.p_ctrl, g_canfd0.p_cfg);
if(FSP_SUCCESS != err)
{
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    return false;
}
```
2. 关闭CAN FD设备
```c
fsp_err_t (* close)(can_ctrl_t * const p_ctrl);
```
关闭CAN FD设备函数就很简单，调用此函数的时候传入参数g_canfd0_ctrl即可。如果关闭设备成功会返回FSP_SUCCESS(0)。

3. CAN FD发送数据帧
```c
fsp_err_t (* write)(can_ctrl_t * const p_ctrl, 
                    uint32_t buffer_number, 
                    can_frame_t * const p_frame);
```

发送CAN FD数据帧的write函数，其第二个参数指的是发送的buffer序号，而不是数据个数，取值范围在CANFD_TX_MB_0~CANFD_TX_MB_7，CANFD_TX_MB_32~CANFD_TX_MB_39之间；第三个参数表示数据帧的结构，包括ID、ID类型、数据等，结构体原型如下：
```c
typedef struct st_can_frame
{
    uint32_t         id;                           ///< CAN ID.
    can_id_mode_t    id_mode;               ///< Standard or Extended ID (IDE).
    can_frame_type_t type;                         ///< Frame type (RTR).
    uint8_t          data_length_code;             ///< CAN Data Length Code (DLC).
    uint32_t         options;              ///< Implementation-specific options.
    uint8_t          data[CAN_DATA_BUFFER_LENGTH]; ///< CAN data.
} can_frame_t;
```
- CAN Id的类型有标准帧和扩展帧，在代码中的宏定义值是：
 ```c
 typedef enum e_can_id_mode
{
    CAN_ID_MODE_STANDARD,              ///< Standard IDs of 11 bits used.
    CAN_ID_MODE_EXTENDED,              ///< Extended IDs of 29 bits used.
} can_id_mode_t;
 ```

- 帧类型有数据帧和远程帧之分：
```c
typedef enum e_can_frame_type
{
    CAN_FRAME_TYPE_DATA,               ///< Data frame.
    CAN_FRAME_TYPE_REMOTE,             ///< Remote frame.
} can_frame_type_t;
```
- 数据个数则根据当前发送的是传统CAN数据帧还是CAN FD数据帧决定，传统数据帧个数不能超过8，CAN FD数据帧个数据不能超过64。
- CAN数据帧的特殊操作有三种：ESI、BRS和FDF：

```c
typedef enum e_canfd_frame_option
{
    CANFD_FRAME_OPTION_ERROR = 0x01,   ///< Error state set (ESI).
    CANFD_FRAME_OPTION_BRS   = 0x02,   ///< Bit Rate Switching (BRS) enabled.
    CANFD_FRAME_OPTION_FD    = 0x04,   ///< Flexible Data frame (FDF).
} canfd_frame_options_t;
```
- CAN数据帧的数据数组，此数组的大小由宏定义值CAN_DATA_BUFFER_LENGTH确定：
```c
#if BSP_FEATURE_CANFD_NUM_CHANNELS
 #define CAN_DATA_BUFFER_LENGTH    (64)
#else
 #define CAN_DATA_BUFFER_LENGTH    (8)
#endif
```
用户可以参考以下代码使用write函数发送CAN数据：
```c
fsp_err_t err = g_canfd0.p_api->write(g_canfd0.p_ctrl, CANFD_TX_MB_0, (can_frame_t*)frame);
if(FSP_SUCCESS != err)
{
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    return false;
}
```

4. CAN FD读取数据帧
```c
fsp_err_t (* read)(can_ctrl_t * const p_ctrl, 
                   uint32_t buffer_number, 
                   can_frame_t * const p_frame);
```
此函数和发送函数十分类似，第二个参数是读取buffer的序号，取值范围是CANFD_RX_BUFFER_MB_0~CANFD_RX_BUFFER_MB_31和CANFD_RX_BUFFER_FIFO_0、CANFD_RX_BUFFER_FIFO_1；第二个参数同样是数据帧结构体。

用户可以参考发送数据的方法来使用此函数。

5. CAN FD的通信模式
```c 
fsp_err_t (* modeTransition)(can_ctrl_t * const p_api_ctrl, 
                             can_operation_mode_t operation_mode,
                             can_test_mode_t test_mode);
```

此函数用于设置CAN FD的通讯方式，由参数e_can_operation_mode和e_can_test_mode共同决定。

e_can_operation_mode定义了CAN支持的所有操作模式：

```c
typedef enum e_can_operation_mode
{
    CAN_OPERATION_MODE_NORMAL = 0,              ///< CAN Normal Operation Mode
    CAN_OPERATION_MODE_RESET,                   ///< CAN Reset Operation Mode
    CAN_OPERATION_MODE_HALT,                    ///< CAN Halt Operation Mode
    CAN_OPERATION_MODE_SLEEP            = 5,    ///< CAN Sleep Operation Mode
    CAN_OPERATION_MODE_GLOBAL_OPERATION = 0x80, // CANFD Global Operation Mode
    CAN_OPERATION_MODE_GLOBAL_RESET,            // CANFD Global Reset Mode
    CAN_OPERATION_MODE_GLOBAL_HALT,             // CANFD Global Halt Mode
    CAN_OPERATION_MODE_GLOBAL_SLEEP = 0x85      // CANFD Global Sleep Mode
} can_operation_mode_t;
```
在正常通信中一般选择CAN_OPERATION_MODE_NORMAL模式。
e_can_test_mode定义了CAN支持的所有测试模式：

```c
typedef enum e_can_test_mode
{
    CAN_TEST_MODE_DISABLED          = 0,   ///< CAN Test Mode Disabled.
    CAN_TEST_MODE_LISTEN            = 3,   ///< CAN Test Listen Mode.
    CAN_TEST_MODE_LOOPBACK_EXTERNAL = 5,   ///< CAN Test External Loopback Mode.
    CAN_TEST_MODE_LOOPBACK_INTERNAL = 7,   ///< CAN Test Internal Loopback Mode.
    CAN_TEST_MODE_INTERNAL_BUS      = 0x80 ///< CANFD Internal CAN Bus Communication Test Mode.
} can_test_mode_t;
```
在测试阶段可以根据硬件设计选择某种测试模式，在正常的双端CAN通信中不要使用测试模式，选择CAN_TEST_MODE_DISABLED。

在开始通信前，用户需要在代码中指定CAN的通信模式，可以参考以下代码来设置通信模式：

```c
fsp_err_t err = g_canfd0.p_api->modeTransition(g_canfd0.p_ctrl,
                             CAN_OPERATION_MODE_NORMAL,
                             CAN_TEST_MODE_LOOPBACK_INTERNAL);
if(FSP_SUCCESS != err)
{
   printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
   return false;
}
```
6. 获取CAN FD的配置参数
```c
fsp_err_t (* infoGet)(can_ctrl_t * const p_ctrl, 
                      can_info_t * const p_info);
```
用户可以获取到的CAN信息有这些：
```c
typedef struct st_can_info
{
    uint32_t status;            ///< Useful information from the CAN status register.
    uint32_t rx_mb_status;             ///< RX Message Buffer New Data flags.
    uint32_t rx_fifo_status;           ///< RX FIFO Empty flags.
    uint8_t  error_count_transmit;     ///< Transmit error count.
    uint8_t  error_count_receive;      ///< Receive error count.
    uint32_t error_code;               ///< Error code, cleared after reading.
} can_info_t;
```

 

## 17.3 CAN FD回环实验

此实验会使用到按键中断、printf功能和滴答定时器，请读者将前文的外部中断实验的驱动文件、drv_uart.c/.h文件和滴答定时器的驱动文件移植到本工程。

### 17.3.1 设计目的

本节实验是利用CAN FD的环回测试模式，体验CAN FD的过滤器配置和数据收发。本实验通过按键控制CAN FD的数据帧发送，按一次发送一次。

### 17.3.2 硬件连接

本书配套的开发板板载了CAN收发器，因而既可以使用外部环回测试也可以使用内部换回测试。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images21.png" alt="images21" style="zoom:50%;" />

### 17.3.3 驱动程序

1. 接收过滤器列表

使用RASC配置CAN FD并生成代码后，接受过滤器列表会在hal_data.c中声明：
```c
extern const canfd_afl_entry_t p_canfd0_afl[CANFD_CFG_AFL_CH0_RULE_NUM];
```
因而需要用户在代码中按照声明的格式定义此接收过滤器数组，例如本书在drv_canfd.c中就定义了此数组：

```c
const canfd_afl_entry_t p_canfd0_afl[CANFD_CFG_AFL_CH0_RULE_NUM] =
{
    {
        .id =
        {
            /* Specify the ID, ID type and frame type to accept. */
            .id         = 0x000,
            .frame_type = CAN_FRAME_TYPE_DATA,
            .id_mode    = CAN_ID_MODE_STANDARD
        },

        .mask =
        {
            /* These values mask which ID/mode bits to compare when filtering messages. */
            .mask_id         = 0x000,
            .mask_frame_type = 1,
            .mask_id_mode    = 1
        },

        .destination =
        {
            /* If DLC checking is enabled any messages shorter than the below setting will be rejected. */
            .minimum_dlc = CANFD_MINIMUM_DLC_0,

            /* Optionally specify a Receive Message Buffer (RX MB) to store accepted frames. RX MBs do not have an
             * interrupt or overwrite protection and must be checked with R_CANFD_InfoGet and R_CANFD_Read. */
            .rx_buffer   = CANFD_RX_MB_NONE,

            /* Specify which FIFO(s) to send filtered messages to. Multiple FIFOs can be OR'd together. */
            .fifo_select_flags = CANFD_RX_FIFO_0
        }
    },
};
```
canfd_afl_entry_t结构体各成员含义见下表：

![images22](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images22.jpg)

以本书的过滤器为例：

- id=0；
- frame_type = CAN_FRAME_TYPE_DATA；
- id_mode = CAN_ID_MODE_STANDARD；
- mask_id=0；

表示所有的标准ID数据帧都可以接收，不做任何过滤，而如果：

- id=0x40；
- frame_type = CAN_FRAME_TYPE_DATA；
- id_mode = CAN_ID_MODE_STANDARD；
- mask_id=0x7F0；

那么就表示ID在0x40~0x4F的标准ID数据帧不进行过滤，其它的都过滤不接收。计算方式如下：

![images23](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images23.png)

2. 断回调函数

本书的中断回调函数仅对收发完成事件做处理，用户可以根据需求添加对错误事件的处理。
```c
void canfd0_callback(can_callback_args_t *p_args)
{
    /* TODO: add your own code here */
    switch(p_args->event)
    {
        case CAN_EVENT_TX_COMPLETE:
        {
            gCANFDTxCplt = true;
            break;
        }
        case CAN_EVENT_RX_COMPLETE:
        {
            memcpy(&gRxFrame, &p_args->frame, sizeof(can_frame_t));
            gCANFDRxCplt = true;
            break;
        }
        default:break;
    }
}
```
本书没有使用CAN FD的read函数读取数据，而是在中断回调函数中将接收到的数据帧复制给一个静态全局变量gRxFrame。

3. 收发完成等待函数

在通信过程中通常需要知道读写操作何时完成，然后再进行下一步的处理，本书以下代码等待读写完成，并加入了超时机制：
```c
static bool CANFDDrvWaitTxCplt(void)
{
    uint16_t uwTimeout = 100;
    while(!gCANFDTxCplt && uwTimeout)
    {
        uwTimeout--;
        HAL_Delay(1);
    }
    bool ret = gCANFDTxCplt;
    gCANFDTxCplt = false;
    return ret;
}

static bool CANFDDrvWaitRxCplt(void)
{
    uint16_t uwTimeout = 100;
    while(!gCANFDRxCplt && uwTimeout)
    {
        uwTimeout--;
        HAL_Delay(1);
    }
    bool ret = gCANFDRxCplt;
    gCANFDRxCplt = false;
    return ret;
}
```
这两个函数的逻辑比较简单，不再讲解。

4. 数据发送函数

本书通过帧ID的大小来分辨标准帧还是扩展帧，将这一判断封装到发送函数中，然后调用CAN FD的write函数将数据帧发送出去：

```c
static int (CANFDDrvWrite)(struct CANDev *ptDev, void *frame, unsigned char length)
{
    if(NULL == ptDev)   return false;
        
    can_frame_t *tFrame = (can_frame_t*)frame;
    tFrame->data_length_code   = length;
    tFrame->type               = CAN_FRAME_TYPE_DATA;
    tFrame->options            = 0;
    if(tFrame->id > 0x7FF)
        tFrame->id_mode         = CAN_ID_MODE_EXTENDED;
    else
        tFrame->id_mode          = CAN_ID_MODE_STANDARD;
    
    if(1 == ptDev->channel)
    {
        fsp_err_t err = g_canfd0.p_api->write(g_canfd0.p_ctrl, CANFD_TX_MB_0, (can_frame_t*)frame);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return false;
        }
        return CANFDDrvWaitTxCplt();
    }
    
    return true;
}
```
5. 数据接收函数

在介绍中断回调函数的时候已经说明，在中断回调函数中已经把接收到的数据复制到gRxFrame里，因此接收函数的实现就比较简单了——从gRxFrame中复制数据即可：

```c
static int (CANFDDrvRead)(struct CANDev *ptDev, void *frame)
{
    if(NULL == ptDev)   return false;
    if(1 == ptDev->channel)
    {
        if(true == CANFDDrvWaitRxCplt())
        {
            memcpy((can_frame_t*)frame, (can_frame_t*)&gRxFrame, sizeof(can_frame_t));
            return true;
        }
    }
    return false;
}
```
6. 按键驱动的修改

为了适配本实验，将按键中断实验的代码进行了修改：

- 按键消抖处理不再点灯，而是设置一个按键标志位：
```c
void KeyProcessJitter(uint32_t tick)
{
    if(tick == uwPressTick)
    {
        gKeyStatus = true;
    }        
}
```
- 要记得将按键消抖处理函数放到滴答定时器的中断服务函数中：
```c
void SysTick_Handler(void)
{
    dwTick += 1;
    KeyProcessJitter(dwTick);
}
- IODrvRead函数可以获取按键IO的电平值了：

```c
static IODevState_t IODrvRead(struct IODev *ptdev)
{
    if(ptdev->name == NULL)     return false;
    IODevState_t state = LowLevel;
    if(strcmp(ptdev->name, "UserKey") == 0)
    {
        state = (IODevState_t)gKeyStatus;
        gKeyStatus = false;
    }
    
    return state;
}
```
- 注册按键IO设备的时候需要将Read函数注册：
```c
static IODev gKeyDev = {
    .name = "UserKey",
    .Init = IODrvInit,
    .Write = NULL,
    .Read = IODrvRead
};
```

### 17.3.4 测试程序

对滴答定时器、UART、按键设备和CAN FD设备初始化之后，读取IO按键，发现按键被按下后就发送一个数据帧。程序还会尝试读取数据，如果收到数据就把它打印出来：
```c
uint16_t count = 0;
while(1)
{
    can_frame_t txFrame;
    if(pKeyDev->Read(pKeyDev) == true)
    {
        txFrame.id = count;
        for(uint8_t i=0; i<8; i++)
        {
            txFrame.data[i] = 0x10 + i + count;
        }
        if(pCANDev->Write(pCANDev, (can_frame_t*)&txFrame, 8) != true)
        {
            printf("Failed to transmit ID = 0x%.3x frame\r\n", txFrame.id);
            continue;
        }
        printf("\r\nSuccess to transmit!\r\n\tID = 0x%.3x frame\r\n", txFrame.id);
    }
    
    can_frame_t rxFrame;
    if(pCANDev->Read(pCANDev, (can_frame_t*)&rxFrame) != true)
    {
        continue;
    }
    count++;
    printf("\r\nLoopback --- %d\r\n", count);
    printf("\tSource ID = 0x%.3x \t Destination ID = 0x%.3x\r\n", txFrame.id, rxFrame.id);
    for(uint8_t i=0; i<8; i++)
    {
        printf("\tSource Data[%d] = 0x%.2x", i, txFrame.data[i]);
        printf("\t Destination[%d] = 0x%.2x\r\n", i, rxFrame.data[i]);
    }
}
```
- 第07~11行：发送的数据帧每次都设置不同的ID和数据；
- 第15行：如果发送失败则不去判断是否接收到数据；
- 第23行：如果没有接收到数据则不进行信息打印，从头再来；

### 17.3.5 测试结果

将工程编译后，把得到的二进制可执行文件烧录到处理器中执行可以看到如下的打印信息：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images24.png" alt="images24" style="zoom:75%;" />

## 17.4 CAN FD双板通信实验

此实验会使用到按键中断、printf功能和滴答定时器，请读者将前文的外部中断实验的驱动文件、drv_uart.c/.h文件和滴答定时器的驱动文件移植到本工程。

本节实验使用的CAN FD驱动程序和上一节回环实验的代码基本一致，读者在配置好FSP生成工程后可以将上一节的启动代码整体移植到本工程。

### 17.4.1 设计目的

让用户体验真实的CAN FD双端通信。本实验需要两块支持CAN FD接口的开发板，除了本书配套的一块RA6M5处理器的开发板外，用户还需准备一块有CAN FD接口和控制器的开发板（可以再购买一块本书配套的开发板）。

### 17.4.2 硬件连接

本节实验使用两块开发板连接CAN FD控制器的CAN_H和CAN_L，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images25.png" alt="images25" style="zoom:67%;" />

### 17.4.3 驱动程序

本节实验的驱动程序大体和上一小节的实验一致，差别仅在于初始化CAN FD的时候不再是测试模式：

```c
static int CANFDDrvInit(struct CANDev *ptDev)
{
    if(NULL == ptDev)   return false;
    if(1 == ptDev->channel)
    {
        {
            fsp_err_t err = g_canfd0.p_api->open(g_canfd0.p_ctrl, g_canfd0.p_cfg);
            if(FSP_SUCCESS != err)
            {
                printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
                return false;
            }
        }
        {
            fsp_err_t err = g_canfd0.p_api->modeTransition(g_canfd0.p_ctrl,
                                         CAN_OPERATION_MODE_NORMAL,
                                         CAN_TEST_MODE_DISABLED);
            if(FSP_SUCCESS != err)
            {
               printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
               return false;
            }
        }
    }
    
    return true;
}
```
- 第15~17行：设置的CAN FD通信模式，不使能测试模式

### 17.4.4测试程序

测试程序和上一小节的基本也一样，只是去掉了数据的比较，只是把接收到的数据打印出来：

```c
uint16_t count = 0;
while(1)
{
    if(pKeyDev->Read(pKeyDev) == true)
    {
        can_frame_t txFrame;
        txFrame.id = count;
        for(uint8_t i=0; i<8; i++)
        {
            txFrame.data[i] = 0x10 + i + count;
        }
        if(pCANDev->Write(pCANDev, (can_frame_t*)&txFrame, 8) != true)
        {
            printf("\r\nFailed to transmit!\r\n\tID = 0x%.3x frame\r\n", txFrame.id);
            continue;
        }
        count++;
        printf("\r\nSuccess to transmit!\r\n\tID = 0x%.3x frame\r\n", txFrame.id);
    }
    
    can_frame_t rxFrame;
    if(pCANDev->Read(pCANDev, (can_frame_t*)&rxFrame) != true)
    {
        continue;
    }
    printf("\r\nSuccess to Receive!\r\n\tID = 0x%.3x\r\n", rxFrame.id);
    for(uint8_t i=0; i<8; i++)
    {
        printf("\tReceive[%d] = 0x%.2x\r\n", i, rxFrame.data[i]);
    }
}
```
### 17.4.5测试结果

本实验需要使用2个RA6M5开发板，连接它们的CAN接口后，两个板子烧入同样的程序。然后按下按键以给对方发送数据：

![images26](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-17/images26.png)
