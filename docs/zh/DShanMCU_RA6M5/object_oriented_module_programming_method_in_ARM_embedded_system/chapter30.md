# 第30章 IRDA红外遥控实验

本章目标

- 学会使用红外遥控IRDA的通信协议；
- 了解环形缓冲区的概念以及掌握基于环形缓冲区的程序设计；
- 学会使用瑞萨RA6M5的GPT输入捕获功能；

## 30.1 IRDA红外遥控协议简介

NEC协议是众多红外遥控协议的其中一种,除NEC外,还有RC5、RC6等协议。市面上买到的非学习型万能电视遥控器大多集成一种或多种编码，一般都支持NEC协议。

NEC编码的一帧（通常按一下遥控器按钮所发送的数据）由引导码、地址码及数据码组成，如下图所示，把地址码及数据码取反的作用是验证数据的正确性。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-30\image1.png) 

当一直按住一个按钮的时候，会隔110ms左右发一次连续码，连续码后面不带任何数据。NEC协议的信号定义如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-30\image2.png)  

引导码由一个9ms的低脉冲加上一个4.5ms的高脉冲组成，它用来通知接收方“我要开始传输数据了”。

数据1和0，开始都是0.56ms的低脉冲，对于数据1，后面的高脉冲比较长；对于数据0，后面的高脉冲比较短。 

NEC协议里有很多时间，这些时间有一个有趣的现象，把所有时间里面最小的0.56ms看作基本脉冲宽度，假设用t表示，那么其它时长都是t的倍数。

NEC协议中，信号的最小时间单位是0.56ms，这个时间对人来说是很短的，但对于嵌入式系统它是很长的，足够做很多事情了。我们并不知道用户什么时候按下遥控器，使用轮询的方式特别耗资源，因此使用中断来处理。

## 30.2 模块配置

### 30.2.1 硬件连接

本次实验使用的是板载IRDA模块，其原理图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-30\image3.png)  

使用的引脚是P404，属于定时器GPT3的输入输出控制引脚。

### 30.2.2 GPT模块配置

在RASC中设置引脚和添加Stack模块，本小节就仅展示配置结果。

1. 配置Pins

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-30\image4.png)  

2. 配置GPT Stack

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-30\image5.png)  

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-30\image6.png)  

## 30.3 设备对象封装

在实际开发过程中，会涉及很多不同的设备。本实验抛砖引玉，对于串口、定时器，都基于环形缓冲区来实现它们的操作。

### 30.3.1 串口设备

1. 对象封装和管理

前面的章节里，使用串口时比较简单直接。本实验里，针对串口设备的特点，抽象出一个结构体（在dev_uart.h里）： 

```c
typedef struct UartDev{
    char *name;
    unsigned char channel;
    int (*Init)(struct UartDev *ptdev);
    int (*Write)(struct UartDev *ptdev, unsigned char * const buf, unsigned int length);
    int (*Read)(struct UartDev *ptdev, unsigned char *buf, unsigned int length);
    struct UartDev *next;
}UartDev;
```

底层的程序里，对于每一个串口设备，都要实现一个UartDev结构体。

假设底层drv_uart.c里实现了一个UartDev结构体，要把它插入一个链表管理起来，在dev_uart.c里实现了如下链表插入函数：

```c
static struct UartDev *gHeadUartDev;
void UartDeviceInsert(struct UartDev *ptdev)
{
    if(NULL == gHeadUartDev)
        gHeadUartDev = ptdev;
    Else
    {
        ptdev->next = gHeadUartDev;
        gHeadUartDev = ptdev;
    }
}
```

2. 实现串口设备

在drv_uart.c中，构造一个UartDev结构体，代码如下：

```c
static struct UartDev gLogDevice = {
    .name = "Log",
    .channel = 7,
    .Init = UARTDrvInit,
    .Read = UARTDrvRead,
    .Write = UARTDrvWrite,
    .next = NULL
};
```

然后提供一个UartDevicesCreate函数，调用“UartDeviceInsert(&gLogDevice)”把这个设备插入链表：

```c
void UartDevicesCreate(void)
{
    UartDeviceInsert(&gLogDevice);
    gLogDevice.Init(&gLogDevice);
}
```

3. 注册串口设备

底层的drv_uart.c提供了UartDevicesCreate函数来注册它实现的UartDev，谁来调用UartDevicesCreate？

假设还有另一个底层的drv_uart2.c也提供了Uart2DevicesCreate函数来注册它实现的UartDev，谁来调用Uart2DevicesCreate？

