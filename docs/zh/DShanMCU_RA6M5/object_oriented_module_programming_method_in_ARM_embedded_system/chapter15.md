# 第15章 Common I2C总线模块

本章目标

- 使用RASC快速配置Common I2C模块
- 学会使用i2c的API驱动触摸芯片，获取触点数据

## 15.1 Common I2C模块的使用

RA芯片的I2C分为Simple I2C和Common I2C。Simple I2C就是本书《第8章 SCI SPI》所讲的SCI模块的I2C模式，是使用串行总线来模拟I2C协议，而本章所讲的Common I2C是芯片内部实际存在的一个硬件I2C控制器模块。

得益于FSP的封装，Simple I2C和Common I2C在应用上并没有很大的差别。

### 15.1.1 I2C模块的配置

要配置I2C模块，先在RASC的“Pin Configuration”里的“Peripherals”找到“Connectivity:IIC”，然后根据硬件设计选择I2C通道。比如本书使用的是P409/P410作为I2C的SDA和SCL，这两个IO属于I2C2的A组引脚，因而选择“IIC2”，然后在展开的引脚配置中的“Pin Group Selection”选择“_A_only”并且使能操作模式，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-15/image1.png) 

接着再去“Stacks”里添加I2C的模块。点击“New Stack”，选择“Connectivity”，再选择里面的“I2C Master(r_iic_master)”。本章目标是作为主机去读取触摸屏的数据，所以选择Master，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-15/image2.png) 

当添加了I2C的Master模块后，就要去配置它的参数来。本章实验在RASC中配置I2C的参数具体如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-15/image3.png)

- Name：I2C模块的名称，需要满足C语言字符串标准；
- Channel：I2C模块的通道；
- Rate：I2C通信速率，Standard支持的最大速率400kbps，快速模式最大能达到1Mbps；
- Rise/Fall Time：SCL信号上升沿和下降沿的耗时；

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-15/image4.png)  

- Duty Cycle：SCL时钟线的占空比，范围是4%~96%，默认是50%；
- Slave Address：从机设备地址，根据从机芯片设置；
- Address Mode：地址模式，支持7-Bit和10-Bit；
- Timeout Mode：数据检测超时模式，支持long mode和short mode。long mode的超时计数器是16bit的，short mode的超时计数器是14bit的；当超时计数溢出都没有检测到数据则通信中止；
- Timeout during SCL Low：在SCL低电平时是否使能超时检测，默认是Enabled；
- Callback：中断回调函数名称，建议和通道匹配，例如i2c1_callback；
- Interrupt Priority Level：I2C中断优先级； 

### 15.1.2 配置信息解读

配置信息分为两部分：引脚的配置信息、I2C模块的配置信息。

使用RASC配置好参数并生成工程后，会在工程的pin_data.c中生成模块的引脚信息，在hal_data.c中生成模块的配置信息。

1. I2C模块的引脚信息

