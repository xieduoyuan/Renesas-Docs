# 第20章 DAC输出模拟信号

本章目标

- 了解DAC基本概念和RA6M5处理器的DAC外设；
- 学会使用RASC配置DAC输出指定电压和正弦波形；

## 1.1 RA6M5的DAC 

### 1.1.1 DAC简介

计算机里处理的都是数字0/1信号，而自然界几乎都是模拟信号，比如音频信号、无线传输信号等，这就要求计算机具有模拟信号的输出能力，将数字信号（离散信号）转换为模拟信号（连续信号）的器件就叫数模转换器(Digital-to-Analog Converter，DAC)。

按原理可分为：Nyquist型和过采样型。Nyquist型转换器按其结构又可大致分为电阻分压型、R_2R型、电荷分配型和电流驱动型。

下图所示为DAC转换过程，输入的数字编码Din（dn1 : d0），按其权值大小转换成相应的模拟量并相加，相加的结果Aout与数字量Din成正比，即实现了D/A转换。

 <img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image1.png" style="zoom: 33%;" />

DAC的主要有三个性能指标：分辨率、建立时间和转换精度。

- 分辨率：指DAC能输出的最小变化量，通常使用二进制有效位表示，反应了DAC输出模拟量的最小变化值。当输出量程一定时，位数越多，量化单位越小，误差越小，分辨率越高。比如一个12位的DAC，参考电压为3.3V，则其能输出的最小电压为：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image2.jpg)

- 建立时间：指DAC从输入信号变化开始，到输出模拟信号达到满刻度值（±1/2LSB）所需时间。根据建立时间得长短，可以将DAC分为超高速（＜1μS）、高速（10~1μS）、中速（100~10μS）、低速（≥100μS）。
- 转换精度：指DAC输出的模拟电压实际值与理论值之间的偏差，通常为1个或半个最小数字量的变化量，表示为1LSB或1/2LSB。

### 20.1.2 RA6M5的DAC框图

RA6M5处理器的DAC硬件框图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image3.png)

框图中的“12-bit D/A”是核心部件，整个DAC外设都是围绕着DA0通道和DA1通道展开的，左上作为参考电源以及模拟转换输出，右边有着相应的控制寄存器、总线接口、同步转换。

### 20.1.3 参考电压

AVCC0引脚作为ADC12和DAC12的电源输入引脚，AVSS0引脚作为ADC12和DAC12的接地输入引脚。VREFH引脚作为DAC12的模拟参考高电压电源引脚。VREFL引脚作为DAC12的模拟参考低电压引脚。

分别把它们接入到电源的正负两级，可以得到DAC的输出电压范围为：0~3.3V。如果想让输出的电压范围变宽，可以在外部加一个电压调节电路，把0~3.3V的DAC输出抬升到特定的范围即可。
在电路设计的时候不增加磁珠和电容接入到DAC12电源电路，会使得输出的电压不稳甚至输出的不是想要的电压，这个时候可以在电路上增加磁珠和电容来减少干扰，从而优化DAC比较电压源从而使其输出稳定。

### 20.1.4 触发源

可以设置软件来触发DAC，也可以通过使用ELC进行触发，还可以使用外部中断进行触发，最终目的是为了使得DACR.DAOEn（n=0,1）位被置1，可以编写相应的寄存器控制代码来使用不同的方式进行触发。

ELC也可以触发DAC转换，过程为：先设置ELSR12或ELSR13，选择“要连接的事件”，当连接的事件发生后，会使得DAC的寄存器DAOEi置1并开启DAC转换。ELSR12对应DAOE0即DAC0，ELSR13对应DAOE1即DAC1。

### 20.1.5 数据转换

1.DAC的数据寄存器

RA6M5处理器的DAC数据寄存器DADRn(n=0,1)是一个16bit的可读可写的寄存器，用来保存DAC的转换值。当开启了DA转换后，存储在此寄存器的值就会被转化为一个模拟量输出。
此16bit寄存器实际上只有低12bit被用来保存转换值，高4bit是无效的，因而DAC可以转换的数字量范围是0~4095。

保存在此寄存器的数值有两种对齐方式：左对齐或右对齐。默认是右对齐。

2.电压转换公式

