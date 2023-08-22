# 第23章 ADC与DSP

本章目标

- 了解ADC基本概念和RA6M5处理器的ADC模块；
- 学会使用RASC配置ADC采样引脚的模拟信号；
- 学会使用RASC配置CMSIS的DSP库对ADC的采样数据做FFT处理；

## 23.1 ADC简介

自然界的信号几乎都是模拟信号，比如光亮、温度、压力、声音，而为了方便存储、处理，计算机里面都是数字的0/1信号，将模拟信号（连续信号）转换为数字信号（离散信号）的器件就叫模数转换器(Analog-to-Digital Converter，ADC)。

按原理可分为：并行比较型A/D转换器(FLASH ADC)、逐次比较型A/D转换器(SAR ADC)和双积分式A/D转换器(Double Integral ADC)。

A/D转换过程通常为4步：采样、保持、量化和编码。如下图所示，

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image1.png)

一个连续的电压信号ui(t)通过一个由方波CPs控制的开关S之后施加到电容C上，由于电容两端的电压不会突变，可知在S断开时C将维持ui(t)在开关断开瞬间的电压一段时间，直到开关S再次打开。这样，一个模拟的电压信号就转换成了采样展宽信号us(t)，其中CPs的频率就是采样频率fs。最后，由ADC的数字编码电路将采样展宽信号us(t)转换成n位的数字量dn-1:d0并输出。

采样是对模拟信号周期性地抽取样值，使模拟信号转化为时间上离散的脉冲信号。采样频率（fS）越高，采样越密集，采样值越多，也就越接近模拟信号。为确保采样后的信号能够还原模拟信号，根据香农-奈奎斯特(Shannon & Nyquist)采样定理，采样频率必须大于等于2倍输入模拟信号的最高截止频率（fImax）：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image2.jpg)

ADC的主要有三个性能指标：分辨率、转换时间和转换精度。

- 分辨率：又称为转换精度，指ADC能分辨的最小电压，通常使用二进制有效位表示，反应了ADC对输入模拟量微小变化的分辨能力。当最大输入电压一定时，位数越多，量化单位越小，误差越小，分辨率越高。比如一个12位的ADC，参考电压为3.3V，则其能分辨的最小电压为：

  ![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image3.jpg)

- 转换时间：其倒数为转换速率，指ADC从控制信号到来开始，到输出端得到稳定的数字信号所经历的时间。转换时间通常与ADC类型有关，双积分型ADC的转换时间一般为几十毫秒，属于低速ADC；逐次逼近型ADC的转换时间一般为几十微妙，属于中速ADC；并联比较型ADC的转换时间一般为几十纳秒，属于高速ADC。

- 转换精度：指ADC输出的数字量所表示的模拟值与实际输入的模拟量之间的偏差，通常为1个或半个最小数字量的模拟变化量，表示为1LSB或1/2LSB。
#
## 23.2 RA6M5处理器的ADC

### 23.2.1 硬件特性

ADC的时钟源是PCLKC，在RA6M5的用户手册中对于PCLKC的时钟描述如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image4.png)

PCLKC总线时钟最高能到50MHz，也就是说ADC12的转换时钟最高是50MHz。本书所有的实验都是在CPU支持的最高时钟下运行的，因而对于本章的ADC实验而言，其时钟都是50MHz。以50Mhz的ADC时钟而言，其部分硬件特性见下表：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image5.jpg)

瑞萨RA6M5芯片有2个逐次逼近型硬件ADC单元ADC0和ADC1，两个ADC共有多达26路采样通道（AN000~AN010，AN012，AN013，AN100~AN102，AN116~AN128），支持的采样有效位有8-bit，10-bit和12-bit。在阻抗为400Ω、时钟为50MHz情况下，采样转换时间最快为0.4us，即25MHz的采样率。

ADC输入范围为：VREFL-≤VIN≤VREFH+。RA6M5的参考电压是由VREFL、VREFH、AVCC0、AVSS0这四个外部引脚决定，且每个单元可以设置不同的参考电压，具体可以通过设置不同通道的VREFL、VREFH进行改变。

在设计原理图的时候一般把AVSS0和VREFL接地，把AVCC0和VREFH接3V3，得到ADC的输入电压范围为：0~3.3V。

如果采用12bit ADC是，那么12位满量程对应的就是3.3V，12位满量程对应的数字值是：2^12 = 4096。数值0对应的就是0V。如果转换后的数字量数值为n，n对应的模拟电压为v，那么：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image6.jpg)

瑞萨RA6M5的ADC有3种工作模式：

1. 单次扫描模式：在单次扫描下，一次扫描一个或多个指定通道。
2. 连续扫描模式：在连续扫描下，一个或多个指定的通道被重复扫描，直到软件设置寄存器ADCSR.ADST位为0。
3. 分组扫描模式：将所选择的模拟输入通道分为A组和b组，然后按组对组内的通道进行一次A/D转换。A、B组可独立选择扫描启动条件，可独立启动A、B组的A/D转换。

