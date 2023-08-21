# 第8章 SCI SPI

本章目标

- 使用RASC快速配置SCI的SPI模式
- 学会使用SCI-SPI的API进行数据收发

## 8.1 sci spi模块的使用

### 8.1.1 配置sci spi模块

本章配置的SPI是RA芯片里SCI模块中的一种模式，因而其配置方法和上一章的SCI中的UART模式配置十分的类似。

本节实验没有和其它外设相连，因而可以选择任意SCI通道：把它设置为“Simple SPI”模式，并使用其默认引脚即可。在RASC中创建了工程后，在“Pins”里面的“Peripherals”中展开“Connectivity:SCI”，选择其中一个SCI通道，例如SCI5，在“Pin Configuration”配置界面里的“Operation Mode”中将操作模式选为“Simple SPI”，如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image1.png) 

随后根据硬件设计来选择时钟和数据收发的引脚。

接着在“Stacks”中添加SCI SPI的堆栈模块，点击进入“Stacks”配置界面后，点击“New Stack”，展开里面的“Connectivity”，选择“SPI(r_sci_spi)”，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image2.png)  

这里一定要注意，RA的SPI分为“Simple SPI”和“SPI”,“Simple SPI”是SCI的模式之一，而“SPI”是一个实际存在的SPI硬件控制器。本章的实验是基于SCI的SPI，因而选择的是“SPI(r_sci_spi)”。

完成这些操作后，会在“Stacks”配置界面的“HAL/Common Stacks”中新增一个“g_spi0 SPI(r_sci_spi)”模块，接下来就要根据实际情况配置这个模块的属性。比如在前面选择的是SCI的SPI5，而此处新增的模块默认名称是“g_spi0”且默认的通道是0，为了和实际通道匹配，就要去这个模块的属性中更改名称及其通道，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image3.png)  

当这里选定好“Channel”后，下方的“Pins”里面的内容就会自动更新为前面操作的引脚。

对于属性中的“Callback”，它中断回调函数，函数的命名有两种方法：

1) 不同的外设使用不同的回调函数；
2) 同一类的外设使用相同的回调函数，根据参数内容做不同的处理；

对于初学者，建议使用第一种方法；而对于有经验的工程师，为了减小程序代码开销，建议使用第二种方法。本书使用第一种方法，将此SCI SPI的中断回调函数名称和它的通道相匹配，改为“sci_spi5_callback”，如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image4.png"  />  

而对于SCI SPI的其它参数，需要根据实际通信的外设来设置，看一下在RASC中这些参数的信息：

- Operating Mode：SPI的操作模式，SPI有两种模式分别是主机模式和从机模式，对应于此处的“Master”和“Slave”；

- Clock Phase：时钟相位设置，决定SPI的数据是在时钟的上升沿还是下降沿采样，在上升沿还是下降沿保持，根据SPI通信的外设要求决定；

- Clock Polarity：时钟优先状态，即在SPI通信空闲时，时钟保持高电平还是低电平；

- Bit Order：数据传输方向，有两种选择分别是高位在前和低位在前，同样根据SPI通信的外设要求决定；

- Bitrate：通信速率，这个速率要根据主机支持的SCI SPI最大通信速率和从机支持的SPI最大通信速率来共同决定，取两者的较小值；

将模块属性中的参数设置好之后点击“Generate Project Content”生成代码，可以在RASC的“Summary”界面的“Location”处快速打开工程所在目录来打开工程，如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image5.png)  

### 8.1.2 配置信息解读

使用RASC配置SCI SPI后，生成了引脚配置信息和SCI SPI本身的配置信息。以本章的第一个实验“0801_sci_spi_loopback”回环收发实验为例。

1. 引脚配置信息