DAC的转换出来的模拟量值是根据其转换精度和参考电压换算的，公式如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image4.jpg)

3. DA转换时间

RA6M5处理器的DA转换时间在其数据手册中有说明，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image5.png)

是否使用DAC的放大器，输出的模拟量范围和转换时间是不同的：

- 使用放大器：输出模拟量电压范围在0~之间；DA转换时间最大3us；
- 用放大器：输出模拟量电压范围在0~之间；DA转换时间最大4us；

4. DA转换过程

开启DAC任意通道的DA转换分为如下几步：
- 通过设置DADPR[DPSEL]位确定转换值是左对齐还是右对齐；
- 往寄存器DADRn写入数字值；
- 将DACR[DAOEn]位置1开启转换；
- 如果要进行多次转换，则在DACR[DAOEn]=1情况下，连续往DADRn寄存器写入值即可，转换时间为;
- 如果要停止转换，就将DAOEn写0；

## 20.2 DAC模块的使用

### 20.2.1 配置DAC模块

在RASC中配置DAC时，建议先配置DAC的通道的引脚，再去添加DAC的Stack模块并进行配置。

1. 配置DAC通道引脚

在RASC的“Pins”中的“Peripherals”选择“Analog:DAC”，根据硬件选择DAC通道，假设是DACO，那么则在右侧弹出的配置中将“Operation Mode”设置为“Enabled”，引脚只有一个P014。如果是DAC1，其引脚是P015。配置如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image6.png)

2. 配置DAC的Stack模块

在FSP的“Stacks”界面点击“New Stack”，选择“Analog”中的“DAC(r_dac)”，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image7.png)

DAC的Stack模块分为3个板块：

- Common：对所有DAC外设Stack模块通用，DAC这里只有参数校验的使能或不使能，默认是不使能；
- Module：某个指定的DAC外设Stack模块参数配置，在里面设置DAC外设Stack的名称、通道、数据格式、放大器使能、触发源等参数；
- Pins：某个指定DAC外设的输出引脚

如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image8.png)

配置好DAC的Stack参数后，点击FSP配置界面的“Generate Project Content”，使用RASC生成RA6M5处理器的Keil MDK工程。

### 20.2.2 配置信息解读

RASC生成的DAC配置信息有两种：引脚配置信息、DAC模块本身的配置信息。

1. 引脚信息

该信息会在ra_gen\pin_data.c文件里生成。在RASC里配置的每一个引脚，都会在pin_data.c生成一个ioport_pin_cfg_t数组项，里面的内容跟配置时选择的参数一致。代码如下：

```c
const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
    {.pin = BSP_IO_PORT_00_PIN_14,
     .pin_cfg = ((uint32_t) IOPORT_CFG_ANALOG_ENABLE)
    },
    ......（省略内容）
};
```

这里将P014引脚的配置设置为复用模拟功能。

2. 块配置信息

DAC模块的配置信息在hal_data.c里，它是dac_cfg_t类型的结构体常量，名为g_dac0_cfg，代码如下：

```c
const dac_cfg_t g_dac0_cfg =
{
    .channel             = 0,
    .ad_da_synchronized  = false,
    .p_extend            = &g_dac0_ext_cfg
};
```

- channels：DAC通道；
- ad_da_synchronized：是否和ADC同步转换
- p_extend：扩展的配置信息

对于p_extend，它被用来描述DAC的扩展配置参数，比如是否使用放大器、数据存放格式、是否使能内部输出等，结构体原型如下：

```c
typedef struct st_dac_extended_cfg
{
    bool   enable_charge_pump; ///< Enable DAC charge pump available on selected MCUs.
    bool  output_amplifier_enabled; ///< Output amplifier enable available on selected MCUs.
    bool  internal_output_enabled;  ///< Internal output enable available on selected MCUs.
    dac_data_format_t data_format;              ///< Data format
} dac_extended_cfg_t;
```

RASC生成的had_data.c中，定义了g_dac0_ext_cfg常量，代码如下：

```c
const dac_extended_cfg_t g_dac0_ext_cfg =
{
    .enable_charge_pump   = 0,
    .data_format         = DAC_DATA_FORMAT_FLUSH_RIGHT,
    .output_amplifier_enabled = 0,
    .internal_output_enabled = false,
};
```