对于单次扫描模式和连续扫描模式，都会从最小的扫描通道开始从低到高进行A/D转换。如果开启了自诊断模式，在每次扫描开始时会执行一次转换，它会在三个参考电压中选择一个来转换。每一种转换模式都有着它的优点和缺点，需要通过实际需求来选择。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image7.png)

### 23.2.3ADC 的单次扫描采样

在单次扫描下，一次扫描一个或多个指定通道。在单次扫描模式转换期间，可以通过ADST为来判断ADC是否处在工作状态，在ADC转换的期间ADST为将一直保持为1，当所有选定通道的ADST转换完成时，将自动设置为0。

1. 当ADCSR.ADST位通过软件触发器、同步触发器输入（ELC）和异步触发器输入被置1的时候，ADC转换开始。对在ADANSA0和ADANSA1寄存器中选择的ANn通道进行A/D转换，从编号最小通道开始。
2. 每当单个信道的A/D转换完成时，A/D转换结果都被存储在关联的A/D数据寄存器（ADDRy）中。
3. 当所有选定通道的A/D转换完成时，将产生一个ADC12i_ADI（i=0,1）中断请求。

### 23.2.4 ADC的连续扫描采样

在连续扫描下，一个或多个指定的通道被重复扫描，直到软件设置寄存器ADCSR.ADST位为0。

1. 当ADCSR.ADST位通过软件触发器、同步触发器输入（ELC）和异步触发器输入被置1的时候，ADC转换开始。对在ADANSA0和ADANSA1寄存器中选择的ANn通道进行A/D转换，从编号最小通道开始。
2. 每当单个信道的A/D转换完成时，A/D转换结果都被存储在关联的A/D数据寄存器（ADDRy）中。
3. 当所有选定通道的A/D转换完成时，将生成一个ADC12i_ADI（i=0,1）中断请求。
ADCSR.ADST位不会自动清除,只要ADCSR.ADST位保持1时就会一直的重复步骤b/c，直到ADCSR.ADST位被软件置为0时ADC转换才会停止，之后ADC单元进入等待状态。
### 23.2.5 ADC的组扫描采样

将所选择的模拟输入通道分为A组和B组，然后按组对组内的模拟输入通道进行一次A/D转换。A、B组可独立选择扫描启动条件，可独立启动A、B组的A/D转换。

1. 当ELC0上的GPT触发ELC_ADC（A组）时，A组的ADC开始转换。
2. 当组A扫描完成时，将生成一个ADC12i_ADI（i=0,1）中断。
3. B组的扫描由ELC_ADC（A组）触发。
4. 当B组扫描完成时，如果ADCSR.GBADIE位为1时将生成一个ADC12i_GBADI（i=0,1）中断。

### 23.2.6 ADC采样触发源

触发ADC开启转换的触发源有多种，主要分为三类：

- 软件触发
- 异步触发，也就是外部引脚ADTRGn触发采样；
- 同步触发，也就是使用ELC连接其他外设信号触发AD采样；

如果使用ELC连接其他外设同步触发AD采样的话，那么触发源就多种多样了。可以通过定时器计数溢出触发、通信结束信号触发等等。使用哪一种触发方式取决于实际的项目需求。

### 23.2.7 ADC采样转换时间

根据瑞萨RA6M5的用户手册提供的时间转换图：


![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image8.png)

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image9.jpg)

## 23.3 ADC-DMAC模块的使用
### 23.3.1 配置ADC引脚

在RASC配置界面的“Pins”中的“Peripherals”中找到“Analog:ADC”,根据硬件设计的AD引脚决定选择“ADC0”还是“ADC1”。本书以ADC0的通道5为例，使用的引脚是P005，如下图所示;

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image10.png)

### 23.3.2 配置ADC模块

在FSP配置界面的Stacks中，可以添加两类ADC的Stack模块：ADC和ADC-DMAC Integration。ADC-DMAC是在ADC的基础上再增添DMA功能，在本书下一小节会讲到如何配置。

1. 添加ADC Stack

添加步骤如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image11.png)

2. 配置ADC Module General

ADC Module General的参数详情见下表：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image12.jpg" style="zoom:80%;" />

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image13.png)

3. 配置ADC Module Input

配置ADC的采样通道以及窗口电压比较等，参数描述如下表：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image14.jpg" style="zoom:67%;" />

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image15.png)

4. 配置ADC Module Interrupts

配置ADC采样的触发源、中断使能优先级和中断回调函数名等，参数描述如下表：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image16.jpg)

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image17.png" style="zoom:150%;" />

5. 配置ADC Module Extra

使能与否ADC的环形缓冲区。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image18.png)

### 23.3.3 配置ADC的DMA模块

1. 添加ADC-DMAC

添加步骤如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image19.png)

会得到这样一个ADC Stack模块：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image20.png)

2. 配置ADC Module

ADC-DMAC中关于ADC Module的配置中，以下这些参数已被固定、不可更改：

- Module：Single Scan
- ADC Ring Buffer:Enabled

如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image21.png)