我们需要在设备层实现一个函数：UartDevicesRegister，用来调用底层的接口函数，管理底层实现的所有UartDev。代码如下：

```c
void UartDevicesRegister(void)
{
    UartDevicesCreate();
    UartDeviceList();
}
```

调用UartDevicesRegister后，在链表里就记录有底层实现的各个UartDev了。

4. 查找串口设备

如何使用串口设备？需要在链表里根据名字找到UartDev，代码如下：

```c
struct UartDev *UartDeviceFind(const char *name)
{
    struct UartDev *ptdev = gHeadUartDev;
    while(ptdev)
    {
        if(strstr(ptdev->name, name))
        {
            return ptdev;
        }
        ptdev = ptdev->next;
    }
    return NULL;
}
```

5. 打印整个串口设备列表

链表打印也很简单，从表头开始遍历、打印：

```c
void UartDeviceList(void)
{
    struct UartDev *ptdev = gHeadUartDev;
    printf("\r\nUart Device List:\r\n");
    while(ptdev)
    {
        printf("\t%s\r\n", ptdev->name);
        ptdev = ptdev->next;
    }
    printf("\r\n");
}
```

### 30.3.2 定时器设备

1. 对象封装

根据定时器的特点抽象出一个结构体，里面有名称、通道等属性，还有初始化、启停、读取等操作方法。代码如下：

```c
typedef struct TimerDev{
    char *name;
    unsigned char channel;
    unsigned char status;
    int (*Init)(struct TimerDev *ptdev);
    int (*Start)(struct TimerDev *ptdev);
    int (*Stop)(struct TimerDev *ptdev);
    int (*Read)(struct TimerDev *ptdev, unsigned char *buf, unsigned int length);
    int (*Timeout)(struct TimerDev *ptdev, unsigned int timeout);
    struct TimerDev *next;
}TimerDevice;
```

2. 实现定时器设备

本章要使用GPT3的输入捕获功能，因而在drv_gpt.c中实现了这个定时器：

```c
static struct TimerDev gGPTDevice = {
    .name = "GPT3",
    .channel = 3,
    .status = 0,
    .Init = GPTDrvInit,
    .Start = GPTDrvStart,
    .Stop = GPTDrvStop,
    .Read = GPTDrvRead,
    .Timeout = NULL,
    .next = NULL
};

void GPTTimerDevicesCreate(void)
{
    TimerDeviceInsert(&gGPTDevice);
}
```

3. 管理定时器设备

对于瑞萨的RA6M5处理器而言，定时器分为3大类：

1) 滴答定时器
2) GPT
3) 看门狗定时器

根据config.h中的宏开关来决定是否注册这些设备：

```c
void TimerDevicesRegister(void)
{
#if DRV_USE_SYSTICK
    SystickTimerDevicesCreate();
#endif
    
#if DRV_USE_GPT
    GPTTimerDevicesCreate();
#endif
    
#if DRV_USE_WDT
#endif
    
#if DRV_USE_IWDT
#endif
    
    TimerDeviceList();
}
```

## 30.4 驱动程序

### 30.4.1 初始化定时器

本次实验会使用定时器：红外遥控器的输入引脚，触发定时器产生中断，在中断回调函数中记录时间。所以需要使能ECL模块来连接GPIO和GPT3，并且使能GPT3的触发功能。

另外，接收到的红外遥控信号是一系列的波形，读取到完整的波形后，才能解析出数据。所以需要为GPT3创建一个环形缓冲区，用来保存一系列的时间值。

初始化代码如下：

```c
static struct RingBuffer *gGPT3Buffer = NULL;
static int GPTDrvInit(struct TimerDev *ptdev)
{
    if(NULL==ptdev) return EINVAL;
    switch(ptdev->channel)
    {
        case 0:case 1:case 2:
            break;
        case 3:
        {
            /* 打开GPT设备完成初始化 */
            fsp_err_t err = g_timer3.p_api->open(g_timer3.p_ctrl, g_timer3.p_cfg);
            assert(FSP_SUCCESS == err);
            /* 使能GPT的ELC功能 */
            err = g_timer3.p_api->enable(g_timer3.p_ctrl);
            assert(FSP_SUCCESS == err);
            /* 打开ELC设备完成初始化 */
            err = g_elc.p_api->open(g_elc.p_ctrl, g_elc.p_cfg);
            assert(FSP_SUCCESS == err);
            /* 使能ELC的连接功能 */
            err = g_elc.p_api->enable(g_elc.p_ctrl);
            assert(FSP_SUCCESS == err);
            /* 给GPT3申请一个缓冲区存储采样捕获数据 */
            gGPT3Buffer = RingBufferNew(1024);
            break;
        }
        case 4:case 5:case 6:
        case 7:case 8:case 9:
            break;
        default:break;
    }
    
    return ESUCCESS;
}
```