该信息会在0801_sci_spi_loopback\ra_gen\pin_data.c文件里生成。在RASC里配置的每一个引脚，都会在pin_data.c生成一个ioport_pin_cfg_t数组项，里面的内容跟配置时选择的参数一致。代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
    {.pin = BSP_IO_PORT_01_PIN_08,
     .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN +
               | (uint32_t) IOPORT_PERIPHERAL_DEBUG)
    },
    {.pin = BSP_IO_PORT_03_PIN_00,
     .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
              | (uint32_t) IOPORT_PERIPHERAL_DEBUG)
    },
    {.pin = BSP_IO_PORT_05_PIN_01,
     .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
               | (uint32_t) IOPORT_PERIPHERAL_SCI1_3_5_7_9)
    },
    {.pin = BSP_IO_PORT_05_PIN_02,
     .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
               | (uint32_t) IOPORT_PERIPHERAL_SCI1_3_5_7_9)
    },
    {.pin = BSP_IO_PORT_05_PIN_03,
     .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
               | (uint32_t) IOPORT_PERIPHERAL_SCI1_3_5_7_9)
    },
};
```

- 第10~21行就是配置SCI的SPI5的引脚P501/P502/P503，将他们配置为SCI通道1、3、5、7、9的外设引脚。

2. SCI SPI配置信息

该信息会在0801_sci_spi_loopback\ra_gen\hal_data.c文件里生成。在RASC里指定了SPI使用哪个SCI通道、指定了它的通道、时钟特性、数据传输方向和中断回调函数注册等信息，这些配置信息都被放入一个spi_cfg_t结构体，部分代码摘录如下：

```c
const spi_cfg_t g_spi5_cfg =
{
    .channel         = 5,
    .operating_mode  = SPI_MODE_MASTER,
    .clk_phase       = SPI_CLK_PHASE_EDGE_ODD,
    .clk_polarity    = SPI_CLK_POLARITY_LOW,
    .mode_fault      = SPI_MODE_FAULT_ERROR_DISABLE,
    .bit_order       = SPI_BIT_ORDER_MSB_FIRST,
    ......(省略内容)
    .p_callback      = sci_spi5_callback,
    ......(省略内容)
};
```

- 第3行：指定使用的sci通道；
- 第4~8行：设置SPI的通信参数；
- 第10行：注册SPI的中断回调函数；

### 8.1.3 中断回调函数

中断回调函数的原型已经在hal_data.h中进行了声明，需要用户在自己的程序中实现，其原型代码如下：

```c
/** Called by the driver when a transfer has completed or an error has occurred (Must be implemented by the user). */
#ifndef sci_spi5_callback
void sci_spi5_callback(spi_callback_args_t *p_args);
#endif
```

它的参数类型是一个spi_callback_args_t结构体指针，这个结构体的原型如下：

```c
/** Common callback parameter definition */
typedef struct st_spi_callback_args
{
    uint32_t     channel;              ///< Device channel number
    spi_event_t  event;                ///< Event code
    void const * p_context;            ///< Context provided to user during callback
} spi_callback_args_t;
```

此结构体会表明触发此中断的是哪一个sci通道，是什么事件触发的，而触发的内容在sci中是没有使用到的。

触发中断的事件由枚举类型spi_event_t指明，这个枚举的内容如下：

```c
/** SPI events */
typedef enum e_spi_event
{
    SPI_EVENT_TRANSFER_COMPLETE = 1,   ///< The data transfer was completed
    SPI_EVENT_TRANSFER_ABORTED,        ///< The data transfer was aborted
    SPI_EVENT_ERR_MODE_FAULT,          ///< Mode fault error
    SPI_EVENT_ERR_READ_OVERFLOW,       ///< Read overflow error
    SPI_EVENT_ERR_PARITY,              ///< Parity error
    SPI_EVENT_ERR_OVERRUN,             ///< Overrun error
    SPI_EVENT_ERR_FRAMING,             ///< Framing error
    SPI_EVENT_ERR_MODE_UNDERRUN        ///< Underrun error
} spi_event_t;
```

包括了SPI发送完成中断事件、发送暂停事件和其它错误事件。用户就可以根据传参进来的事件进行对应的处理。例如在spi5的中断回调函数中，可以如下设置“发送完成标志”：

```c
void sci_spi5_callback(spi_callback_args_t *arg)
{
    if(SPI_EVENT_TRANSFER_COMPLETE == arg->event)
        sci_spi5_tx_cplt = 1;
}
```

- 第3行：判断事件是否为SPI发送完成事件；

- 第4行：如果是发送完成触发的中断，则将发送完成标志位置1；

### 8.1.4 API接口及其用法

在0801_sci_spi_loopback\ra\fsp\inc\api\r_spi_api.h中定义了spi模块的接口，它定义了一个结构体类型spi_api_t，内容如下：

```c
/** Shared Interface definition for SPI */
typedef struct st_spi_api
{
    fsp_err_t (* open)(spi_ctrl_t * p_ctrl, spi_cfg_t const * const p_cfg);
    fsp_err_t (* read)(spi_ctrl_t * const p_ctrl, 
                       void * p_dest, 
                       uint32_t const length,
                       spi_bit_width_t const bit_width);
    fsp_err_t (* write)(spi_ctrl_t * const p_ctrl, 
                        void const * p_src, 
                        uint32_t const length,
                        spi_bit_width_t const bit_width);
    fsp_err_t (* writeRead)(spi_ctrl_t * const p_ctrl, 
                            void const * p_src, 
                            void * p_dest, 
                            uint32_t const length, 
                            spi_bit_width_t const bit_width);
    fsp_err_t (* callbackSet)(spi_ctrl_t * const p_api_ctrl, 
                              void (* p_callback)(spi_callback_args_t *), 
                              void const * const p_context,
                               spi_callback_args_t * const p_callback_memory);
    fsp_err_t (* close)(spi_ctrl_t * const p_ctrl);
} spi_api_t;
```

在具体的C文件中，需要实现一个sci_api_t结构体变量，比如在r_sci_spi.c里实现了如下结构体：

```c
const spi_api_t g_spi_on_sci =
{
  .open     = R_SCI_SPI_Open,
  .read     = R_SCI_SPI_Read,
  .write    = R_SCI_SPI_Write,
  .writeRead  = R_SCI_SPI_WriteRead,
  .close    = R_SCI_SPI_Close,
  .callbackSet = R_SCI_SPI_CallbackSet
};
```

要使用SCI SPI收发数据时，可以调用结构体g_spi_on_sci里的各个函数指针，也可以直接调用r_sci_spi.c里实现的各个函数（比如

```c
R_SCI_SPI_Open、R_SCI_SPI_Read）。
```

1. 打开SCI SPI设备

此函数用于配置SCI的SPI，并且标记转态为“已经打开”。函数原型：

```c
fsp_err_t (* open)(spi_ctrl_t * p_ctrl, spi_cfg_t const * const p_cfg);
```

来看一下这个函数的参数：

a) p_ctrl：此参数是一个spi_ctrl_t结构体指针类型，该结构体本质上void类型，原型如下：

```c
typedef void spi_ctrl_t;
```

它可以指向任意类型的参数，在r_sci_spi.h里，这个参数实际的类型是sci_spi_instance_ctrl_t结构体，定义如下：

```c
typedef struct st_sci_spi_instance_ctrl
{
    uint32_t          open;
    spi_cfg_t const * p_cfg;
    R_SCI0_Type     * p_reg;
    uint8_t         * p_src;
    uint8_t         * p_dest;
    uint32_t          tx_count;
    uint32_t          rx_count;
    uint32_t          count;

    /* Pointer to callback and optional working memory */
    void (* p_callback)(spi_callback_args_t *);
    spi_callback_args_t * p_callback_memory;

    /* Pointer to context to be passed into callback function */
    void const * p_context;
} sci_spi_instance_ctrl_t;
```

- 第3行：open表示SPI设备的状态，是关闭还是打开状态
- 第4行：SPI的配置信息，指定在SPI传输过程中类如发送中断、接受中断等的中断号、中断优先级和时钟特性等；
- 第5行：R_SCI0_Type结构体对应SCI的各个寄存器；
- 第6、7行：指向发送数据的首地址和接收数据保存到内存中的首地址；
- 都8、9行：当发送完一个字节或接收到一个字节的数据后，发送计数将会在中断中减1，而接收计数将会加1，直到发送计数为0或接收计数达到指定接收长度值，就会调用中断回调函数；
- 第13行：指向中断回调函数；
- 第14行：保存中断回调函数信息；
- 第17行：传递给中断回调函数的其他信息；

b) p_cfg：此参数是spi_cfg_t结构体类型，该结构体就是上述第4行的内容，原型如下：

```c
typedef struct st_spi_cfg
{
    uint8_t channel;                                   ///< Channel number to be used

    IRQn_Type                   rxi_irq;         ///< Receive Buffer Full IRQ number
    IRQn_Type                   txi_irq;       ///< Transmit Buffer Empty IRQ number
    IRQn_Type                   tei_irq;          ///< Transfer Complete IRQ number
    IRQn_Type                   eri_irq;               ///< Error IRQ number
    uint8_t                     rxi_ipl;             ///< Receive Interrupt priority
    uint8_t                     txi_ipl;            ///< Transmit Interrupt priority
    uint8_t                     tei_ipl;   ///< Transfer Complete Interrupt priority
    uint8_t                     eri_ipl;       ///< Error Interrupt priority
    spi_mode_t           operating_mode;   ///< Select master or slave operating mode
    spi_clk_phase_t      clk_phase;      ///< Data sampling on odd or even clock edge
    spi_clk_polarity_t          clk_polarity;          ///< Clock level when idle
    spi_mode_fault_t     mode_fault;///< Mode fault error (master/slave conflict) flag
    spi_bit_order_t         bit_order;         ///< Select to transmit MSB/LSB first
    transfer_instance_t const * p_transfer_tx;         ///< To use SPI DTC/DMA write transfer, link a DTC/DMA instance here.  Set to NULL if unused.
    transfer_instance_t const * p_transfer_rx;         ///< To use SPI DTC/DMA read transfer, link a DTC/DMA instance here.  Set to NULL if unused.
    void (* p_callback)(spi_callback_args_t * p_args); ///< Pointer to user callback function
    void const * p_context;      ///< User defined context passed to callback function
    void const * p_extend;   ///< Extended SPI hardware dependent configuration
} spi_cfg_t;
```

这些参数在使用RASC配置后，自动生成对应的配置信息代码。

开发者可以在自己的代码中调用open函数来实现对sci spi设备的初始化，例如：

```c
void drv_sci_spi_init(void)
{
    fsp_err_t err = g_spi5.p_api->open(g_spi5.p_ctrl, g_spi5.p_cfg);
    if(FSP_SUCCESS == err)
        printf("Success to open device: spi5\r\n");
    else
        printf("Failed to open device: spi5\r\n");
}
```

2. 关闭SCI SPI设备

SCI SPI设备的close函数，会将SPI设备的状态标志open设置为0，原型如下：

```c
fsp_err_t (* close)(spi_ctrl_t * const p_ctrl);
```

此函数的参数就是一个spi_crl_t结构体类型的参数。开发者可以参考以下代码来关闭指定的spi设备：

```c
void drv_sci_spi_close(void)
{
    fsp_err_t err = g_spi5.p_api->close(g_spi5.p_ctrl);
    if(FSP_SUCCESS == err)
        printf("Success to close device: spi5\r\n");
    else
        printf("Failed to close device: spi5\r\n");
}
```

3. 使用SCI SPI发送指定长度的数据

SCI SPI的发送函数write适用于半双工或单工通信场景，其原型如下：

```c
fsp_err_t (* write)(spi_ctrl_t * const p_ctrl, 
                    void const * p_src, 
                    uint32_t const length,
                    spi_bit_width_t const bit_width);
