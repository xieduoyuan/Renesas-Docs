# 第32章 DS18B20温度获取实验

本章目标

- 了解DS18B20通信协议；
- 学会使用RA6M5驱动DS18B20以获取温度数据；

## 32.1 DS18B20简介

DS18B20温度传感器具有线路简单、体积小的特点，用来测量温度非常简单，在一根通信线上可以挂载多个DS18B20温度传感器。用户可以通过编程实现9~12位的温度读数，每个DS18B20有唯一的64位序列号，保存在rom中，因此一条总线上可以挂载多个DS18B20。

温度寄存器格式如下表所示：

|         | Bit 7                                                        | Bit 6                                                        | Bit 5                                                        | Bit 4                                                        | Bit 3                                                        | Bit 2                                                        | Bit 1                                                        | Bit 0                                                        |
| ------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| LS Byte | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps1.jpg) | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps2.jpg) | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps3.jpg) | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps4.jpg) | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps5.jpg) | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps6.jpg) | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps7.jpg) | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps8.jpg) |
| MS Byte | S                                                            | S                                                            | S                                                            | S                                                            | S                                                            | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps9.jpg) | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps10.jpg) | ![img](file:///C:\Users\myj\AppData\Local\Temp\ksohtml24560\wps11.jpg) |

## 32.1.1 单总线连接

主控芯片和DS18B20之间，只需要连接两条线：数据线、GND。除去GND，只有一条数据线，这就是单总线。

要使用一条数据线传输双向的数据，要考虑最坏的情况：如果双方同时驱动这个数据线时，一个输出高电平，一个输出低电平，会不会烧坏？所以，一般来说，单总线的驱动电路都是漏极开路，并且使用上拉电阻。如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image1.png)  

A、 B的输出值与DATA信号的关系，如下表所示：

| A    | B    | DATA |
| ---- | ---- | ---- |
| 0    | 0    | 0    |
| 0    | 1    | 0    |
| 1    | 0    | 0    |
| 1    | 1    | 1    |

即：DATA = A & B，只要一方输出0，DATA就是0。

使用单总线可以连接很多DS18B20，它们平时处于高阻态（内部输出1，反相后无法驱动三极管），不影响其他设备。参与通信的DS18B20，想输出0时并不会损坏其他设备。

DS18B20接口如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image2.png)  

## 32.1.2 内部存储器

DS18B20内部有个64位只读存储器（ROM）和64位配置存储器（SCRATCHP）。

64位只读存储器（ROM）包含序列号等，具体格式如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image3.png)  

低八位用于CRC校验，中间48位是DS18B20唯一序列号，高八位是该系列产品系列号(固定为28h)。因此，根据每个DS18B20唯一的序列号，可以实现一条总线上可以挂载多个DS18B20时，获取指定DS18B20的温度信息。

64位配置存储器（SCRATCHP）由9个Byte组成，包含温度数据、配置信息等，具体格式如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image4.png)  

Byte[0:1]：温度值。也就是当我们发出一个测量温度的命令之后，还需要发送一个读内存的命令才能把温度值读取出来。

Byte[2:3]：TL是低温阈值设置，TH是高温阈值设置。当温度低于/超过阈值，就会报警。 TL、TH存储在EEPROM中，数据在掉电时不会丢失；

Byte4：配置寄存器。用于配置温度精度为9、10、11或12位。配置寄存器也存储在EEPROM中，数据在掉电时不会丢失；

Byte[5:7]：厂商预留；

Byte[8]：CRC校验码。

## 32.1.3 通信时序

① 初始化时序

主机要跟DS18B20通信，首先需要发出一个开始信号。下图中，深黑色线表示由主机驱动信号，浅灰色线表示由DS18B20驱动信号。最开始时引脚是高电平，想要开始传输信号，步骤如下：

a. 主机必须要拉低至少480us，这是复位信号；

b. 然后主机释放总线，等待15~60us之后，

c. 如果GPIO上连有DS18B20芯片，它会拉低60~240us。

如果主机在最后检查到60～240us的低脉冲，则表示DS18B20初始化成功。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image5.png)  

② 写时序

如果写0，拉低至少60us(写周期为60-120us)即可；

