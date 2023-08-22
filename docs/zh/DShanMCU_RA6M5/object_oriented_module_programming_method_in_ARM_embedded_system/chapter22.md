# 第22章 DMA控制器

本章目标

- 了解DMA基本概念和RA6M5处理器的DMAC模块；
- 学会使用RASC配置DMAC在指定内存间搬移数据；

## 22.1 DMA简介

DMA(Direct Memory Access)直接内存访问，可以大大减轻CPU工作量。CPU执行的众多指令中，有的用于计算、有的用于控制程序、有的用于转移数据等。其中转移数据的指令，尤其是转移大量数据，会占用大量CPU。如果是把外设A的数据，传给外设B，这种情况其实不需要CPU一直参与，只需在A、B之间创建个通道，让它们自己传输即可。这就是DMA设计的目的，在进行大量数据转移时较少CPU的干预，让DMA专注于数据转移，让CPU专注于计算、控制。

DMA主要实现将A处的数据直接搬运到B处，这里的A、B可以是内存（内/外部SRAM等），也可以是外设（UART、I2C、SPI、ADC等），因此所有的场景如下三种：

- 内存到外设
- 外设到内存
- 内存到内存

无论是以上何种方式，都是先设置好DMA的数据源地址、数据目标地址、数据长度。设置好后，启动DMA就可以自动地把数据从源地址依次传输到目标地址。

## 22.2 RA6M5处理器的DMAC控制器

### 22.2.1 DMAC的特性

RA6M5包括一个8通道的直接内存访问控制器（DMAC），可以在不需要CPU干预的情况下传输数据。当产生DMA传输请求时，DMAC将存储在传输源地址的数据传输到传输目标地址。其外设模块特性详见下表：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-22/image1.jpg)

![image2](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-22/image2.jpg)

### 22.2.2 DMAC的系统框图

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-22/image3.png)

## 22.3 DMAC模块配置

### 22.3.1 配置DMAC模块

1. 添加DMAC Stack模块

在RASC中配置DMAC时，首先需要去Stacks中添加DMAC的Stack模块，步骤如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-22/image4.png)

2. 配置 DMAC Stack属性

对于DMAC某个通道的Stack属性有许多参数可以配置，在不同的应用场景下需要重点关注的配置项可能有所不同。以软件触发DMAC在内存间传输数据为例，开发者应该关注DMAC在传输过程中每次传输的数据大小是多少位的，内存地址的变化是递增还是递减的，是否需要循环传输，所有的数据都传输完毕后是否需要触发完成中断等等。

软件触发DMAC在内存间传输数据的配置如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-22/image5.png)

- 通道：第0通道；
- 传输模式;正常模式；
- 每次传输的数据大小;2bytes-16bits;
- 地址变化：源地址和目的地址在每次传输完一个数据后都递增；
- 触发源：无，也就是软件触发；
- 中断回调函数：dma0_callback；
- 中断：所有的数据都传输完毕后才触发一次完成中断；

至于其它的参数，例如传输的数据个数，源数据buffer大小等，均可以在程序中根据每次实际的传输情况来实时修改。

### 22.3.2 DMAC配置信息解读

使用RASC配置了DMAC并生成代码后，会在hal_data.c中生成DMAC的设备对象g_dma0，它是transfer_instance_t类型的结构体。此结构体的成员表明了DMAC设备对象的控制参数、配置信息和操作api等信息：

```c
const transfer_instance_t g_dma0 =
{
    .p_ctrl        = &g_dma0_ctrl,
    .p_cfg         = &g_dma0_cfg,
    .p_api         = &g_transfer_on_dmac
};
```

1. p_ctrl：transfer_ctrl_t结构体类型指针成员，实际是void类型，指向dmac_instance_ctrl_t结构体类型的全局变量g_dma0_ctrl。dmac_instance_ctrl_t，明了DMAC设备对象的状态和类型：

```c
typedef struct st_dmac_instance_ctrl
{
    uint32_t open;                     // Driver ID

    transfer_cfg_t const * p_cfg;

    /* Pointer to base register. */
    R_DMAC0_Type * p_reg;
} dmac_instance_ctrl_t;
```