```

来看一下它的参数：

- p_ctrl：spi_crl_t结构体类型参数，传入使用RASC生成的spi设备的全局结构体变量；
- p_src：源数据（要发送的数据）地址；
- length：要发送的数据个数；
- bit_width：数据宽度，在SCI中一律设置为8Bit即，此位传入SPI_BIT_WIDTH_8_BITS；

开发者可以参考如下代码来发送指定长度的数据：

```c
void drv_sci_spi_write(uint8_t *pbuf, uint16_t size)
{
    sci_spi5_tx_cplt = 0;
g_spi5.p_api->write(g_spi5.p_ctrl, 
(uint8_t*)pbuf, 
(uint32_t)size, SPI_BIT_WIDTH_8_BITS);
    while(!sci_spi5_tx_cplt);
}
```

第3行和第5行是发送标志：发送前清零，如果发送完成会在中断回调函数中被置1。

4. 使用SCI SPI接收指定长度的数据

SCI SPI的接收函数read适用于半双工或单工通信场景，其原型如下：

```c
fsp_err_t (* read)(spi_ctrl_t * const p_ctrl, 
                   void * p_dest, 
                   uint32_t const length,
                   spi_bit_width_t const bit_width);
```

和发送及其相似，只不过p_dest是接收数据的缓冲区首地址，其数据宽度依然是8Bit。

开发者可以参考如下代码来接收指定长度的数据：

```c
g_spi5.p_api->read(g_spi5.p_ctrl, (uint8_t*)pbuf, (uint32_t)size, SPI_BIT_WIDTH_8_BITS);
```

5. 使用SCI SPI同时收发指定长度的数据

在全双工模式下建议使用SCI SPI的同时收发函数writeRead，其原型如下：

```c
fsp_err_t (* writeRead)(spi_ctrl_t * const p_ctrl, 
                        void const * p_src, 
                        void * p_dest, 
                        uint32_t const length, 
                        spi_bit_width_t const bit_width);