I2C涉及的引脚，它们的配置信息在工程的pin_data.c中生成。在RASC里配置的每一个引脚，都会在pin_data.c生成一个ioport_pin_cfg_t数组项，里面的内容跟配置时选择的参数一致。代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
    ......（省略内容）
    { .pin = BSP_IO_PORT_04_PIN_09,
      .pin_cfg = ((uint32_t) IOPORT_CFG_DRIVE_MID 
                | (uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
                | (uint32_t) IOPORT_PERIPHERAL_IIC)},
    { .pin = BSP_IO_PORT_04_PIN_10,
      .pin_cfg = ((uint32_t) IOPORT_CFG_DRIVE_MID 
                | (uint32_t) IOPORT_CFG_PERIPHERAL_PIN 
                | (uint32_t) IOPORT_PERIPHERAL_IIC)},
    ......（省略内容）
};
```

这个常量数组将P5409和P410配置为I2C外设复用功能。

2. I2C模块的配置信息

I2C的配置信息会在hal_data.c中的i2c_master_cfg_t结构体类型常量g_i2c_master2_cfg中定义，代码如下：

```c
const i2c_master_cfg_t g_i2c_master2_cfg =
{
    .channel             = 2,
    .rate                = I2C_MASTER_RATE_STANDARD,
    .slave               = 0x14,
    .addr_mode           = I2C_MASTER_ADDR_MODE_7BIT,
    ......（省略内容）
    .p_callback          = i2c2_callback,
    .p_context           = NULL,
    ......（省略内容）
    .ipl                 = (12),
    .p_extend            = &g_i2c_master2_extend,
};
```

- 第03行：通道设置为2；
- 第04行：通信速率设置为标准速率；
- 第05行：从机地址是0x14；
- 第06行：地址模式为7bit模式；
- 第08行：设置中断函数名为i2c2_callback；

使用I2C的open函数时，就会使用这个常量来初始化I2C模块。

### 15.1.3 中断回调函数

在g_i2c_master2_cfg用到了名为“i2c1_callback”的函数，此函数仅在hal_data.h中进行了如下声明，但是没有实现：

```c
#ifndef i2c1_callback
void i2c1_callback(i2c_master_callback_args_t * p_args);
#endif
```

需要用户实现这个函数，例如：

```c
void i2c1_callback(i2c_master_callback_args_t * p_args)
{
    switch (p_args->event)
    {
    }
}
```

这个中断回调函数的参数是i2c_master_callback_args_t结构体指针，此结构体的原型如下：

```c
typedef struct st_i2c_master_callback_args
{
    void const       * p_context;      ///< Pointer to user-provided context
    i2c_master_event_t event;          ///< Event code
} i2c_master_callback_args_t;
```

其中事件成员是一个枚举类型，囊括的事件类型有：

```c
typedef enum e_i2c_master_event
{
    I2C_MASTER_EVENT_ABORTED     = 1,  ///< A transfer was aborted
    I2C_MASTER_EVENT_RX_COMPLETE = 2,  ///< A receive operation was completed successfully
    I2C_MASTER_EVENT_TX_COMPLETE = 3   ///< A transmit operation was completed successfully
} i2c_master_event_t;
```

从此可以知道，触发I2C中断的原因有：发送完成、接收完成、传输中止。它们触发中断后，会调用回调函数以执行用户的代码。

### 15.1.4 API接口及其应用

在I2C模块的FSP库函数头文件r_i2c_master_api.h中，定义了I2C主机设备的操作函数结构体i2c_master_api_t，原型如下：

```c
/** Interface definition for I2C access as master */
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

I2C主机设备支持的操作有：open/read/write/close等，FSP在r_iic_master.c中实现了这个结构体：

```c
/* IIC Implementation of I2C device master interface */
i2c_master_api_t const g_i2c_master_on_iic =
{
    .open            = R_IIC_MASTER_Open,
    .read            = R_IIC_MASTER_Read,
    .write           = R_IIC_MASTER_Write,
    .abort           = R_IIC_MASTER_Abort,
    .slaveAddressSet = R_IIC_MASTER_SlaveAddressSet,
    .close           = R_IIC_MASTER_Close,
    .statusGet       = R_IIC_MASTER_StatusGet,
    .callbackSet     = R_IIC_MASTER_CallbackSet
};
```

本章以对I2C主机设备的打开关闭和读写为例进行分析。

1. 打开I2C主机设备

打开I2C主机设备的函数指针原型如下：

```c
/** Opens the I2C Master driver and initializes the hardware.
 * @param[in] p_ctrl    Pointer to control block. Must be declared by user. Elements are set here.
 * @param[in] p_cfg     Pointer to configuration structure.
 */
fsp_err_t (* open)(i2c_master_ctrl_t * const p_ctrl, i2c_master_cfg_t const * const p_cfg);
```

- p_ctrl：指向I2C主机控制块，比如g_i2c_master2_ctrl；
- p_cfg：指向I2C主机参数配置结构体常量，比如g_i2c_master2_cfg；

p_ctrl的类型是iic_master_instance_ctrl_t结构体，在I2C通信的时候会改变此结构体中的设备状态、地址值、读写状态和应答状态等。

p_cfg的类型是i2c_master_cfg_t，此结构体被用来表示I2C主机的配置，例如I2C的通道、中断号、收发函数和中断回调函数等。

用户可以参照如下代码来打开I2C主机设备，它的内部会进行初始化：

```c
fsp_err_t err = g_i2c_master2.p_api->open(g_i2c_master2.p_ctrl, g_i2c_master2.p_cfg);
if (FSP_SUCCESS != err)
{
    printf("%s %d\r\n", __FUNCTION__, __LINE__);
    return;
}
```

2. 关闭I2C主机设备

关闭I2C设备的函数指针原型如下：

```
fsp_err_t (* close)(i2c_master_ctrl_t * const p_ctrl);
```

它的参数p_ctrl指向I2C主机控制块，此函数会将控制块中的I2C状态改变为关闭状态。

3. I2C接收数据函数

I2C接收数据的函数指针原型如下：

