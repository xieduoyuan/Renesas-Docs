# 第13章 Common SPI

本章目标

- 使用RASC快速配置Common SPI模块
- 学会使用Common SPI的API进行数据收发

## 13.1 Common SPI模块的使用

RA芯片的SPI分为Simple SPI和Common SPI。Simple SPI就是本书《第8章 SCI SPI》所讲的SCI模块的SPI模式，是使用串行总线来模拟SPI协议，而本章所讲的是芯片内部实际存在的一个硬件SPI控制器模块。

本章将会从Common SPI在RASC中的配置开始讲解，最后编写程序操作OLED（它的驱动芯片SSD1306），重点在于学习使用Common SPI的API。

### 13.1.1 配置SPI模块

本章实验驱动的OLED模块非板载模块，而是一个外接模块，因而选择的Common SPI通道可以任选一路。本书选用的是SPI0，使用的GPIO引脚如下：

| 序号 | 模块引脚 | 芯片SPI0引脚 |
| ---- | -------- | ------------ |
| 1    | CS       | P205         |
| 2    | SCK      | P204         |
| 3    | MISO     | P202         |
| 4    | MOSI     | P203         |
| 5    | GPIO     | P206         |

其中CS是SPI的片选信号引脚，GPIO则是OLED灯驱动芯片SSD1306在4线SPI通信下切换数据和命令的控制信号引脚（即决定SPI总线上传输的数据，是控制SSD1306的指令还是写入SSD1306显存的数据）。

配置引脚CS和GPIO为普通输出功能，参考前文《5.3 LED实验》配置GPIO。要在RASC中配置Common SPI，首先在RASC的“Pin Configuration”中的“Peripherals”里展开“Connectivity:SPI”，选中里面的SPI0，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image1.png) 

在第5步配置SPI0时，对于“Pin Group Selection”，有4组可以选：Mixed/A/B/C_Only，如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image2.png" style="zoom:150%;" /> 

默认是“A_only”，不同的组别支持的引脚是不同的，此处根据硬件选择的引脚决定，本章使用的是默认引脚A组的P202/P203/P204。

选好IO的组别后，将“Operation Mode”从“Disabled”改为“Enabled”。操作模式里的另一个选项“Custom”的作用是：Common SPI下的所有引脚都可以由用户自己选择；而选择“Enabled”时对应的时钟线和数据线时固定的引脚；片选引脚可以由用户自己选择。本书使用Enabled默认的数据线和时钟线，且不会使用硬件片选，而使用软件控制IO来控制片选信号。

所以Common SPI的SPI0的模式和引脚配置结果如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image3.png)  

配置好SPI0的模式和引脚后，就要去RASC的“Stacks”处增加SPI0的Stack模块。在“Stacks”配置界面点击“New Stack”，选择其中的“Connectivity”，再选择里面的“SPI(r_spi)”，此处一定要注意不是选择“SPI(r_sci_spi)”。如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image4.png)  

当新建好一个SPI Stack后，需要去它的“属性”中配置详细的参数。本书根据SPI协议，将SPI Stack的属性分成了8个较为重要的可配置参数，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image5.png)  

① SPI模块的名称和使用通道：建议名称和通道匹配，例如本章使用的是SPI0，那么通道channel就是0，而名称则对应的是g_spi0；以后使用FSP的API操作SPI0时就可以g_spi0.papi->xxxx()来使用SPI0模块；
② 中断优先级设置：此处设置收发完成的中断优先级和错误中断优先级，需要综合考虑工程中其它外设的中断优先级设置，达到更好的系统控制效果；
③ SPI的操作模式：Master或Slave，这里选择Master；
④ SPI的时钟特性：设置SPI空闲时时钟线呈现什么电平、传输过程中在时钟的哪个边沿采样数据；
⑤ 数据位格式：可以选择高位在前或低位在前，本书使用的设备均为高位在前的模式；
⑥ 中断回调函数：建议函数名称和通道匹配；
⑦ SPI的操作模式：全双工/半双工，时钟同步或异步等；
⑧ 通信速率：本书使用的处理器在最大主频200MHz下，SPI的通信速率最大允许50MHz，通信速率需要考虑从机支持的最大通信速率来设置。

### 13.1.2 配置信息解读

使用RASC配置Common SPI后，生成了两类配置信息：Common SPI对应的引脚配置信息、Common SPI本身的配置信息。以本章的实验“1301_spi_oled”为例。

1. 引脚配置信息

