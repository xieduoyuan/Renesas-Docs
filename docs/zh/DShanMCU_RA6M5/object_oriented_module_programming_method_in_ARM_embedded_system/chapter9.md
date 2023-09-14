# 第9章 SCI I2C

本章目标

- 使用RASC快速配置SCI的I2C模式
- 学会使用SCI-I2C的API进行数据收发

## 9.1 sci i2c模块的使用

### 9.1.1 配置sci i2c模块

本章配置的I2C是RA芯片里SCI模块中的一种模式，因而其配置方法和之前的《第7章7.1 sci_uart模块的使用》的UART模式配置十分的类似。

板载的I2C模块是一片EEPROM，原理图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image1.png) style="zoom: 150%;" /> 

在RASC中创建了工程后，在“Pins”里面的“Peripherals”中展开“Connectivity:SCI”，选择其中一个SCI通道，例如SCI4，在“Pin Configuration”配置界面里的“Operation Mode”中将操作模式选为“Simple I2C”，如图所示：

 ![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image2.png)

上图中的第⑥步需要根据原理图来选择引脚，本书使用过的是P206和P207。

接着在“Stacks”中添加SCI I2C的堆栈模块，点击进入“Stacks”配置界面后，点击“New Stack”，展开里面的“Connectivity”，选择“I2C Master(r_sci_i2c)”，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image3.png) 

这里要注意，RA的I2C分为“Simple I2C”和“Common I2C”,“Simple I2C”是SCI的模式之一，而“Common I2C”是一个实际存在的I2C硬件控制器。本章的实验是基于SCI的I2C主机，因而选择的是“I2C Master(r_sci_i2c)”。

1. 设置通道

完成这些操作后，会在“Stacks”配置界面的“HAL/Common Stacks”中新增一个“g_i2c0 I2C Master(r_sci_i2c)”模块，接下来就要根据实际应用配置这个模块。比如在前面选择的是SCI的I2C4，而此处新增的模块默认名称是“g_i2c0”且默认的通道是0，为了和实际通道匹配，就要去这个模块的属性中更改名称及其通道，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image4.png" style="zoom:150%;" /> 

2. 设置从机地址

在《6.1.3 I2C协议》中已经说明，在I2C通信协议中，是通过地址来选中要访问的设备，因而在RASC中还需要配置I2C从设备的地址。一条I2C总线可以支持多个I2C从设备，要访问某个设备时需要指定它的地址。我们可以在配置界面先指定某个从设备的地址，以后访问其他设备时再通过FSP的库函数修改地址。本节讲解如何在配置界面指定从设备地址。

在SCI I2C的“Stacks中，它的“Module”中有两个选项用于设置从机地址，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image5.png" style="zoom:150%;" /> 

- Slave Address：从机的地址值；
- Address Mode：地址模式，支持7-bit模式和10-bit模式，如果选择10-bit模式，还需要在Stacks中的是“Common”中将“10-bit slave addressing”从“Disabled”设置为“Enabled”，如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image6.png) 

本章的实验是读写一块EEPROM芯片AT24C02，根据它的手册和模块的硬件原理图可以知道其地址是0x50，是一个7-bit模式的地址，因而这里就将“Slave Address”设置为0x50，而地址模式“Address Mode”就使用默认的7-bit，如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image7.png" style="zoom:150%;" />  

既然使用的是7-bit地址模式，那就不用去使能前面的10-bit地址模式了。

3. 设置通信速率和中断

I2C的通信速率支持标准速率和快速速率。标准速率最大能到100kbps，快速速率最大能到400kbps。本章的实验是读取EEPROM，EEPROM芯片本身处理的速度就比较慢，所以就是用的标准速率，而不是快速速率。

另外，使用中断来判断I2C传输的完成状态，在中断回调函数中通过事件类型来判断是发送完成还是接收完成。设置中断回调函数的名称时，建议和通道名称相匹配。

速率模式和中断回调函数名称的设置如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image8.png" style="zoom:150%;" />  

将上面的配置设置好之后就可以点击RASC的“Generate Project Content”生成工程了。

### 9.1.2 配置信息解读

使用RASC配置SCI I2C后，生成了引脚配置信息和SCI I2C本身的配置信息。以本章的第一个实验“0901_sci_i2c_eeprom”读写EEPROM实验为例。

1. 引脚配置信息