```c
fsp_err_t (* read)(i2c_master_ctrl_t * const p_ctrl, 
                   uint8_t * const p_dest, 
                   uint32_t const bytes,
                   bool const restart);
```

- p_ctrl：指向I2C主机设备控制块；
- p_dest：目的数据（用来接收数据）的地址；
- bytes：要接收的数据个数，单位是字节；
- restart：主机接收完一帧数据后的操作，true-接收完一帧数据后主机不发送停止信号而是发送Start信号继续传输，false-接收完一帧数据后主机发送停止信号。

开发者可以参考如下代码来读取数据：

```c
fsp_err_t err = g_i2c_master2.p_api->read(g_i2c_master2.p_ctrl, buf, len, 0);
if (FSP_SUCCESS != err)
{
    printf("%s %d\r\n", __FUNCTION__, __LINE__);
    return;
}
```

4. I2C发送数据函数

I2C主机设备向从机设备发送数据的函数指针原型如下：

```c
    fsp_err_t (* write)(i2c_master_ctrl_t * const p_ctrl, 
                        uint8_t * const p_src, 
                        uint32_t const bytes,
                        bool const restart);
```

- p_ctrl：执行I2C主机设备控制块，主机发送数据的时候会根据控制块的地址等信息发起开始信号、应答信号等；
- p_dest：目的数据（用来接收数据）的地址；
- bytes：要发送的数据个数，单位是字节；
- restart：发送完此帧数据后的操作：true表示不会发出Stop信号而是马上发出Start信号——这样可以一直霸占I2C总线，false表示发出Stop信号（大家重新竞争I2C总线）；

开发者可以参考如下代码来进行I2C的数据发送：

```c
fsp_err_t err = g_i2c_master2.p_api->write(g_i2c_master2.p_ctrl, tmpbuf, 2, 0);
if (FSP_SUCCESS != err)
{
    printf("%s %d\r\n", __FUNCTION__, __LINE__);
    return;
}
```

## 15.2 Common I2C驱动触摸屏实验

### 15.2.1 硬件连接

本章使用的是外接触摸屏，使用FPC排线与主板相连，FPC的I2C原理图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-15/image5.png)

使用的引脚是P409和P410。

### 15.2.2 GT911驱动解析

GT911是一款拥有5点电容触摸点位、拥有26个驱动通道和14个感应通道的触控芯片，可以同时识别5个触摸点位的实时准确位置、移动轨迹和触摸面积，并且根据主控需要，读取相应点为的触摸信息。

GT911的通信是标准的I2C通信协议，主机在和GT911进行I2C通信的时候需要满足I2C总线的标准协议。GT911的I2C从机设备地址定义如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-15/image6.png)  

它支持两种地址，使用哪个地址取决于GT911发生复位后INT引脚的电平。如果复位时，INT引脚是高电平，则地址是0x14/0x28/0x29；否则就是0x5D,0xBA/0xBB。

本章实验设计选择的是地址0x14。

通过发送指令和读写数据来驱动GT911，不同的指令支持的数据个数不同：一个指令对应一个寄存器的数据，也可能一个指令对应N个寄存器的数据。以读取点位数据指令0x8157为例，用户发送0x8157指令后可以连续读取7个字节的数据（触控点位ID和触控位置信息）：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-15/image7.png)  

### 15.2.3 GT911驱动程序

本章实验仅仅是简单地获取触点的位置信息。对于触摸设备，因对它的基本要求无非就是获取触摸点位信息，因而本章将抽象为“触摸设备”，在drv_touch.h中用一个结构体来描述这一类触摸设备：

```c
typedef struct TouchDev{
    char *name;
    void (*Init)(struct TouchDev *ptDev);
    bool (*Read)(struct TouchDev *ptDev, unsigned short *pX, unsigned short *pY);
}TouchDev, *PTouchDev;
```

对于这一类触摸设备，应用层对它的操作只涉及：初始化、读取触摸位置。因而TouchDev结构体里只有Init、Read两个函数指针。

而对于具体的触摸驱动芯片，需要实现自己的TouchDev结构体。本章在drv_gt911.c中进行了实现TouchDev结构体，接下来对它的函数进行一一说明。

1. 中断回调函数

在I2C通信过程中，需要上一次的传输完成后才能开始下一次传输，因而需要通过I2C的中断触发事件来判断上一次传输是否已经完成，代码如下：