```

使用此函数可以同时发送和接收相同长度的数据，数据宽度是8bit。开发者可以参考以下代码来实现同时收发：

```c
void drv_sci_spi_writeRead(uint8_t *wbuf, uint8_t *rbuf, uint16_t size)
{
    sci_spi5_tx_cplt = 0;
    g_spi5.p_api->writeRead(g_spi5.p_ctrl, 
                           (uint8_t*)wbuf, 
                           (uint8_t*)rbuf, 
                           (uint32_t)size, 
                           SPI_BIT_WIDTH_8_BITS);
    while(!sci_spi5_tx_cplt);
}
```

## 8.2 sci spi回环收发实验

本节实验会用到UART的printf功能，请参考前文《7.3 stdio实验》配置实现printf功能。

### 8.2.1 硬件连接

所谓回环收发就是自发自收，数据从MCU的MOSI直接发送给自身的MISO，因而在硬件上只需要将MOSI和MISO短接即可。例如本节实验0801_sci_spi_loopback使用到的SCI5，其发送引脚是P501，接收引脚是P502，做本实验将这两个脚短接即可，不用管SCK和CS引脚。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image6.png"  /> 

### 8.2.2 应用程序

本实验工程将spi的驱动代码模块化，分为初始化函数、收发函数、中断回调函数和测试函数，spi的驱动函数都在drv_sci_spi.c中实现，在drv_sci_spi.h中声明，测试函数在app_spi.c中实现，在app.h中声明，以便后续移植使用。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image7.png) 

1. 设备初始化

函数：void SPIDrvInit(void)，实现如下：

```c
void SPIDrvInit(void)
{
    /* 打开设备 */
    fsp_err_t err = g_spi5.p_api->open(g_spi5.p_ctrl, g_spi5.p_cfg);
    /* 发送调试信息 */
    if(FSP_SUCCESS == err)
        printf("Success to open device: spi5\r\n");
    else
        printf("Failed to open device: spi5\r\n");
}
```

2. 中断回调函数

中断回调函数已经在前文讲过许多次，这里直接展示其实现：

```c
static volatile bool gSPITxCplt = false;
void sci_spi5_callback(spi_callback_args_t *arg)
{
    /* 判断是否是发送完成触发的中断 */
    /* 如果是的话就将发送完成标志位置1 */
    if(SPI_EVENT_TRANSFER_COMPLETE == arg->event)
        gSPITxCplt = true;
}
```

发送完成标志是一个静态的全局变量：

```c
static volatile bool gSPITxCplt = false;
```

它会在中断回调函数中被修改，使用了关键字volatile修饰。

3. 收发完成等待函数

每次收发通信的时候，需要根据收发状态标志来判断是否通信完成，因而将这一个判断动作封装成一个超时等待函数：void SPIDrvWaitTxCplt(void)，代码如下：

```c
static void SPIDrvWaitTxCplt(void)
{
    uint16_t wTimeout = 50;
    while(!gSPITxCplt && wTimeout)
    {
        R_BSP_SoftwareDelay(1, BSP_DELAY_UNITS_MILLISECONDS);
        wTimeout--;
    }
    gSPITxCplt = false;
}
```

4. 收发数据驱动函数

对于此函数的调用者而言，实际上只需要关心存有发送数据的缓冲区、用于接收数据的缓冲区、要收发的数据个数，并不关心数据传输的宽度，因而将收发函数封装为以下这样的函数：

```c
void SPIDrvWriteReadBuf(uint8_t *wbuf, uint8_t *rbuf, uint16_t wSize)
{
    /* 调用writeRead函数收发数据 */
    g_spi5.p_api->writeRead(g_spi5.p_ctrl,
                            (uint8_t*)wbuf,
                            (uint8_t*)rbuf,
                            (uint32_t)wSize,
                            SPI_BIT_WIDTH_8_BITS);
    /* 等待size长度的数据发送和接收完成 */
    SPIDrvWaitTxCplt();
}
```

5. 测试代码

测试代码比较简单，就是每次收发相同长度的数据然后进行注意比较，出错则将错误数据打印出来，代码实现如下：

```c
void SPIAppTest(void)
{
    SPIDrvInit();

    /* 测试计数，测试count次后退出测试 */
    uint32_t dwCount = 5;
    /* 收发数据保存的数组，长度为256字节 */
    uint8_t wBuf[256] = {0};
    uint8_t rBuf[256] = {0};
    while(dwCount)
    {
        /* 每次发送数据前给发送数组赋值随机数，增加测试可靠性 */
        for(uint16_t i=0; i<256; i++)
        {
            wBuf[i] = (uint8_t)rand();
        }
        /* 同时收发256字节数据 */
        SPIDrvWriteReadBuf(wBuf, rBuf, 256);
        uint16_t err = 0;
        /* 逐一比较收发数组中的数据是否一致，如果出现不一致就将其打印出来观察并且计数错误个数 */
        for(uint16_t i=0; i<256; i++)
        {
            if(wBuf[i] != rBuf[i])
            {
                err++;
                printf("Error:\r\n\twBuf:0x%.2x\trBuf:0x%.2x\r\n", wBuf[i], rBuf[i]);
            }
        }
        if(0 == err)
        printf("Success to write and read data by sci spi:\t%d!\r\n", (int)dwCount);
dwCount--
        /* 每隔1秒测试一次 */
        R_BSP_SoftwareDelay(1, BSP_DELAY_UNITS_SECONDS);
    }
}
```

### 8.2.3 上机实验

在hal_entry.c中调用void drv_sci_spi_init(void)初始化函数，将编译成功后生成的可执行二进制文件烧写到芯片中，可以观察到如下现象：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image8.png) 

## 8.3 sci spi驱动显示屏实验

本节实验会用到UART的printf功能，请参考前文《7.3 stdio实验》配置实现printf功能，并将0801_sci_spi_loopback/drivers中的drv_uart.c和drv_uart.h移植到本节实验的工程中。

### 8.3.1 硬件连接

本节实验是使用RA的SCI SPI模式驱动一块SPI接口的显示屏，这块显示屏的驱动芯片是ST7796s，实验板和显示屏的连接原理图如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image9.png" style="zoom:150%;" /> 

本节实验只涉及SPI通信，因而只需要关心原理图中13~19号引脚，各引脚的意思如下表：

| 显示屏接口号 | 接口含义                                                     | MCU引脚号 | MCU引脚模式            |
| ------------ | ------------------------------------------------------------ | --------- | ---------------------- |
| 13-MISO      | SPI从机的输出引脚，主机的输入引脚                            | P100      | SCI0 SPI的RXD0         |
| 14-CS        | SPI片选脚，低电平有效                                        | P103      | GPIO Out               |
| 15-RS        | ST7796s的数据/命令切换引脚，高电平表示接收数据，低电平表示接收命令 | P104      | GPIO Out               |
| 16-SCK       | SPI的时钟输出引脚                                            | P102      | SCI0 SPI的SCK0         |
| 17-MOSI      | SPI主机的输出引脚，从机的输入引脚                            | P101      | SCI0 SPI的TXD0         |
| 18-RESET     | ST7796s的硬件复位引脚                                        | P105      | GPIO Out               |
| 19-PWM       | 显示屏的背光控制引脚，高电平点亮                             | P608      | GPIO Out/GPT5的GTIOC5A |

对于背光控制引脚，既可以直接使用IO输出高电平全功率点亮屏幕，也可以使用GPT功能输出PWM调节，由于还没有讲到GPT外设，本节将P608配置为GPIO的输出模式。

### 8.3.2 配置SCI SPI和Ports

配置SCI的SPI和GPIO在前面的章节已经讲过，本节就不再赘述。与本章第一个实验不同的是，本节使用的引脚是SCI0的SPI引脚，因而在选择SCI通道的时候要选择为SCI0，且配置其Stack的时候要将控制块名称和通道都和通道0相匹配，中断回调函数那里也取名为sci_spi0_callback。

### 8.3.3 显示屏驱动解析

要驱动一块显示屏，必须要先了解这块显示屏内部的驱动芯片，弄清楚这块芯片支持什么接口，用什么协议通信，支持那种颜色格式，有哪些配置命令等等。这些都需要去仔细阅读显示屏驱动芯片的手册。

一块显示屏的驱动是比较复杂的，要想将其显示性能尽可能的发挥是需要花很长时间去钻研手册的，这不是本书的重点，本书将演示如何点亮ST7796s驱动的屏幕，并把屏幕设置为指定颜色。

1. 屏幕分辨率

ST7796s能够驱动分辨率最大为320*480的屏幕，每个像素使用16tbit表示其颜色。全屏显示需要显存320*480*2字节，约300K字节。

2. 支持的接口协议

ST7796s支持的接口协议有许多种，例如：

- 8bit/9bit/16bit/18bit的8080并行接口；
- 16/18 RGB接口；
- 3线制/4线制串行接口；
- MIPI接口；

本书使用的是4线制串行接口，也就是SPI接口，包括CS、SCK、MOSI和MISO。

3. 命令/数据切换控制

在串行接口驱动下，通信数据从数据模式到命令模式的相互切换依靠的是ST7796s的DCX引脚，也就是前文原理图中的RS引脚，手册中对此引脚的描述如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image10.png) 

此引脚输入的电平为‘1’时，ST7796s认为收到的数据为显示数据；为‘0’时认为收到的数据是命令。也就是书SPI主机，即单片机这边通过RS引脚输出高低电平来切换数据的模式。

4. 休眠与唤醒

当ST7796s发生硬件复位或软件复位时，复位结束后芯片是处于休眠模式的，即手册中说的Sleep in模式，在此模式下芯片的内部晶振不会工作，DC转换也会停止，因而显示也会失效。

要想正常的显示就需要将其唤醒，休眠和唤醒都是通过命令来控制的：

- 0x10:Sleep in
- 0x11:Sleep out

这两个命令在休眠模式下都是可以通过SPI传输给ST7796s，因而在低功耗场景下，可以用这两个命令实现屏幕的休眠和唤醒。

5. 显示模式设置

ST7796s支持的显示模式有局部显示和普通显示。局部显示，顾名思义，就是在320 RGB*480分辨率下不显示完整，仅在某个区域显示。在局部显示模式下，需要通过命令来设置显示区域。普通显示就是整屏显示。

这两个模式的设置命令如下：

- 0x12：局部显示；
- 0x13：普通显示；

6. 显示方向设置

图像在屏幕上的显示方向由两个要素控制：像素显示方向和颜色显示方向。像素显示方向由4个方位组合，即上下左右，可以分为：

- 左->右，上->下；
- 左->右，下->上；
- 右->左，上->下；
- 右->左，下->上；

而颜色方向则只有两种：RGB或BGR。

一般人们习惯的阅读方式是左->右，上->下，而颜色方向常用的是RGB。控制显示方向的命令是0x36，其描述如下：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image11.png"  /> 

MY/X/V是像素数据在现存中行列地址读写的方向，细节如下图：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image12.png"  /> 

具体的示例在手册中有详细描写，本节仅摘取部分，如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image13.png"  /> 

要让数据对应的像素点如何显示取决于具体的应用场景。

7. 颜色格式设置

设置颜色格式使用的命令是0x3A，其描述如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image14.png) 

通常情况下将RGB接口的颜色格式和控制接口的颜色格式都设置为16bit，即写为0x55。

8. 显示的开启和关闭

开启和关闭显示使用到的命令分别是0x29和0x28：

- 0x28：Display Off，关闭显示；
- 0x29：Display On，开启显示；

9. 显示地址设置

显示地址分为行地址和列地址，设置行列地址有不同的命令，分别是：

- 0x2A：Column Address Set，列地址设置；
- 0x2B：Row Address Set，行地址设置；

观察下手册中对这两个命令的描述：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image15.png) 

可以看到，他们均需要设置各自的起始地址和结束地址，且均是先发送始地址的高8位，再发送始地址的低8位，接着发送结束地址的高8位，最后发送结束地址的低8位。

清楚了这个规则后，在之后的设置显示区域的时候就知道该怎么写代码了。

10. 将数据写入显存

将数据写入显存使用的命令是0x2C，看下它的描述：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image16.png) 

不难理解，当发送了0x2C给芯片后，接着可以发N个字节的像素数据到显存。

### 8.3.4 显示屏驱动程序

通过前文已经可以理清楚驱动ST7796s的基本流程：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-8/image17.png) 

本次实验将显示器的驱动代码在drv_sci_spi_disp.c中实现，显示器设备结构体在drv_config.h中声明。

1. 中断回调函数和写等待函数

中断回调函数将发送完成标志写1，而写等待函数则是等待发送完成标志被设置为1之后再将其清零，代码如下：

```c
static volatile bool gFlagWaitTX = false;
void sci_spi0_callback(spi_callback_args_t *arg)
{
    /* 判断是否是发送完成触发的中断 */
/* 如果是的话就将发送完成标志位置1 */
    if(SPI_EVENT_TRANSFER_COMPLETE == arg->event)
        gFlagWaitTX = true;
}
static void LCDDrvWaitTX(void)
{
    volatile uint16_t wTimeout = 500;
    while(!gFlagWaitTX && wTimeout)
    {
        R_BSP_SoftwareDelay(1, BSP_DELAY_UNITS_MILLISECONDS);
        wTimeout--;
    }
    gFlagWaitTX = false;
}
```

2. 定义引脚状态

根据ST7796s的引脚描述和原理图连接关系，来定义各引脚的状态枚举类型，代码如下：

```c
typedef enum{
    notLight,
    isLight
}Black;   /* 背光引脚控制状态 */

