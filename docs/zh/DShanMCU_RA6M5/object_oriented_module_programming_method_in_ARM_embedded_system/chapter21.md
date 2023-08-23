# 第21章 事件链接控制器ELC

本章目标

- 了解ELC基本概念和RA6M5处理器的ELC模块；
- 学会使用RASC配置ELC链接不同外设，并触发设备工作；

## 21.1 ELC简介

### 21.1.1 ELC的特征

ELC：Event Link Controller，事件链接控制器。它用于链接芯片上两个不同的外设，通过外设A的某个中断事件触发外设B去执行某个动作，这个过程是通过芯片内部硬件信号的连接完成的，不需要占用CPU资源。因而ELC可以帮助开发者完成许多同步触发的工作，而不会引起CPU资源的过多浪费。

ELC支持的事件类型多达219种。当产生了一个ELC事件的时候，也可以触发激活DTC功能。

### 21.1.2 ELC的系统框图

ECL的系统框图如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image1.png" style="zoom:50%;" />

1. 事件控制器

2. ELC相关寄存器：用户可以配置和观察这些寄存器来调试ELC。

3. ELC支持连接的事件：并不是所有的中断事件都能够用于ELC，只有框图中显示的这些中断事件可以。

### 1.1.1 支持的事件

ELC支持互相连接触发的外设模块见下表：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image2.jpg)

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image3.png)

- 外部中断IRQ触发定时器GPT开始计数；
- 定时器开始计数后，当计数溢出事件产生时，同步触发ADC转换和CTSU的测量模式；
- 串口中断触发DTC开启数据传输；

这所有的触发操作都是无需CPU干预处理。

## 21.2 ELC模块的配置

### 21.2.1 配置ELC模块

ELC本身只是一个连接控制器，不涉及双方设备的设置。具体模块的触发条件，需要去设置该模块。因而在RASC中，ELC的配置很简单，只需要在FSP的“Stacks”中添加ELC的Stack即可，无需额外配置，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image4.png)

击“New Stack”后在“System”中找到“Event Link Controller(r_elc)”添加ELC模块即可（在用户代码里，再去打开、使能它即可）。

对于ELC的Stack配置，只能设置它的名字（使用默认值即可）：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image5.png)

### 21.2.2 配置信息解读

使用RASC配置ELC并生成代码后，在common_data.c中生成一个elc_instance_t结构体类型的全局变量g_elc，它包括ELC控制参数成员、ELC配置信息、ELC控制接口成员。代码如下：

```c
const elc_instance_t g_elc = {
    .p_ctrl = &g_elc_ctrl,
    .p_api  = &g_elc_on_elc,
    .p_cfg  = &g_elc_cfg
};
```

- g_elc_ctrl：elc_instance_ctrl_t结构体类型，表明ELC的状态，原型如下：

```c
typedef struct st_elc_instance_ctrl
{
    uint32_t     open;
    void const * p_context;
} elc_instance_ctrl_t;
```

- g_elc_on_elc：ELC的控制接口，elc_api_t结构体指针，指向g_elc_on_elc结构体。g_elc_on_elc在r_elc.c中实现：

```c
const elc_api_t g_elc_on_elc =
{
    .open                  = R_ELC_Open,
    .close                 = R_ELC_Close,
    .softwareEventGenerate = R_ELC_SoftwareEventGenerate,
    .linkSet               = R_ELC_LinkSet,
    .linkBreak             = R_ELC_LinkBreak,
    .enable                = R_ELC_Enable,
    .disable               = R_ELC_Disable,
};
```

这些控制API将会在下一小节进行介绍讲解。

- g_elc_cfg：ELC的控制配置信息，它是elc_cfg_t结构体指针，此结构体原型如下：

```c
typedef struct st_elc_cfg
{
    elc_event_t const link[ELC_PERIPHERAL_NUM]; ///< Event link register (ELSR) settings
} elc_cfg_t;
```

此结构体在elc_data.c中生成，以本章外部中断触发定时器开始计数为例，生成的列表内容如下：

```c
const elc_cfg_t g_elc_cfg = {
    .link[ELC_PERIPHERAL_GPT_A] = ELC_EVENT_ICU_IRQ6, /* ICU IRQ6 (External pin interrupt 6) */
    .link[ELC_PERIPHERAL_GPT_B] = ELC_EVENT_ICU_IRQ1, /* ICU IRQ1 (External pin interrupt 1) */
    .link[ELC_PERIPHERAL_GPT_C] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_GPT_D] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_GPT_E] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_GPT_F] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_GPT_G] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_GPT_H] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_ADC0] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_ADC0_B] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_ADC1] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_ADC1_B] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_DAC0] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_DAC1] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_IOPORT1] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_IOPORT2] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_IOPORT3] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_IOPORT4] = ELC_EVENT_NONE, /* No allocation */
    .link[ELC_PERIPHERAL_CTSU] = ELC_EVENT_NONE, /* No allocation */
};
```