```c
static volatile bool gI2C2TxCplt = false;
static volatile bool gI2C2RxCplt = false;
void i2c2_callback(i2c_master_callback_args_t * p_args)
{
    switch (p_args->event)
    {
        case I2C_MASTER_EVENT_TX_COMPLETE:
        {
            gI2C2TxCplt = true;
            break;
        }
        case I2C_MASTER_EVENT_RX_COMPLETE:
        {
            gI2C2RxCplt = true;
            break;
        }
        default:
        {
            gI2C2TxCplt = gI2C2RxCplt = false;
            break;
        }
    }
}
```

- 第07~11行：如果触发中断的事件类型是发送完成事件，则将发送完成标志位置true；
- 第12~16行：如果触发中断的事件类型是接收完成事件，则将接收完成标志位置true；

2. 收发超时等待函数

本章实现了2个等待函数，里面加入了超时机制，代码如下：

```c
static void I2C2WaitTxCplt(void)
{
    uint16_t wTimeOut = 100;
    while(!gI2C2TxCplt && wTimeOut)
    {
        HAL_Delay(1);
        wTimeOut--;
    }
    gI2C2TxCplt = false;
}

static void I2C2WaitRxCplt(void)
{
    uint16_t wTimeOut = 100;
    while(!gI2C2RxCplt && wTimeOut)
    {
        HAL_Delay(1);
        wTimeOut--;
    }
    gI2C2RxCplt = false;
}
```

3. 写GT911寄存器函数

写GT911的寄存器时，要发出寄存器地址、寄存器数据。数据个数可能各有不同，函数里动态分配内存，用来保存寄存器地址、寄存器数据，然后一次性发送出去。参考如下代码：

```c
static void GT911DrvWriteReg(uint16_t reg, uint8_t *buf, uint8_t len)
{
    uint8_t regl = (uint8_t)(reg & 0xff);
    uint8_t regh = (uint8_t)(reg>>8);
    uint8_t * write_package = (uint8_t*)malloc((len + 2) * sizeof(uint8_t));
    memcpy(write_package, &regh, 1);
    memcpy(write_package + 1, &regl, 1);
    memcpy(write_package + 2, buf, len);
    fsp_err_t err = g_i2c_master2.p_api->write(g_i2c_master2.p_ctrl, write_package, len + 2, 0);
    if (FSP_SUCCESS != err)
    {
        printf("%s %d\r\n", __FUNCTION__, __LINE__);
        return;
    }
    I2C2WaitTxCplt();
    free(write_package);
}
```

- 第05~08行：根据传入的数据长度，动态分配数据包，并将指令和数据进行打包组合，以便调用I2C的write函数一次性发送出去；
- 第09行：调用write函数发送数据包，发送完之后不再接着发送数据，因而最后一个参数restart=0；

4. 读GT911寄存器函数

读寄存器时，要先发出寄存器地址，再读入数据。代码如下：

```c
static void GT911DrvReadReg(uint16_t reg, uint8_t *buf, uint8_t len)
{
    uint8_t tmpbuf[2];

    tmpbuf[0] = (uint8_t)(reg >> 8);
    tmpbuf[1] = (uint8_t)(reg &0xff);
    fsp_err_t err = g_i2c_master2.p_api->write(g_i2c_master2.p_ctrl, tmpbuf, 2, 0);
    if (FSP_SUCCESS != err)
    {
        printf("%s %d\r\n", __FUNCTION__, __LINE__);
        return;
    }
    I2C2WaitTxCplt();
    err = g_i2c_master2.p_api->read(g_i2c_master2.p_ctrl, buf, len, 0);
    if (FSP_SUCCESS != err)
    {
        printf("%s %d\r\n", __FUNCTION__, __LINE__);
        return;
    }
    I2C2WaitRxCplt();
}
```

5. 各类ID读取函数

GT911有多种ID供用户获取，以获取GT911的生产ID为例，它需要主机发送寄存器指令0x8140给GT911，然后读取4个字节的ID数据，代码如下：

```c
static uint32_t GT911DrvReadProductID(void)
{
    uint32_t id = 0;
    GT911DrvReadReg(GT911_PRODUCT_ID_REG, (uint8_t*)&id ,4);
    return id;
}
```

其它的ID也可以参考这样的写法实现，本章的工程1501_i2c_touch为读者封装了这几个ID读取函数：

```c
static uint32_t GT911DrvReadProductID(void);
static uint32_t GT911DrvReadVendorID(void);
static uint8_t GT911DrvReadVersion(void);
static uint8_t GT911DrvGetGSTID(void);
```

6. 清除点位寄存器