该信息会在0901_sci_i2c_eeprom\ra_gen\pin_data.c文件里生成。在RASC里配置的每一个引脚，都会在pin_data.c生成一个ioport_pin_cfg_t数组项，里面的内容跟配置时选择的参数一致。代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
    ……(省略内容)
    {
        .pin = BSP_IO_PORT_02_PIN_06,
        .pin_cfg = ((uint32_t) IOPORT_CFG_NMOS_ENABLE
 | (uint32_t) IOPORT_CFG_PERIPHERAL_PIN
 | (uint32_t) IOPORT_PERIPHERAL_SCI0_2_4_6_8)
    },
    {
        .pin = BSP_IO_PORT_02_PIN_07,
        .pin_cfg = ((uint32_t) IOPORT_CFG_NMOS_ENABLE
 | (uint32_t) IOPORT_CFG_PERIPHERAL_PIN
 | (uint32_t) IOPORT_PERIPHERAL_SCI0_2_4_6_8)
    },
    ……(省略内容)
};
```

- 第03行~08行：将引脚P206设置为SCI0/2/4/6/8通道的外设引脚，并且使能了NMOS即设置为开漏功能的引脚；
- 第09行~14行：将引脚P207设置为SCI0/2/4/6/8通道的外设引脚，并且使能了NMOS即设置为开漏功能的引脚；

2. SCI I2C配置信息

该信息会在0901_sci_i2c_eeprom\ra_gen\hal_data.c文件里生成。在RASC里指定了I2C使用哪个SCI通道、指定了它的通道、从机地址、地址模式和中断回调函数注册等信息，这些配置信息都被放入一个g_i2c2_cfg结构体，部分代码摘录如下：

```c
const i2c_master_cfg_t g_i2c2_cfg =
{
    .channel             = 4,
    .rate                = I2C_MASTER_RATE_STANDARD,
    .slave               = 0x50,
    .addr_mode           = I2C_MASTER_ADDR_MODE_7BIT,
    ......(省略内容)
    .p_callback          = sci_i2c4_master_callback,
    .p_context           = NULL,
    ......(省略内容)
};
```

- 第3行：使用的SCI通道4；
- 第4行：选择的是标准I2C速率；
- 第5行：从机地址值为0x50；
- 第6行：地址模式为7-bit地址；
- 第8行：中断回调函数名称；

### 9.1.3 中断回调函数

中断回调函数的原型已经在hal_data.h中进行了声明，需要用户在自己的程序中实现，其原型如下：

```c
#ifndef sci_i2c4_master_callback
void sci_i2c4_master_callback(i2c_master_callback_args_t * p_args);
#endif
```

它的参数类型是一个i2c_master_callback_args_t结构体指针，这个结构体的原型如下：

```c
/** I2C callback parameter definition */
typedef struct st_i2c_master_callback_args
{
    void const       * p_context;      ///< Pointer to user-provided context
    i2c_master_event_t event;          ///< Event code
} i2c_master_callback_args_t;
```

此结构体会表明触发此sci i2c中断的是哪一个事件，i2c主机的事件类型支持以下这些：

```c
/** Callback events */
typedef enum e_i2c_master_event
{
    I2C_MASTER_EVENT_ABORTED     = 1,  ///< A transfer was aborted
    I2C_MASTER_EVENT_RX_COMPLETE = 2,  ///< A receive operation was completed successfully
    I2C_MASTER_EVENT_TX_COMPLETE = 3   ///< A transmit operation was completed successfully
} i2c_master_event_t;
```

- 通信中止事件；
- 接收完成事件；
- 发送完成事件；

用户就可以根据传参进来的事件来做处理。例如在i2c2的中断回调函数中，可以判断是发送完成了，还是接收完成了。代码如下：

```c
static volatile bool gI2CTxCplt = false;
static volatile bool gI2CRxCplt = false;
void sci_i2c4_master_callback(i2c_master_callback_args_t *p_args)
{
    if(I2C_MASTER_EVENT_RX_COMPLETE == p_args->event)
    {
        gI2CRxCplt = true;
    }
    else if(I2C_MASTER_EVENT_TX_COMPLETE == p_args->event)
    {
        gI2CTxCplt = true;
    }
}
```

- 第05~08行：判断事件是否是接收完成事件，如果是的话就将一个静态全局变量接收完成标志置1；
- 第09~11行：判断事件是否是发送完成事件，如果是的话就将一个静态全局变量发送完成标志置1；

接着可以利用这两个标志位来封装等待函数：等待发送完成、等待接收完成。代码如下：

```c
static void I2C4WaitTxCplt(void)
{
    uint16_t wTimeout = 50;
    while(!gI2CTxCplt && wTimeout)
    {
        R_BSP_SoftwareDelay(1, BSP_DELAY_UNITS_MILLISECONDS);
        wTimeout--;
    }
    gI2CTxCplt = false;
}
static void I2C4WaitRxCplt(void)
{
    uint16_t wTimeout = 50;
    while(!gI2CRxCplt && wTimeout)
    {
        R_BSP_SoftwareDelay(1, BSP_DELAY_UNITS_MILLISECONDS);
        wTimeout--;
    }
    gI2CRxCplt = false;
}
```

这两个函数都使用了超时等待的机制，在50ms内没有等到目标标志位置1则复位该标志位退出。

读者可以自行完善这两个等待函数，将其修改为带返回值的函数，如果等到了返回true，超时了则返回false。

### 9.1.4 API接口及其用法

在路径0901_sci_i2c_eeprom/ra/fsp/inc/api/r_i2c_master_api.h中定义了i2c模块的接口，它定义了一个结构体类型i2c_master_api_t，内容如下：

```c
typedef struct st_i2c_master_api
{
    fsp_err_t (* open)(i2c_master_ctrl_t * const p_ctrl, 
                       i2c_master_cfg_t const * const p_cfg);
    fsp_err_t (* read)(i2c_master_ctrl_t * const p_ctrl, 
                       uint8_t * const p_dest, 
                       uint32_t const bytes,
                       bool const restart);
    fsp_err_t (* write)(i2c_master_ctrl_t * const p_ctrl, 
                        uint8_t * const p_src, 
                        uint32_t const bytes,
                        bool const restart);
    fsp_err_t (* abort)(i2c_master_ctrl_t * const p_ctrl);
    fsp_err_t (* slaveAddressSet)(i2c_master_ctrl_t * const p_ctrl, 
                                  uint32_t const slave,
                                  i2c_master_addr_mode_t const addr_mode);
    fsp_err_t (* callbackSet)(i2c_master_ctrl_t * const p_api_ctrl, 
                              void (* p_callback)(i2c_master_callback_args_t *),
                              void const * const p_context, 
                              i2c_master_callback_args_t * const p_callback_memory);
    fsp_err_t (* statusGet)(i2c_master_ctrl_t * const p_api_ctrl, 
                            i2c_master_status_t * p_status);
    fsp_err_t (* close)(i2c_master_ctrl_t * const p_ctrl);
} i2c_master_api_t;
```

在具体的C文件中，需要实现一个i2c_master_api_t结构体变量，比如在r_sci_i2c.c里实现了如下结构体：

```c
/* Simple I2C on SCI HAL API mapping for I2C Master interface */
i2c_master_api_t const g_i2c_master_on_sci =
{
    .open            = R_SCI_I2C_Open,
    .read            = R_SCI_I2C_Read,
    .write           = R_SCI_I2C_Write,
    .abort           = R_SCI_I2C_Abort,
    .slaveAddressSet = R_SCI_I2C_SlaveAddressSet,
    .close           = R_SCI_I2C_Close,
    .callbackSet     = R_SCI_I2C_CallbackSet,
    .statusGet       = R_SCI_I2C_StatusGet
};
```

要使用SCI I2C收发数据时，可以调用结构体g_i2c_master_on_sci里的各个函数指针，也可以直接调用r_sci_i2c.c里实现的各个函数（比如R_SCI_I2C_Open、R_SCI_I2C_Read）。

1. 打开I2C设备

函数用于配置SCI的I2C，并且标记转态为“已经打开”。函数原型：

```c
fsp_err_t (* open)(i2c_master_ctrl_t * const p_ctrl, i2c_master_cfg_t const * const p_cfg);
```

来看一下这个函数的参数：

a) p_ctrl：此参数是一个i2c_master_ctrl_t结构体指针类型，该结构体本质上是void类型，原型如下：

```c
typedef void i2c_master_ctrl_t;
```

它可以指向任意类型的参数，在r_sci_i2c.h里，这个参数实际的类型是sci_i2c_instance_ctrl_t结构体，定义如下：

```c
typedef struct st_sci_i2c_instance_ctrl
{
    i2c_master_cfg_t const * p_cfg;     // Pointer to the configuration structure
    uint32_t                 slave;     // The address of the slave device
    i2c_master_addr_mode_t addr_mode; // Indicates how slave fields should be interpreted
    uint32_t                 open;      // Flag to determine if the device is open
    R_SCI0_Type            * p_reg;     // Base register for this channel

    IRQn_Type rxi_irq;                  // Receive IRQ number
    IRQn_Type txi_irq;                  // Transmit IRQ number
    IRQn_Type tei_irq;                  // Transmit end IRQ number

    /* Current transfer information. */
    uint8_t * p_buff;               // Holds the data associated with the transfer */
    uint32_t  total;          // Holds the total number of data bytes to transfer */
    uint32_t  remain;               // Tracks the remaining data bytes to transfer */
    uint32_t  loaded;  // Tracks the number of data bytes written to the register */

    uint8_t addr_low;                   // Holds the last address byte to issue */
    uint8_t addr_high;    // Holds the first address byte to issue in 10-bit mode  */
    uint8_t addr_total;    // Holds the total number of address bytes to transfer */
    uint8_t addr_remain;        // Tracks the remaining address bytes to transfer */
    uint8_t addr_loaded;     // Tracks the number of address bytes written to the register */

    volatile bool read;          // Holds the direction of the data byte transfer */
    volatile bool restart;      // Holds whether or not the restart should be issued when done */
    volatile bool err; // Tracks whether or not an error occurred during processing */
    volatile bool restarted; // Tracks whether or not a restart was issued during the previous transfer */
    volatile bool do_dummy_read;  // Tracks whether a dummy read is issued on the first RX */
    volatile bool activation_on_rxi;    // Tracks whether the transfer is activated on RXI interrupt */
    volatile bool activation_on_txi;    // Tracks whether the transfer is activated on TXI interrupt */
    /* Pointer to callback and optional working memory */
    void (* p_callback)(i2c_master_callback_args_t *);
    i2c_master_callback_args_t * p_callback_memory;
    /* Pointer to context to be passed into callback function */
    void const * p_context;
} sci_i2c_instance_ctrl_t;
```

- 第3行：I2C设备配置信息；
- 第4行：从机地址值；
- 第5行：地址模式；
- 第6行：I2C设备状态；
- 第26行：重复收发标志位；
- 第33行：中断回调函数指针；

这个结构体的信息比较多，它将I2C的数据传输信息都集成到了里面。使用I2C进行传输时，在发送地址的时候就要确定是读还是写。因而第19行~第25行这几个结构体成员在FSP的收发库函数中就会被用来合并、重组地址值。

FSP库已经将I2C通信过程中涉及的计算、标志判断封装到了库函数中，开发者无需关注内部的细节，只要会使用这些库函数就可以了。

b) p_cfg：此参数是i2c_master_cfg_t结构体类型，该结构体就是上述第3行的内容，原型如下：

```c
typedef struct st_i2c_master_cfg
{
    /** Generic configuration */
    uint8_t                channel;    ///< Identifier recognizable by implementation
    i2c_master_rate_t      rate; ///< Device's maximum clock rate from enum i2c_rate_t
    uint32_t               slave; ///< The address of the slave device
    i2c_master_addr_mode_t addr_mode;   ///< Indicates how slave fields should be interpreted
    uint8_t      ipl;   ///< Interrupt priority level. Same for RXI, TXI, TEI and ERI.
……
    void (* p_callback)(i2c_master_callback_args_t * p_args); ///< Pointer to callback function
    void const * p_context;     ///< Pointer to the user-provided context
    /** Implementation-specific configuration */
    void const * p_extend;      ///< Any configuration data needed by the hardware
} i2c_master_cfg_t;
```

- 第3行：sci i2c通道；
- 第4行：设置i2c的最大速率；
- 第5行：从机地址值；
- 第6行：地址模式；

开发者可以在自己的代码中调用open函数来实现对sci i2c设备的初始化，例如：

```c
static int EEPROMDrvInit(struct I2CDev* ptDev)
{
    if(NULL == ptDev->name)    return -1;
    fsp_err_t err = g_i2c4.p_api->open(g_i2c4.p_ctrl, g_i2c4.p_cfg);
    if(FSP_SUCCESS == err)
    {
        printf("Success to open device: i2c4!\r\n");
        return -1;
    }
    else
        printf("Failed to open device: i2c4!\r\n");
    return 0;
}
```

- 第4行：打开I2C设备；

-第5~10行：根据open函数的返回值来判断是否打开成功，并且输出打印调试信息来观察；

这个函数使用了面向对象思想封装了I2C设备，这个在后文讲接。

2. 关闭I2C设备

关闭SCI I2C设备的close函数会将I2C设备的状态标志open设置为0表示其为关闭状态，原型如下：

```c
fsp_err_t (* close)(i2c_master_ctrl_t * const p_ctrl);
```

此函数的参数就是一个i2c_master_ctrl_t结构体类型的参数，前面已经将结果该结构体。开发者可以参考以下代码来关闭指定的I2C设备：

```c
void drv_sci_i2c_close(void)
{
    fsp_err_t err = g_i2c2.p_api->close(g_i2c2.p_ctrl);
    if(FSP_SUCCESS == err)
        printf("Success to close device: i2c2\r\n");
    else
        printf("Failed to close device: i2c2\r\n");
}
```

3. 设置从机地址

发起I2C传输时，每次都要指明从机的地址。

在配置SCI I2C的时候指定了一个从机地址0x50，开发者调用wirte/read函数进行通信的时候，FSP库函数发出设备地址时就使用0x50。

要访问其他从设备时， FSP提供了设置从机地址的函数，原型如下：

```c
fsp_err_t (* slaveAddressSet)(i2c_master_ctrl_t * const p_ctrl, 
                              uint32_t const slave,
                              i2c_master_addr_mode_t const addr_mode);