第24行分配的缓冲区，只在这个驱动文件用到，用户并不关心GPT3的内部实现，所以gGPT3Buffer被设置为static类型，不要对外暴露它的存在。

### 30.4.2 定时器开启

调用GPT的start函数开启即可：

```c
static int GPTDrvStart(struct TimerDev *ptdev)
{
    if(NULL==ptdev) return -EINVAL;
    switch(ptdev->channel)
    {
        case 0:case 1:case 2:
            break;
        case 3:
        {
            /* 开启GPT的计数 */
            fsp_err_t err = g_timer3.p_api->start(g_timer3.p_ctrl);
            assert(FSP_SUCCESS == err);
            break;
        }
        case 4:case 5:case 6:
        case 7:case 8:case 9:
            break;
        default:break;
    }
    
    return ESUCCESS;
}
```

### 30.4.3 定时器关闭

关闭定时器停止计数，顺便讲计数器清零、清除环形缓冲区：

```c
static int GPTDrvStop(struct TimerDev *ptdev)
{
    if(NULL==ptdev) return -EINVAL;
    switch(ptdev->channel)
    {
        case 0:case 1:case 2:
            break;
        case 3:
        {
            /* 停止GPT的计数 */
            fsp_err_t err = g_timer3.p_api->stop(g_timer3.p_ctrl);
            assert(FSP_SUCCESS == err);
            err = g_timer3.p_api->reset(g_timer3.p_ctrl);
            assert(FSP_SUCCESS == err);
            gOverflowCount = 0;
            if(NULL != gGPT3Buffer)
                gGPT3Buffer->Clear(gGPT3Buffer);
            break;
        }
        case 4:case 5:case 6:
        case 7:case 8:case 9:
            break;
        default:break;
    }
    
    return ESUCCESS;
```

### 30.4.4 中断回调函数

在定时器的回调函数里，有一个全局变量：gOverflowCount，它每隔10us累加一次。当发生GPIO捕获事件时，可以把gOverflowCount当做时间存入环形缓冲区。代码如下：

```c
void timer3_callback(timer_callback_args_t * p_args)
{
    switch(p_args->event)
    {
        case TIMER_EVENT_CYCLE_END:
        {
            gOverflowCount++;
            break;
        }
        case TIMER_EVENT_CAPTURE_A:
        case TIMER_EVENT_CAPTURE_B:
        {
            uint32_t  lCaptureTime = gOverflowCount;
            if(NULL != gGPT3Buffer)
                gGPT3Buffer->Write(gGPT3Buffer, (uint8_t*)&lCaptureTime, sizeof(uint32_t));
            break;
        }
        default:break;
    }
}
```

### 30.4.5 读取定时器的采样数据

定时器的回调函数里，把信号的触发时间存入到唤醒缓冲区。要解析数据时，需要从环形缓冲区中读取数据。代码如下：

```c
static int GPTDrvRead(struct TimerDev *ptdev, unsigned char *buf, unsigned int length)
{
    if(NULL == ptdev)   return -EINVAL;
    if(NULL == buf)     return -EINVAL;
    if(0 == length)     return -EINVAL;
    if(NULL == gGPT3Buffer)   return -EINVAL;
    
    unsigned int ret = gGPT3Buffer->Read(gGPT3Buffer, buf, length);
    if(ret != length)   return -ENOMEM;
    return (int)length;
}
```

## 30.5 红外模块驱动

### 30.5.1 遥控器键值

红外遥控器上的所有按键的十六进制键值如下：

```c
const unsigned char KeyCode[20] = {0x45, 0x47, 0x44, 0x40, 0x43, 0x07, 0x15, 0x09, 0x16, 0x19, 0x0D, 0x0C, 0x18, 0x5E, 0x08, 0x1C, 0x5A, 0x42, 0x52, 0x4A};
```

为了方便理解，针对这些键值定义了一个字符串指针数组：

```c
const unsigned char *KeyName[20] = {"Open", "Menu", "Test", "+", "Return", "Back", "Suspend", "Forward", "0", "-", "Cancle", "1", "2", "3", "4", "5", "6", "7", "8", "9"};
```

### 30.5.2 红外设备对象封装

对于红外模块而言，最重要的就是获取键值，也就是读取函数；另外也要对红外模块进行初始化，抽象出一个结构体：