- 第02行：IRQ6触发ELC_GPTA类事件；
- 第03行：IRQ1触发ELC_GPTB类事件；

ELC_GPT_A~H是指ELC允许的GPT事件类型名称，如下表所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image6.png)

### 21.2.3 API接口及其使用

在上一小节已经了解到ELC的控制接口，其原型是elc_api_t结构体，如下：

```c
typedef struct st_elc_api
{
    fsp_err_t (* open)(elc_ctrl_t * const p_ctrl, 
                       elc_cfg_t const * const p_cfg);
    fsp_err_t (* close)(elc_ctrl_t * const p_ctrl);
    fsp_err_t (* softwareEventGenerate)(elc_ctrl_t * const p_ctrl, 
                                        elc_software_event_t event_num);
    fsp_err_t (* linkSet)(elc_ctrl_t * const p_ctrl, 
                          elc_peripheral_t peripheral, 
                          elc_event_t signal);
    fsp_err_t (* linkBreak)(elc_ctrl_t * const p_ctrl, 
                            elc_peripheral_t peripheral);
    fsp_err_t (* enable)(elc_ctrl_t * const p_ctrl);
    fsp_err_t (* disable)(elc_ctrl_t * const p_ctrl);
} elc_api_t;
```

本小节就对这些操作API进行一一介绍讲解。

1. 打开ELC设备

```c
fsp_err_t (* open)(elc_ctrl_t * const p_ctrl, 
                   elc_cfg_t const * const p_cfg);
```

- p_ctrl：elc_ctrl_t结构体类型，此结构体实际上是void类型，实际会指向elc_instance_ctrl_t结构体全局变量g_elc_ctrl；
- p_cfg：elc_cfg_t结构体类型，实际会指向elc_cfg_t全局常量g_elc_cfg；

open函数的主要功能就是将事件连接列表的设置值，用来初始化ELC模块。可以参考以下代码来初始化ELC设备：

```c
fsp_err_t err = g_elc.p_api->open(g_elc.p_ctrl, g_elc.p_cfg);
if(FSP_SUCCESS != err)
{
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    return;
}
```

2. 关闭ELC设备

```c
fsp_err_t (* close)(elc_ctrl_t * const p_ctrl);
```

关闭ELC函数实现的功能比较简单，就是将代表ELC的状态成员变量设置为CLOSED，并且失能ELC设备：

```c
/* Set state to closed */
p_instance_ctrl->open = ELC_CLOSED;

/* Globally disable the operation of the Event Link Controller */
R_ELC->ELCR = ELC_ELCR_ELCON_DISABLE;
```

3. 使能和失能ELC功能

```c
fsp_err_t (* enable)(elc_ctrl_t * const p_ctrl);
fsp_err_t (* disable)(elc_ctrl_t * const p_ctrl);
```

只有在使能了ELC的情况下，外设模块的事件触发才能生效。而使能、失能ELC实际上就是对ELC的ELCR寄存器进行控制：

```c
/* Globally enable ELC function */
R_ELC->ELCR = ELC_ELCR_ELCON_ENABLE;

/* Globally disable ELC function */
R_ELC->ELCR = ELC_ELCR_ELCON_DISABLE;
```

4. 设置事件链接

```c
fsp_err_t (* linkSet)(elc_ctrl_t * const p_ctrl, 
                      elc_peripheral_t peripheral, 
                      elc_event_t signal);
```

在初始化设置列表之后，如果要额外添加事件，可以使用这个API。支持的外设列表在r_elc_api.h中的elc_peripheral_t枚举中定义，支持的事件信号类型在bsp_elc.h中的elc_event_t枚举定义。

用户可以参考以下代码使用这个函数：

```c
fsp_err_t err = R_ELC_LinkSet(&g_elc_ctrl, ELC_PERIPHERAL_DAC0, ELC_EVENT_ICU_IRQ10);
if(FSP_SUCCESS != err)
{
    printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    return;
}
```

5. 断开事件链接

```c
fsp_err_t (* linkBreak)(elc_ctrl_t * const p_ctrl, 
                        elc_peripheral_t peripheral);
```

断开连接只需要传入需要断开连接的设备序号即可。

6. 件触发产生事件