```

- slave：从机地址值；

- addr_mode：地址模式，支持7-bit和10-bit两种：

  ```c
  typedef enum e_i2c_master_addr_mode
  {
      I2C_MASTER_ADDR_MODE_7BIT  = 1,    ///< Use 7-bit addressing mode
      I2C_MASTER_ADDR_MODE_10BIT = 2,    ///< Use 10-bit addressing mode
  } i2c_master_addr_mode_t;
  ```

因而开发者想要和多个i2c从设备通信时，在通信之前必须要调用此函数修改从机地址，然后再开始收发数据。

4. 使用SCI I2C发送指定长度的数据

SCI I2C的发送函数write需要指定：所发送数据的起始地址、数据的字节个数，以及发送完一帧数据（一帧，而不是一个字节的数据）之后的动作：是判断从机应答信号以继续发送，还是发送停止信号。原型如下：

```c
fsp_err_t (* write)(i2c_master_ctrl_t * const p_ctrl, 
                    uint8_t * const p_src, /* 指向发送数据的起始地址 */
                    uint32_t const bytes,  /* 发送bytes个字节的数据 */
                    bool const restart);   /* 发送完此帧数据的操作 */
                                 /* true判断从机应答继续发送，false发送停止信号停止发送 */
```

- p_src：源数据（要发送的数据）地址；
- bytes：发送bytes个字节的数据；
- restart：发送完此帧数据后的操作：true表示不会发出Stop信号而是马上发出Start信号——这样可以一直霸占I2C总线，false表示发出Stop信号（大家重新竞争I2C总线）；

开发者可以参考如下代码来进行I2C的数据发送：

```c
static int EEPROMDrvWriteByte(struct I2CDev* ptDev, unsigned char ucAddr, unsigned char const ucData)
{
    if(NULL == ptDev->name)    return -1;
    uint16_t wData = (uint16_t)((ucData<<8) | ucAddr);
    /* 发送一个字节的地址数据 */
    g_i2c4.p_api->write(g_i2c4.p_ctrl, (unsigned char*)&wData, (unsigned int)2, false);
    I2C4WaitTxCplt();
    return 0;
}
```

此函数是往EEPROM的addr地址处写入一个字节的数据wbyte：

- 第4行：将数据和地址计算合并为1帧数据，调用一次write函数全部发送完，简化操作；
- 第6行：由于只发送一个数据就停止了，因而restart设置为false；
- 第7行：等待发送完成；

这个过程中I2C总线上其实发生了两个字节的发送：先发送了设备地址，再发送了数据。

5. 使用SCI I2C接收指定长度的数据

SCI I2C的发送函数read需要指定：用来接收数据的缓冲区地址、想接收多少字节、以及接收完当前帧后的操作，原型如下：

```c
fsp_err_t (* read)(i2c_master_ctrl_t * const p_ctrl,
                   uint8_t * const p_dest, /* 保存接收数据的首地址 */
                   uint32_t const bytes,   /* 想接收多少字节 */
                   bool const restart);    /* 接收完一帧数据后的操作 */
                                           /* true-接收完一帧发送ACK */
                                           /* false-接收完一帧发送NACK */