typedef enum{
    isReset,
    notReset
}Reset;   /* 复位引脚控制状态 */

typedef enum{
    isSelect,
    notSelect
}CS;      /* 片选信号控制状态 */

typedef enum{
    isCommand,
    isData
}DC;     /* 数据/命令切换控制状态 */
```

3. 控制引脚操作函数

驱动ST7796s需要控制4个引脚，用来选中设备、切换指令数据、硬件复位、控制背光等，他们的代码如下：

```c
static void LCDDrvWriteCS(CS eState)
{
    g_ioport.p_api->pinWrite(g_ioport.p_ctrl,
                             BSP_IO_PORT_01_PIN_03,
                             (bsp_io_level_t)eState);
}
static void LCDDrvWriteDCX(DCX eState)
{
    g_ioport.p_api->pinWrite(g_ioport.p_ctrl,
                             BSP_IO_PORT_01_PIN_04,
                             (bsp_io_level_t)eState);
}
static void LCDDrvWriteReset(Reset eState)
{
    g_ioport.p_api->pinWrite(g_ioport.p_ctrl,
                             BSP_IO_PORT_01_PIN_05,
                             (bsp_io_level_t)eState);
}
static void LCDDrvWriteBlack(Black eState)
{
    g_ioport.p_api->pinWrite(g_ioport.p_ctrl,
                             BSP_IO_PORT_06_PIN_08,
                             (bsp_io_level_t)eState);
}
```

因为这些控制函数仅会在ST7796s的内部驱动函数中用到，因而都是静态函数，在后续的使用中可以这样使用：

```c
LCDDrvWriteReset(isReset);
LCDDrvWriteDCX(isCommand);
LCDDrvWriteDCX(isData);
LCDDrvWriteCS(isSelect);
```

4. 硬件复位

通过RESET引脚硬件复位驱动芯片，低电平复位，复位结束后要将其拉回高电平，以免使芯片一直处于复位状态，代码如下：

```c
static void LCDDrvHWReset(void)
{
    LCDDrvWriteReset(isReset);
    R_BSP_SoftwareDelay(100, BSP_DELAY_UNITS_MILLISECONDS);
    LCDDrvWriteReset(notReset);
    R_BSP_SoftwareDelay(50, BSP_DELAY_UNITS_MILLISECONDS);
}
```

5. 写寄存器命令函数

写命令需要将引脚DCX拉低，然后发送一个字节的命令数据，代码如下：

```c
static void LCDDrvWriteReg(uint8_t reg)
{
    LCDDrvWriteDCX(isCommand);
    g_spi0.p_api->write(&g_spi0_ctrl, (uint8_t*)&reg, 1, SPI_BIT_WIDTH_8_BITS);
    LCDDrvWaitTX();
}
```

6. 写数据函数

写数据则需要将DCX拉高，然后开始发送数据，此处封装的是给寄存器发送数据的函数，每次只发送一个字节，代码如下：

```c
static void LCDDrvWriteDat(uint8_t dat)
{
    LCDDrvWriteDCX(isData);
    g_spi0.p_api->write(&g_spi0_ctrl, (uint8_t*)&dat, 1, SPI_BIT_WIDTH_8_BITS);
    LCDDrvWaitTX();
}
```

7. 写多字节数据函数

在显示器驱动中，通常是把很多数据连续地发送给显示器，本工程将其封装成了如下函数：

```c
static void LCDDrvWriteBuf(uint8_t* buf, uint32_t size)
{
    LCDDrvWriteReg(0x3C);
    LCDDrvWriteDCX(isData);
    
    unsigned char *pbuf = (unsigned int*)buf;
    while(size)
    {
        uint32_t length = 0;
        if(size<65536)
            length = (uint16_t)size;
        else
        {
            length = 65535;
        }
        fsp_err_t err = g_spi0.p_api->write(g_spi0.p_ctrl, pbuf, length, SPI_BIT_WIDTH_8_BITS);
        assert(FSP_SUCCESS==err);
        LCDDrvWaitTX();
        size = size - length;
        pbuf = pbuf + length;
    }
}
static void LCDDrvWriteBuf(uint8_t* buf, uint32_t size)
{
    LCDDrvWriteReg(0x3C);
    LCDDrvWriteDCX(isData);
    g_spi0.p_api->write(&g_spi0_ctrl, (uint8_t*)buf, size, SPI_BIT_WIDTH_8_BITS);
    LCDDrvWaitTX();
}
```

先发送一个0x3C指令，告诉显示器即将来很多个数据，然后再开始发送数据。

0x3C连续写模式仅在ST7796s的’MX=1’下才可使用。

8. 注册显示器控制函数

同样使用面向对象编程思想，将显示器的操作封装到一个结构体中，用函数指针成员来指向具体的操作函数，此结构体在drv_disp.h中定义如下：

```c
typedef struct DisplayDevice {
    char *name;
    void *FBBase; /* CPU能直接读写的显存 */
    unsigned short wXres;    /* X方向分辨率 */
    unsigned short wYres;    /* Y方向分辨率 */
    unsigned short wBpp;     /* 每个像素使用多少个像素 */
    unsigned int   dwSize;
    void           (*Init)(struct DisplayDevice *ptDev);   /* 硬件初始化 */
    void           (*DisplayON)(struct DisplayDevice *ptDev);   /* 开启显示 */
    void           (*DisplayOFF)(struct DisplayDevice *ptDev);   /* 关闭显示 */
    void           (*SetDisplayWindow)(struct DisplayDevice* ptDev, \
                                     unsigned short wXs, unsigned short wYs, \
                                     unsigned short wXe, unsigned short wYe);
    void           (*Flush)(struct DisplayDevice *ptDev); /* 把FBBase的数据刷到LCD的显存里 */
    /* 设置FBBase中的数据, 把(iX,iY)的像素设置为颜色dwColor
     * dwColor的格式:0x00RRGGBB
     */
    int          (*SetPixel)(struct DisplayDevice *ptDev, \
                             unsigned short wX, unsigned short wY, \
                             unsigned short wColor);
    struct DisplayDevice *pNext;
}DisplayDevice, *PDisplayDevice;
```

开发者需要在驱动程序中实现此结构体：设置里面的参数（比如分辨率）、函数指针。本工程实现的结构体如下：

```c
static DisplayDevice gLcdDevice = {
        .name = "LCD",
        .FBBase = gLcdFbuf,
        .wXres = 320,
        .wYres = 480,
        .wBpp = 16,
        .dwSize = 320*480*16/8,
        .Init = LCDDrvInit,
        .DisplayON = LCDDrvSetDisplayOn,
        .DisplayOFF = LCDDrvSetDisplayOff,
        .SetDisplayWindow = LCDDrvSetDisplayWindow,
        .Flush = LCDDrvFlush,
        .SetPixel = LCDDrvSetPixel
};
```

第二个成员FBBase指向的数组，需要根据显示器的特性来确定，比如本实验的ST7796s，它的一个像素由16bit数据组成，全屏有320*480个像素，因而就需要320*480*16/8个字节的数组来表示显存在处理器内存中的映射，如下所示：

```c
static unsigned short gLcdFbuf[320*480];
```

本实验已经实现的操作函数将会在后文进行介绍。

9. 获取显示设备函数

出于良好的编程习惯，将显示设备结构体定义为了一个静态的全局变量，上层代码需要一个接口来获取这个结构体：

```c
struct DisplayDevice *LCDGetDevice(void)
{
    return &gLcdDevice;
}
```

此函数返回一个DisplayDevice指针，上层应用通过它来操作显示设备。

10. 显示器的开启和关闭函数

这两个操作函数比较简单，就是向ST7796s发送0x28/0x29指令即可，代码如下：

```c
void LCDDrvSetDisplayOn(struct DisplayDevice* ptDev)
{
    if(NULL == ptDev->name)    return;
    LCDDrvWriteReg(0x29);
}
void LCDDrvSetDisplayOff(struct DisplayDevice* ptDev)
{
    if(NULL == ptDev->name)    return;
    LCDDrvWriteReg(0x28);
}
```

11. 设置显示区域函数

通过前文已知，设置显示区域就是设置显示行、列的起始地址、结束地址，先发地址高8位再发地址低8位的规则，封装得到了如下代码的函数：

```c
void LCDDrvSetDisplayWindow(struct DisplayDevice* ptDev, \
                           unsigned short hwXs, unsigned short hwYs, \
                           unsigned short hwXe, unsigned short hwYe)
{
    if(NULL == ptDev->name)    return;
    /* 设置列地址 */
    LCDDrvWriteReg(0x2A);
    LCDDrvWriteDat((uint8_t)(hwXs>>8));       // 起始地址先高后低
    LCDDrvWriteDat((uint8_t)(0x00FF&hwXs));
    LCDDrvWriteDat((uint8_t)(hwXe>>8));        // 结束地址先高后低
    LCDDrvWriteDat((uint8_t)(0x00FF&hwXe));
    /* 设置行地址 */
    LCDDrvWriteReg(0x2B);
    LCDDrvWriteDat((uint8_t)(hwYs>>8));
    LCDDrvWriteDat((uint8_t)(0x00FF&hwYs));
    LCDDrvWriteDat((uint8_t)(hwYe>>8));
    LCDDrvWriteDat((uint8_t)(0x00FF&hwYe));
}
```

12. 全屏刷新函数

此函数用于将设备结构体里FBBase的所有数据，一次性发送给屏幕，用来刷新整个屏幕，代码如下：

```c
void LCDDrvFlush(struct DisplayDevice *ptDev)
{
    if(NULL == ptDev->name)    return;
    LCDDrvWriteBuf((uint8_t*)ptDev->FBBase, (uint32_t)ptDev->dwSize);
}
```

13. 设置像素点函数

在有些应用场景下会对某个或者某几个像素点进行单独操作，来显示指定图像，因而需要实现一个单独像素点设置的接口以供使用，代码如下所示：

```c
int LCDDrvSetPixel(struct DisplayDevice *ptDev, \
                   unsigned short wX, unsigned short wY, \
                   unsigned short wColor)
{
    if(NULL == ptDev->name)    return -1;
    if (wX >= ptDev->wXres || wY >= ptDev->wYres)
        return -1;

    unsigned short *buf = (unsigned short*)ptDev->FBBase;

    buf[wY * ptDev->wXres + wX] = (unsigned short)wColor;

    return 0;
}
```

像素点位置的偏移根据屏幕的分辨率和显示模式决定，本章的计算公式不一定适合所有的屏幕，读者移植使用的时候需要注意。

14. 屏幕初始化函数

本次实验初始化屏幕设置的参数比较简单：打开SPI->硬件复位->唤醒设备->设置颜色格式->开启显示->点亮背光。代码如下：

```c
void LCDDrvInit(struct DisplayDevice* ptDev)
{
    if(NULL == ptDev->name)    return;
    /* 打开SPI设备完成初始化 */
    fsp_err_t err = g_spi0.p_api->open(&g_spi0_ctrl, &g_spi0_cfg);
    if(FSP_SUCCESS == err)
        printf("Success to open device:\tspi0\r\n");
    else
        printf("Failed to open device:\tspi0\r\n");
    
    /* 初始化屏幕设备 */
    LCDDrvHWReset(); //LCD 复位
    LCDDrvWriteCS(isSelect);
    LCDDrvWriteBlack(isLight);//点亮背光
    
    LCDDrvWriteReg(0x11);
    LCDDrvWriteReg(0x20);
    LCDDrvWriteReg(0x36);
    LCDDrvWriteDat(0x40);
    LCDDrvWriteReg(0x3A);
    LCDDrvWriteDat(0x55);
    LCDDrvWriteReg(0x13);
    LCDDrvWriteReg(0x29);
}
```

### 8.3.5 显示屏测试程序

本次实验的测试程序有两个功能：清屏和画圆。测试程序在app_disp.c文件中实现，在app.h中声明。测试程序代码如下：

```c
#define FLOYRGB565(r, g, b) ((unsigned short)((((unsigned short)(r>>3)<<11)|(((unsigned short)(g>>2))<<5)|((unsigned short)b>>3))))

