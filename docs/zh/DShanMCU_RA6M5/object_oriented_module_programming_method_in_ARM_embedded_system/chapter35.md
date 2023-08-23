# 第35章 ADXL345三轴传感器驱动实验

## 35.1 ADXL345三轴传感器简介

### 35.1.1 产品概述

ADXL345是一款小而薄的超低功耗3轴加速度计，分辨率高(13位)，测量范围达±16g。数字输出数据为16位二进制补码格式，可通过SPI(3线或4线)或I2C数字接口访问。

该器件提供多种特殊检测功能。活动和非活动检测功能：通过比较任意轴上的加速度与用户设置的阈值来检测有无运动发生。敲击检测功能：可以检测任意方向的单振和双振动作。自由落体检测功能：可以检测器件是否正在掉落。这些功能可以独立映射到两个中断输出引脚中的一个。

### 35.1.2 串行SPI通信

对于SPI，可3线或4线配置，如以下连接图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-35\image1.png) 

本书配套开发板使用的是4线SPI，对应的通信时序如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-35\image2.png)  

从时序图中可知，ADXL345的地址只有6bit[A5:A0]，地址字节的最高位为读写控制位，此位为1表示对某个地址写数据；此位为0表示读取某个地址的数据。

### 35.1.3 寄存器映射表

ADXL345的可访问寄存器多大31个，为了节省篇幅，本书就不在此处一一列举。请读者自行查阅本书配套的资料包中关于ADXL345的手册，里面对其寄存器进行了详细的说明描述。

### 35.1.4 ADXL345的中断

ADXL345提供两个中断输出引脚：INT1和INT2。这两个中断引脚都是推挽低阻抗引脚。中断引脚默认配置为高电平有效。设置DATA_FORMAT寄存器(地址0x31)中的INT_INVERT位，可以更改为低电平有效。

### 35.1.5 ADXL345的敲击检测

加速度值超过THRESH_TAP寄存器(地址0x1D)值，并且持续时间小于DUR寄存器(地址0x21)规定的时间范围的时候，SINGLE_TAP中断置位。

两次加速度事件超过THRESH_TAP寄存器(地址0x1D)值，并且持续时间小于DUR寄存器(地址0x21)的规定时间范围的时候，DOUBLE_TAP中断置位。第二次敲击开始于Latent寄存器(地址0x22)规定的时间之后，但在Window寄存器(0x23)规定时间内。详情见手册敲击检测部分。

### 35.1.6 ADXL345的活动检测

加速度值大于THRESH_ACT寄存器(地址0x24)存储值时，Activity(活动)中断置位，由任一轴参与，通过ACT_INACT_CTL寄存器(0x27)置位。

加速度值小于THRESH_INACT寄存器(地址0x25)的存储值时，Inactivity(静止)位置位，所有轴参与，多于TIME_INACT寄存器(地址0x26)规定的时间，通过ACT_INACT_CTL寄存器(地址0x27)置位。TIME_INACT最大值为255秒。

### 35.1.7 ADXL345的自由落体检测

加速度值小于THRESH_FF寄存器(地址0x28)的存储值时，FREE_FALL置位，大于TIME_FF寄存器(地址0x29)所有轴(逻辑与)所规定的时间。FREE_FALL中断不同于静止中断，因为：所有轴始终参与，并为逻辑“和”的形式，定时器周期小得多(最大值：1.28秒)，始终为直流耦合操作模式。

## 35.2 ADXL345输出响应

ADXL345的输出响应，相对于XYZ方向的关系如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-35\image3.png)  

## 35.3 模块配置

### 35.3.1 GPIO配置

本次实验使用的是开发板配套扩展板的SPI组，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-35\image4.png)

使用的SPI引脚是P202/P203/P204和P205，SPI引脚对应使用的是RA6M5的Common SPI0:

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-35\image5.png)  

对于P205，将它配置为通用输出即可。

### 35.3.2 SPI配置

本次实验中，对于SPI的Stack配置不能直接使用默认的参数了，因为ADXL345的手册中明确指明了SPI的SCLK线在空闲时需要处于高电平，而且采样数据是在SPI的上升沿采样，在下降沿有效，而RASC中对于SPI的默认参数刚好相反，需要用户做修改：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-35\image6.png)  