在每次读取了触摸点位寄存器的数据后，需要将寄存器的数据清除掉，以便下一次触摸时更新寄存器的数据。如果不清除坐标寄存器的数据的话，每次读取都会得到一个固定值0x7F。

清除坐标寄存器的地址是0x814E，用户只需要往这个寄存器写入一个零即可，代码如下：

```c
static void GT911DrvClearBuf(void)
{
    uint8_t data = {0};
    GT911DrvWriteReg(GT911_CLEARBUF_REG, (uint8_t*)&data, 1);
}
```

7. 抽象GT911触摸屏设备对象

对于GT911触摸设备，本章根据其参数特性进行了封装，来表示GT911的触摸区域和触摸点位，参考以下在drv_gt911.h中的代码设计：

```c
typedef enum{
    TP_ROT_NONE = 0,
    TP_ROT_90,
    TP_ROT_180,
    TP_ROT_270
} TouchRotation_t;

/**用于存放每一个触控点的id，坐标，大小**/
typedef struct TouchPointInfo{
    unsigned char id;
    unsigned short x;
    unsigned short y;
    unsigned short size;
}TouchPointInfo_t;

/**类结构体**/
typedef struct TouchDrv{
    unsigned char  ucAddr;
    unsigned short wHeight;
    unsigned short wWidth;
    TouchRotation_t tRotation;
    TouchPointInfo_t tPointsInfo[TOUCH_POINT_TOTAL]; //用于存储五个触控点的坐标
}TouchDrv_t;
```

在后续的设计中，通过定义结构体TouchDrv_t变量来表示一个GT911设备：

```
static struct TouchDrv gTP;
```

8. 读取GT911触摸点位函数

在分析GT911的数据读写时，曾以读取某一个点位的数据为例，了解了一个点位拥有7个数据信息。而GT911共有5个点位信息可以获取，对应的寄存器地址在drv_gt911.h中以宏定义的形式体现：

```c
#define GT_TP1_REG      0X814F      //第一个触摸点数据地址
#define GT_TP2_REG      0X8157      //第二个触摸点数据地址
#define GT_TP3_REG      0X815F      //第三个触摸点数据地址
#define GT_TP4_REG      0X8167      //第四个触摸点数据地址
#define GT_TP5_REG      0X816F      //第五个触摸点数据地址
```

什么情况下才需要去读取点位信息呢？有触摸事件发生的时候。而用户该如何获知GT911是否有被触摸呢？它用一个寄存器来表示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-15/image8.png)  

- Bit-7:buffer_status，1-有触摸数据等待主机读取；0-没有数据；
- Bit-6:large detect,1-表示有大片区域被触摸了；
- Bit-4:HaveKey,1-正在被触摸；0-没有被触摸或者松开触摸了；
- Bit-[3:0]:触摸的点数；

用户可以根据这6个寄存器指令来获取每次触摸的点位信息了，参考如下代码：

```c
static bool GT911DrvIsTouched(TouchDrv_t * tp)
{
    uint8_t touched_state, touch_num, buffer_status;
    touched_state = GT911DrvGetGSTID();
    touch_num = touched_state & 0xf;            //触点数量
    buffer_status = (touched_state >> 7) & 1;   // 帧状态

    if(buffer_status == 1 && (touch_num <= TOUCH_POINT_TOTAL) && (touch_num > 0))
    {
        uint16_t pointers_regs[TOUCH_POINT_TOTAL] = {GT_TP1_REG, GT_TP2_REG, GT_TP3_REG, GT_TP4_REG, GT_TP5_REG};
        // 获取每个触控点的坐标值并保存
        for (int i = 0; i < touch_num; ++i)
        {
            uint8_t point_info_per_size = 7;
            uint8_t * point_info_p = malloc(point_info_per_size * sizeof(uint8_t ));
            GT911DrvReadReg(pointers_regs[i], point_info_p, point_info_per_size);

            tp->tPointsInfo[i].id = point_info_p[0];
            tp->tPointsInfo[i].x = (unsigned short)(point_info_p[1] + (point_info_p[2] << 8));
            tp->tPointsInfo[i].y = (unsigned short)(point_info_p[3] + (point_info_p[4] << 8));
            tp->tPointsInfo[i].size = (unsigned short)(point_info_p[5] + (point_info_p[6] << 8));

            free(point_info_p);

            //旋转方向
            uint16_t temp;
            switch (tp->tRotation)
            {
                case TP_ROT_NONE:
                    tp->tPointsInfo[i].x = tp->wWidth - tp->tPointsInfo[i].x;
                    tp->tPointsInfo[i].y = tp->wHeight - tp->tPointsInfo[i].y;
                    break;
                case TP_ROT_270:
                    temp = tp->tPointsInfo[i].x;
                    tp->tPointsInfo[i].x = tp->wWidth - tp->tPointsInfo[i].y;
                    tp->tPointsInfo[i].y = temp;
                    break;
                case TP_ROT_180:
//                    tp->tPointsInfo[i].x = tp->tPointsInfo[i].x;
//                    tp->tPointsInfo[i].y = tp->tPointsInfo[i].y;
                    break;
                case TP_ROT_90:
                    temp = tp->tPointsInfo[i].x;
                    tp->tPointsInfo[i].x = tp->tPointsInfo[i].y;
                    tp->tPointsInfo[i].y = tp->wHeight - temp;
                    break;
                default:
                    break;
            }
        }
        GT911DrvClearBuf();
        return true;
    }
    //必须给GT911_POINT_INFO缓冲区置0,不然读取的数据一直为128！！！！
    GT911DrvClearBuf();
    return false;
}
```

