# 第28章 基于面向对象的工程结构

在前面的章节里，讲解了瑞萨RA6M5的常用外设，重点在于模块的操作原理、如何使用RASC进行配置、如何编写程序。这些模块功能单一，RASC生成的代码封装良好，也是基于面向对象的思想构造了对应的结构体。但是在使用这些模块时，我们没有特意使用面向对象的思想来写程序。

本章之后的内容，将会在FSP所提供的HAL库基础上，去操作更丰富的模块。这些模块的驱动程序，不应该跟底层的HAL库紧密绑定：比如温湿度传感器DHT11的驱动程序，既可以在RA6M5上运行，也能够非常容易地移植到其他平台上。在编写模块驱动程序时，就要把程序分层，每层之间设计好接口，然后使用面向对象的思想来实现各层。

随着功能的增加，一个工程涉及的文件会越来越多，本书设计了如下图所示的工程结构：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-28/image1.jpg)

1. 应用程序

位于applications目录下，用于存放业务相关的代码，它们可能是多个模块对象的联调，也可能是数据的处理。比如“根据按键操作LED”，这就属于应用层的代码。按键和LED的操作函数，不属于应用层，而是属于底下的设备层。

这一层需要和底层驱动完全解耦合：这一层的代码移植到其它平台时，无需修改代码。

2. 头文件

位于include目录下，主要存放error.h和config.h，前者用于统一错误代码，后者用于配置整个工程。

3. 设备层

位于devices目录。简单设备的文件直接放在devices目录里；对于模块，在devices目录下根据模块名字创建一个子目录，用来存放模块的文件。

在dev_xxx.h中根据设备的特性定义一些结构体，在dev_xxx.c里实现了这些结构体，并使用链表来管理同类设备。上层代码获取这些结构体后，就可以直接调用结构的函数指针来操作设备。

以GPIO设备为例，实现了4个函数：

```c
void IODevicesRegister(void);
void IODeviceInsert(struct IODev *ptdev);
struct IODev *IODeviceFind(const char *name);
void IODeviceList(void);
```

- IODevicesRegister：注册所有使用到的GPIO设备；
- IODeviceInsert：这个函数被底层的drv_gpio.c调用，用来插入一个GPIO设备；
- IODeviceFind：根据名称查找IO设备；
- IODeviceList：打印所有的IO设备；

4. 驱动层

位于drivers目录，存放的平台相关的驱动源代码。

drivers.h：根据config.h中的宏开关，包含drv_xxx.h。

drv_xxx.h：接口，供外部代码调用。

drv_xxx.h：驱动代码，一般用来实现并注册dev_xxx.h中声明的结构体，会调用平台提供的HAL库。

仍以GPIO设备为例，在dev_gpio.h里抽象出了IODev接构体，如下：

```c
typedef struct IODev{
    char            *name;
    unsigned int    port;
    unsigned char   value;
    int             (*Init)(struct IODev *ptDev);
    int             (*Write)(struct IODev *ptDev, unsigned char level);
    int             (*Read)(struct IODev *ptDev);
    struct IODev *next;
}IODevice, *pIODevice;
```

在drv_gpio.c，对于每一个GPIO引脚，都要实现一个IODev结构体，示例如下： 

```c
static struct IODev gDQDev = {
    .name = "DS18B20 DQ",
    .port = BSP_IO_PORT_00_PIN_03,
    .value = 0,
    .Init = IODrvInit,
    .Read = IODrvRead,
    .Write = IODrvWrite,
    .next = NULL
};
```

最后，在drv_gpio.c里还要实现一个函数，用来注册这些IODev：

```c
void IODevicesCreate(void)
{
    IODeviceInsert(&gDQDev);
}
```

在drv_gpio.h里声明IODevicesCreate函数，供外部代码调用。

5. 自定义库

位于libs目录。

存放一些通用功能模块，例如延时函数、环形缓冲区函数、printf重定向函数等。一般来说这些模块跟底层硬件关系不大，但是也有例外。比如延时函数跟底层硬件定时器密切相关，但是它太常用了，所以也放在libs目录下。

6. RA库

这一层是一个泛指，RA相关的代码。比如使用RASC生成工程时，这些目录的代码都是自动生成的：ra、ra_cfg、ra_gen，它们都属于“RA库”。