该信息会在1301_spi_oled\ra_gen\pin_data.c文件里生成。在RASC里配置的每一个引脚，都会在pin_data.c生成一个ioport_pin_cfg_t数组项，里面的内容跟配置时选择的参数一致。代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] =
{
	......(省略内容)
	{ .pin = BSP_IO_PORT_02_PIN_02, /* MISO */
	  .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN
		        | (uint32_t) IOPORT_PERIPHERAL_SPI) },
	{ .pin = BSP_IO_PORT_02_PIN_03, /* MOSI */
	  .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN
		        | (uint32_t) IOPORT_PERIPHERAL_SPI) },
	{ .pin = BSP_IO_PORT_02_PIN_04, /* SCK */
	  .pin_cfg = ((uint32_t) IOPORT_CFG_PERIPHERAL_PIN
		        | (uint32_t) IOPORT_PERIPHERAL_SPI) },
	{ .pin = BSP_IO_PORT_02_PIN_05, /* CS */
	  .pin_cfg = ((uint32_t) IOPORT_CFG_DRIVE_HIGH
		  | (uint32_t) IOPORT_CFG_PORT_DIRECTION_OUTPUT 
		  | (uint32_t) IOPORT_CFG_PORT_OUTPUT_HIGH) },
	{ .pin = BSP_IO_PORT_02_PIN_06, /* GPIO */
	  .pin_cfg = ((uint32_t) IOPORT_CFG_DRIVE_MID
		  | (uint32_t) IOPORT_CFG_PORT_DIRECTION_OUTPUT 
		  | (uint32_t) IOPORT_CFG_PORT_OUTPUT_HIGH) },
	......(省略内容)
  };
```

- 第04~12行：SPI0的GPIO配置为外设复用模式；
- 第13~16行：SPI0的片选CS引脚配置为输出模式，默认输出高电平；
- 第17~20行：外接OLED模块的数据/命令切换引脚，配置为输出模式，默认输出高电平；

2. SPI配置信息

SPI模块信息会在1301_spi_oled\ra_gen\hal_data.c文件里生成。在RASC里配置的SPI通道、时钟特性和中断回调函数函数等，都会在hal_data.c生成一个spi_cfg_t结构体，里面的内容跟配置时选择的参数一致。代码如下：

```c
/** SPI configuration for SPI HAL driver */
const spi_cfg_t g_spi0_cfg =
{ .channel = 0,
  ......(省略内容)
  .operating_mode = SPI_MODE_MASTER,
  .clk_phase = SPI_CLK_PHASE_EDGE_ODD,
  .clk_polarity = SPI_CLK_POLARITY_LOW,
  .mode_fault = SPI_MODE_FAULT_ERROR_DISABLE,
  .bit_order = SPI_BIT_ORDER_MSB_FIRST,
  .p_transfer_tx = g_spi0_P_TRANSFER_TX,
  .p_transfer_rx = g_spi0_P_TRANSFER_RX,
  .p_callback = spi0_callback,
  .p_context = NULL,
  .p_extend = (void*) &g_spi0_ext_cfg, };
```

- 第05行：操作模式为主机模式；
- 第06~07行：时钟特性是在第1个边沿触发数据采样，空闲时时钟线为低电平；
- 第10~11行：绑定spi0的收发函数；
- 第12行：注册中断回调函数；
- 第14行：配置扩展参数；

扩展参数中的值来自SPI0的配置参数，它对应SPI0的某些寄存器的值。例如通信速率是50MHz时，那么扩展参数中寄存器SPBR和BRDV的值将由RASC计算出来。SPI0的扩展配置代码如下：

```c
/** SPI extended configuration for SPI HAL driver */
const spi_extended_cfg_t g_spi0_ext_cfg =
{ .spi_clksyn = SPI_SSL_MODE_CLK_SYN,
  .spi_comm = SPI_COMMUNICATION_FULL_DUPLEX,
  .ssl_polarity = SPI_SSLP_LOW,
  .ssl_select = SPI_SSL_SELECT_SSL0,
  .mosi_idle = SPI_MOSI_IDLE_VALUE_FIXING_DISABLE,
  .parity = SPI_PARITY_MODE_DISABLE,
  .byte_swap = SPI_BYTE_SWAP_DISABLE,
  .spck_div =
  {
  /* Actual calculated bitrate: 50000000. */.spbr = 0,
    .brdv = 0 },
  .spck_delay = SPI_DELAY_COUNT_1,
  .ssl_negation_delay = SPI_DELAY_COUNT_1,
  .next_access_delay = SPI_DELAY_COUNT_1 };