另外还需要使能SPI的“发送buffer为空中断”、“接收中断”，并命名中断回调函数。

## 35.4 外设驱动程序

### 35.4.1 GPIO驱动

本次实验的SPI片选信号脚P205，会使用软件方式拉低或拉高此引脚来选中SPI设备或放弃SPI设备，因而需要使用GPIO设备对象。

```c
static struct IODev gSPIDACCSDev = {
    .name = "ADXL345 CS",
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

### 35.4.2 SPI驱动

对于SPI设备而言，需要的驱动功能无非就是：初始化、读、写和同时读写，因而将这些属性需求封装到一个结构体中，源码如下：

```c
typedef struct SPIDev{
	char *name;
    unsigned char channel;
    int (*Init)(struct SPIDev *ptdev);
    int (*Write)(struct SPIDev *ptdev, const unsigned char *buf, unsigned int length);
    int (*Read)(struct SPIDev *ptdev, unsigned char *buf, unsigned int length);
    int (*WriteRead)(struct SPIDev *ptdev, unsigned char * const wbuf, unsigned char *rbuf, unsigned int length);
    struct SPIDev *next;
}SPIDevice;
```

对于SPI设备对象的管理依然使用链表的方式，实现注册、插入、查找和打印，在dev_spi.c中实现。

1. 初始化SPI

对于RA6M5而言，初始化SPI控制器，其实就是调用open函数打开指定SPI即可，本书实验做了一点补充，将片选信号也放到初始化函数中：

```c
static int SPIDrvInit(struct SPIDev *ptdev)
{
    if(NULL == ptdev)   return -EINVAL;
    switch(ptdev->channel)
    {
        case 0:
        {
            pCSIO = IODeviceFind("SPIDAC CS");
            if(NULL == pCSIO)      return -ENXIO;
            /* 打开设备 */
            fsp_err_t err = g_spi0.p_api->open(g_spi0.p_ctrl, g_spi0.p_cfg);
            assert(FSP_SUCCESS == err);
            break;
        }
        case 1:case 2:case 3:case 4:
        case 5:
        case 6:case 7:case 8:case 9:
            break;
        default:break;
    }
    return ESUCCESS;
}
```

2. SPI写数据

Common SPI不同于SCI SPI，SCI SPI只能输出8bit的数据，而Common SPI还能够输出1~32bit的数据，因而用户完全可以根据要写的数据量来动态调整数据位数，以加速传输速度：

```c
static int SPIDrvWrite(struct SPIDev *ptdev, const unsigned char *buf, unsigned int length)
{
    if(NULL == ptdev)   return -EINVAL;
    if(NULL == buf)     return -EINVAL;
    if(0 == length)     return -EINVAL;
    
    switch(ptdev->channel)
    {
        case 0:
        {
            pCSIO->Write(pCSIO, 0);
            fsp_err_t err = FSP_SUCCESS;
            if((length%4)==0)
            {
                length = length>>2;
                err = g_spi0.p_api->write(g_spi0.p_ctrl, buf, length, SPI_BIT_WIDTH_32_BITS);
            }
            else if((length%2)==0)
            {
                length = length>>1;
                err = g_spi0.p_api->write(g_spi0.p_ctrl, buf, length, SPI_BIT_WIDTH_16_BITS);
            }
            else if(length==1)
            {
                err = g_spi0.p_api->write(g_spi0.p_ctrl, buf, length, SPI_BIT_WIDTH_8_BITS);
            }
            assert(FSP_SUCCESS == err);
            SPI0DrvWaitTxCplt();
            pCSIO->Write(pCSIO, 1);
            break;
        }
        case 1:case 2:case 3:case 4:
            break;
        case 5:
        case 6:case 7:case 8:case 9:
            break;
        default:break;
    }
    return ESUCCESS;
}
```

需要注意的是SPI传输一次最大能够传输65536个数据，如果传输的数据超过了这个上限，用户需要分包传输。

3. SPI读数据

Common SPI读取数据也是一样的道理，可以读取32bit以内的任意位数的数据，一次读取多达数据个数也是65536个：

```c
static int SPIDrvRead(struct SPIDev *ptdev, unsigned char *buf, unsigned int length)
{
    if(NULL == ptdev)   return -EINVAL;
    if(NULL == buf)     return -EINVAL;
    if(0 == length)     return -EINVAL;
    
    switch(ptdev->channel)
    {
        case 0:
        {
            pCSIO->Write(pCSIO, 0);
            fsp_err_t err = FSP_SUCCESS;
            if((length%4)==0)
            {
                length = length>>2;
                err = g_spi0.p_api->read(g_spi0.p_ctrl, buf, length, SPI_BIT_WIDTH_32_BITS);
            }
            else if((length%2)==0)
            {
                length = length>>1;
                err = g_spi0.p_api->read(g_spi0.p_ctrl, buf, length, SPI_BIT_WIDTH_16_BITS);
            }
            else if(length==1)
            {
                err = g_spi0.p_api->read(g_spi0.p_ctrl, buf, length, SPI_BIT_WIDTH_8_BITS);
            }
            assert(FSP_SUCCESS == err);
            SPI0DrvWaitTxCplt();
            pCSIO->Write(pCSIO, 1);
            break;
        }
        case 1:case 2:case 3:case 4:
            break;
        case 5:
        case 6:case 7:case 8:case 9:
            break;
        default:break;
    }
    return ESUCCESS;
}
```

4. SPI同时读写数据

同时读写也是一个道理：

```c
static int SPIDrvWriteRead(struct SPIDev *ptdev, unsigned char * const wbuf, unsigned char *rbuf, unsigned int length)
{
    if(NULL == ptdev)   return -EINVAL;
    if(NULL == wbuf)    return -EINVAL;
    if(NULL == rbuf)    return -EINVAL;
    if(0 == length)     return -EINVAL;
    
    switch(ptdev->channel)
    {
        case 0:
        {
            pCSIO->Write(pCSIO, 0);
            fsp_err_t err = FSP_SUCCESS;
            if((length%4)==0)
            {
                length = length>>2;
                err = g_spi0.p_api->writeRead(g_spi0.p_ctrl, wbuf, rbuf, length, SPI_BIT_WIDTH_32_BITS);
            }
            else if((length%2)==0)
            {
                length = length>>1;
                err = g_spi0.p_api->writeRead(g_spi0.p_ctrl, wbuf, rbuf, length, SPI_BIT_WIDTH_16_BITS);
            }
            else if(length==1)
            {
                err = g_spi0.p_api->writeRead(g_spi0.p_ctrl, wbuf, rbuf, length, SPI_BIT_WIDTH_8_BITS);
            }
            assert(FSP_SUCCESS == err);
            SPI0DrvWaitTxCplt();
            pCSIO->Write(pCSIO, 1);
            break;
        }
        case 1:case 2:case 3:case 4:
            break;
        case 5:
        case 6:case 7:case 8:case 9:
            break;
        default:break;
    }
    return ESUCCESS;
}
```

5. 回调函数和传输完成等待函数

回调函数和传输等待在本书前文对于SPI外设的使用已经讲过，此处仅展示下代码：

```c
static volatile bool gSPI0TxCplt = false;
void spi0_callback(spi_callback_args_t *p_args)
{
    switch(p_args->event)
    {
        case SPI_EVENT_TRANSFER_COMPLETE:
        {
            gSPI0TxCplt = true;
            break;
        }
        default:break;
    }
}
static void SPI0DrvWaitTxCplt(void)
{
    while(!gSPI0TxCplt);
    gSPI0TxCplt = false;
}
```

## 35.5 ADXL345模块

对于ADXL345这个处理器，其官方给出了一个非常完备的参考驱动，参考地址：

https://github.com/analogdevicesinc/no-OS/tree/master/drivers/accel/adxl345

本节是对这个驱动代码的移植使用。

### 35.5.1 ADXL345设备对象

对于ADXL345，常用操作是读取3轴上的加速度值，在有些时候还会需要手动关闭和开启它的测量；另外，还需要设置ADXL345的测量范围以及精度，因而将这些属性统一封装到一个结构体中（dev_adxl345.h）：

 

```c
typedef struct ADXL345Dev{
    char *name;
    /** Measurement range */
    unsigned char   selected_range;
    /** Enable/Disable Full Resolution */
    unsigned char   full_resolution_set;
    MeasureValue    value;
    int (*Init)(struct ADXL345Dev *ptdev);
    int (*Read)(struct ADXL345Dev *ptdev);
    int (*Start)(struct ADXL345Dev *ptdev);
    int (*Stop)(struct ADXL345Dev *ptdev);
}ADXL345Device;
```

然后在dev_adxl345.c里构造一个ADXL345Device结构体，并给上层代码提高获得这个结构体的函数，代码如下：

```c
static ADXL345Device gADXL345 = {
    .name = "ADXL345",
    .selected_range = 2,
    .full_resolution_set = 0,
    .Init   = ADXLDevInit,
    .Read   = ADXLDevRead,
    .Start  = ADXLDevStart,
    .Stop   = ADXLDevStop
};