3. DAC外设对象结构体

使用RASC配置生成的DAC外设对象，是一个dac_instance_t结构体类型常量，名为g_dac0表示，此结构体原型如下：

```c
typedef struct st_dac_instance
{
    dac_ctrl_t      * p_ctrl;   ///< Pointer to the control structure for this instance
    dac_cfg_t const * p_cfg;    ///< Pointer to the configuration structure for this instance
    dac_api_t const * p_api;   ///< Pointer to the API structure for this instance
} dac_instance_t;
```

g_dac0定义如下：

```c
typedef struct st_dac_instance
{
    dac_ctrl_t      * p_ctrl;   ///< Pointer to the control structure for this instance
    dac_cfg_t const * p_cfg;    ///< Pointer to the configuration structure for this instance
    dac_api_t const * p_api;   ///< Pointer to the API structure for this instance
} dac_instance_t;
```

g_dac0定义如下：

```c
const dac_instance_t g_dac0 =
{
    .p_ctrl    = &g_dac0_ctrl,
    .p_cfg     = &g_dac0_cfg,
.p_api     = &g_dac_on_dac
};
```

- p_ctrl：控制参数，用来记录一些状态信息；
- p_cfg：DAC的配置参数；
- p_api：DAC的接口，它是一个dac_api_t指针，指向g_dac_on_dac；

### 20.2.3API 接口及其用法

DAC的API在dac_api_t结构体中指明，此结构体的原型如下：

```c
typedef struct st_dac_api
{
    fsp_err_t (* open)(dac_ctrl_t * const p_ctrl, dac_cfg_t const * const p_cfg
    fsp_err_t (* close)(dac_ctrl_t * const p_ctrl);
    fsp_err_t (* write)(dac_ctrl_t * const p_ctrl, uint16_t value
    fsp_err_t (* start)(dac_ctrl_t * const p_ctrl);
    fsp_err_t (* stop)(dac_ctrl_t * const p_ctrl);
} dac_api_t;
```

在r_dac.c中实现了一个dac_api_t结构体，代码如下：

```c
const dac_api_t g_dac_on_dac =
{
    .open  = R_DAC_Open,
    .write = R_DAC_Write,
    .start = R_DAC_Start,
    .stop  = R_DAC_Stop,
    .close = R_DAC_Close,
};
```

下面介绍这些函数进行介绍，并举例。

1. 打开DAC设备

```c
fsp_err_t (* open)(dac_ctrl_t * const p_ctrl, dac_cfg_t const * const p_cfg);
```

此函数会初始化DAC设备，用户可以参考如下代码：

```c
fsp_err_t err = g_dac0.p_api->open(g_dac0.p_ctrl, g_dac0.p_cfg);
if(FSP_SUCCESS != err)
{
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    return;
}
```

2. 写入DAC转换数字量值

```c
fsp_err_t (* write)(dac_ctrl_t * const p_ctrl, uint16_t value);
```

此函数会将value写入到DAC的DADR寄存器中，如果开启了DAC转换，会立刻进行DAC转换，并把模拟信号输出到DAC引脚上。

用户可以参考如下代码使用此函数：

```c
fsp_err_t err = g_dac0.p_api->write(g_dac0.p_ctrl, value);
if(FSP_SUCCESS != err)
{
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    return;
}
```

3. 开启和停止转换

- 开启转换

```c
fsp_err_t (* start)(dac_ctrl_t * const p_ctrl);
```

- 停止转换

```c
fsp_err_t (* stop)(dac_ctrl_t * const p_ctrl);
```

只要用户调用start函数开启DAC的转换，每次调用write写入数字量的时候，就会立刻开始转换为模拟量。

用户可以参考如下代码开启DAC转换(停止转换类似)：

```c
fsp_err_t err = g_dac0.p_api->start(g_dac0.p_ctrl);
if(FSP_SUCCESS != err)
{
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    return;
}
```

4. 关闭DAC设备

```c
fsp_err_t (* close)(dac_ctrl_t * const p_ctrl);
```

此函数关闭DAC的转换，如果使用了放大器还会失能放大器，并且将DAC的状态标志改为关闭状态。

## 20.3 DAC控制实现呼吸灯
### 20.3.1 设计目的