```

这个结构体有助于开发者了解SPI的通信细节，比如每个时钟采样或发送数据时的时延变化等。对于深度开发SPI外设的用户会比较有用。

### 13.1.3 中断回调函数

中断回调函数的原型已经在hal_data.h中进行了声明，需要用户在自己的程序中实现，其原型代码如下：

```c
#ifndef spi0_callback
void spi0_callback(spi_callback_args_t *p_args);
#endif
```

其参数类型是spi_callback_args_t结构体指针，此结构体会表明触发中断的是哪一个SPI通道，触发的事件是什么，该结构体的详细代码如下：

```c
/** Common callback parameter definition */
typedef struct st_spi_callback_args
{
    uint32_t     channel;              ///< Device channel number
    spi_event_t  event;                ///< Event code
    void const * p_context;            ///< Context provided to user during callback
} spi_callback_args_t;
```

- 第04行：表明SPI通道；
- 第05行：表明触发事件类型；

触发事件类型是一个枚举类型结构体，包括但不限于发送完成事件、发送中止等，枚举代码如下：

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

比如本章的实验就是在中断回调函数中，根据通道值和触发事件来判断SPI传输是否完成。如果传输完成，则将一个标志位设置为true。参考代码如下：

```c
void spi0_callback(spi_callback_args_t *p_args)
{
    if(p_args->channel == 0)
    {
        if(p_args->event == SPI_EVENT_TRANSFER_COMPLETE)
            gSPITxCplt = true;
    }
}
static bool SPIWaitTxCplt(void)
{
    unsigned short wTimeout = 100;
    while(!gSPITxCplt && wTimeout)
    {
        HAL_Delay(1);
        wTimeout--;
    }
    gSPITxCplt = false;
    if(gSPITxCplt==false && wTimeout==0)
        return false;
    return true;
}
```

- 第03~07行：根据通道和触发事件的值来设置通讯标志位；
- 第10~22行：根据通讯标志为封装一个通讯超时等待函数；

### 13.1.4 API接口及其用法

在路径1301_spi_oled/ra/fsp/inc/api/r_spi_api.h中定义了SPI模块的接口，它定义了一个结构体类型spi_api_t，内容如下：

```c
/** Shared Interface definition for SPI */
typedef struct st_spi_api
{
    fsp_err_t (* open)(spi_ctrl_t * p_ctrl, 
                       spi_cfg_t const * const p_cfg);
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

在具体的C文件中，需要定义一个spi_api_t结构体变量，比如在r_spi.c里定义了如下结构体变量：

```c
/* SPI implementation of SPI interface. */
const spi_api_t g_spi_on_spi =
{
    .open        = R_SPI_Open,
    .read        = R_SPI_Read,
    .write       = R_SPI_Write,
    .writeRead   = R_SPI_WriteRead,
    .close       = R_SPI_Close,
    .callbackSet = R_SPI_CallbackSet
};
```

要使用SPI的控制接口，可以调用结构体g_spi_on_spi里的各个函数指针，也可以直接调用r_spi.c里实现的各个函数。

1. 打开SPI设备

打开SPI设备的函数原型如下：

```c
fsp_err_t (* open)(spi_ctrl_t * p_ctrl, 
                   spi_cfg_t const * const p_cfg);
```

它有两个参数：

- spi_ctrl_t*：一个void类型的指针类型，指向SPI的控制参数结构体spi_instance_ctrl_t，该结构体会在hal_data.h中定义一个全局变量g_spi0_ctrl，结构体原型如下：

```c
typedef struct st_spi_instance_ctrl
{
    uint32_t          open;            ///< Indicates whether the open() API has been successfully called.
    spi_cfg_t const * p_cfg;           ///< Pointer to instance configuration
    R_SPI0_Type     * p_regs;          ///< Base register for this channel
    void const      * p_tx_data;       ///< Buffer to transmit
    void            * p_rx_data;       ///< Buffer to receive
    uint32_t          tx_count;        ///< Number of Data Frames to transfer (8-bit, 16-bit, 32-bit)
    uint32_t          rx_count;        ///< Number of Data Frames to transfer (8-bit, 16-bit, 32-bit)
    uint32_t          count;           ///< Number of Data Frames to transfer (8-bit, 16-bit, 32-bit)
    spi_bit_width_t   bit_width;       ///< Bits per Data frame (8-bit, 16-bit, 32-bit)

    /* Pointer to callback and optional working memory */
    void (* p_callback)(spi_callback_args_t *);
    spi_callback_args_t * p_callback_memory;

    /* Pointer to context to be passed into callback function */
    void const * p_context;
} spi_instance_ctrl_t;
```

此结构体会记录SPI通信过程中的参数变化，比如收发数据存储地址、收发数据剩余个数、收发数据位宽等；

- spi_cfg_t*：spi配置参数结构体，指向SPI的配置参数结构体，该结构体会在hal_data.h中定义一个全局变量g_spi0_cfg，该结构体的原型如下：

```c
typedef struct st_spi_cfg
{
    uint8_t channel;                                   ///< Channel number to be used

    IRQn_Type                   rxi_irq;          ///< Receive Buffer Full IRQ number
    IRQn_Type                   txi_irq;       ///< Transmit Buffer Empty IRQ number
    IRQn_Type                   tei_irq;        ///< Transfer Complete IRQ number
    IRQn_Type                   eri_irq;               ///< Error IRQ number
    uint8_t                     rxi_ipl;      ///< Receive Interrupt priority
    uint8_t                     txi_ipl;       ///< Transmit Interrupt priority
    uint8_t         tei_ipl;      ///< Transfer Complete Interrupt priority
    uint8_t                     eri_ipl;               ///< Error Interrupt priority
    spi_mode_t        operating_mode;   ///< Select master or slave operating mode
    spi_clk_phase_t        clk_phase;    ///< Data sampling on odd or even clock edge
    spi_clk_polarity_t          clk_polarity;          ///< Clock level when idle
    spi_mode_fault_t            mode_fault;            ///< Mode fault error (master/slave conflict) flag
    spi_bit_order_t             bit_order;      ///< Select to transmit MSB/LSB first
    transfer_instance_t const * p_transfer_tx;         ///< To use SPI DTC/DMA write transfer, link a DTC/DMA instance here.  Set to NULL if unused.
    transfer_instance_t const * p_transfer_rx;         ///< To use SPI DTC/DMA read transfer, link a DTC/DMA instance here.  Set to NULL if unused.
    void (* p_callback)(spi_callback_args_t * p_args); ///< Pointer to user callback function
    void const * p_context;   ///< User defined context passed to callback function
    void const * p_extend;      ///< Extended SPI hardware dependent configuration
} spi_cfg_t;
```

此结构体会指明SPI通信的中断类型、时钟特性和中断回调函数等。

这两个结构体的配置都由RASC自动生成，不需要用户手动配置。开发者可以参考如下代码来打开某个SPI设备完成初始化：

```c
fsp_err_t err = g_spi0.p_api->open(g_spi0.p_ctrl, g_spi0.p_cfg);
if(FSP_SUCCESS != err)
{
	printf("Error when open spi0 device!\r\n");
	return -1;
}
printf("Success to open device: spi0\r\n");
```

2. 关闭SPI设备

关闭SPI设备的函数原型如下：

```c
fsp_err_t (* close)(spi_ctrl_t * const p_ctrl);
```

此函数会将控制结构体中的open成员设置为false，表明SPI设备处于关闭状态，如果使能了SPI的参数校验功能，则在open为false的情况下，读写函数直接返回错误。

3. SPI读取数据

SPI读取数据的函数原型如下：

```c
fsp_err_t (* read)(spi_ctrl_t * const p_ctrl, 
                   void * p_dest, 
                   uint32_t const length,
                   spi_bit_width_t const bit_width);
```

- p_dest：目的数据（用来接收数据）的地址；
- length：读取数据的个数
- bit_width：读取数据的宽度，支持3bit~31bit；

读取到的数据个数换算：count=length*bit_width/8 bytes。

4. SPI发送数据

发送数据的函数原型如下：

```c
fsp_err_t (* write)(spi_ctrl_t * const p_ctrl, 
                    void const * p_src,
                    uint32_t const length,
                    spi_bit_width_t const bit_width);
```

- p_src：源数据（要发送的数据）地址；
- length：发送数据的个数；
- bit_width：发送数据的位宽，支持3bit~31bit；

发送的数据个数换算：count=length*bit_width/8 bytes。开发者可以参考如下代码来发送n个字节的数据：

```c
fsp_err_t err = g_spi0.p_api->write(g_spi0.p_ctrl, 
                                    (uint8_t*)rbuf, 
                                    wSize, 

                                    SPI_BIT_WIDTH_8_BITS);
if(FSP_SUCCESS != err)
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
```

5. SPI收发数据

SPI传输是全双工的。即使只调用read函数想读取N字节数据，它也会发出N个字（只不过我们忽略了这些发送出去的数据，默认为0xFF）；即使你只调用write函数想发出N字节数据，它也会接收到N字节数据（只不过丢弃了而已）。需要同时读、写时，可以使用SPI的同时收发函数，原型如下：

```c
fsp_err_t (* writeRead)(spi_ctrl_t * const p_ctrl, 
                        void const * p_src, 
                        void * p_dest, 
                        uint32_t const length,
                        spi_bit_width_t const bit_width);
```

- p_src：源数据（要发送的数据）地址；
- p_dest：目的数据（用来接收数据）的地址；
- length：收发数据的个数；
- bit_width：收发数据的位宽；

## 13.2 SPI驱动OLED显示实验

### 13.2.1 硬件连接

本书使用的外接SPI OLED模块是百问网的SPI OLED模块，外形如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image6.png)  