```c
typedef struct IRDADev{
    char *name;
    int (*Init)(struct IRDADev *ptdev);
    int (*Read) (struct IRDADev *ptdev, unsigned char *key_code, char **key_name);
}IRDADevice;
```

然后在dev_irda.c中构造IRDADev，代码如下：

```c
static struct IRDADev gIRDADev = {
    .name  = "nec",
    .Init = IRDADevInit,
    .Read = IRDADevRead
};

struct IRDADev *IRDADeviceGet(void)
{
    return &gIRDADev;
}
```

### 30.5.3 数据解码

根据NEC协议，数据的解码总体分为3步：

1) 查找引导码字段；
2) 查找连发码/非连发码字段；
3) 数据解析；

引导码是两个采样捕获数据的时间差在9ms左右，连发码的时间差是2.25ms左右，非连发码的在4.5ms左右，误差取为500us。

当收到一个引导码后，后续会传来32个位数据（表示地址和数据），那么定时器就需要采样64次，根据时间差分辨该位是1还是0。

综上所述，IRDA的解码程序如下设计：

```c
static int IRDADevRead(struct IRDADev *ptdev, unsigned char *key_code, char *key_name)
{
    if(NULL == ptdev)       return -EINVAL;
    if(NULL == pTimerDev)   return -EINVAL;
    
    uint16_t temp_buff[64] = {0};
    uint8_t pQ = 0;
    uint32_t tick[2] = {0};
    uint8_t step = 0;
    uint16_t duty = 0;
    uint32_t value = 0;
    uint8_t i = 0, cnt = 0;
    ptdev->key = NULL;
    while(1)
    {
        if(pTimerDev->Read(pTimerDev, (uint8_t*)&tick[pQ], sizeof(uint32_t)) != sizeof(uint32_t))
        {
            continue;
        }
        pQ++;
        if(pQ==2)
        {
            duty = (uint16_t)(tick[1] - tick[0])*10;
            tick[0] = tick[1];
            pQ = 1;
        }
        switch(step)
        {
            case 0:
            {   
                if( (duty>=8500) && (duty<=9500) )  // 引导码
                {
                    step++;
                }
                break;
            }
            case 1:
            {
                if( (duty>=4000) && (duty<=5000) )    // 非连发码
                {
                    i = 0;
                    cnt = 0;
                    step++;
                }
                else if( (duty>=2000) && (duty<=2500) )   // 连发码
                {
                    step += 3;
                }
                else
                {
                    step = 0;
                }
                break;
            }
            case 2:
            {                
                temp_buff[i] = duty;
                i++;
                if(i==64)   step++;
                break;
            }
            case 3:
            {
                for(i=0;i<64;i+=2)
                {
                    if( (temp_buff[i]>=450) && (temp_buff[i]<=650) ) 
                    {
                        if( (temp_buff[i+1]>=450) && (temp_buff[i+1]<=650) )    // 逻辑0
                        {
                        } 
                        else if( (temp_buff[i+1]>=1000) && (temp_buff[i+1]<=2000) ) // 逻辑1
                        {
                            value = value + (1<<cnt);
                        }
                        cnt++;
                    }
                }
                step++;
                break;
            }
            case 4:
            {
                step = 0;
                pQ = 0;
                uint8_t sys_code = (value>>16)&0xFF;
                for(i=0; i<20; i++)
                {
                    if(KeyCode[i] == sys_code)
                    {
                        *key_code = sys_code;
                        *key_name = (char*)KeyName[i];
                        return ESUCCESS;
                    }
                }
                return EIO;;
            }
            default:break;
        }
    }
}
```

成功解码后，返回按键码、按键名字。

## 30.6 测试程序

测试程序放在Applications文件夹中，IRDA的测试源文件为app_irda.c，在里面实现了一个设备测试函数，将所有用到的设备进行注册，初始化IRDA设备，并且读取键值打印出来，代码如下所示：

```c
void IRDAAppTest(void)
{
    UartDevicesRegister();
    TimerDevicesRegister();
    
    struct IRDADev *pIRDA = IRDADeviceGet();
    if(NULL == pIRDA)
    {
        printf("Failed to get IRDA device!\r\n");
        return;
    }
    pIRDA->Init(pIRDA);
    
    while(1)
    {
        if(ESUCCESS == pIRDA->Read(pIRDA))
        {
            printf("%s\r\n", pIRDA->key);
        }
    }
}
```

### 30.7 测试结果

在hal_entry()函数中调用测试函数IRDAAppTest，将编译出来的二进制可执行文件烧录到板子上运行，打开串口助手，按下遥控器按键可以看到类似下面的信息：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-30\image7.png)  