使用DAC输出线性电压改变LED亮度，从而实现呼吸灯效果。

### 0.3.2 硬件连接

配套开发板的P014没有连接外接电路，用户可以参考下图，使用杜邦线和洞洞板搭建控制电路：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image9.png)

电阻阻值在1kΩ~10kΩ即可，LED颜色任意，建议选择变化明显容易观察的、较深的颜色。

### 20.3.3 驱动程序

1.DAC设备对象抽象

RA6M5处理器有两个硬件DAC，基于面向对象的编程思想，对DAC设备进行了抽象，定义了如下结构体：

```c
typedef struct DACDev{
    char *name;
    unsigned char channel;
    void (*Init)(struct DACDev *ptDev);
    void (*SetValue)(struct DACDev *ptDev, unsigned short value);
    void (*Write)(struct DACDev *ptDev, unsigned short *buf, unsigned short len);
}DACDevTypeDef;
```

然后在驱动程序中实现结构体中的3个函数，并用来初始化一个DACDev结构体，代码如下：

```c
static void DACDrvInit(struct DACDev *ptDev);
static void DACDrvSetValue(struct DACDev *ptDev, unsigned short value);
static void DACDrvWrite(struct DACDev *ptDev, unsigned short *buf, unsigned short len);

static struct DACDev gDACDev0 = {
    .name = "DAC0",
    .channel = 1,
    .Init = DACDrvInit,
    .SetValue = DACDrvSetValue,
    .Write = DACDrvWrite
};
```

- 第01~03行：声明内部静态驱动函数；
- 第05~11行：构造DACDev结构体

还提供如下函数，供用户获得这个DACDev结构体：

```c
struct DACDev *DACDrvGetDevice(void)
{
    return &gDACDev0;
}
```

2. 初始化

打开DAC设备、启动DAC转换，代码如下：

```c
static void DACDrvInit(struct DACDev *ptDev)
{
    if(NULL == ptDev)   return;
    if(1 == ptDev->channel)
    {
        fsp_err_t err = g_dac0.p_api->open(g_dac0.p_ctrl, g_dac0.p_cfg);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return;
        }
        err = g_dac0.p_api->start(g_dac0.p_ctrl);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return;
        }
    }
}
```

- 第06行：打开DAC设备，完成DAC0的初始化；
- 第12行：开启DAC的转换，之后只要调用write函数即可不断进行DA转换；

3. 单次输出模拟量

由于FSP的DAC库函数对于写入数值只有一个write函数，因而单次输出模拟量其实就是对write的封装：

```c
static void DACDrvSetValue(struct DACDev *ptDev, unsigned short value)
{
    if(NULL == ptDev)   return;
    if(1 == ptDev->channel)
    {
        fsp_err_t err = g_dac0.p_api->write(g_dac0.p_ctrl, value);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return;
        }
    }
}
```

4. 连续输出模拟量

连续输出相较于单次输出，差别仅在于输出多个模拟量，是对write的不同方式的封装而已：

```c
static void DACDrvWrite(struct DACDev *ptDev, unsigned short *buf, unsigned short len)
{
    if(NULL == ptDev)   return;
    if(1 == ptDev->channel)
    {        
        for(unsigned int i=0; i<len; i++)
        {
            fsp_err_t err = g_dac0.p_api->write(g_dac0.p_ctrl, buf[i]);
            if(FSP_SUCCESS != err)
            {
                printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
                return;
            }
        }
    }
}
```

### 20.3.4 测试程序

使LED要呈现呼吸灯的效果，其实让LED的驱动电压有规律地递增或递减：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-20/image10.png" style="zoom:50%;" />

因而可以使用单次输出模拟量的方法，每隔一段时间输出一个递增变化的模拟量。测试代码如下：

```c
void DACAppTest(void)
{
    SystickInit();
    UARTDrvInit();
    DACDevTypeDef *ptDacDev = DACDrvGetDevice();
    if(NULL == ptDacDev)
    {
        printf("Error. Can not get DAC device!\r\n");
        return;
    }
    
    printf("Success to get device: %s\r\n", ptDacDev->name);
    ptDacDev->Init(ptDacDev);
    
    bool dir = false;
    volatile uint16_t value = 0;
    
    while(1)
    {
        if(value==0)
            dir = true;
        else if(value==4096)
            dir = false;
        
        if(dir)
            value += 4;
        else
            value -= 4;
        ptDacDev->SetValue(ptDacDev, value);
        HAL_Delay(1);
    }
}
```