和处理器的连线如下表所示：

| 序号 | 模块引脚 | 芯片SPI0引脚 |
| ---- | -------- | ------------ |
| 1    | CS       | P205         |
| 2    | SCK      | P204         |
| 3    | MISO     | P202         |
| 4    | MOSI     | P203         |
| 5    | GPIO     | P206         |
| 6    | GND      | GND          |
| 7    | 3V3      | 3V3          |

### 13.2.2 SSD1306驱动解析

SSD1306是一个分辨率为128*64的单色显示器，也就意味着如果要全屏刷新这个显示器的话，在处理器的内存映射中需要一个128*64/8字节的内存来表示显示器的显存。

驱动SSD1306需要从以下几个角度来分析：

- 支持的接口协议；
- 显存写入模式；
- 显示区域设置；
- 显示模式设置；

1. 接口协议

SSD1306支持6800/8080并行接口协议，也支持3线制和4线制的SPI接口协议，还支持I2C接口协议。本书使用的模块是4线制SPI接口协议。

对于4线制SPI接口协议，其通信过程对于片选信号和数据/命令切换信号的要求如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image7.png)  

要启动SPI传输，需要设置CS为低电平以选中目标设备。而DC#信号被用来分辨所传输的SPI数据是“命令”，还是“显存数据”。