```c
fsp_err_t (* softwareEventGenerate)(elc_ctrl_t * const p_ctrl, 
                                    elc_software_event_t event_num);
```

ELC支持的软件触发事件只有两种，在r_elc_api.h中定义的elc_software_event_t枚举类型里列出了这2种事件：

```c
typedef enum e_elc_software_event
{
    ELC_SOFTWARE_EVENT_0,              ///< Software event 0
    ELC_SOFTWARE_EVENT_1,              ///< Software event 1
} elc_software_event_t;
```

## 21.3 外部中断触发GPT启停

本实验会使用到按键外部中断、串口的printf和GPT，请读者阅读前面的章节参考配置相关外设模块。

### 21.3.1 设计目的

使用两个外部中断来触发GPT定时器计数的开始和停止，让用户了解ELC的使用方法。
### 21.3.2 模块配置

1. 外部中断

外部中断在FSP的“Pins”中选好ICU的引脚后，配置各自的Stack如下图示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image7.png)

本次实验选用的外部中断是IRQ1和IRQ6，使用的引脚是P205和P000。通过ELC使用IRQ触发GPT计数，是通过内部硬件的信号连接来实现的，所以不需要使用外部中断的中断服务函数及其中断回调函数。

2. LC外设

在前文已经说明，ELC的配置除了模块名称外，并不需要做额外配置。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image8.png)

3. GPT定时器

GPT定时器的配置除了通道、周期值、计数类型等常规配置如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image9.png)

本章的实验还需要配置GPT模块的Input项中关于开启计数触发源和停止计数触发源的设置：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image10.png)

对于开启触发源和停止触发源，里面的可选项是一样的，本次实验使用IRQ6触发定时器开始计数，使用IRQ1触发定时器停止计数，因而“Start Source”和“Stop Source”的配置如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image11.png)

![image12](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image12.png)

### 21.3.3 驱动程序

1. 外部中断

外部中断IRQ信号会直接链接触发GPT，因而只需要在RASC中配置IRQ模块，不需要在代码中初始化IRQ。

2. GPT初始化函数

对于GPT的初始化，只需要调用open、enable函数指针：

```c
void GPTDrvInit(void)
{
    {
        fsp_err_t err = g_timer0.p_api->open(g_timer0.p_ctrl, g_timer0.p_cfg);
        if(FSP_SUCCESS != err)
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    }
    {
        fsp_err_t err = g_timer0.p_api->enable(g_timer0.p_ctrl);
        if(FSP_SUCCESS != err)
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
    }
}
```

瑞萨对于GPT的enable函数解释是：“Enables external event triggers that start, stop, clear, or capture the counter.”，也就是使能外部中断事件触发计数器的开始、停止、清除和捕获。

3. GPT中断回调函数和溢出等待函数

GPT的中断回调函数，只是设置一个溢出标志值，函数代码如下：

```c
static volatile bool gGPTOverflow = false;
/* Callback function */
void gpt_timer0_callback(timer_callback_args_t *p_args)
{
    /* TODO: add your own code here */
    if(p_args->event == TIMER_EVENT_CYCLE_END)
        gGPTOverflow = true;
}

void GPTDrvWaitOverflow(void)
{
    while(!gGPTOverflow);
    gGPTOverflow = false;
}
```

4. ELC初始化函数

对于ELC的初始化，只需要调用open、enable函数指针，代码如下：

```c
void ELCDrvInit(void)
{
    {
        fsp_err_t err = g_elc.p_api->open(g_elc.p_ctrl, g_elc.p_cfg);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return;
        }
    }
    {
        fsp_err_t err = g_elc.p_api->enable(g_elc.p_ctrl);
        if(FSP_SUCCESS != err)
        {
            printf("Function:%s\tLine:%d\r\n", __FUNCTION__, __LINE__);
            return;
        }
    }
}`
```

### 21.3.4 测试程序

本次实验的测试程序比较简单，每次GPT计数溢出后就计数一次，串口将计数值打印，代码如下：

```c
void ELCAppTest(void)
{
    ELCDrvInit();
    UARTDrvInit();
    GPTDrvInit();
    
    printf("\r\nStart ELC Test!\r\n");
    uint32_t tick = 0;
    while(1)
    {
        GPTDrvWaitOverflow();
        printf("Tick: %d\r", (int)tick++);
    }
}
```

### 21.3.5 测试结果

在hal_entry.c中的hal_entry()函数中调用测试函数，将编译出来的二进制文件烧写到板子上运行。按下开发板的按键后，就会触发开启定时器开始计数，将开发板的P205引脚和GND短接后就会触发定时器停止计数：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-21/image13.png)