```

- p_dest：目的数据（用来接收数据）的地址；
- bytes：想接收多少字节；
- restart：主机接收完一帧数据后的操作，true-接收完一帧数据后主机不发送停止信号而是发送Start信号继续传输，false-接收完一帧数据后主机发送停止信号。

本实验读取EEPROM指定地址开始的N个字节，参考代码如下：

```c
static int EEPROMDrvRead(struct I2CDev* ptDev, unsigned char ucAddr, unsigned char* rbuf, unsigned int dwSize)
{
    if(NULL == ptDev->name)    return -1;
    /* 发送一个字节的地址数据 */
    g_i2c4.p_api->write(g_i2c4.p_ctrl, (unsigned char*)&ucAddr, (unsigned int)1, true);
    I2C4WaitTxCplt();
    /* 读取该地址的一个字节数据 */
    R_BSP_SoftwareDelay(300, BSP_DELAY_UNITS_MICROSECONDS);
    g_i2c4.p_api->read(g_i2c4.p_ctrl, (unsigned char*)rbuf, (unsigned int)dwSize, false);
    I2C4WaitRxCplt();
    return 0;
}
```

- 第9行：调用read函数读取size个字节的数据，读取完size个字节的数据后发送一个Stop信号给从机。

## 9.2 sci i2c读写EEPROM实验

本节实验会用到UART的printf功能，请参考前文《7.3 stdio实验》配置实现printf功能，并将0801_sci_spi_loopback/drivers中的drv_uart.c和drv_uart.h移植到本节实验的工程中。

### 9.2.1 硬件连接

本实验使用的方法是开发板上的I2C引脚用杜邦线外接一个EEPROM模块，使用的I2C是SCI2里面的I2C，因而请读者参考下图来连接硬件保证实验的成功进行：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image9.png) 

### 9.2.2 EEPROM驱动解析

本次实验使用的EEPROM芯片是AT24C02，它遵循标准的I2C通信协议，在日常的开发中，如果遇到需要频繁改写某些小量数据且要掉电非易失的应用场景，EEPROM将会比Flash更加适合。因而学会驱动EEPROM也是嵌入式开发者应该掌握的一个技能。

1. 内存大小及其分布

传统的EEPROM(Flash在某些地方被称作广义EEPROM，与传统EEPROM区别)的发展历程和制作工艺决定了其大小基本都是几十Byte到几百Byte，很少有超过512Byte。

本次实验选用的AT24C02，其内存大小是2KB，即2048 bits，也即是256 bytes。这256 bytes分为32个页Page，每一页有8个字节。因而在访问内存时，其地址是每隔8个数值为1页。

2. 设备地址与读写控制

AT24C02的设备地址在手册中如下图描述：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image10.png) 

高四位固定为1010，低四位分别由三个引脚[A2, A1, A0]和读写控制位RW共同决定，本实验使用的EEPROM模块[A2, A1, A0]三个引脚都是接的地，值为0，因而其7-bit模式下的地址是0x50，而不是0xA0。

AT24C02的读写控制位RW，为0时是写操作，为1时是读操作。

3. 单字节写

AT24C02单字节写的时序如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image11.png) 

I2C主机这边的整个流程如下：

① 主机发送起始信号；
② 主机发送设备地址且是写操作
③ 主机发送写入的目标内存地址
④ 主机发送写入的数据
⑤ 主机发送停止信号

由于RA的FSP库已经将I2C发送设备地址这一步封装到了write库函数中，因而用户在使用write发送数据的时候，驱动AT24C02单字节写时，只需要发送内存地址值和数据值即可，且发送完一个字节之后就要发送停止信号，所以write的restart参数为false。

4. 页写和跨页写

AT24C02的页写时序如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image12.png) 

I2C主机这边的整个流程如下：

① 主机发送起始信号；
② 主机发送设备地址且是写操作；
③ 主机发送写入的目标内存地址；
④ 主机连续发送n个字节的数据；
⑤ 主机发送停止信号；

用户调用write时FSP库函数内部会发送从设备地址，用户只需要发生目标内存地址和数据buffer即可。

但是AT24C02的一页只有8个字节，所以上图中的n个数据不能超过8个数据；而且写完一页之后必须要发送一个停止信号。

当发生跨页写时，要能识别出不同的页，对于每一页要单独处理。

调用write函数时传入的起始地址必须是一页的首地址吗？不必，举例说明。

假设AT24C02的内存中初始值全为0，现在从地址2(地址0~地址8是属于第0页)开始写8个字节（比如[0~7]），然后从地址2开始读8个字节，能读到数据[0~7]吗？只能读到[0~5，0，0]，后面2个是0；而如果从地址0开始读8个字节呢？读到的数据变成了[6,7,0~5]。

发生了什么？数据从第0页的起始位置覆盖写了。关于这一点，AT24C02的手册是这样解释的：当从某一页的某个地址开始写数据时，AT24C02收到一个数据后内存地址会自增1，当地址自增到这一页的极限位置时，内存地址会回到这一页的起始地址，如果再次接收到数据就会从头开始覆盖写这一页。

5. 多字节写

多字节写就是对页写的补充扩展，其本质是页写，但是需要处理多个页，详细设计会在后文的驱动程序中介绍。

6. 读当前地址字节数据

AT24C02读当前页的时序如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image13.png) 

这个过程比较简单，主机发送一个读操作的设备地址后，从机就将数据发送给主机。但是这个过程中要清楚读取地址的变化。

所谓当前地址，就是指上一次读写操作后的地址再加1，例如上一次是从0地址写入数据，那么使用当前地址就等于1，执行“读当期地址一个字节”时：得到的是地址1上的数据，并且当前地址增加1变为2。

如果上一次读写操作的地址是最后一页的最后一个字节，也就是读255地址的数据，当前地址就变为0.，那么执行“读当期地址一个字节”时：得到的是地址0上的数据，并且当前地址增加1变为1。

同样的，FSP库也将发送读操作的设备地址在read函数中进行了封装，用户使用read函数时只需要指定用于接收数据的缓冲区地址和要读取的数据个数即可。

当前地址读操作只读取1个字节的数据，且读完之后主机要发送停止信号，因而用户调用read函数执行此操作是，参数size要设置为1，参数restart设置为false。

7. 读指定任意地址n个字节数据

AT24C02读指定任意地址n个字节的时序如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image14.png) 

流程如下（忽略了发送设备地址的步骤）：

a) 主机需要先发送一个要读取的内存地址给从机，这个操作中的设备地址是一个写操作；
b) 开始读取n个字节；

这个过程中，用户使用write发送完内存地址后，没有发送停止信号，所以第一步write的restart参数要设置为true。

第二步是调用read函数，在读取到n个字节后发送停止信号，因而用户使用read函数读取数据时，参数restart要设置为false。

8. 连续读取n个字节数据

AT24C02连续读取n个字节数据的时序如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image15.png) 

可以看到，这个模式下主机在发送带设备地址之后没有发送内存地址，而是直接开始读，直到读完n个字节的数据后才会发送停止信号。

连续读的内存地址变化是：读完一个字节的数据后内存地址自增1，如果内存地址自增到AT24C02的内存极限也就是255地址时，下一次读就会回到0继续开始读，直到主机发送停止信号。

连续读的起始内存地址就是上一次操作AT24C02的地址加1。例如，上一次MCU是往地址10写入10个数据，那么连续读的起始内存地址就是10+10+1=21。

### 9.2.3 EEPROM驱动程序

上一小节分析了EEPROM的驱动后，对于程序设计可以归纳出如下图的流程图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image16.png) 

1. 中断回调函数

这3个是EEPROM驱动程序设计中的辅助函数：中断回调函数、等待发送/接收完成函数，用以确保通信的状态正常。中断回调函数的原型和实现在前文已经展示过，代码如下：

```c
static volatile bool gI2CTxCplt = false;
static volatile bool gI2CRxCplt = false;
void sci_i2c4_master_callback(i2c_master_callback_args_t *p_args)
{
    if(I2C_MASTER_EVENT_RX_COMPLETE == p_args->event)
    {
        gI2CRxCplt = true;
    }
    else if(I2C_MASTER_EVENT_TX_COMPLETE == p_args->event)
    {
        gI2CTxCplt = true;
    }
}
```

2. 等待发送/接收完成函数

等待发送完成和等待接收完成前文也已经展示过，代码如下：

```c
static void I2C4WaitTxCplt(void)
{
    uint16_t wTimeout = 50;
    while(!gI2CTxCplt && wTimeout)
    {
        R_BSP_SoftwareDelay(1, BSP_DELAY_UNITS_MILLISECONDS);
        wTimeout--;
    }
    gI2CTxCplt = false;
}
static void I2C4WaitRxCplt(void)
{
    uint16_t wTimeout = 50;
    while(!gI2CRxCplt && wTimeout)
    {
        R_BSP_SoftwareDelay(1, BSP_DELAY_UNITS_MILLISECONDS);
        wTimeout--;
    }
    gI2CRxCplt = false;
}
```

这两个用的超时等待机制是：收发都必须满足50ms的等待，不管中途收发完成标志是否已经满足。

这个延时时间的理由是EEPROM芯片AT24C02的写周期最大是5ms，以一次发送一个设备地址+内存地址+一页数据的字节个数，也就是10个字节的数据量计算，得到了50ms的延时时间。

3. I2C设备对象封装

本书是以面向对象思想来编程，因而在使用I2C通信时，也将AT24C02的操作封装为了如下结构体对象：

```c
typedef struct I2CDev{
    char    *name;
    int     (*Init)(struct I2CDev *ptDev);
    int     (*Write)(struct I2CDev *ptDev, unsigned char ucAddr, unsigned char const *wBuf, unsigned int dwSize);
    int     (*Read)(struct I2CDev *ptDev, unsigned char ucAddr,  unsigned char *rBuf, unsigned int dwSize);
}I2CDev, *PI2CDev;
```

I2C设备对象的操作其实只有初始化和读写操作，因而做了如上的设备对象封装。用户在驱动程序中实现这些操作函数，然后进行如下的注册：

```c
static I2CDev gEepromDev = {
                             .name  = "EEPROM",
                             .Init  = EEPROMDrvInit,
                             .Write = EEPROMDrvWriteBuff,
                             .Read  = EEPROMDrvRead
};
```

最后再使用一个函数将此设备提供给上层应用：

```c
struct I2CDev* EEPROMGetDevice(void)
{
    return &gEepromDev;
}
```

用户在应用程序中只需要使用此函数得到I2CDev结构返指针，然后调用里面Write/Read函数进行数据收发即可。后文将会对每个操作函数进行程序设计的分析。

4. I2C设备初始化函数

AT24C02不需要设置什么参数，因而只需要打开I2C总线即可，代码如下：

```c
static int EEPROMDrvInit(struct I2CDev* ptDev)
{
    if(NULL == ptDev->name)    return -1;
    fsp_err_t err = g_i2c4.p_api->open(g_i2c4.p_ctrl, g_i2c4.p_cfg);
    if(FSP_SUCCESS == err)
    {
        printf("Success to open device: i2c4!\r\n");
        return 0;
    }
    else
        printf("Failed to open device: i2c4!\r\n");

    return -1;
}
```

5. EEPROM单字节写函数

单字节写EEPROM，只需要传输目标内存地址、要发送的数据即可，写完之后要发送停止信号（restart=false），代码如下：

```c
static int EEPROMDrvWriteByte(struct I2CDev* ptDev, unsigned char ucAddr, unsigned char const ucData)
{
    if(NULL == ptDev->name)    return -1;

    uint16_t wData = (uint16_t)((ucData<<8) | ucAddr);
    /* 发送一个字节的地址数据 */
    g_i2c4.p_api->write(g_i2c4.p_ctrl, (unsigned char*)&wData, (unsigned int)2, false);
    I2C4WaitTxCplt();

    return 0;
}
```

6. EEPROM页写函数

页写同样是需要传输起始页地址和写入的数据，并且要表明往该页写多少个数据，因而封装了如下的代码：

```c
static int EEPROMDrvWritePage(struct I2CDev* ptDev, unsigned char ucAddr, unsigned char const* wbuf, unsigned int dwSize)
{
    if(NULL == ptDev->name)    return -1;
    unsigned char data[9] = {0};
    data[0] = ucAddr;
    for(unsigned char i=0; i<dwSize; i++)
    {
        data[i+1] = wbuf[i];
    }
    g_i2c4.p_api->write(g_i2c4.p_ctrl, (unsigned char*)data, (unsigned int)(dwSize+1), false);
    I2C4WaitTxCplt();
    R_BSP_SoftwareDelay((dwSize+1)*5, BSP_DELAY_UNITS_MILLISECONDS);
    return 0;
}
```

上述函数并未判断地址是否超过页地址的极限，如果读者不希望发生从页起始地址覆盖写操作，可以自行加入判断。

7. 综合写函数

综合写就要考虑多种情况：是否是单字节写？如果是多字节写，起始地址是否和页地址对齐（8的倍数）？如果没对齐该怎样处理？写入的数量该如何和地址配合完成连续写而不是覆盖页写？

基于这些考量，本书设计了如下图的程序流程图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image17.png) 

根据此流程图得到了下面的代码：

```c
static int EEPROMDrvWriteBuff(struct I2CDev* ptDev, unsigned char ucAddr, unsigned char const* wbuf, unsigned int dwSize)
{
    if(NULL == ptDev->name)    return -1;

    if(dwSize == 1)
        return EEPROMDrvWriteByte(ptDev, ucAddr, *wbuf);

    /* 如果从当前地址开始写size字节会超过EEPROM的容量则返回错误值-1 */
    if((ucAddr+dwSize) >= 256)      return -1;

    unsigned char nAddr = ucAddr;
    /* 不管从何处开始，都将从起始地址开始把所在页写满 */
    /* 或者不会写满的情况下，从起始位置开始写size个字节 */
    unsigned char ucSize;  /* 当前写入的数据个数 */
    if( (ucAddr==0 || (ucAddr/EE_PAGE_SIZE)!=0) && (dwSize<=EE_PAGE_SIZE))
        ucSize = (unsigned char)dwSize;
    else
        ucSize = EE_PAGE_SIZE - (ucAddr % EE_PAGE_SIZE);
    EEPROMDrvWritePage(ptDev, nAddr, wbuf, ucSize);

    /* 写满起始位置开始的那一页之后，要将位置、数据地址和个数进行偏移计算 */
    nAddr += ucSize;
    wbuf += ucSize;
    dwSize -= ucSize;

    /* 如果写满起始地址所在页后还有数据，就进行下一步处理 */
    while(dwSize != 0)
    {
        /* 如果剩余数据个数大于一页的个数，就写满下一页 */
        /* 否则将剩余数据全部写到下一页 */
        if(dwSize <= EE_PAGE_SIZE)
            ucSize = (unsigned char)dwSize;
        else
            ucSize = EE_PAGE_SIZE;

        EEPROMDrvWritePage(ptDev, nAddr, wbuf, ucSize);
        /* 继续偏移 */
        nAddr += ucSize;
        wbuf += ucSize;
        dwSize -= ucSize;
    }

    return 0;
}
```

8. EEPROM读函数

结合前文的驱动解析已知，当主机向AT24C02读取数据时，只要不发送停止信号，就可以一直连续的读，AT24C02会将地址自动增1。利用此特点和AT24C02随机地址读数据的时序要求，设计了下面这样的代码：

```c
static int EEPROMDrvRead(struct I2CDev* ptDev, unsigned char ucAddr, unsigned char* rbuf, unsigned int dwSize)
{
    if(NULL == ptDev->name)    return -1;

    /* 发送一个字节的地址数据 */
    g_i2c4.p_api->write(g_i2c4.p_ctrl, (unsigned char*)&ucAddr, (unsigned int)1, true);
    I2C4WaitTxCplt();
    /* 读取该地址的一个字节数据 */
    R_BSP_SoftwareDelay(300, BSP_DELAY_UNITS_MICROSECONDS);
    g_i2c4.p_api->read(g_i2c4.p_ctrl, (unsigned char*)rbuf, (unsigned int)dwSize, false);
    I2C4WaitRxCplt();
    return 0;
}
```

本实验期望的是主机读取了一帧size字节的数据后就不再接收数据了，因而read的restart参数设置为false。

### 9.2.4 EEPROM读写测试程序

本章的实验分为两种：单字节读写和多字节跨页读写。将测试程序放到了0901_sci_i2c_eeprom\applications\app_eeprom.c文件中，并且在该目录下的app.h对测试函数进行了声明。

本次实验使用的测试方法有两种：在EEPROM的随机地址处写入和读出单个字节的数据、在随机地址处写入和读出随机大小的字节数据。将写入和读出的数据进行比较，打印测试结果。

基于此方法封装了两个测试功能：单字节读写和多字节读写:

```c
void EEPROMAppTest(void)
{
    I2CDev *ptEepromDev = EEPROMGetDevice();
    if(NULL == ptEepromDev) return;
    if(0 != ptEepromDev->Init(ptEepromDev)) return;
    uint8_t ucCount = 10;
    printf("Start Test Simple I2C Write/Read a Byte From AT24C02\r\n");
    printf("\t|  Write  | Read | Result  | Count |\r\n");
    while(ucCount)
    {
        uint8_t ucWData = (uint8_t)rand();
        uint8_t ucRData = 0;
        uint8_t addr = (uint8_t)rand();
        ptEepromDev->Write(ptEepromDev, addr, &ucWData, 1);
        R_BSP_SoftwareDelay(10, BSP_DELAY_UNITS_MILLISECONDS);
        ptEepromDev->Read(ptEepromDev, addr, &ucRData, 1);
        R_BSP_SoftwareDelay(10, BSP_DELAY_UNITS_MILLISECONDS);
        printf("\t|   %.3d   | %.3d  |", ucWData, ucRData);
        if(ucWData == ucRData)
            printf(" %s |   %.2d  |\r\n", "Success", ucCount);
        else
            printf(" %s |  %.3d  |\r\n", "Error", ucCount);
        ucCount--;
    }
    printf("Start Test Simple I2C Write/Read n Bytes From AT24C02\r\n");
    printf("\t| Address | Size | Result  | Count |\r\n");
    ucCount = 5;
    uint8_t wbuf[256];
    uint8_t rbuf[256];
    while(ucCount)
    {
        uint8_t ucAddr = (uint8_t)rand();
        uint8_t size = (uint8_t)rand();
        for(uint16_t i=0; i<256; i++)
        {
            wbuf[i] = (uint8_t)i;
        }
        size = (uint8_t)(((ucAddr+size)>256)?(256-ucAddr):size);
        printf("\t|   %.3d   | %.3d  |", ucAddr, size);
        ptEepromDev->Write(ptEepromDev, ucAddr, wbuf, size);
        R_BSP_SoftwareDelay(100, BSP_DELAY_UNITS_MILLISECONDS);
        ptEepromDev->Read(ptEepromDev, ucAddr, rbuf, size);
        uint16_t err_c = 0;
        for(uint16_t i=0; i<size; i++)
        {
            if(rbuf[i] != wbuf[i])
            {
                err_c++;
            }
        }
        if(0 == err_c)
            printf(" %s |   %.2d  |\r\n", "Success", ucCount);
        else
            printf(" %s |  %.3d  |\r\n", "Error", err_c);
        ucCount--;
        R_BSP_SoftwareDelay(100, BSP_DELAY_UNITS_MILLISECONDS);
    }
}
```

### 9.2.5 上机实验

在hal_entry.c的hal_entry()函数中初始UART设备和I2C设备并且调用两个测试函数，代码如下：

```c
#include "drv_uart.h"
#include "app.h"
#include "hal_data.h"
void hal_entry(void)
{
    /* TODO: add your own code here */
    UARTDrvInit();
    EEPROMAppTest();
}
```

编译烧写到处理器运行后，可以得到如下的结果：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-9/image18.png" style="zoom:150%;" /> 