SSD1306的4线制SPI通信的时序如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image8.png)  

可以看到，对于SSD1306而言，它会在时钟信号的低电平期间切换数据，在上升沿采样数据，在时钟信号的高电平期间保持数据，传输的数据都是高位在前低位在后。因而在使用RASC配置SPI的时候就要和这个时钟特性要匹配。

需要注意的是，对于SSD1306而言，在串行通行模式（SPI或I2C）下是没有读取数据的操作，只有写操作。

2. 显存写入模式

SSD1306的显存横向纵向分布方式不同。横向分布下，1个bit表示一个地址值，叫做column地址；纵向分布下，8个bit表示一个地址值，叫做页地址。SSD1306纵向共有64bit，分为8个页。

SSD1306的显存写入模式就是它的地址模式，分为：页地址模式、横向地址模式和纵向地址模式。不同的地址模式下，把数据写入显存后，显存的地址变化方式是不一样的。

在页地址模式下，如果往page0的column0写入一个byte的数据，那么column将会从0递增为1；当column递增到横向地址的最大值（满屏为127）时，column会回到0，而页地址page不会变化依然保存为0。因而，在页地址模式下要想将全屏刷新，需要分8次操作：先设置Paga n地址，写入128个字节（n的 取值从0到7）。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image9.png)  

在横向地址模式下，如果往page0的column写入一个byte的数据，那么column将会从0递增为1；当column递增到横向地址的最大值时，column会回到0，而页地址会递增1；如果页地址递增到最大页数，则将回到第0页开始覆盖写。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image10.png)  

在纵向地址模式下，如果往page0的column0写入一个byte的数据，那么column地址不会变化，而页地址page将会从0递增1，当page递增到最大页地址时，page会回到0地址，而column地址会递增1。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image11.png)  

在横向地址模式或纵向地址模式下，要刷新全屏的数据，只需要在程序中执行一次发送128*8 bytes的数据到SSD1306即可，地址会自动变化，相比于页地址模式会更方便。

3. 显示区域设置

设置显示区域有两种方法：硬件映射和命令控制。

对于硬件映射，是使用0x40~0x7F区间的指令，告诉SSD1306从硬件的0~63行的哪一行开始显示。这个方法多用“裁剪应用”，不是很常用。

而命令控制则是通过设置column起始地址和结束地址以及page页的起始地址和结束地址来划定一个显示范围，在小范围更新图像数据时比较好用（全屏刷新时不用每次都设置显示区域）。

设置column地址和页地址的方法如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13/image12.png)  

- 设置column地址的命令是0x21，然后发送2个字节的数据指明起始地址和结束地址；
- 设置page地址的命令是0x22，然后发送2个字节的数据指明起始地址和结束地址；

4. 显示模式设置