2. p_cfg：transfer_cfg_t结构体类型常量指针成员，指向同类型的g_dma0_cfg全局常量，g_dma0_cfg的成员取值来自RASC中对于该DMAC设备对象的配置：

```c
const transfer_cfg_t g_dma0_cfg =
{
    .p_info              = &g_dma0_info,
    .p_extend            = &g_dma0_extend,
};
```

2.1 g_dma0_info：表明DMAC设备对象的地址变化方式、传输数据大小等信息：

```c
transfer_info_t g_dma0_info =
{
    .transfer_settings_word_b.dest_addr_mode = TRANSFER_ADDR_MODE_INCREMENTED,
    .transfer_settings_word_b.repeat_area    = TRANSFER_REPEAT_AREA_SOURCE,
    .transfer_settings_word_b.irq            = TRANSFER_IRQ_END,
    .transfer_settings_word_b.chain_mode     = TRANSFER_CHAIN_MODE_DISABLED,
    .transfer_settings_word_b.src_addr_mode  = TRANSFER_ADDR_MODE_INCREMENTED,
    .transfer_settings_word_b.size           = TRANSFER_SIZE_2_BYTE,
    .transfer_settings_word_b.mode           = TRANSFER_MODE_NORMAL,
    .p_dest                                  = (void *) NULL,
    .p_src                                   = (void const *) NULL,
    .num_blocks                              = 0,
    .length                                  = 1,
};
```

2.2 g_dma0_extend：表明DMAC设备对象的中断、内存偏移大小、源数据内存大小等信息：

```c
const dmac_extended_cfg_t g_dma0_extend =
{
    .offset              = 1,
    .src_buffer_size     = 1,
#if defined(VECTOR_NUMBER_DMAC0_INT)
    .irq                 = VECTOR_NUMBER_DMAC0_INT,
#else
    .irq                 = FSP_INVALID_VECTOR,
#endif
    .ipl                 = (10),
    .channel             = 0,
    .p_callback          = dma0_callback,
    .p_context           = NULL,
    .activation_source   = ELC_EVENT_NONE,
};
```

- p_api：transfer_api_t结构体类型常量指针，指向在r_dmac.c中实现的g_transfer_on_dmac，里面含有各种操作函数；

### 22.3.3 中断回调函数

在RASC中设置中断回调函数的名字后，会在hal_data.h中声明次函数：

```c
#ifndef dma0_callback
void dma0_callback(dmac_callback_args_t * p_args);
#endif
```

用户需要实现此函数，例如在软件触发实验中的drv_dma.c中的实现此函数，代码如下：

```c
void dma0_callback(dmac_callback_args_t * p_args)
{
    (void)p_args;
    gDMAXferCplt = true;
}
```

在所有的数据都传输完毕后，中断被触发，进而调用这个回调函数。它只是设置一个变量表示DMA传输完毕。

### 22.3.4 DMAC的API及其用法

DMAC设备的接口函数在transfer_api_t结构体中声明，结构体原型如下：

```c
typedef struct st_transfer_api
{
    fsp_err_t (* open)(transfer_ctrl_t * const p_ctrl, 
                       transfer_cfg_t const * const p_cfg);
    fsp_err_t (* reconfigure)(transfer_ctrl_t * const p_ctrl, 
                              transfer_info_t * p_info);
    fsp_err_t (* reset)(transfer_ctrl_t * const p_ctrl, 
                        void const * p_src, void * p_dest,
                        uint16_t const num_transfers);
    fsp_err_t (* enable)(transfer_ctrl_t * const p_ctrl);
    fsp_err_t (* disable)(transfer_ctrl_t * const p_ctrl);
    fsp_err_t (* softwareStart)(transfer_ctrl_t * const p_ctrl, 
                                transfer_start_mode_t mode);
    fsp_err_t (* softwareStop)(transfer_ctrl_t * const p_ctrl);
    fsp_err_t (* infoGet)(transfer_ctrl_t * const p_ctrl, 
                          transfer_properties_t * const p_properties);
    fsp_err_t (* close)(transfer_ctrl_t * const p_ctrl);
} transfer_api_t;
```

此结构体在r_dmac.c中实现，代码如下：

