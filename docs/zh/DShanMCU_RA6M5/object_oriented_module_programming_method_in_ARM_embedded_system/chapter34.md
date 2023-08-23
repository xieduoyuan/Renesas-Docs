# 第34章 SR04超声波测距实验

## 34.1 SR04超声波模块简介

### 34.1.1 产品概述

超声波测距模块是利用超声波来测距。模块先发送超声波，然后接收反射回来的超声波，由反射经历的时间和声音的传播速度340m/s，计算得出距离。

SR04是一款常见的超声波传感器，模块自动发送8个40KHz的方波，自动检测是否有信号返回，用户只需提供一个触发信号，随后检测回响信号的时间长短即可。

SR04采用5V电压，静态电流小于2mA，感应角度最大约15度，探测距离约2cm-450cm。

### 34.1.2 硬件连接

主机通过两条数据线与SR04连接：主机通过Trig引脚发脉冲给SR04，主机检测Echo引脚的高电平时长。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image1.png) 

SR04模块上面有四个引脚，分别为：VCC、Trig、Echo、GND。

Trig是脉冲触发引脚，即控制该脚让SR04模块开始发送超声波。

Echo是回响接收引脚，即SR04模块一旦接收到超声波的返回信号则输出回响信号，回响信号的脉冲宽度与所测距离成正比。

### 34.1.3 测距时序

SR04超声波测距模块时序图所下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image2.png)  

要测距，需如下操作：

① 触发：

向Trig（脉冲触发引脚）发出一个大约10us的高电平。

② 发出超声波，接收反射信号：

模块就自动发出8个40Khz的超声波，超声波遇到障碍物后反射回来，模块接收返回来的超声波。

③ 回响：

模块接收到反射回来的超声波后，Echo引脚输出一个与检测距离成比例的高电平。

我们只要在该引脚为高时，开启定时器计数，在该引脚变为低时，结束定时器计数。根据定时器的计数和定时器频率就可以算出经历时间，根据时间即可推导出距离。

计算公式为：测试距离=(高电平时间*声速(340M/S))/2;

## 34.2 模块配置

### 34.2.1 GPIO配置

本次实验使用的超声波模块会使用到2个IO：Trig和Echo。P003连接到Trig，将其配置为输出模式：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image3.png)  

P503引脚连接到Echo，使用它的GPT触发功能，触发GPT的计数开启或者停止。

### 34.2.2 定时器配置

本次实验获取回响时间采用的方法是，使用P503触发GPT开始计数和结束计数。

已知Echo默认情况下是低电平的，当Trig发出信号后，Echo会产生高脉冲。

所以，使用P503的上升沿触发GPT的计数开启，下降沿触发GPT的计数停止，在Trig引脚发出开始脉冲后，就轮询GPT的状态和计数变化。

如果GPT处于停止状态，且计数不为0，那就代表着Echo触发了一次GPT计数，将计数值读取出来，就可以算出时间、举例。

RA6M5的P503引脚具有的外设复用功能如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image4.png) 

本书利用其GPY_POEG2:GTETRGC功能触发GPT，本次实验使用的是GPT0。对于GPT的配置如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image5.png)  

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image6.png) 

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image7.png)  

这里配置的计数周期值是32位GPT最大计数，这是为了尽可能让测量时间在GPT的一次计数周期内完成，不产生溢出以免增加计算的复杂度。

### 34.2.3 GPT_POEG配置

因为使用到了外部引脚触发GPT的POEG功能，因而还需要添加POEG Stack模块：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image8.png)  

另外P503是PORG2，所以添加的POEG模块通道要修改为2，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image9.png)  

## 34.3 驱动程序

### 34.3.1 IO驱动

和DS18B20的IO驱动一模一样，参考《32.4.1 IO驱动》。

### 34.3.2 定时器驱动

1. 初始化定时器

在初始化的时候除了要打开GPT以外，还需要打开POEG设备：

```c
static int GPTDrvInit(struct TimerDev *ptdev)
{
    if(NULL==ptdev) return -EINVAL;
    switch(ptdev->channel)
    {
        case 0:
        {
            /* 打开GPT设备完成初始化 */
            fsp_err_t err = g_timer0.p_api->open(g_timer0.p_ctrl, g_timer0.p_cfg);
            assert(FSP_SUCCESS == err);
            err = g_poeg0.p_api->open(g_poeg0.p_ctrl, g_poeg0.p_cfg);
            assert(FSP_SUCCESS == err);
            err = g_timer0.p_api->enable(g_timer0.p_ctrl);
            assert(FSP_SUCCESS == err);
            break;
        }
        default:break;
    }
    
    return ESUCCESS;
}
```

2. 轮询GPT状态以及读取计数值