显示模式设置的参数比较多，比如：显存中每一位数据对应一个像素，那么这位数据是1还是0才能让像素被点亮？显示像素是从左往右显示，还是从右往左显示等等。

### 13.2.3 SSD1036驱动程序

1. 中断回调函数和通讯等待函数

这两个函数在前文《13.1.3 中断回调函数》已经见过，此处不再展示。

2. 信号引脚控制函数

驱动SSD1306时，需要控制CS和DCX两个引脚，因而需要初始化IO且各自封装一个API供后续使用，代码如下：

```c
static void OLEDDrvGpioInit(void)
{
    fsp_err_t err = g_ioport.p_api->open(g_ioport.p_ctrl, g_ioport.p_cfg);
    if(FSP_SUCCESS != err)
        printf("Failed to open GPIOs!\r\n");
}
static void OLEDDrvWriteCS(CS eState)
{
    fsp_err_t err = g_ioport.p_api->pinWrite(g_ioport.p_ctrl, BSP_IO_PORT_02_PIN_05, (bsp_io_level_t)eState);
    if(FSP_SUCCESS != err)
        printf("Failed to write %d to pin 0x%.4x!\r\n", eState, BSP_IO_PORT_02_PIN_05);
}
static void OLEDDrvWriteDCX(DCX eState)
{
    fsp_err_t err = g_ioport.p_api->pinWrite(g_ioport.p_ctrl, BSP_IO_PORT_02_PIN_06, (bsp_io_level_t)eState);
    if(FSP_SUCCESS != err)
        printf("Failed to write %d to pin 0x%.4x!\r\n", eState, BSP_IO_PORT_02_PIN_06);
}
```

3. 显示设备对象封装和注册

本章的实验还是使用《8.3 sci spi驱动显示屏实验》节的设备对象封装结构体来表示一个显示设备：