如果写1，先拉低至少1us，然后拉高，整个写周期至少为60us即可。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image6.png)  

③ 读时序

主机先拉低至少1us，随后读取电平，如果为0，即读到的数据是0，如果为1，即可读到的数据是1。

整个过程必须在15us内完成，15us后引脚都会被拉高。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image7.png)  

## 32.1.4 常用命令

现在我们知道怎么发1位数据，收1位数据。发什么数据才能得到温度值，这需要用到“命令”。

DS18B20中有两类命令：ROM命令、功能命令，列表如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image8.png)  

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image9.png)  

## 32.1.5 流程图

DS18B20芯片手册中有ROM命令、功能命令的流程图，先贴出来，下一小节再举例。

ROM命令流程图如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image10.png)  

 功能命令流程图如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image11.png)  

## 32.1.6 操作示例1：单个DS18B20温度转换

总线上只一个DS18B20设备时，根据下表发送命令、读取数据。因为只有一个DS18B20，所以不需要选择设备，发出“Skip ROM”命令。然后发户“Convert T”命令启动温度转换；等待温度转换成功后再读数据。读数据前，也要发出“Skip ROM”命令。

下表列得很清楚：

| 主机模式 | 数据       | 描述                                              |
| -------- | ---------- | ------------------------------------------------- |
| 发送     | 复位       | 主机发出复位脉冲                                  |
| 接收     | 回应       | 总线上可能有多个DS18B20，它们都可以拉低信号，回应 |
| 发送     | CCh        | 主机发出“Skip ROM”命令(忽略ROM)                   |
| 发送     | 44h        | 主机发出“Convert T”命令(启动温度转换)             |
| 发送     | 保持高电平 | 主机使用强上拉保存数据线为高电平，至少tCONV()     |
| 发送     | 复位       | 主机发出复位脉冲                                  |
| 接收     | 回应       | 总线上可能有多个DS18B20，它们都可以拉低信号，回应 |
| 发送     | CCh        | 主机发出“Skip ROM”命令(忽略ROM)                   |
| 发送     | BEh        | 主机发出“Read Scratchpad”命令(读内存)             |
| 接收     | 9字节数据  | 主机读9字节数据                                   |

## 32.1.7 操作示例2：指定DS18B20温度转换

总线上有多个DS18B20设备时，根据下表发送命令、读取数据。首先是要选中指定设备：使用“Match ROM”命令发出ROM Code来选择中设备；然后发出“Convert T”命令启动温度转换；等待温度转换成功后读数据。读数据前，也要发出“Match ROM”命令、ROM Code。

下表列得很清楚：

| 主机模式 | 数据         | 描述                                              |
| -------- | ------------ | ------------------------------------------------- |
| 发送     | 复位         | 主机发出复位脉冲                                  |
| 接收     | 回应         | 总线上可能有多个DS18B20，它们都可以拉低信号，回应 |
| 发送     | 55h          | 主机发出“Match ROM”命令(匹配ROM)                  |
| 发送     | 64位ROM code | 主机发出想访问的DS18B20的“ROM Code”               |
| 发送     | 44h          | 主机发出“Convert T”命令(启动温度转换)             |
| 发送     | 保持高电平   | 主机使用强上拉保存数据线为高电平，至少tCONV()     |
| 发送     | 复位         | 主机发出复位脉冲                                  |
| 接收     | 回应         | 总线上可能有多个DS18B20，它们都可以拉低信号，回应 |
| 发送     | 55h          | 主机发出“Match ROM”命令(匹配ROM)                  |
| 发送     | 64位ROM code | 主机发出想访问的DS18B20的“ROM Code”               |
| 发送     | BEh          | 主机发出“Read Scratchpad”命令(读内存)             |
| 接收     | 9字节数据    | 主机读9字节数据                                   |

## 32.2 模块配置

DS18B20所用引脚要配置为开漏输出，还要使用一个GPT定时器实现微妙的延时。

## 32.2.1 GPIO配置

本次实验使用的DS18B20为扩展模块，接插到开发板的扩展板上。使用引脚P003作为DS18B20的DQ功能引脚，原理图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image12.png)  

根据DS18B20手册的描述，DQ引脚应该被设置为开漏输出，因而在RASC中如下配置：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image13.png)  