```c
const transfer_api_t g_transfer_on_dmac =
{
    .open          = R_DMAC_Open,
    .reconfigure   = R_DMAC_Reconfigure,
    .reset         = R_DMAC_Reset,
    .infoGet       = R_DMAC_InfoGet,
    .softwareStart = R_DMAC_SoftwareStart,
    .softwareStop  = R_DMAC_SoftwareStop,
    .enable        = R_DMAC_Enable,
    .disable       = R_DMAC_Disable,
    .close         = R_DMAC_Close,
};
```

接下来就来了解下这些函数的用法。

1. 打开DMAC设备对象

```c
fsp_err_t (* open)(transfer_ctrl_t * const p_ctrl, 
                   transfer_cfg_t const * const p_cfg);
```

- p_ctrl：用来记录一些状态信息；
- p_cfg：配置信息，实际上就是指向RASC生成的g_dma0_cfg结构体；

调用open函数之后，DMAC设备就被初始化了，用户可以参考以下代码：

```c
fsp_err_t err = g_dma0.p_api->open(g_dma0.p_ctrl, g_dma0.p_cfg);
if(FSP_SUCCESS != err)
{
    LOG(__FUNCTION__, __LINE__);
    return -1;
}
```

2. 关闭DMAC设备对象

```c
fsp_err_t (* close)(transfer_ctrl_t * const p_ctrl);
```

close函数会将DMAC设备对象的open标志位设置为CLOSED，并且关闭中断。

3. 复位DMAC传输的地址和数据个数

```c
fsp_err_t (* reset)(transfer_ctrl_t * const p_ctrl, 
                    void const * p_src, 
                    void * p_dest,
                    uint16_t const num_transfers);
```

如果使用软件触发DMAC开启传输，那么建议在每次开启数据传输前调用此函数，用法如下：

```c
fsp_err_t err = g_dma0.p_api->reset(g_dma0.p_ctrl, ptdev->src, ptdev->dst, ptdev->length);
if(FSP_SUCCESS != err)
{
    LOG(__FUNCTION__, __LINE__);
    return -1;
}
```

4. 使能DMAC的数据传输

```c
fsp_err_t (* enable)(transfer_ctrl_t * const p_ctrl);
```

可能会在其它的API中使能DMAC的数据传输功能，因而此函数并非一定要手动调用，例如reset函数内就会在最后使能DMAC的数据传输。

5. 失能DMAC的链接触发

```c
fsp_err_t (* disable)(transfer_ctrl_t * const p_ctrl);
```

恰如其名，此函数和enable的功能是相反的，调用此函数可以关闭DMAC的数据传输功能。

6. 软件开启DMAC的数据传输

```c
fsp_err_t (* softwareStart)(transfer_ctrl_t * const p_ctrl, 
                            transfer_start_mode_t mode);
```

mode参数是transfer_start_mode_t枚举类型，可以选择每次软件触发传输时，是只传输一个数据，还是传输多个数据直到所有数据传输完成，此枚举的原型如下：

```c
typedef enum e_transfer_start_mode
{
    TRANSFER_START_MODE_SINGLE = 0,
    TRANSFER_START_MODE_REPEAT = 1
} transfer_start_mode_t;
```

用户可以参考以下代码利用软件触发DMAC的数据传输：

```c
fsp_err_t err = g_dma0.p_api->softwareStart(g_dma0.p_ctrl, TRANSFER_START_MODE_REPEAT);
if(FSP_SUCCESS != err)
{
    LOG(__FUNCTION__, __LINE__);
    return -1;
}
```

7. 软件停止DMAC的数据传输

```c
fsp_err_t (* softwareStop)(transfer_ctrl_t * const p_ctrl);
```

只有在使用softwareStart(…, TRANSFER_START_MODE_REPEAT)模式的软件触发DMAC时，才能使用softwareStop函数中断DMAC的传输。

## 22.4 软件触发数据搬移实验

### 22.4.1设计目的

让用户了解在RASC只如何配置DMAC为软件触发方式，并且了解DMAC的FSP库函数接口，使用这些接口完成数据的传输。

### 2.4.2驱动程序

1.DMAC设备对象的再抽象

鉴于瑞萨RA6M5的DMAC有8个通道，每个通道都可以单独使用，并且操作方法是类似的，所以可以将DMAC设备进行抽象，将DMAC的设备名称、通道值、内存地址、传输数据个数等信息放入一个结构体中：