void DispAppTest(void)
{
    DisplayDevice *ptDispDev = LCDGetDevice();
    if(NULL == ptDispDev)
    {
        printf("Failed to get LCD device!\r\n");
        return;
    }
    /* 初始化显示设备 */
    ptDispDev->Init(ptDispDev);
    /* 设置屏幕显示区域 */
    ptDispDev->SetDisplayWindow(ptDispDev, 0, 0, ptDispDev->wXres - 1, ptDispDev->wYres - 1);
    /* 清除屏幕 */
    memset((uint8_t*)ptDispDev->FBBase, 0x00, ptDispDev->dwSize);
    ptDispDev->Flush(ptDispDev);
    /* 画一个实心圆 */
    uint16_t x = 0, y = 0, r = 100;
    for(x = ((ptDispDev->wXres>>1) - r); x<((ptDispDev->wXres>>1) + r); x++)
    {
        for(y = ((ptDispDev->wYres>>1) - r); y<((ptDispDev->wYres>>1) + r); y++)
        {
            if(((x-(ptDispDev->wXres>>1)) * (x-(ptDispDev->wXres>>1))+(y-(ptDispDev->wYres>>1)) * (y-(ptDispDev->wYres>>1))) <= r*r)
            {
                ptDispDev->SetPixel(ptDispDev, x, y, FLOYRGB565(0, 255, 0));
            }
        }
    }
    ptDispDev->Flush(ptDispDev);
}
```

- 第01行：使用宏函数将RGB颜色转换为16bit的颜色值；
- 第15~16行：清屏；
- 第19~30行：在屏幕中心画一个半径为100像素点的实心圆；

随后在hal_entry.c中的hal_entry()函数调用各设备初始化函数以及这个圆圆函数，即可在屏幕上显示一个填充的黑色圆，代码如下：

```c
#include "drv_uart.h"
#include "app.h"
#include "hal_data.h"
void hal_entry(void)
{
    /* TODO: add your own code here */
    UARTDrvInit();
    DispAppTest();
}
```

### 1.3.6 上机实验

将编译生成的可执行二进制文件烧入到芯片中后，通过串口可以得到如下打印信息：

```c
Success to open device: uart7
Success to open device: spi0
```

观察屏幕可以看到一个填充圆。

 