- 第05行：获取指定的DAC设备；
- 第13行：初始化DAC设备；
- 第20~23行：根据数据的边际判断输出的数据是该递增还是递减；
- 第25~28行：输出的数字量每次递增或递减4个数字量；
- 第29行：将变化后的数字量写入到DAC的数据寄存器中；
- 第30行：每隔1ms数据递增或递减一次；

为什么每次的变化量是4呢？根据呼吸灯的效果，设计逐渐变亮或变暗的时间周期为1.5s为佳，而DAC的数字量范围是0~4095，也就是4096个数字量，每隔1ms变化一次输出的数字量的话，为了接近1.5s的周期，且得到一个整数的数字量，每次变化4个单位是最科学的。

### 20.3.5 测试结果

用户可以使用示波器测试引脚P014的波形查看是否为一个线性变化的三角波，同时查看LED，可以观察到一个呼吸灯的效果。

## 20.4 DAC输出正弦波实验

### 20.4.1 设计目的

使用DAC输出一个幅度为3.3V，周期为192us的正弦波。

### 20.4.2 正弦波数据的生成

本书使用的是python脚本生成的正弦波数据，截取了其中一段正弦波数据，python脚本代码如下：

```c
import os
import numpy as np
import matplotlib.pyplot as plt

def sin_wave(A, f, fs, phi, t):
    '''
    :params A:    振幅
    :params f:    信号频率
    :params fs:   采样频率
    :params phi:  相位
    :params t:    时间长度
    '''
    # 若时间序列长度为 t=1s, 
    # 采样频率 fs=1000 Hz, 则采样时间间隔 Ts=1/fs=0.001s
    # 对于时间序列采样点个数为 n=t/Ts=1/0.001=1000, 即有1000个点,每个点间隔为 Ts
    Ts = 1/fs
    n = t / Ts
    n = np.arange(n)
    y = A*np.sin(2*np.pi*f*n*Ts - phi*(np.pi/180))
    return y
    
# f=50 hz
fs = 256
dat = sin_wave(A=2048, f=4, fs=fs, phi=0, t=1) + 2048
dat = np.trunc(dat)

data = dat[48:48+64]
x = "const uint16_t sin[] ={ \n"
for i in range(int(data.size/16)):
    for j in range(16):
        str = '0x{:04x}'.format(int(data[i*16+j]))
        x = x + str + ","
    x = x + "\n"
x = x + "};"
f = open("sine.c", "w")
f.write(x)
f.close()
```

python不是本书讲解的对象，因而不对此段代码做分析，请读者自行学习分析。

### 20.4.3 驱动程序

驱动程序实际上使用的还是上一小节的那些函数和DAC设备对象，这里不再赘述，将上一小节的代码一直到本小节的实验中即可。

### 20.4.4 测试程序

本小节输出正弦波的方法是让DAC输出一段固定的正弦波数据，因而使用到的将会是DAC设备对象的连续输出模拟量的那一个函数，示例代码如下所示：

```c
const uint16_t sine[] ={ 
......(数据省略)
};

void DACAppTest(void)
{
    SystickInit();
    UARTDrvInit();
    DACDevTypeDef *ptDacDev = DACDrvGetDevice();
    if(NULL == ptDacDev)
    {
        printf("Error. Can not get DAC device!\r\n");
        return;
    }
    
    printf("Success to get device: %s\r\n", ptDacDev->name);
    ptDacDev->Init(ptDacDev);

    while(1)
    {
        ptDacDev->Write(ptDacDev, (uint16_t*)sine, 256);
    }
}
```

- 第01~03行：python生成的正弦波数据；
- 第21行：使用DAC设备对象连续输出函数将正弦波数据转化为模拟量输出到引脚；

如果输出正弦波数据的时候，每个数据的输出间隔设计合适，输出正弦波也是能够实现呼吸灯效果的，读者可以自行尝试。

### 20.4.5 测试结果

使用示波器观察引脚P014的波形可以看到一个周期为192us，幅度为3.3V的正弦波。