## 32.2.2 GPT配置

本次实验需要比较精确的微妙级别的延时，因而使用了一个GPT定时器来实现延时函数，GPT配置如下图所示；

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image14.png)  

## 32.3 延时函数模块封装

为了满足更多的需求，将延时函数封装为一个独立的模块，实现秒级、毫秒级和微秒级的延时函数。这些延时函数对于不同的平台，不同的RTOS，内部实现的办法会有所不同。

基于瑞萨处理器RA6M5平台，这些延时函数使用定时器设备的Timeout函数实现，代码如下：

```c
void delay(unsigned long secs)
{
    struct TimerDev *pTimer = TimerDeviceFind("Delay Timer");
    pTimer->Timeout(pTimer, secs*1000*1000);
}

void mdelay(unsigned long msecs)
{
    struct TimerDev *pTimer = TimerDeviceFind("Delay Timer");
    pTimer->Timeout(pTimer, msecs*1000);
}

void udelay(unsigned long usecs)
{
    struct TimerDev *pTimer = TimerDeviceFind("Delay Timer");
    pTimer->Timeout(pTimer, usecs);
}
```

要想使用上述函数，要在config.h中定义如下宏开关：

```c
/* Libraries Enable/Disable */
#define LIBS_USE_DELAY      1
```

## 32.4 驱动程序

## 32.4.1 GPIO驱动

GPIO驱动程序就是对引脚进行初始化和读写。

1. 初始化GPIO

   ```c
   static int IODrvInit(struct IODev *ptdev)
   {
       if(ptdev == NULL)       return -EINVAL;
       if(ptdev->name == NULL) return -EINVAL;
       
       fsp_err_t err = g_ioport.p_api->open(g_ioport.p_ctrl, g_ioport.p_cfg);
       assert(FSP_SUCCESS == err);
   
       return ESUCCESS;
   }
   ```

1. 输出电平

   ```c
   static int IODrvWrite(struct IODev *ptdev, unsigned char level)
   {
       if(ptdev == NULL)       return -EINVAL;
       if(ptdev->name == NULL) return -EINVAL;
       
       fsp_err_t err = g_ioport.p_api->pinCfg(g_ioport.p_ctrl, ptdev->port, IOPORT_CFG_PORT_DIRECTION_OUTPUT);
       assert(FSP_SUCCESS == err);
       err = g_ioport.p_api->pinWrite(g_ioport.p_ctrl, ptdev->port, (bsp_io_level_t)level);
       assert(FSP_SUCCESS == err);
   
       return ESUCCESS;
   }
   ```

- 第06行：将IO重新配置为输出模式；

2. 读取电平

   ```c
   static int IODrvRead(struct IODev *ptdev)
   {
       if(ptdev == NULL)       return -EINVAL;
       if(ptdev->name == NULL) return -EINVAL;
   
       fsp_err_t err = g_ioport.p_api->pinCfg(g_ioport.p_ctrl, ptdev->port, IOPORT_CFG_PORT_DIRECTION_INPUT);
       assert(FSP_SUCCESS == err);
       err = g_ioport.p_api->pinRead(g_ioport.p_ctrl, ptdev->port, (bsp_io_level_t*)&ptdev->value);
       assert(FSP_SUCCESS == err);
   
       return ESUCCESS;
   }
   ```

- 第06行：将IO重新配置为输入模式；

## 32.4.2 定时器驱动

本节只展现GPT关键的代码，至于其它部分代码请读者自行参考前面章节。