3.配置DMAC Transfer

ADC-DMAC中关于DMAC的配置有许多也是固定配置不可更改的，允许用户修改的参数如下：

- Name：ADC-DMAC的DMAC在代码中的模块名称，默认g_transfer0；
- Channel：使用的DMAC通道，范围0~7，默认0；
- Destination Pointer：保存数据的目的数组命，默认为NULL；
- Activation Source：触发DMAC进行数据传输的信号源，在ADC采样中最好使用ADC单次扫描完成中断触发，即ADCn SCAN END (A/D scan end interrupt)；
- Callback：DMA传输完成中断调用的中断函数名，默认为NULL；
- Context：DMAC中断回调函数的传入内容，默认为NULL；
- Transfer End Interrupt Priority：DMAC传输数据完成中断优先级，默认Disabled；

如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image22.png)

### 23.3.4 配置GPT和ELC模块

在多数情况下，使用周期性触发的定时器中断来触发ADC的采样。
对于瑞萨RA6M5的GPT模块配置和ELC模块配置在本书前面的章节已经介绍过，此处不再赘述。

### 23.3.5 ADC的配置信息

ADC的引脚配置信息会在pin_data.c的g_bsp_pin_cfg_data[]数组中生成，代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
    {.pin = BSP_IO_PORT_00_PIN_05,
     .pin_cfg = ((uint32_t) IOPORT_CFG_ANALOG_ENABLE)
    },
    ......（省略内容）
};
```

如此处将P005复用为IOPORT_CFG_ANALOG_ENABLE，也就是使能了P005的模拟量输入功能。

ADC设备对象会在hal_data.c中生成，名为g_adc，代码如下:

```c
const adc_instance_t g_adc5 =
{
    .p_ctrl    = &g_adc5_ctrl,
    .p_cfg     = &g_adc5_cfg,
    .p_channel_cfg = &g_adc5_channel_cfg,
    .p_api     = &g_adc_on_adc
};
```

- p_ctrl：它被用来保存ADC的信息，比如状态、寄存器、回调函数等待，原型如下：

```c
typedef struct
{
    R_ADC0_Type     * p_reg;                    // Base register for this unit
    adc_cfg_t const * p_cfg;
    uint32_t          opened;         // Boolean to verify that the Unit has been initialized
    uint32_t          initialized;              // Initialized status of ADC
    uint32_t          scan_mask;                // Scan mask used for Normal scan
    uint16_t          scan_start_adcsr;
    void (* p_callback)(adc_callback_args_t *); 
    adc_callback_args_t * p_callback_memory;
    /* Pointer to context to be passed into callback function */
    void const * p_context;
} adc_instance_ctrl_t;
```

- p_cfg：指向ADC模块的配置信息结构体g_adc_cfg，其原型如下：

```c
typedef struct st_adc_cfg
{
    uint16_t         unit;                             ///< ADC unit to be used
    adc_mode_t       mode;                             ///< ADC operation mode
    adc_resolution_t resolution;                       ///< ADC resolution
    adc_alignment_t  alignment;                        ///< Specify left or right alignment; ignored if addition used
    adc_trigger_t    trigger;                          ///< Default and Group A trigger source
    IRQn_Type        scan_end_irq;                     ///< Scan end IRQ number
    IRQn_Type        scan_end_b_irq;                   ///< Scan end group B IRQ number
    uint8_t          scan_end_ipl;                     ///< Scan end interrupt priority
    uint8_t          scan_end_b_ipl;                   ///< Scan end group B interrupt priority
    void (* p_callback)(adc_callback_args_t * p_args); ///< Callback function; set to NULL for none
    void const * p_context;                            ///< Placeholder for user data. Passed to the user callback in @ref adc_callback_args_t.
    void const * p_extend;                             ///< Extension parameter for hardware specific settings
} adc_cfg_t;
```

以软件触发采样为例，g_adc_cfg成员的赋值如下：

```c
const adc_cfg_t g_adc5_cfg =
{
    .unit                = 0,
    .mode                = ADC_MODE_SINGLE_SCAN,
    .resolution          = ADC_RESOLUTION_12_BIT,
    .alignment           = (adc_alignment_t) ADC_ALIGNMENT_RIGHT,
    .trigger             = ADC_TRIGGER_SOFTWARE,
    .p_callback          = NULL,
    ....（省略内容）
};
```

- p_channel_cfg：指向某个通道的配置值，也是来自RASC的配置，其原型如下：

```c
typedef struct st_adc_channel_cfg
{
    uint32_t           scan_mask;    ///< Channels/bits: bit 0 is ch0; bit 15 is ch15.
    uint32_t           scan_mask_group_b;  ///< Valid for group modes.
    uint32_t           add_mask;           ///< Valid if add enabled in Open().
    adc_window_cfg_t * p_window_cfg;   ///< Pointer to Window Compare configuration
    adc_group_a_t      priority_group_a;   ///< Valid for group modes.
    uint8_t            sample_hold_mask;   ///< Channels/bits 0-2.
    uint8_t            sample_hold_states; ///< Number of states to be used for sample and hold. Affects channels 0-2.
} adc_channel_cfg_t;
```

以软件触发采样为例，对于通道5，它的配置参数如下：

```c
const adc_channel_cfg_t g_adc5_channel_cfg =
{
    .scan_mask           = ADC_MASK_CHANNEL_5 |  0,
    .scan_mask_group_b   =  0,
    .priority_group_a    = ADC_GROUP_A_PRIORITY_OFF,
    .add_mask            =  0,
    .sample_hold_mask    =  0,
    .sample_hold_states  = 24,
    ......（省略内容）
};
```

- p_api：ADC模块的接口，指向在r_adc.c中实现的g_adc_on_adc结构体。用户可以使用g_adc.p_api中的函数指针来操作ADC。

### 23.3.6 ADC的API接口及其使用

ADC的API接口，在结构体adc_api_t中声明了，代码如下：

```c
typedef struct st_adc_api
{
    fsp_err_t (* open)(adc_ctrl_t * const p_ctrl, adc_cfg_t const * const p_cfg);
    fsp_err_t (* scanCfg)(adc_ctrl_t * const p_ctrl, void const * const p_extend);
    fsp_err_t (* scanStart)(adc_ctrl_t * const p_ctrl);
    fsp_err_t (* scanGroupStart)(adc_ctrl_t * p_ctrl, adc_group_mask_t group_mask);
    fsp_err_t (* scanStop)(adc_ctrl_t * const p_ctrl);
    fsp_err_t (* scanStatusGet)(adc_ctrl_t * const p_ctrl, adc_status_t * p_status);
    fsp_err_t (* read)(adc_ctrl_t * const p_ctrl, 
                       adc_channel_t const reg_id, uint16_t * const p_data
    fsp_err_t (* read32)(adc_ctrl_t * const p_ctrl, 
                         adc_channel_t const reg_id, uint32_t * const p_data);
    fsp_err_t (* calibrate)(adc_ctrl_t * const p_ctrl, void const * p_extend);
    fsp_err_t (* offsetSet)(adc_ctrl_t * const p_ctrl, 
                           adc_channel_t const reg_id, int32_t const offset);
    fsp_err_t (* callbackSet)(adc_ctrl_t * const p_api_ctrl, 
                              void (* p_callback)(adc_callback_args_t *),
                              void const * const p_context, 
                              adc_callback_args_t * const p_callback_memory);
    fsp_err_t (* close)(adc_ctrl_t * const p_ctrl);
    fsp_err_t (* infoGet)(adc_ctrl_t * const p_ctrl, adc_info_t * const p_adc_info);
} adc_api_t;
```

在r_adc.c中实现了一个adc_api_t结构体，代码如下：

```c
const adc_api_t g_adc_on_adc =
{
    .open           = R_ADC_Open,
    .scanCfg        = R_ADC_ScanCfg,
    .infoGet        = R_ADC_InfoGet,
    .scanStart      = R_ADC_ScanStart,
    .scanGroupStart = R_ADC_ScanGroupStart,
    .scanStop       = R_ADC_ScanStop,
    .scanStatusGet  = R_ADC_StatusGet,
    .read           = R_ADC_Read,
    .read32         = R_ADC_Read32,
    .close          = R_ADC_Close,
    .calibrate      = R_ADC_Calibrate,
    .offsetSet      = R_ADC_OffsetSet,
    .callbackSet    = R_ADC_CallbackSet,
};
```

接下来就来了解下这些函数及其用法。

1. 打开ADC设备

```c
fsp_err_t (* open)(adc_ctrl_t * const p_ctrl, adc_cfg_t const * const p_cfg);
```
- p_ctrl：在调用open函数的时候可以直接传入&g_adc_ctrl或使用g_adc.p_ctrl；
- p_cfg：在调用open函数的时候可以直接传入&g_adc_cfg或使用g_adc.p_cfg；

open函数初始化ADC，比如根据p_cfg来配置ADC的寄存器，设置中断回调函数等。但是这个函数没有完成对采样通道的初始化，采样通道的初始化需要调用scanCfg函数。

用户可以参考以下代码初始化ADC：

```c
fsp_err_t err = g_adc5.p_api->open(g_adc5.p_ctrl, g_adc5.p_cfg);
assert(FSP_SUCCESS == err);
```

2. 关闭ADC设备

```c
fsp_err_t (* close)(adc_ctrl_t * const p_ctrl);
```

调用close函数就是改变ADC的p-ctrl中代表ADC状态的某些成员的值，并且会关闭ADC的触发源以及停止采样。

3. ADC的采样通道设置

```c
fsp_err_t (* scanCfg)(adc_ctrl_t * const p_ctrl, void const * const p_extend);
```

在调用open函数初始化了ADC后，还需要调用scanCfg配置指定的采样通道。用户在调用此函数时，第二个参数传入g_adc的p_channel_cfg成员，例如：

```c
err = g_adc5.p_api->scanCfg(g_adc5.p_ctrl, g_adc5.p_channel_cfg);
assert(FSP_SUCCESS == err);
```

4. 软件开启ADC采样/组采样

```c
fsp_err_t (* scanStart)(adc_ctrl_t * const p_ctrl);
fsp_err_t (* scanGroupStart)(adc_ctrl_t * p_ctrl, adc_group_mask_t group_mask);
```

如果没有使用组采样模式的话，就是用scanStart函数软件启动ADC采样。

如果使用了组采样模式，那么就需要调用scanGroupStart来启动ADC的组采样，第2个参数是adc_group_mask_t类型，它表示ADC的采样组别，有如下取值：

```c
typedef enum e_adc_group_mask
{
    ADC_GROUP_MASK_NONE = 0x000,       ///< Group Mask Unknown or None
    ADC_GROUP_MASK_0    = 0x001,       ///< Group Mask 0
    ADC_GROUP_MASK_1    = 0x002,       ///< Group Mask 1
    ……(省略内容)
    ADC_GROUP_MASK_7    = 0x080,       ///< Group Mask 7
    ADC_GROUP_MASK_8    = 0x100,       ///< Group Mask 8
    ADC_GROUP_MASK_ALL  = 0x1FF,       ///< All Groups
} adc_group_mask_t;
```

以普通模式为例，用户可以参考以下代码启动ADC的单次扫描采样：

```c
fsp_err_t err = g_adc5.p_api->scanStart(g_adc5.p_ctrl);
assert(FSP_SUCCESS == err);
```

5. 软件中止ADC采样/组采样

```c
fsp_err_t (* scanStop)(adc_ctrl_t * const p_ctrl);
fsp_err_t (* scanStatusGet)(adc_ctrl_t * const p_ctrl, adc_status_t * p_status);
```

同样的，软件中止ADC采样时，也分为普通模式和组采样模式。不同的模式有各自的中止函数。

6. 读取ADC的采样数据

```c
fsp_err_t (* read)(adc_ctrl_t * const p_ctrl, 
                   adc_channel_t const reg_id, 
                   uint16_t * const p_data);
fsp_err_t (* read32)(adc_ctrl_t * const p_ctrl, 
                     adc_channel_t const reg_id, 
                     uint32_t * const p_data);
```

用户通过read函数直接读取到ADC采样到的12bit的有效值。也可以调用read32函数读出采样值并转化为32bit的数据。

以直接读取12bit有效数据为例，用户可以参考以下代码读取ADC数据：

```c
err = g_adc5.p_api->read(g_adc5.p_ctrl, ADC_CHANNEL_5, &value[i]);
assert(FSP_SUCCESS == err);
```

7. ADC的状态获取

```c
fsp_err_t (* scanStatusGet)(adc_ctrl_t * const p_ctrl, adc_status_t * p_status);
```

此函数能够获取到ADC的运行状态，有如下状态：

```c
/** ADC states. */
typedef enum e_adc_state
{
    ADC_STATE_IDLE             = 0,    ///< ADC is idle
    ADC_STATE_SCAN_IN_PROGRESS = 1,    ///< ADC scan in progress
} adc_state_t;

/** ADC status. */
typedef struct st_adc_status
{
    adc_state_t state;                 ///< Current state
} adc_status_t;
```

如果用户采用软件触发采样的话，可以利用此函数判断ADC是否采样完成，例如：

```c
while (ADC_STATE_SCAN_IN_PROGRESS == status.state)
{
    g_adc5.p_api->scanStatusGet(g_adc5.p_ctrl, &status);
}
```

## 23.4 直流电压采样实验
### 23.4.1 设计目的

让用户学会使用瑞萨FSP ADC库函数驱动ADC外设，采样外部模拟电压。

### 23.4.2 硬件设计

本书配套的开发板板载没有ADC采样电路，用户使用具备ADC功能的引脚，用它来连接外部模拟信号。本书使用的是P005引脚，它对应ADC0的通道5。

### 23.4.3 驱动程序

1.ADC设备抽象

基于面向对象的编程思想，对ADC设备抽象出了一个结构体类型：

```c
typedef struct ADCDev{
    char *name;
    unsigned short channel;
    int (*Init)(struct ADCDev *ptDev);
    int (*Read)(struct ADCDev *ptDev, unsigned short *value, unsigned short num);
}ADCDevTypeDef;
```

用户需要在ADC的驱动代码中构造ADCDev结构体，代码如下：

```c
static int ADCDrvInit(struct ADCDev *ptDev);
static int ADCDrvRead(struct ADCDev *ptDev, unsigned short *value, unsigned short num);
static struct ADCDev gAdcDev = {
    .name = "ADC0",
    .channel = 5,
    .Init = ADCDrvInit,
    .Read = ADCDrvRead
};
```

并向上层调用者提供获取ADCDev的接口：

```c
struct ADCDev *ADCGetDevice(void)
{
    return &gAdcDev;
}
```

2. 初始化ADC

初始化ADC时，既要初始化ADC，也要初始化ADC里的某个通道。代码如下：

```c
static int ADCDrvInit(struct ADCDev *ptDev)
{
    if(NULL == ptDev)   return -1;
    if(5 == ptDev->channel)
    {
        fsp_err_t err = g_adc5.p_api->open(g_adc5.p_ctrl, g_adc5.p_cfg);
        assert(FSP_SUCCESS == err);
        
        err = g_adc5.p_api->scanCfg(g_adc5.p_ctrl, g_adc5.p_channel_cfg);
        assert(FSP_SUCCESS == err);
    }
    
    return 0;
}
```

- 第06行：调用open函数完成对ADC0的通用初始化；
- 第09行：调用scanCfg函数完成对ADC0通道5的初始化；

3. ADC采样完成等待函数

通过获取ADC的状态，来判断ADC当前是否正在进行采样转换，进而封装出来一个状态等待函数：

```c
01	static void ADCWaitConvCplt(void)
02	{
03	    adc_status_t status;
04	    status.state = ADC_STATE_SCAN_IN_PROGRESS;
05	    
06	    while (ADC_STATE_SCAN_IN_PROGRESS == status.state)
07	    {
08	        g_adc5.p_api->scanStatusGet(g_adc5.p_ctrl, &status);
09	    }
10	}
```

用户使用软件开启ADC采样后，可以调用此函数等待采样转换完成。

4. 数据读取函数

本实验将ADC的开启和数据读取封装到了一个函数中，来开启指定通道的ADC采样以及等待采样完成，并读取、返回数据：

```c
static int ADCDrvRead(struct ADCDev *ptDev, unsigned short *value, unsigned short num)
{
    if(NULL == ptDev || NULL == value || num <= 0)   return -1;
    if(5 == ptDev->channel)
    {
        for(uint16_t i=0; i<num; i++)
        {
            fsp_err_t err = g_adc5.p_api->scanStart(g_adc5.p_ctrl);
            assert(FSP_SUCCESS == err);
            ADCWaitConvCplt();
            err = g_adc5.p_api->read(g_adc5.p_ctrl, ADC_CHANNEL_5, &value[i]);
            assert(FSP_SUCCESS == err);
        }
    }
    
    return 0;
}
```

### 23.4.4 测试程序

本次实验采用的测试方法是每隔1s连续采样4次，将采样出来的数字量通过换算得到模拟电压量，将其打印出来观测，测试代码如下：

```c
void ADCAppTest(void)
{
    SystickInit();
    UARTDrvInit();
    
    ADCDevTypeDef *ptAdcDev = ADCGetDevice();
    if(NULL == ptAdcDev)
    {
        printf("Error. Not found ADC device!\r\n");
        return;
    }
    printf("Success to find ADC device: %s-%d\r\n", ptAdcDev->name, ptAdcDev->channel);
    ptAdcDev->Init(ptAdcDev);
    while(1)
    {
        uint16_t buf[4] = {0};
        ptAdcDev->Read(ptAdcDev, buf, 4);
        printf("\r\nSample Result:\r\n\t");
        for(uint16_t i=0; i<4; i++)
        {
            float value = (float)(buf[i]*3.3/4096);
            printf("[%d] --> %f\r\n\t", i+1, value);
        }
        HAL_Delay(1000);
    }
}
```

### 23.4.5 测试结果

在hal_entry()中调用测试函数，将编译出来的二进制可执行文件烧录到板子上并运行，将P005接到某个不超过3.3V的直流电压上观察结果，会得到例如下图这样的打印信息：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image23.png)

## 23.5 DSP库的配置与FFT函数介绍

### 23.5.1 CMSIS的DSP库

对应ARM的Cortex-M内核，它对于数据的处理一套DSP库，集成到了ARM的CMSIS架构中，这些库包含以下处理算法：

- )BasicMathFunctions：基本数学函数：提供浮点数的各种基本运算函数，如向量加减乘除等运算。
- CommonTables：数字信号处理常用参数表。
- ComplexMathFunctions：复数计算数学函数。
- ControllerFunctions：控制算法函数。包括正弦余弦，PID电机控制，矢量Clarke变换，矢量Clarke逆变换等。
- FastMathFunctions：常见快速算法的数学函数。
- FilteringFunctions：滤波函数功能，主要为FIR和LMS（最小均方根）等滤波函数。
- MatrixFunctions：矩阵处理函数。包括矩阵加法、矩阵初始化、矩阵反、矩阵乘法、矩阵规模、矩阵减法、矩阵转置等函数。
- StatisticsFunctions：统计功能函数。如求平均值、最大值、最小值、计算均方根RMS、计算方差/标准差等。
- SupportFunctions：支持功能函数，如数据拷贝，Q格式和浮点格式相互转换，Q任意格式相互转换。
- TransformFunctions：变换功能。包括复数FFT（CFFT）/复数FFT逆运算（CIFFT）、实数FFT（RFFT）/实数FFT逆运算（RIFFT）、和DCT（离散余弦变换）和配套的初始化函数。

对于CMSIS的DSP库，其内容非常的丰富，读者可以去Keil MDK的CMSIS DSP文档中心了解详细信息：[https://www.keil.com/pack/doc/CMSIS/DSP/html/index.html](https://www.keil.com/pack/doc/CMSIS/DSP/html/index.html)

### 23.5.2 CMSIS-DSP的FFT算法介绍

CMSIS DSP库里面包含一个专门用于计算实数序列的FFT库，很多情况下，用户只需要计算实数序列即可。计算同样点数FFT的实数序列要比计算同样点数的虚数序列有速度上的优势。快速的rfft算法是基于混合基cfft算法实现的。

一个N点的实数序列FFT正变换采用下面的步骤实现：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image24.png)

由上面的框图可以看出，实数序列的FFT是先计算N/2个实数的CFFT，然后再重塑数据进行处理从而获得半个FFT频谱即可（利用了FFT变换后频谱的对称性）。

一个N点的实数序列FFT逆变换采用下面的步骤实现：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image25.png)

实数FFT支持浮点，Q31和Q15三种数据类型。以Q15和F32的RFFT DSP库函数为例。

1. arm_rfft_q15

此函数原型：

```c
void arm_rfft_q15(const arm_rfft_instance_q15 * S, q15_t * pSrc, q15_t * pDst)
```

- S：arm_rfft_instance_q15结构体类型支持参数，表明此处FFT的点数和类型（正运算还是逆运算），结构体原型如下：

```c
typedef struct
{
    uint32_t fftLenReal;                      /**< length of the real FFT. */
    uint8_t ifftFlagR;                        /**< flag that selects forward (ifftFlagR=0) or inverse (ifftFlagR=1) transform. */
    uint8_t bitReverseFlagR;                  /**< flag that enables (bitReverseFlagR=1) or disables (bitReverseFlagR=0) bit reversal of output. */
    uint32_t twidCoefRModifier;               /**< twiddle coefficient modifier that supports different size FFTs with the same twiddle factor table. */
    const q15_t *pTwiddleAReal;                     /**< points to the real twiddle factor table. */
    const q15_t *pTwiddleBReal;                     /**< points to the imag twiddle factor table. */
#if defined(ARM_MATH_MVEI) && !defined(ARM_MATH_AUTOVECTORIZE)
    arm_cfft_instance_q15 cfftInst;
#else
    const arm_cfft_instance_q15 *pCfft;       /**< points to the complex FFT instance. */
#endif
} arm_rfft_instance_q15;
```

- fftLenReal：FFT点数
- ifftFlagR：FFT正运算或逆运算标志
- bitReverseFlagR：输出结果是正运算或逆运算的结果

使用arm_rfft_q15函数做FFT运算前需要先使用arm_rfft_instance_q15定义一个变量表明FFT的运算点数和类型：

```c
arm_rfft_instance_q15 S = {.fftLenReal = 1024};
```

然后再调用arm_rfft_init_q15函数将此变量记录和初始化：

```c
arm_rfft_init_q15(&S, 1024, 0, 0);
```

最后再调用arm_rfft_q15函数做FFT运算：

```c
arm_rfft_q15(&S, (q15_t*)p_buf, (q15_t*)q_buf);
```

2. arm_rfft_f32

此函数原型：

```c
void arm_rfft_f32(const arm_rfft_instance_f32 * S, float32_t * pSrc, float32_t * pDst)
```

用法和arm_rfft_q15非常类似：

2.1 使用arm_rfft_instance_f32定义一个变量表明FFT的运算点数和类型：

```c
arm_rfft_instance_f32 S = {.fftLenReal = 1024};
```

2.2 然后再调用arm_rfft_init_f32函数将此变量记录和初始化：

```c
arm_rfft_init_f32(&S, 1024, 0, 0);
```

2.3最后再调用arm_rfft_q15函数做FFT运算：

```c
arm_rfft_f32(&S, (float32_t*)p_buf, (float32_t*)q_buf);
```

## 23.6 连续信号的采样和处理实验

### 23.6.1 设计目的

让用户学会使用RASC添加CMSIS DSP模块，并学会使用DMAC方式传输ADC的采样数据到内存中，了解定时器触发ADC采样的配置。

### 23.6.2 模块配置

1. 添加CMSIS DSP

CMSIS DSP的添加步骤如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image26.png)

2. 添加ELC模块

参考本书前文《第21章 事件链接控制器ELC》。

3. ADC-DMAC的配置
- ADC	

  ![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image27.png)

  <img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image28.png" alt="image28" style="zoom:80%;" />

- DMA

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-23/image29.png)

### 23.6.3 硬件设计

本书配套的开发板板载没有ADC采样电路，用户使用具备ADC功能的引脚，用它来连接外部模拟信号。本书使用的是P005引脚，它对应ADC0的通道5。

### 23.6.4 驱动程序

本次实验依然需要抽象ADC设备，参考上一节。

1. 初始化ADC、DMAC、ELC和定时器

在初始化函数中需要完成ADC、DMAC、ELC和定时器的初始化，并且使能DMA、使能ELC，代码如下：

```c
static int ADCDrvInit(struct ADCDev *ptDev)
{
    if(NULL == ptDev)   return -1;
    if(5 == ptDev->channel)
    {
        /* 打开ADC设备完成通用初始化 */
        fsp_err_t err = g_adc5.p_api->open(g_adc5.p_ctrl, g_adc5.p_cfg);
        assert(FSP_SUCCESS == err);
        /* 配置ADC指令的通道完成初始化 */
        err = g_adc5.p_api->scanCfg(g_adc5.p_ctrl, g_adc5.p_channel_cfg);
        assert(FSP_SUCCESS == err);
        /* 打开ELC设备完成初始化 */
        err = g_elc.p_api->open(g_elc.p_ctrl, g_elc.p_cfg);
        assert(FSP_SUCCESS == err);
        /* 使能ELC的连接功能 */
        err = g_elc.p_api->enable(g_elc.p_ctrl);
        assert(FSP_SUCCESS == err);
        /* 打开DMA设备完成初始化 */
        err = g_transfer0.p_api->open(g_transfer0.p_ctrl, g_transfer0.p_cfg);
        assert(FSP_SUCCESS == err);
        /* 使能DMAC的ELC触发源 */
        err = g_transfer0.p_api->enable(g_transfer0.p_ctrl);
        assert(FSP_SUCCESS == err);
        /* 打开定时器设备完成初始化 */
        err = g_timer0.p_api->open(g_timer0.p_ctrl, g_timer0.p_cfg);
        assert(FSP_SUCCESS == err);
        /* 使能ADC的转换功能 */
        err = g_adc5.p_api->scanStart(g_adc5.p_ctrl);
        assert(FSP_SUCCESS == err);
    }
    
    return 0;
}
```

2. DMAC传输完成中断回调函数

在RASC的配置中，DMAC中断的触发源是传输完所有的数据，因而只需要在中断回调函数中将传输完成标志赋值为true即可：

```c
static volatile bool adc_sample_cplt = false;
void adc5_dma_callback(dmac_callback_args_t * p_args)
{
    adc_sample_cplt = true;
}
```

3. ADC采样完成等待函数

DMAC传输完成就代表着ADC采样的完成，因而可以依靠DMAC中断回调函数中的标志位来判断ADC是否全部采样完成：

```c
static void ADCWaitConvCplt(void)
{
    while(!adc_sample_cplt);
    adc_sample_cplt = false;
}
```

4. ADC数据读取函数

此函数里，先重新配置DMAC，再开启定时器，使用定时器来触发ADC转换。然后等待ADC完成后，关闭定时器。ADC的采样结果，通过DMA传输到buffer里。代码如下：

```c
static int ADCDrvRead(struct ADCDev *ptDev, unsigned short *buffer, unsigned short num)
{
    if(NULL == ptDev || NULL == buffer || num <= 0)   return -1;
    if(5 == ptDev->channel)
    {
        /* 每次采样前将DMAC的目的地址和传输个数重置 */
        g_transfer0.p_cfg->p_info->p_dest = buffer;
        g_transfer0.p_cfg->p_info->length = num;
        fsp_err_t err = g_transfer0.p_api->reconfigure(g_transfer0.p_ctrl, g_transfer0.p_cfg->p_info);
        assert(FSP_SUCCESS == err);
        /* 开启定时器触发ADC采样 */
        err = g_timer0.p_api->start(g_timer0.p_ctrl);
        assert(FSP_SUCCESS == err);
        ADCWaitConvCplt();
        /* 采样结束后关闭定时器 */
        err = g_timer0.p_api->stop(g_timer0.p_ctrl);
        assert(FSP_SUCCESS == err);
    }
    
    return 0;
}
```

### 23.6.5 测试程序

本次实验仅仅是对ADC采样的数据做了一次FFT运算，但是并没有对运算出来的结果做进一步的频谱分析。代码如下：

```c
#include <arm_math.h>

uint16_t p_buf[1024] = {0};
uint16_t q_buf[1024] = {0};

void ADCAppTest(void)
{
    SystickInit();
    UARTDrvInit();
    
    ADCDevTypeDef *ptAdcDev = ADCGetDevice();
    if(NULL == ptAdcDev)
    {
        printf("Error. Not found ADC device!\r\n");
        return;
    }
    printf("Success to find ADC device: %s-%d\r\n", ptAdcDev->name, ptAdcDev->channel);
    ptAdcDev->Init(ptAdcDev);
    
    arm_rfft_instance_q15 S = {.fftLenReal = 1024};
    arm_rfft_init_q15(&S, 1024, 0, 0);
    while(1)
    {
        ptAdcDev->Read(ptAdcDev, p_buf, 512);
        arm_rfft_q15(&S, (q15_t*)p_buf, (q15_t*)q_buf);
        HAL_Delay(1000);
    }
}
```

### 23.6.6 测试结果

本次实验没有结果输出，读者可以自行将FFT运算结果通过串口输出观察。