```c
static int GPTDrvRead(struct TimerDev *ptdev, unsigned char *buf, unsigned int length)
{
    if(NULL == ptdev)   return -EINVAL;
    if(NULL == buf)     return -EINVAL;
    if(0 == length)     return -EINVAL;

    switch(ptdev->channel)
    {
        case 0:
        {
            timer_status_t status = {.state = TIMER_STATE_STOPPED};
            fsp_err_t err = g_timer0.p_api->statusGet(g_timer0.p_ctrl, &status);
            assert(FSP_SUCCESS == err);
            if(TIMER_STATE_STOPPED == status.state && status.counter == 0)
            {
                return -EIO;
            }
            else if(TIMER_STATE_STOPPED == status.state && status.counter != 0)
            {
                unsigned int *pbuf = (unsigned int *)buf;
                *pbuf = status.counter*10;    /* ns */
                err = g_timer0.p_api->reset(g_timer0.p_ctrl);
                assert(FSP_SUCCESS == err);
                return (int)length;
            }
            else
                return -EIO;
            break;
        }
        default:break;
    }
    return (int)length;
}
```

- 第12行：获取定时器状态；
- 第14行：判断状态是否停止和计数值是否为零，如果是这种情况那么就代表没有回响信号；
- 第18行：如果定时器是停滞状态，且GPT计数值不为0，就表示成功测量了一次回响信号，下面就取出计数值存入buffer。

## 34.4 SR04模块

### 34.4.1 SR04设备对象

要操作SR04，只需要对它进行初始化、然后读取数值。抽象出如下结构体（dev_ultra.h）：

```c
typedef struct UltraDev{
    float distance;
    unsigned int humidity;
    int (*Init)(struct UltraDev *ptdev);
int (*Read)(struct UltraDev *ptdev);
} UltraDevice;
```

在drv_ ultra.c中实现了一个UltraDev结构体，代码如下：

```c
static struct UltraDev gDevice = {
.distance = 0,
    .Init = UltraDevInit,
    .Read = UltraDevRead
};
```

最后需要向上层应用提供获取SR04设备的接口：

```c
struct UltraDev *UltraGetDevice(void)
{
    return &gDevice;
}
```

### 34.4.2 初始化设备

SR04的初始化函数就是初始化IO以及定时器：

```c
static int UltraDevInit(struct UltraDev *ptdev)
{
    if(NULL == ptdev)   return -EINVAL;
    gTrigDevice = IODeviceFind("Ultra Trig");
    if(NULL == gTrigDevice)
    {
        printf("Failed to Find Ultra Trig IO!\r\n");
        return -ENXIO;
    }
    if(ESUCCESS != gTrigDevice->Init(gTrigDevice))
    {
        printf("Failed to init GPIO!\r\n");
        return -EIO;
    }
    gTrigDevice->Write(gTrigDevice, 0);

    gEchoTimerDevice = TimerDeviceFind("Ultra Echo Timer");
    if(NULL == gEchoTimerDevice)
    {
        printf("Failed to Find Ultra Echo Timer!\r\n");
        return -ENXIO;
    }
    if(ESUCCESS != gEchoTimerDevice->Init(gEchoTimerDevice))
    {
        printf("Failed to init Ultra Echo Time!\r\n");
        return -EIO;
    }

    return ESUCCESS;
}
```

### 34.4.3 测量距离

当使用Trig发出开始脉冲后，只需要等待读取定时器的状态和计算出来的时间值即可：

```c
static int UltraDevRead(struct UltraDev *ptdev)
{
    if(NULL == ptdev)   return -EINVAL;
    gTrigDevice->Write(gTrigDevice, 1);
    udelay(20);
    gTrigDevice->Write(gTrigDevice, 0);
    unsigned int time = 0;
    while(gEchoTimerDevice->Read(gEchoTimerDevice, (unsigned char*)&time, 4) != 4);
    ptdev->distance = (float)(time*34.0/2/1000000.0);
    return ESUCCESS;
}
```

- 第09行：因为计算出来的时间是ns单位，因而通过声速和时间的公式计算出探测距离。

## 34.5 测试程序

本次实验每隔10ms探测一次距离：

```c
void DeviceTest(void)
{
    UartDevicesRegister();
    TimerDevicesRegister();
    IODevicesRegister();
    
    UltraDevice *pDevice = UltraGetDevice();
    if(NULL == pDevice)
    {
        printf("Error. There is no SR04 Ultra device!\r\n");
        return;
    }
    pDevice->Init(pDevice);
    while(1)
    {
        if(ESUCCESS == pDevice->Read(pDevice))
        {
            printf("测试距离：%.4fcm\r\n", pDevice->distance);
        }
        mdelay(10);
    }
}
```

## 34.6 测试结果

将程序烧写到开发板上运行可以得到如下图所示的探测结果：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-34\image10.png)

 