```c
typedef struct DisplayDevice {
    char *name;
    void *FBBase; /* CPU能直接读写的显存 */
    unsigned short wXres;    /* X方向分辨率 */
    unsigned short wYres;    /* Y方向分辨率 */
    unsigned short wBpp;     /* 每个像素使用多少个像素 */
    unsigned int   dwSize;
    int            (*Init)(struct DisplayDevice *ptDev);   /* 硬件初始化 */
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

上述代码是放在drv_disp.h中，还需要在drv_oled.c中实现DisplayDevice结构体，代码如下：

```c
static unsigned short gOledFbuf[128*64/8];
static DisplayDevice gOledDev = {
                             .name = "OLED",
                             .FBBase = gOledFbuf,
                             .wXres = 128,
                             .wYres = 64,
                             .wBpp = 1,
                             .dwSize = 128*64*1/8,
                             .Init = OLEDDrvinit,
                             .DisplayON = OLEDDrvDispON,
                             .DisplayOFF = OLEDDrvDispOFF,
                             .SetDisplayWindow = OLEDDrvSetDispWindow,
                             .Flush = OLEDDrvFulsh,
                             .SetPixel = OLEDDrvSetPixel
};
```

并且在drv_oled.c中写一个设备获取接口将OLED显示设备提供给上层应用：

```c
struct DisplayDevice *OLEDGetDevice(void)
{
    return &gOledDev;
}
```

此函数会在drv_disp.h中进行声明。

显示设备的函数指针所指向的函数将会在后文列举说明。

4. 发送指令函数

发送指令时需要将DCX拉低，可以在头文件中定义一个枚举类型表明DCX的状态，例如：

```c
typedef enum{
    isCommand,
    isData
}DCX;     /* 数据/命令切换控制状态 */
```

然后调用前面的WriteDCX函数以及SPI的write函数发送指令，代码如下：

```c
static void OLEDDrvWriteReg(uint8_t ucData)
{
    OLEDDrvWriteDCX(isCommand);
    fsp_err_t err = g_spi0.p_api->write(g_spi0.p_ctrl, 
                                        (uint8_t*)&ucData, 
                                        1, SPI_BIT_WIDTH_8_BITS);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    SPIWaitTxCplt();
}
```

5. 发送数据函数

发送数据则需要将DCX拉高，然后再调用write函数。代码如下：

```c
static void OLEDDrvWriteDat(uint8_t ucData)
{
    OLEDDrvWriteDCX(isData);
    fsp_err_t err = g_spi0.p_api->write(g_spi0.p_ctrl, 
                                        (uint8_t*)&ucData, 
                                        1, SPI_BIT_WIDTH_8_BITS);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    SPIWaitTxCplt();
}
static void OLEDDrvWriteBuf(uint8_t* rbuf, unsigned short wSize)
{
    OLEDDrvWriteDCX(isData);
    fsp_err_t err = g_spi0.p_api->write(g_spi0.p_ctrl, 
                                        (uint8_t*)rbuf, 
                                        wSize, SPI_BIT_WIDTH_8_BITS);
    if(FSP_SUCCESS != err)
        printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    SPIWaitTxCplt();
}
```

要注意的是，第04行传输的是8位数据，它对应8个像素。

在某些显示设备的驱动芯片中，有可能是用16bit的来表示一个像素。

6. SSD1306参数配置函数

SSD1306可以配置的参数有很多，比如对比度、功率、时钟等等，本书不会一一详细列举代码，仅以函数名称展示：

| 序号                                   | 函数名                                                       | 参数                                                 | 作用                                                      |
| -------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------- |
| 1                                      | void OLEDDrvSetContrastValue(uint8_t ucValue)                | ucValue：对比度值，范围0~255                         | 设置SSD1306的对比度                                       |
| 2                                      | void OLEDDrvEntrieDisp(bool bState)                          | bState：true-局部显示；false-全屏显示；              | SSD1306全部显示或者局部显示：0xA5-局部显示；0xA4-全部显示 |
| 3                                      | void OLEDDrvSetDispMode(bool bMode)                          | bMode：true-1显示0不显示；false-1不显示0显示；       | SSD1306正常显示还是颠倒显示                               |
| 4                                      | void OLEDDrvSetHScroll(uint8_t ucDir, uint8_t ucStart, uint8_t ucFrtime, uint8_t ucEnd) | ucDir:true-从左往右滚动；false—从右往左滚动          | 设置横向滚动区域                                          |
| 5                                      | void OLEDDrvSetHVScrool(uint8_t ucDir, uint8_t ucStart, uint8_t ucFrtime, uint8_t ucEnd, uint8_t ucOffset) | ucDir:true-从左往右滚动；false—从右往左滚动          | 设置横向和纵向的滚动区域                                  |
| 6                                      | void OLEDDrvSetScroll(bool bState)                           | bState：true-开启滚动；false-关闭滚动                | 开启或者关闭滚动显示效果                                  |
| 7                                      | static void OLEDDrvSetScrollArea(uint8_t ucArea, uint8_t ucNumOfRow) | ucArea-起始行；ucNumOfRow-滚动行数；                 | 设置滚动显示区域                                          |
| 8                                      | void OLEDDrvSetMemAddrMode(uint8_t ucMode)                   | ucMode：1-页地址模式；2-横向地址模式；3-纵向地址模式 | 设置地址模式                                              |
| 9                                      | void OLEDDrvSetColumnAddr(uint8_t ucStart, uint8_t ucEnd)    | ucStart-行起始地址；ucEnd-行结束地址                 | 在页地址模式下只有起始地址有效；                          |
| 10                                     | void OLEDDrvSetPageAddr(uint8_t ucStart, uint8_t ucEnd)      | ucStart-页起始地址；ucEnd-页束地址                   | 在页地址模式下只有起始地址有效；                          |
| 11                                     | void OLEDDrvDispON(struct DisplayDevice* ptDev)              | ptDev-指向显示设备                                   | 开启显示功能                                              |
| 12                                     | void OLEDDrvDispOFF(struct DisplayDevice* ptDev)             | ptDev-指向显示设备                                   | 关闭功能                                                  |

 其它硬件配置函数省略，使用默认值也可。                                                                                                               
7. 设置显示区域函数

设置显示区域其实就是划定行地址和页地址的起始地址以及结束地址，将这两者封装到一起，将地址参数传入即可，参照如下代码：

```c
static void OLEDDrvSetDispWindow(struct DisplayDevice* ptDev, 
                                 unsigned short wXS, unsigned short wYS, 
                                 unsigned short wXE, unsigned short wYE)
{
    if(NULL == ptDev->name)    return;
    OLEDDrvSetColumnAddr((uint8_t)wXS, (uint8_t)wXE);
    OLEDDrvSetPageAddr((uint8_t)wYS, (uint8_t)wYE);
}
```

8. 绘制单个像素点函数

绘制单个像素首先需要知道绘制的地址是哪一个，假设将column地址设置为x，page地址设置为y，那么目标像素地址的换算公式如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-13\image13.png)

y除以8是因为共有8页，再乘以128是因为每一页有128个column。

另外，本章实验使用的是frame buffer，为此可以封装成以下函数：

```c
static int OLEDDrvSetPixel(struct DisplayDevice* ptDev, 
                           unsigned short wX, unsigned short wY,
                           unsigned short wColor)
{
    if(NULL == ptDev->name)    return -1;
    unsigned char *buf = ptDev->FBBase;
    int page;
    unsigned char *byte;
    int bit;
    if (wX >= ptDev->wXres || wY >= ptDev->wYres)
        return -1;
    page = wY / 8;
    byte = buf + page * 128 + wX;
    bit = wY % 8;
    if (wColor)
        *byte |= (1<<bit);
    else
        *byte &= ~(1<<bit);
    return 0;
}
```

- 第07行：获取frame buffer的首地址；
- 第13~14行：获取目标像素点在frame buffer中的偏移地址；
- 第15行：获取像素点在横向地址的位置；因为修改的像素点位置大概率不会是页数的整数倍，而是某一页的某一位，因而需要计算出这个点在那一页的哪一位需要被修改。
- 第16~19行：修改像素点的显示；

9. 全屏刷新函数

对于SSD1306而言，刷新全屏就是发送128*8 bytes的数据到显存，因而调用前文介绍的一次性发送N字节的函数，代码如下：

```c
static void OLEDDrvFulsh(struct DisplayDevice* ptDev)
{
    if(NULL == ptDev->name)    return;
    OLEDDrvWriteCS(isSelect);
    OLEDDrvWriteBuf(ptDev->FBBase, 128*8);
    OLEDDrvWriteCS(notSelect);
}
```

本章实验使用的是横向地址模式，因而可以一次性发送全部显存数据。

10. 设备初始化函数

SSD1306的初始化，需要初始化涉及的 GPIO、初始化SPI控制器、初始化SSD1306本身，读者可以参考如下代码来初始化SSD1306：

```c
static int OLEDDrvinit(struct DisplayDevice* ptDev)
{
    if(NULL == ptDev->name)    return -1;
    OLEDDrvGpioInit();
    OLEDDrvWriteCS(notSelect);
    OLEDDrvWriteDCX(isCommand);
    fsp_err_t err = g_spi0.p_api->open(g_spi0.p_ctrl, g_spi0.p_cfg);
    if(FSP_SUCCESS != err)
    {
        printf("Error when open spi0 device!\r\n");
        return -1;
    }
    printf("Success to open device: spi0\r\n");
    OLEDDrvWriteCS(isSelect);
    OLEDDrvSetMemAddrMode(1);
    OLEDDrvSetMuxRatio(0x3F);
    OLEDDrvSetDispOffset(0x00);
    OLEDDrvSetDispStartLine(0);
    OLEDDrvSetSegRemap(true);
    OLEDDrvSetCOMScanDir(true);
    OLEDDrvSetCOMHWConfig(0, 0);
    OLEDDrvSetContrastValue(0x7F);
    OLEDDrvEntrieDisp(false);
    OLEDDrvSetDispMode(true);
    OLEDDrvSetDispClock(0x00, 0x08);
    OLEDDrvSetChargePump(true);
    OLEDDrvDispON(ptDev);
    OLEDDrvSetDispWindow(ptDev, 0, 0, ptDev->wXres-1, ptDev->wYres-1);
    OLEDDrvWriteCS(notSelect);
    return 0;
}
```

### 13.2.4 测试程序

本章的测试程序放在app_disp.c中实现，示例代码如下：

```c
void DispAppTest(void)
{
    DisplayDevice *ptDispDev = OLEDGetDevice();
    if(ptDispDev == NULL)
    {
        printf("Failed to get OLED Display Device!\r\n");
        return;
    }

    ptDispDev->Init(ptDispDev);
    uint8_t *pBuf = (uint8_t*)ptDispDev->FBBase;
    while(1)
    {
        for(uint16_t i=0; i<128*8; i++)
        {
            pBuf[i] = 0x55;
        }
        ptDispDev->Flush(ptDispDev);
        for(uint16_t i=0; i<128*8; i++)
        {
            pBuf[i] = 0x00;
        }
        ptDispDev->Flush(ptDispDev);
    }
}
```

### 13.2.5 上机实验

在hal_entry.c中的hal_entry()函数中初始化串口设备以及调用显示设备的测试函数来使串口设备打印调试信息，让OLED开始测试显示，代码如下：

```c
#include "app.h"
#include "drv_uart.h"
#include "hal_systick.h"
#include "hal_data.h"

void hal_entry(void)
{
    /* TODO: add your own code here */
    SystickInit();
    UARTDrvInit();
    DispAppTest();
}
```

将程序编译出来的二进制可执行文件烧录到板子上，运行后可以看到OLED在不断地示横线、清屏。