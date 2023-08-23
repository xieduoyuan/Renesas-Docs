# 第33章 DHT11温湿度获取实验

## 33.1 DHT11简介

### 33.1.1 产品概述

DHT11是一款可测量温度和湿度的传感器。比如市面上一些空气加湿器，会测量空气中湿度，再根据测量结果决定是否继续加湿。

DHT11数字温湿度传感器是一款含有已校准数字信号输出的温湿度复合传感器，具有超小体积、极低功耗的特点，使用单根总线与主机进行双向的串行数据传输。DHT11测量温度的精度为±2℃，检测范围为-20℃-60℃。湿度的精度为±5%RH，检测范围为5%RH-95%RH，常用于对精度和实时性要求不高的温湿度测量场合。

### 33.1.2 硬件连接

主机通过一条数据线与DH11连接，主机通过这条线发命令给DHT11，DHT11再通过这条线把数据发送给主机。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image1.png) 

### 33.1.3 通信时序

主控发出开始信号后,DHT11从低功耗模式转换到高速模式,等待主机开始信号结束后,DHT11发送响应信号,并送出40bit的数据,完成一次信号采集。DHT11接收到开始信号后触发一次温湿度采集,如果没有开始信号,DHT11不会主动进行温湿度采集。采集数据后转换到低速模式。

通讯过程如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image2.png)  

1) 总线空闲状态为高电平；
2) 主机把总线拉低等待DHT11响应,主机把总线拉低必须大于18毫秒,保证DHT11能检测到起始信号；
3) DHT11接收到主机的开始信号后,等待主机开始信号结束,然后发送80us低电平响应信号；
4) 主机发送开始信号结束后,延时等待20-40us后,读取DHT11的响应信号；

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image3.png)  

主机发送开始信号后,可以切换到输入模式,或者输出高电平均可,总线由上拉电阻拉高。

- 总线为低电平,说明DHT11发送响应信号；
- DHT11发送响应信号后,再把总线拉高80us,准备发送数据；
- 每一bit数据都以50us低电平时隙开始,高电平的长短定了数据位是0还是1；如果读取响应信号为高电平,则DHT11没有响应,请检查线路是否连接正常；
- 当最后一bit数据传送完毕后，DHT11拉低总线50us,随后总线由上拉电阻拉高进入空闲状态；

### 33.1.4 数据位格式

1. 数据‘0’

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image4.png)  

2. 数据‘1’

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image5.png)  

 

## 33.2 模块配置

和DS18B20非常相似，DHT11也是一个单总线设备。对于时延函数的精度也达到微秒级，因而配置和DS18B20基本一致。DHT11使用的GPIO是P503。

### 33.2.1 GPIO配置

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image6.png)  

### 33.2.2 GPT配置

 ![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image7.png)
## 33.3 驱动程序

### 33.3.1 IO驱动

和DS18B20的IO驱动一模一样，参考《32.4.1 IO驱动》。

### 33.3.2 定时器驱动

和DS18B20的GPT驱动一模一样，参考《32.4.2 定时器驱动》。

## 33.4 DHT11模块

### 33.4.1 DHT11设备对象

要操作DHT11，只需要对它进行初始化、然后读取数值。抽象出如下结构体：

```c
typedef struct DHT11Dev{
    unsigned int tempture;
    unsigned int humidity;
    int (*Init)(struct DHT11Dev *ptdev);
int (*Read)(struct DHT11Dev *ptdev);
}DHT11Device;
```

在drv_dht11.c中实现了一个DTH11Dev结构体，代码如下：

```c
static struct DHT11Dev gDevice = {
    .tempture = 0,
    .humidity = 0,
    .Init = DHT11DevInit,
.Read = DHT11DevRead
};
```

最后需要向上层应用提供获取DHT11设备的接口：

```c
struct DHT11Dev *DHT11GetDevice(void)
{
    return &gDevice;
}
```

### 33.4.2 初始化设备

初始化DHT11即初始化IO：

```c
static int DHT11DevInit(struct DHT11Dev *ptdev)
{
    if(NULL == ptdev)   return -EINVAL;
    gDataDevice = IODeviceFind("DHT11 IO");
    if(NULL == gDataDevice)
    {
        printf("Failed to find DHT11 IO!\r\n");
        return -ENXIO;
    }
    if(ESUCCESS != gDataDevice->Init(gDataDevice))
    {
        printf("Failed to init GPIO!\r\n");
        return -EIO;
    }
    return ESUCCESS;
}
```

### 33.4.3 温湿度数据读取

DHT11的数据读取不像DS18B20那样需要发送指令，它完全依靠总线的时延特征来区分信号和数据：

```c
static int DHT11DevRead(struct DHT11Dev *ptdev)
{
    if(NULL == ptdev)   return -EINVAL;
    unsigned int timeout = 100;
    static long long tmp = 0;
    unsigned int tempture_data_inter = 0, tempture_data_dec = 0;
    unsigned int humidity_data_inter = 0, humidity_data_dec = 0;
    unsigned char crc_data = 0;

    tmp = 0;
    // 主机拉低最少18ms
    gDataDevice->Write(gDataDevice, 0);
    mdelay(20);
    // 拉高等待DHT11响应，20-40us
    gDataDevice->Write(gDataDevice, 1);
    udelay(30);
    gDataDevice->Read(gDataDevice);
    while((gDataDevice->value==1) && (timeout!=0))
    {
        gDataDevice->Read(gDataDevice);
        udelay(1);
        timeout--;
    }
……………..（省略，读者自行阅读配套代码原文）
    // 响应DHT11拉低总线80us后再拉高总线80us
    if(crc_data==(tempture_data_inter + humidity_data_inter + tempture_data_dec + humidity_data_dec))
    {
        ptdev->tempture = tempture_data_inter;
        ptdev->humidity = humidity_data_inter;
        return ESUCCESS;
    }
    return -EIO;
}
```

## 33.5 测试程序

获取到DHT11设备且初始化后，即可开始读取数据。本次实验每隔1s读取一次，并将结果打印出来：

```c
void DeviceTest(void)
{
    UartDevicesRegister();
    TimerDevicesRegister();
    IODevicesRegister();
    
    DHT11Device *pDevice = DHT11GetDevice();
    if(NULL == pDevice)
    {
        printf("Error. There is no DHT11 device!\r\n");
        return;
    }
    pDevice->Init(pDevice);
    printf("\r\n");
    while(1)
    {
        if(pDevice->Read(pDevice) == ESUCCESS)
        {
            printf("环境温度：%d℃ \t 环境湿度：%d℃ \r", pDevice->tempture, pDevice->humidity);
        }
        delay(1);
    }
}
```

## 33.6 测试结果

将程序烧录到开发板运行，可以观察到如下结果：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-32\image8.png)