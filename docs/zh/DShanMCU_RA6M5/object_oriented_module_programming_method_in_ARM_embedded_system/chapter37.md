# 第37章 DAC数模转换模块

## 37.1 SPI-DAC模块工作原理

本次实验使用的SPI-DAC模块是定制模块，原理图如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-37\image1.png) 

核心芯片是TLC5615，主机通过SPI接口发出一个数字量，TCL5615将数字量转化为模拟量，并通过OUT引脚输出模拟电压来点亮LED。通过LED的亮度形象地感受DAC的效果。这个模块的参考电压是2.048V，可以输出的最大电压是2倍参考电压，即4.096V。

TLC5615是一个10bit的DAC转换芯片，用户需要将需要转换的数字量左移2bit后再通过SPI发送给TLC5165，数据格式和转换关系如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-37\image2.png)  

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-37\image3.png)  

由于TLC5615是10位DAC,它允许主控每次发送12位或者16位的数据，12位和16位的发送数据格式要求如下图所示。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-37\image4.png)  

这个模块的使用比较简单，重点是在SPI的通信上，其次是在发送数据的时候需要移位。

## 37.2 模块配置

本次实验使用的是开发板配套扩展板的SPI组，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-37\image5.PNG)  

使用的SPI引脚是P202/P203/P204和P205，SPI引脚对应使用的是RA6M5的Common SPI0:

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-37\image6.PNG)  

本次实验使用的SPI-DAC模块控制比较简单，对于SPI的Stack配置使用默认参数即可，使能发送buffer空中断，配置中断对调函数，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-37\image7.png) 

## 37.3 外设驱动

### 37.3.1 GPIO驱动

本次实验的SPI片选信号脚为P205，它的驱动如下：

```C
static struct IODev gSPIDACCSDev = {
    .name = "SPIDAC CS",
    .port = BSP_IO_PORT_02_PIN_05,
    .Init = IODrvInit,
    .Read = IODrvRead,
    .Write = IODrvWrite,
    .next = NULL
};

void IODevicesCreate(void)
{
    IODeviceInsert(&gSPIDACCSDev);
}
```

对于GPIO的驱动函数参考《32.4.1 GPIO驱动》。

### 37.3.2 SPI驱动

参考《35.4.2 SPI驱动》。

## 37.4 DAC驱动程序

### 37.4.1 SPI-DAC设备对象封装

要操纵SPI-DAC模块，只需要初始化、写入数值。为了更具观赏性，还可以提供写入多个数值的操作。把这些特性封装为一个结构体，代码如下（dev_spi_dac.h）：

```C
typedef struct SPIDACDev{
    char *name;
    int (*Init)(struct SPIDACDev *ptdev);
    int (*SetValue)(struct SPIDACDev *ptdev, float voltage);
    int (*Write)(struct SPIDACDev *ptdev, unsigned char *buf, unsigned int length);
}SPIDACDevice;
```

然后在dev_spi_dac.c里构造一个SPIDACDevice结构体，并给上层代码提高获得这个结构体的函数，代码如下：

```C
static SPIDACDevice gDAC = {
    .name = "SPI DAC",
    .Init       = SPIDACDevInit,
    .SetValue   = SPIDACDevSetValue,
    .Write      = SPIDACDevWrite,
};

struct SPIDACDev *SPIDACGetDevice(void)
{
    return &gDAC;
}
```

### 37.4.2 初始化SPI-DAC 

初始化SPI-DAC模块，本质就是初始化SPI控制器，代码如下：

```C
static int SPIDACDevInit (struct SPIDACDev *ptdev)
{
    if(NULL == ptdev)   return -EINVAL;
    gSPI = SPIDeviceFind("SPIDAC SPI");
    if(NULL == gSPI)    return -ENODEV;
    if(ESUCCESS != gSPI->Init(gSPI))    return -EIO;
    return ESUCCESS;
}
```

### 37.4.3 输出一个模拟量

要输出指定数字量，需要根据TLC5615的数据格式进行移位计算，再通过SPI发送给TLC5615：

```C
static int SPIDACDevSetValue (struct SPIDACDev *ptdev, float voltage)
{
    if(NULL == ptdev)   return -EINVAL;
    if(NULL == gSPI)    return -EINVAL;
    if(DAC_OUT_MAX_VOLTAGE < voltage)     return -EINVAL;

    unsigned short value = (unsigned short)((voltage*1024)/(DAC_OUT_MAX_VOLTAGE));
    value = (unsigned short)(value<<2);
    return gSPI->Write(gSPI, (unsigned char*)&value, 2);
}
```

### 37.4.4 输出N个模拟量

为了方便用户使用，将N个数字量在模块驱动函数内部进行格式转换，然后再通过SPI传输给转换芯片：

```C
static int SPIDACDevWrite(struct SPIDACDev *ptdev, unsigned char *buf, unsigned int length)
{
    if(NULL == ptdev)   return -EINVAL;
    if(NULL == gSPI)    return -EINVAL;
    if(NULL == buf)     return -EINVAL;
    if(0 == length)     return -EINVAL;
    
    unsigned short *pbuf = (unsigned short*)buf;
    for(unsigned int i=0; i<length; i+=2)
    {
        pbuf[i] = (unsigned short)(pbuf[i]<<2);
    }
    
    return gSPI->Write(gSPI, buf, length);
}
```

## 37.5 测试程序

本次实验使用SPI传输，连续发送0~4V的电压给DAC模块，以实现呼吸灯效果：

```C
void DeviceTest(void)
{
    UartDevicesRegister();
    TimerDevicesRegister();
    SPIDevicesRegister();
    IODevicesRegister();
    
    SPIDACDevice *pDevice = SPIDACGetDevice();
    if(NULL == pDevice)
    {
        xprintf("Failed to Find SPI DAC Devide!\r\n");
        return;
    }
    pDevice->Init(pDevice);
    
    bool dir = false;
    volatile float value = 0;
    while(1)
    {
        if(value > 4)
            dir = true;
        else if(value < 0)
            dir = false;
        
        if(dir)
            value += (float)0.5;
        else
            value -= (float)0.5;
        pDevice->SetValue(pDevice, value);
        mdelay(300);
    }
}
```

## 37.6 测试结果

将SPI-DAC模块插入到扩展板上后，再将程序烧写到开发板上运行，用户可以看到SPI-DAC模块上的LED呈现呼吸灯效果。