另外，为了和之前抽象出来的触摸设备（TouchDev）相匹配，还要在此基础上封装一个Read函数：

```c
static bool GT911DrvRead(struct TouchDev *ptDev, unsigned short *pX, unsigned short *pY)
{
    if(NULL == ptDev->name) return false;
    if(GT911DrvIsTouched(&gTP))
    {
        *pX = gTP.tPointsInfo[0].x;
        *pY = gTP.tPointsInfo[0].y;
        return true;
    }

    return false;
}
```

9. GT911初始化函数

本章实验并未对GT911进行更精细的设置，因而并不没有修改它的寄存器。

本章的初始化函数仅仅初始化I2C设备、读取GT911的ID和触摸范围，参考如下代码：

```c
static void GT911DrvInit(struct TouchDev *ptDev)
{
    if(NULL == ptDev->name) return;
    uint8_t buf[4];
    gTP.ucAddr = (uint8_t)g_i2c_master2.p_cfg->slave;
    gTP.tRotation = TP_ROT_NONE;
    /* 初始化I2C驱动 */
    fsp_err_t err = g_i2c_master2.p_api->open(g_i2c_master2.p_ctrl, g_i2c_master2.p_cfg);
    if (FSP_SUCCESS != err)
    {
        printf("%s %d\r\n", __FUNCTION__, __LINE__);
        return;
    }
    /* 读ID */
    uint32_t nVendorID = GT911DrvReadVendorID();
    printf("gt911 vendor id: 0x%.4x\r\n", (int)nVendorID);
    uint32_t nProductID = GT911DrvReadProductID();
    printf("gt911 product id: 0x%.4x\r\n", (int)nProductID);
    uint8_t nVersion = GT911DrvReadVersion();
    printf("version = 0x%x\r\n", nVersion);
    GT911DrvReadReg(0x8048, buf, 2);
    gTP.wWidth = (unsigned short)((buf[1] << 8) | buf[0]);
    GT911DrvReadReg(0x804A, buf, 2);
    gTP.wHeight = (unsigned short)((buf[1] << 8) | buf[0]);
}
```

10. 触摸设备的注册和获取

以面向对象的思想，构造了一个TouchDev结构体gTouchDev，代码如下：

```c
static struct TouchDev gTouchDev = {
                                    .name = "GT911",
                                    .Init = GT911DrvInit,
                                    .Read = GT911DrvRead
};
```

然后再以一个函数将此设备返回给上层应用：

```c
struct TouchDev* TouchDevGet(void)
{
    return &gTouchDev;
}
```

### 15.2.4 测试程序

app_test.c是测试程序，它会打印触摸点的信息，代码如下：

```c
void TouchAppTest(void)
{
    TouchDev *ptDev = TouchDevGet();
    if(NULL == ptDev)
    {
        printf("Error. Not Found Touch Device!\r\n");
        return;
    }
    ptDev->Init(ptDev);
    uint16_t x = 0, y = 0;
    while(1)
    {
        if(ptDev->Read(ptDev, &x, &y) == true)
        {
            printf("Touch-Position: (%d,%d)\r\n", x, y);
        }
    }
}
```

### 15.2.5 上机实验

在hal_entry.c中的hal_entry()函数中，初始化滴答定时器、初始化调试串口，然后调用TouchAppTest函数进行测试。

当触摸屏幕的时候，串口助手就会打印例如下图这样的点位坐标信息：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-15/image9.png)  

 