```c
typedef struct DMADev{
    char            *name;
    unsigned char   channel;
    void            *dst;
    void            *src;
    unsigned short  length;
    int (*Init)(struct DMADev *ptdev);
    int (*Xfer)(struct DMADev *ptdev);
}DMADevTypeDef;
```

在驱动程序中实现一个DMADev结构体：

```c
static int DMADrvInit(struct DMADev *ptdev);
static int DMADrvXfer(struct DMADev *ptdev);
struct DMADev gDMADev = {
    .name    = "DMA0",
    .channel = 0,
    .dst     = NULL,
    .src     = NULL,
    .length  = 0,
    .Init    = DMADrvInit,
    .Xfer    = DMADrvXfer
};
```

再向上层调用者提供设备获取接口：

```c
struct DMADev *DMADevGet(void)
{
    return &gDMADev;
}
```

2. 初始化DMAC

本次实验使用的是软件触发DMAC，那么只需要打开DMAC设备即可：

```c
static int DMADrvInit(struct DMADev *ptdev)
{
    if(ptdev == NULL)   return -1;
    /* open dma device */
    {
        fsp_err_t err = g_dma0.p_api->open(g_dma0.p_ctrl, g_dma0.p_cfg);
        if(FSP_SUCCESS != err)
        {
            LOG(__FUNCTION__, __LINE__);
            return -1;
        }
    }
    return 0;
}
```

3. 中断回调函数和传输完成等待函数

在RASC中设置了DMAC传输完所有的数据后触发完成中断，并且也设置了中断回调函数的名字，那么需要实现这个回调函数，代码如下：

```c
static volatile bool gDMAXferCplt = false;
void dma0_callback(dmac_callback_args_t * p_args)
{
    (void)p_args;
    gDMAXferCplt = true;
}
```

然后将此标志为封装一个等待函数，当标志被置为true后才会退出此函数：

```c
static void DMADrvWaitXferCplt(void)
{
    while(!gDMAXferCplt);
    gDMAXferCplt = false;
}
```

4. DMAC数据传输函数

在开启传输之前，需要重新设置参数（比如源地址、目的地址、长度），然后再softwareStart函数开启传输，代码如下：

```c
static int DMADrvXfer(struct DMADev *ptdev)
{
    if(ptdev == NULL)   return -1;
    
    /* reconfigure dma config from ptdev */
    {
        fsp_err_t err = g_dma0.p_api->reset(g_dma0.p_ctrl, ptdev->src, ptdev->dst, ptdev->length);
        if(FSP_SUCCESS != err)
        {
            LOG(__FUNCTION__, __LINE__);
            return -1;
        }
    }
    
    fsp_err_t err = g_dma0.p_api->softwareStart(g_dma0.p_ctrl, TRANSFER_START_MODE_REPEAT);
    if(FSP_SUCCESS != err)
    {
        LOG(__FUNCTION__, __LINE__);
        return -1;
    }

    DMADrvWaitXferCplt();

    return 0;
}
```

### 22.4.3 测试程序

在初始化各个外设和DMAC设备对象后，每隔500ms使用DMA传输一次数据，传输完毕之后将源数据和目的数据一一比较，最后打印比较结果：

```c
static volatile uint16_t uwSrcBuffer[512] = {0};
static volatile uint16_t uwDstBuffer[512] = {0};

void DMAAppTest(void)
{
    SystickInit();
    UARTDrvInit();
    
    DMADevTypeDef *ptDmdDev = DMADevGet();
    if(NULL == ptDmdDev)
    {
        printf("Error. Can not find DMA Device.\r\n");
        return;
    }
    /* 初始化DMAC */
    if(0 != ptDmdDev->Init(ptDmdDev))
    {
        printf("Failed to init DMA Device: %s\r\n", ptDmdDev->name);
        return;
    }
    /* 将源数据数组赋值 */
    for(uint16_t i=0; i<ptDmdDev->length; i++)
    {
        uwSrcBuffer[i] = i+1;
    }
    uint16_t count = 5;
    while(count)
    {
        /* 指定源数据地址和目的数据地址以及数据个数 */
        ptDmdDev->src = (uint16_t*)uwSrcBuffer;
        ptDmdDev->dst = (uint16_t*)uwDstBuffer;
        ptDmdDev->length = 512;
        /* 开始使用DMAC传输数据 */
        if(0 != ptDmdDev->Xfer(ptDmdDev))
        {
            printf("Failed to transmit data by %s\r\n", ptDmdDev->name);
            continue;
        }
        uint16_t uwErrCount = 0;
        /* 数据比较 */
        for(uint16_t i=0; i<ptDmdDev->length; i++)
        {
            if(uwDstBuffer[i] != uwSrcBuffer[i])
            {
                uwErrCount++;
            }
        }
        /* 打印结果 */
        printf("\r\n%d --> Transmit %s\r\n", count--, (uwErrCount==0)?"Success":"Failed");
        HAL_Delay(500);
    }
}
```