1. 初始化GPT

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
               break;
           }
           case 1:case 2:case 3:
           case 4:case 5:case 6:
           case 7:case 8:case 9:
               break;
           default:break;
       }
       
       return ESUCCESS;
   }
   ```


2. GPT Timeout

```c
static int GPTDrvTimeout(struct TimerDev *ptdev, unsigned int timeout)
{
    if(NULL == ptdev)   return -EINVAL;
    if(0 == timeout)    return -EINVAL;
    switch(ptdev->channel)
    {
        case 0:
        {
            fsp_err_t err = g_timer0.p_api->periodSet(g_timer0.p_ctrl, timeout*100);
            assert(FSP_SUCCESS == err);
            err = g_timer0.p_api->reset(g_timer0.p_ctrl);
            assert(FSP_SUCCESS == err);
            err = g_timer0.p_api->start(g_timer0.p_ctrl);
            assert(FSP_SUCCESS == err);
            GPTDrvWaitTimer0Overflow();
            break;
        }
        case 1:case 2:case 3:
        case 4:case 5:case 6:
        case 7:case 8:case 9:
            break;
        default:break;
    }
    return ESUCCESS;
}
```

## 32.5 DS18B20模块

## 32.5.1 DS18B20设备对象

要操作DS18B20，只需要对它进行初始化、然后读取数值（在读函数中封装了启动温度转换的操作）。抽象出如下结构体：

```c
typedef struct DS18B20Dev{
    float value;
    int (*Init)(struct DS18B20Dev *ptdev);
    int (*Read)(struct DS18B20Dev *ptdev);
}DS18B20Device;
```

在Read函数中会发出各类指令，根据这些指令定义一个枚举类型：

```c
typedef enum
{
    READ_ROM            = 0x33,
    MATCH_ROM           = 0x55,
    SEARCH_ROM          = 0xF0,
    ALARM_SEARCH        = 0xEC,
    SKIP_ROM            = 0xCC,
    
    WRITE_SCRATCHPAD    = 0x4E,
    READ_SCRATCHPAD     = 0xBE,
    COPY_SCRATCHPAD     = 0x48,
    CONVERT_T           = 0x44,
    RECALL_E2           = 0xB8,
    READ_POWER_SUPPLY   = 0xB4,
}DS18B20_CMD;
```

最后需要向上层应用提供获取DS18B20设备的接口：

```c
struct DS18B20Dev *DS18B20GetDevice(void)
{
    return &gDevice;
}
```

## 32.5.2 初始化设备

DS18B20本身不需要进行什么初始化，只需要初始化使用到的IO即可：

```c
static int DS18B20DevInit(struct DS18B20Dev *ptdev)
{
    if(NULL == ptdev)   return -EINVAL;
    gDQDevice = IODeviceFind("DS18B20 DQ");
    if(NULL == gDQDevice)
    {
        printf("Failed to find DS18B20 DQ!\r\n");
        return -ENXIO;
    }
    if(ESUCCESS != gDQDevice->Init(gDQDevice))
    {
        printf("Failed to init GPIO!\r\n");
        return -EIO;
    }
    return ESUCCESS;
}
```

## 32.5.3 DS18B20发送一个字节数据

根据DS18B20通信时序，实现发送一个字节的函数：

```c
static void DS18B20DevWriteByte(unsigned char cmd)
{
    for(unsigned char i=0; i<8; i++)
    {
        if((cmd&0x01)==0x01)   // 写1
        {
            gDQDevice->Write(gDQDevice, 0);
            udelay(10);  // 低电平维持10us
            gDQDevice->Write(gDQDevice, 1);
            udelay(100); // 高电平维持100us, 总时长110us 
        }
        else    // 写0
        {
            gDQDevice->Write(gDQDevice, 0);
            udelay(100);  // 低电平维持50us
            gDQDevice->Write(gDQDevice, 1);
            udelay(10);  // 高电平维持50us, 总时长100us 
        }
        cmd = cmd>>1;
    }
}
```

## 32.5.4 DS18B20接收一个字节数据

基于开漏输出的特点，主控想放弃单总线的控制时，要让它输出1；然后才可以读取数据。代码如下：

```c
static unsigned char DS18B20DevReadByte(void)
{
    unsigned char tmp = 0;
    unsigned char time_out = 100;

    for(unsigned char i=0; i<8; i++)
    {
        gDQDevice->Write(gDQDevice, 1);
        gDQDevice->Read(gDQDevice);
        if(gDQDevice->value==0)
        {
            tmp = (tmp>>1);
            gDQDevice->Read(gDQDevice);
            while((gDQDevice->value==0) && (time_out!=0))
            {
                udelay(1);
                gDQDevice->Read(gDQDevice);
                time_out--;
            }
            if(time_out==0) return 0xFF;
            udelay(10);
        }
        else
        {
            tmp = (tmp>>1)|0x80;
            udelay(100);
        }
    }
    return tmp;
}
```

- 第08行：处理器将IO输出寄存器写1放弃总线控制权；

## 32.5.5 DS18B20复位

1. 主控发出初始化时序

代码如下：

```c
static void DS18B20DevResetPulse(void)
{   
    if(NULL == gDQDevice)   return;

    gDQDevice->Write(gDQDevice, 1);
    udelay(10);
    gDQDevice->Write(gDQDevice, 0); // 主机拉低480us~960us
    udelay(480);
    gDQDevice->Write(gDQDevice, 1); // 主机拉高10us
    udelay(10);
}
```

第05、09行的代码让GPIO输出1，但是基于开漏电路的特点，它是依靠上拉电阻将总线拉高。

2. 主控等待DS18B20发出回应脉冲

当主机发出复位脉冲且放弃总线控制后，只需要去读取IO电平并判断时延即可：

```c
static int DS18B20DevWaitPresencePulse(void)
{
    if(NULL == gDQDevice)   return -EINVAL;
    unsigned int time_out = 100;

    time_out = 100;
    gDQDevice->Read(gDQDevice);
    while((gDQDevice->value==1) && (time_out!=0))  
    {
        // 等待DS18B20将总线拉低
        gDQDevice->Read(gDQDevice);
        udelay(1);
        time_out--;
    }
    if(time_out==0) return -EIO;
    
    time_out = 100;
    gDQDevice->Read(gDQDevice);
    while((gDQDevice->value==0) && (time_out!=0))  
    {
        gDQDevice->Read(gDQDevice);
        udelay(1);
        time_out--;
    }
    if(time_out==0) return -EIO;
    
    return ESUCCESS;
}
```

3. 复位函数

综合前两个函数即为复位函数：

```c
static int DS18B20DevReset(void)
{
    DS18B20DevResetPulse();
    if(DS18B20DevWaitPresencePulse() == EIO)
    {
        return -EIO;  // 等待应答超时
    }
    
    return ESUCCESS;
}
```

## 32.5.6 读取DS18B20温度数据

根据前面的操作示例1，编写读取函数，代码如下：

```c
static int DS18B20DevRead(struct DS18B20Dev *ptdev)
{
    if(NULL == ptdev)   return -EINVAL;

    unsigned char ret1 = 0, ret2 = 0;
    unsigned short ret = 0;
    
    if(ESUCCESS != DS18B20DevReset())
    {
        return -EIO;
    }
    DS18B20DevWriteByte(SKIP_ROM);    // 0xCC
    DS18B20DevWriteByte(CONVERT_T);   // 0x44
    
    if(ESUCCESS != DS18B20DevReset())
    {
        return -EIO;
    }
    DS18B20DevWriteByte(SKIP_ROM);    // 0xCC
    DS18B20DevWriteByte(READ_SCRATCHPAD); // 0xBE
    ret1 = DS18B20DevReadByte();
    ret2 = DS18B20DevReadByte();
    ret = (unsigned short)((ret2<<8) | ret1);

    float mTempture_inter = 0, mTempture_dec = 0, mTempture = 0;
    mTempture_dec = (float)((ret&0xFF)*0.0625);
    mTempture_inter = (ret>>4)&0x7F;
    mTempture = mTempture_inter + mTempture_dec;
    if(((ret>>12)&0xF)==0xF)
    {
        mTempture = -mTempture;
    }
    
    ptdev->value = mTempture;
    
    return ESUCCESS;
}
```

## 32.6 测试程序

测试程序比较简单，获取DS18B20设备并成功初始化之后，直接读取即可。本实验每隔2s读取一次数据并打印观察：

```c
void DeviceTest(void)
{
    UartDevicesRegister();
    TimerDevicesRegister();
    IODevicesRegister();
    
    DS18B20Device *pDevice = DS18B20GetDevice();
    if(NULL == pDevice)
    {
        printf("Error. There is no DS18B20 device!\r\n");
        return;
    }
    pDevice->Init(pDevice);
    printf("\r\n");
    while(1)
    {
        if(pDevice->Read(pDevice) == ESUCCESS)
        {
            printf("环境温度：%.4f℃ \r", pDevice->value);
        }
        delay(2);
    }
}
```

## 32.7 测试结果

将程序编译烧录到开发板中运行可以观察到如下图所示的测试结果：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image15.png)  

 