struct ADXL345Dev *ADXL345GetDevice(void)
{
    return &gADXL345;
}
```

### 35.5.2 寄存器读取函数

对于SPI传输，发送N个字节，就会读到N个字节。要访问ADXL345的寄存器，需要发出2个字节：第1个字节表示寄存器地址（它的最高位为1，表示要读寄存器；为0表示要写寄存器）。

针对寄存器的读写，定义了2个宏： 

```c
#define ADXL345_SPI_READ        (1 << 7)
#define ADXL345_SPI_WRITE       (0 << 7)
```

读寄存器时，将寄存器的地址跟ADXL345_SPI_READ进行或运算,就得到要发出的第一个字节，要发出的第二个字节可以设为0。SPI传输中发送2个字节，就会读到2个字节，读到的第2个字节就是要得到的数据：

```c
static uint8_t adxl345_get_register_value(uint8_t register_address)
{
    if(NULL == pADXLSPI)    return 0;

    uint8_t data_buffer[2] = {0, 0};
    uint8_t rxbuffer[2] = {0, 0};
    uint8_t register_value = 0;
    data_buffer[0] = ADXL345_SPI_READ | register_address;
    data_buffer[1] = 0;
    if(ESUCCESS != pADXLSPI->WriteRead(pADXLSPI, data_buffer, rxbuffer, 2))  return 0;
    register_value = rxbuffer[1];
    return register_value;
}
```

### 35.5.3 寄存器写函数

写寄存器时，将寄存器的地址跟ADXL345_SPI_WRITE进行或运算,就得到要发出的第一个字节，要发出的第二个字节就是要发出的数值。代码如下：

```c
static void adxl345_set_register_value(uint8_t register_address, uint8_t register_value)
{
    if(NULL == pADXLSPI)    return;

    uint8_t data_buffer[2] = {0, 0};
    uint8_t rxbuffer[2] = {0, 0};
    data_buffer[0] = ADXL345_SPI_WRITE | register_address;
    data_buffer[1] = register_value;
    pADXLSPI->WriteRead(pADXLSPI, data_buffer, rxbuffer, 2);
}
```

### 35.5.4 ADXL345指令定义

ADXL345的指令比较多，详细的请查看本章配套源码，本书此处仅展示部分代码：

```c
/* ADXL345 Register Map */
#define ADXL345_DEVID           0x00 // R   Device ID.
#define ADXL345_THRESH_TAP      0x1D // R/W Tap threshold.
#define ADXL345_OFSX            0x1E // R/W X-axis offset.
#define ADXL345_OFSY            0x1F // R/W Y-axis offset.
#define ADXL345_OFSZ            0x20 // R/W Z-axis offset.
#define ADXL345_DUR             0x21 // R/W Tap duration.
#define ADXL345_LATENT          0x22 // R/W Tap latency.
#define ADXL345_WINDOW          0x23 // R/W Tap window.
#define ADXL345_THRESH_ACT      0x24 // R/W Activity threshold.
#define ADXL345_THRESH_INACT    0x25 // R/W Inactivity threshold.
#define ADXL345_TIME_INACT      0x26 // R/W Inactivity time.
#define ADXL345_ACT_INACT_CTL   0x27 // R/W Axis enable control for activity
// and inactivity detection.
#define ADXL345_THRESH_FF       0x28 // R/W Free-fall threshold.
#define ADXL345_TIME_FF         0x29 // R/W Free-fall time.
#define ADXL345_TAP_AXES        0x2A // R/W Axis control for tap/double tap.
#define ADXL345_ACT_TAP_STATUS  0x2B // R   Source of tap/double tap.
```

### 35.5.5 设置功耗模式

ADXL345的功耗模式分为标准模式和测量模式，通过寄存器地址0x2D设置：

```c
#define ADXL345_POWER_CTL       0x2D // R/W Power saving features control.
static void adxl345_set_power_mode(uint8_t pwr_mode)
{
    uint8_t old_power_ctl = 0;
    uint8_t new_power_ctl = 0;

    old_power_ctl = adxl345_get_register_value(ADXL345_POWER_CTL);
    new_power_ctl = old_power_ctl & ~ADXL345_PCTL_MEASURE;
    new_power_ctl = new_power_ctl | (pwr_mode * ADXL345_PCTL_MEASURE);
    adxl345_set_register_value(ADXL345_POWER_CTL, new_power_ctl);
}
```

### 35.5.6 读取每个通道的坐标

读取坐标值的寄存器起始地址是0x32：

```c
#define ADXL345_DATAX0          0x32 // R   X-Axis Data 0.
static void adxl345_get_xyz(int16_t *x, int16_t *y, int16_t *z)
{
    if(NULL == pADXLSPI)    return;

    uint8_t first_reg_address = ADXL345_DATAX0;
    uint8_t read_buffer[7]    = {0, 0, 0, 0, 0, 0, 0};
    
    read_buffer[0] = ADXL345_SPI_READ | ADXL345_SPI_MB | first_reg_address;
    pADXLSPI->WriteRead(pADXLSPI, read_buffer, read_buffer, 7);
    /* x = ((ADXL345_DATAX1) << 8) + ADXL345_DATAX0 */
    *x = (int16_t)((read_buffer[2] << 8) + read_buffer[1]);
    /* y = ((ADXL345_DATAY1) << 8) + ADXL345_DATAY0 */  
    *y = (int16_t)((read_buffer[4] << 8) + read_buffer[3]);
    /* z = ((ADXL345_DATAZ1) << 8) + ADXL345_DATAZ0 */  
    *z = (int16_t)((read_buffer[6] << 8) + read_buffer[5]);
}
```

### 35.5.7 读取每个通道的加速度

加速度值是通过3轴坐标值计算转换过来的，计算方法在手册的【偏移校准】节有详细解释，此处参考官网给出的计算方法：

```c
/* ADXL345 Full Resolution Scale Factor */
#define ADXL345_SCALE_FACTOR    0.0039
static void adxl345_get_g_xyz(float *x, float *y, float *z)
{
    int16_t x_data = 0;  // X-axis's output data.
    int16_t y_data = 0;  // Y-axis's output data.
    int16_t z_data = 0;  // Z-axis's output data.

    adxl345_get_xyz(&x_data, &y_data, &z_data);
    *x = (float)(gADXL345.full_resolution_set  ? (x_data * ADXL345_SCALE_FACTOR) :
                (x_data * ADXL345_SCALE_FACTOR * (gADXL345.selected_range >> 1)));
    *y = (float)(gADXL345.full_resolution_set  ? (y_data * ADXL345_SCALE_FACTOR) :
                (y_data * ADXL345_SCALE_FACTOR * (gADXL345.selected_range >> 1)));
    *z = (float)(gADXL345.full_resolution_set  ? (z_data * ADXL345_SCALE_FACTOR) :
                (z_data * ADXL345_SCALE_FACTOR * (gADXL345.selected_range >> 1)));
}
```

### 35.5.8 使能/关闭敲击检测

敲击检测涉及一系列的寄存器读写控制：

```c
#define ADXL345_THRESH_TAP      0x1D // R/W Tap threshold.
#define ADXL345_DUR             0x21 // R/W Tap duration.
#define ADXL345_LATENT          0x22 // R/W Tap latency.
#define ADXL345_WINDOW          0x23 // R/W Tap window.
#define ADXL345_TAP_AXES        0x2A // R/W Axis control for tap/double tap.
```

然后通过设置这些寄存器的值来配置ADXL345的敲击检测功能：

```c
static void adxl345_set_tap_detection(uint8_t tap_type,
                                      uint8_t tap_axes,
                                      uint8_t tap_dur,
                                      uint8_t tap_latent,
                                      uint8_t tap_window,
                                      uint8_t tap_thresh,
                                      uint8_t tap_int)
{
    uint8_t old_tap_axes = 0;
    uint8_t new_tap_axes = 0;
    uint8_t old_int_map = 0;
    uint8_t new_int_map = 0;
    uint8_t old_int_enable = 0;
    uint8_t new_int_enable = 0;

    old_tap_axes = adxl345_get_register_value(ADXL345_TAP_AXES);
    new_tap_axes = old_tap_axes & ~(ADXL345_TAP_X_EN |ADXL345_TAP_Y_EN |ADXL345_TAP_Z_EN);
    new_tap_axes = new_tap_axes | tap_axes;
    adxl345_set_register_value(ADXL345_TAP_AXES, new_tap_axes);
    adxl345_set_register_value(ADXL345_DUR, tap_dur);
    adxl345_set_register_value(ADXL345_LATENT, tap_latent);
    adxl345_set_register_value(ADXL345_WINDOW, tap_window);
    adxl345_set_register_value(ADXL345_THRESH_TAP, tap_thresh);
    old_int_map = adxl345_get_register_value(ADXL345_INT_MAP);
    new_int_map = old_int_map & (~(ADXL345_SINGLE_TAP | ADXL345_DOUBLE_TAP));
    new_int_map = new_int_map | tap_int;
    adxl345_set_register_value(ADXL345_INT_MAP, new_int_map);
    old_int_enable = adxl345_get_register_value(ADXL345_INT_ENABLE);
    new_int_enable = old_int_enable & (~(ADXL345_SINGLE_TAP | ADXL345_DOUBLE_TAP));
    new_int_enable = new_int_enable | tap_type;
    adxl345_set_register_value(ADXL345_INT_ENABLE, new_int_enable);
}
```

### 35.5.9 使能/关闭活动检测

配置活动检测的寄存器地址有：

```c
#define ADXL345_ACT_INACT_CTL   0x27 // R/W Axis enable control for activity
#define ADXL345_THRESH_ACT      0x24 // R/W Activity threshold.
#define ADXL345_INT_ENABLE      0x2E // R/W Interrupt enable control.
#define ADXL345_INT_MAP         0x2F // R/W Interrupt mapping control.
```

通过配置这些寄存器来选择活动检测的方法和参数：

```c
static void adxl345_set_activity_detection(uint8_t act_on_off,
                                           uint8_t act_axes,
                                           uint8_t act_ac_dc,
                                           uint8_t act_thresh,
                                           uint8_t act_int)
{
    uint8_t old_act_inact_ctl = 0;
    uint8_t new_act_inact_ctl = 0;
    uint8_t old_int_map = 0;
    uint8_t new_int_map = 0;
    uint8_t old_int_enable = 0;
    uint8_t new_int_enable = 0;

    old_act_inact_ctl = adxl345_get_register_value(ADXL345_INT_ENABLE);
    new_act_inact_ctl = old_act_inact_ctl & ~(ADXL345_ACT_ACDC | ADXL345_ACT_X_EN | ADXL345_ACT_Y_EN | ADXL345_ACT_Z_EN);
    new_act_inact_ctl = new_act_inact_ctl | (act_ac_dc | act_axes);
    adxl345_set_register_value(ADXL345_ACT_INACT_CTL, new_act_inact_ctl);
    adxl345_set_register_value(ADXL345_THRESH_ACT, act_thresh);
    old_int_map = adxl345_get_register_value(ADXL345_INT_MAP);
    new_int_map = old_int_map & ~(ADXL345_ACTIVITY);
    new_int_map = new_int_map | act_int;
    adxl345_set_register_value(ADXL345_INT_MAP, new_int_map);
    old_int_enable = adxl345_get_register_value(ADXL345_INT_ENABLE);
    new_int_enable = old_int_enable & ~(ADXL345_ACTIVITY);
    new_int_enable = new_int_enable | (ADXL345_ACTIVITY * act_on_off);
    adxl345_set_register_value(ADXL345_INT_ENABLE, new_int_enable);
}
```

### 35.5.10 初始化ADXL345

初始化ADXL345时，需要初始化SPI控制器，另外还需要设置ADXL345自身的工作模式和检测属性：

```c
static int ADXLDevInit(struct ADXL345Dev *ptdev)
{
    if(NULL == ptdev)       return -EINVAL;
    
    pINT1IO = IODeviceFind("ADXL345 INT1");
    if(NULL == pINT1IO)    return -ENXIO;

    pADXLSPI = SPIDeviceFind("ADXL345 SPI");
    if(NULL == pADXLSPI)    return -ENXIO;
    if(ESUCCESS != pADXLSPI->Init(pADXLSPI))    return -EIO;

    if (adxl345_get_register_value(ADXL345_DEVID) != ADXL345_ID)
    {
        xprintf("Failed to read ADXL345's ID!\r\n");
        return -EIO;
    }
    
    adxl345_set_power_mode(0x01);   /* measure(1)/standby(0) mode.*/
    adxl345_set_range_resolution(ADXL345_RANGE_PM_16G,  /* Range option. +- 16g */
                                 ADXL345_FULL_RES);     /*Enables full resolution*/
    adxl345_set_tap_detection(ADXL345_SINGLE_TAP | ADXL345_DOUBLE_TAP,    /* Tap type (none, single, double) */
                              ADXL345_TAP_X_EN | ADXL345_TAP_Y_EN | ADXL345_TAP_Z_EN, /* tap_axes */
                              0x0D,   /* tap_dur */
                              0x50,   /* tap_latent */
                              0xF0,   /* tap_window */
                              0x20,   /* Tap threshold */
                              0x00);    /* Interrupts pin.0x0 - interrupts on INT1 pin */
    adxl345_set_activity_detection(0x01,    /* enables(1)/disable(0) the activity detection. */
                                   ADXL345_ACT_X_EN | ADXL345_ACT_Y_EN | ADXL345_ACT_Z_EN,  /* Axes which participate in detecting activity. */
                                   0x00,    /* dc(0)/ac(ADXL345_ACT_ACDC)-coupled operation. */
                                   0x08,    /* Threshold value for detecting activity */
                                   0x00);   /* Interrupts pin.0-int1 */
    adxl345_set_free_fall_detection(0x01,   /* disables(0)/enable(1) the free-fall detection. */
                                    0x08,   /* Threshold value for free-fall detection. The scale factor */
                                    0x0A,   /* Time value for free-fall detection */
                                    0x00);  /* Interrupts pin. */
	adxl345_get_all_axes();

    return ESUCCESS;
}
```

### 35.5.11 读取加速度

此函数调用获取三轴加速度的adxl345_get_g_xyz函数，只是将其进行了再次封装：

```c
static int ADXLDevRead(struct ADXL345Dev *ptdev)
{
    if(NULL == ptdev)       return -EINVAL;
    if(NULL == pADXLSPI)    return -EIO;

    adxl345_get_g_xyz(&ptdev->value.x, &ptdev->value.y, &ptdev->value.z);
    return ESUCCESS;
}
```

## 35.6 测试程序

将获取到的ADXL345设备对象初始化完毕之后，每隔500ms读一次3轴加速度数据，并将它们打印出来：

```c
void DeviceTest(void)
{
    UartDevicesRegister();
    TimerDevicesRegister();
    SPIDevicesRegister();
    IODevicesRegister();

    ADXL345Device *pADXL345 = ADXL345GetDevice();
    if(NULL == pADXL345)
    {
        xprintf("Failed to Find ADXL345 Device!\r\n");
        return;
    }
    pADXL345->Init(pADXL345);
    while(1)
    {
        if(pADXL345->Read(pADXL345) == ESUCCESS)
        {
            xprintf("x:%.4fg\ty:%.4fg\tz:%.4fg\r\n", pADXL345->value.x, pADXL345->value.y, pADXL345->value.z);
        }
        mdelay(500);
    }
}
```

## 35.7 测试结果

将程序烧写到开发板上运行，打开串口助手并且插上扩展板以及接上ADXL345模块，可以观察到下图所示的结果：

 ![]http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-35\image7.png) 