### 22.4.4 测试结果

在hal_entry()函数中调用测试函数，然后将编译出来的二进制可执行文件烧录到板子上运行，可以观察到下图这样的效果：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-22/image6.png)

## 22.5 定时器触发数据搬移实验

此实验会使用到printf功能和滴答定时器，请读者将前文的关于串口和滴答定时器的配置以及驱动文件移植到本实验中。请参考上一小节添加DMAC的Stack模块和GPT的Stack模块。

### 22.5.1 设计目的

让用户学会在RASC中配置定时器外设，让它触发DMAC的数据传输，并且了解如何在代码中使用API来让定时器触发DMAC的数据传输。

### 22.5.2 模块配置

1. GPT的模块配置

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-22/image7.png)

本次实验只需要配置GPT为普通定时计数即可。

2. MAC的模块配置

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-22/image8.png)

```c
static int DMADrvInit(struct DMADev *ptdev)
{
    if(ptdev == NULL)   return -1;
    /* open dma device */
    {
        fsp_err_t err = g_dma0.p_api->open(g_dma0.p_ctrl, g_dma0.p_cfg);
        if(FSP_SUCCESS != err)
        {
            LOG(__FUNCTION__, __LINE__);
            return -1;
        }
    }
    /* open timer0 */
    {
        fsp_err_t err = g_timer0.p_api->open(g_timer0.p_ctrl, g_timer0.p_cfg);
        if(FSP_SUCCESS != err)
        {
            LOG(__FUNCTION__, __LINE__);
            return -1;
        }
    }
    
    return 0;
}
```

- 第15行：打开GPT设备完成对定时器的初始化；

3. 中断回调函数和传输完成等待函数

参考《22.4.2驱动程序》。

4.数据传输函数

下述代码中，复位DMAC后并没有立刻启动DAM传输，而是开启定时器——通过定时器触发DMA传输，然后等待传输完成后。当数据传输完成后，就关闭定时器。代码如下：

```c
static int DMADrvXfer(struct DMADev *ptdev)
{
    if(ptdev == NULL)   return -1;
    
    /* reconfigure dma config from ptdev */
    {
        fsp_err_t err = g_dma0.p_api->reset(g_dma0.p_ctrl, ptdev->src, ptdev->dst, ptdev->length);
        if(FSP_SUCCESS != err)
        {
            LOG(__FUNCTION__, __LINE__);
            return -1;
        }
    }
    /* start timer to triger DMA xfer data */
    {
        fsp_err_t err = g_timer0.p_api->start(g_timer0.p_ctrl);
        if(FSP_SUCCESS != err)
        {
            LOG(__FUNCTION__, __LINE__);
            return -1;
        }
        
    }
    /* wait for dma xfer cplt */
    DMADrvWaitXferCplt();
    /* stop timer */
    {
        fsp_err_t err = g_timer0.p_api->stop(g_timer0.p_ctrl);
        if(FSP_SUCCESS != err)
        {
            LOG(__FUNCTION__, __LINE__);
            return -1;
        }
        
    }

    return 0;
}
```

- 第16行：开启定时器触发DMAC开始传输数据；
- 第25行：等待数据传输完成；
- 第28行：传输完毕后关闭定时器停止DMAC传输；
### 22.5.3 测试程序

测试程序和上一小节的一模一样，参考《22.4.3测试程序》。

### 22.5.4 测试结果

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-22/image9.png)
