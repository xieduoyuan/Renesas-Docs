# 第4章 模块使用说明

如果要自己创建工程，那么可以阅读本章。建议从最后一个程序“1803_cpu_usage”里的复制各类驱动代码。

## 4.1 LED驱动使用方法

本节介绍板载LED驱动的使用方法，最终实现控制LED灯的亮灭。

驱动程序为drivers\drv_gpio.c，使用方法如下：

```c
// 包含头文件
#include "drv_gpio.h"

// 先获得设备
struct IODev *pLedDev = IOGetDecvice("UserLed");   

// 初始化
pLedDev->Init(pLedDev);

// 输出数值
bool state = false;
pLedDev->Write(pLedDev, state);
state = !state;
```

## 4.2 LCD驱动使用方法

本节介绍板载LCD驱动的使用方法，能够在LCD上显示文字。

### 4.2.1 硬件接线

LCD是板载的，原理图如下：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image1.png) 

各引脚的意思如下表：

| 显示屏接口号 | 接口含义                                                     | MCU引脚号 | MCU引脚模式            |
| :----------- | ------------------------------------------------------------ | --------- | ---------------------- |
| 13-MISO      | SPI从机的输出引脚，主机的输入引脚                            | P100      | SCI0 SPI的RXD0         |
| 14-CS        | SPI片选脚，低电平有效                                        | P103      | GPIO Out               |
| 15-RS        | ST7796s的数据/命令切换引脚，高电平表示接收数据，低电平表示接收命令 | P104      | GPIO Out               |
| 16-SCK       | SPI的时钟输出引脚                                            | P102      | SCI0 SPI的SCK0         |
| 17-MOSI      | SPI主机的输出引脚，从机的输入引脚                            | P101      | SCI0 SPI的TXD0         |
| 18-RESET     | ST7796s的硬件复位引脚                                        | P105      | GPIO Out               |
| 19-PWM       | 显示屏的背光控制引脚，高电平点亮                             | P608      | GPIO Out/GPT5的GTIOC5A |

### 4.2.2 RASC配置

先配置GPIO：SPI片选P103、LCD RS引脚P104（数据/命令切换）、LCD复位引脚P105、LCD背光引脚P608,把它们都配置为输出引脚，以P103为例如下图配置：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image2.png" style="zoom:75%;" /> 

再配置SPI接口，如下：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image3.png" style="zoom:75%;" />  

接着增加SPI stack：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image4.png" style="zoom:75%;" />  

进行配置：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image5.png" style="zoom:75%;" />  

### 4.2.3 函数说明

LCD的驱动程序分为2层：

① 底层硬件相关的驱动：drivers\drv_lcd.c，它被封装成了一个DisplayDevice结构体

② 打印字符的驱动：drivers\drv_font.c

使用时，包含drv_font.h，使用里面的函数即可。

函数说明如下：

```c
/*
 *  函数名：LCD_Init
 *  功能描述：初始化LCD
 *  输入参数：无
 *  输出参数：无
 *  返回值：无
 */
void LCD_Init(void);

/*
 *  函数名：LCD_Clear
 *  功能描述：清屏函数
 *  输入参数：无
 *  输出参数：无
 *  返回值：无
*/
void LCD_Clear(void);

/*
 *  函数名：LCD_PutChar
 *  功能描述：显示一个字符
 *  输入参数：x --> x坐标
 *            y --> y坐标
 *            c -->   显示的字符
 *  输出参数：无
 *  返回值：无
 */
void LCD_PutChar(int x, int y, char c);

/*
 *  函数名：LCD_PrintString
 *  功能描述：显示一个字符串
 *  输入参数：x --> x坐标
 *            y --> y坐标
 *            str -->   显示的字符串
 *  输出参数：无
 *  返回值：打印了多少个字符
 */
int LCD_PrintString(int x, int y, const char *str);

/*
 *  函数名：LCD_ClearLine
 *  功能描述：清除一行
 *  输入参数：x - 从这里开始
 *            y - 清除这行
 *  输出参数：无
 *  返回值：无
 */
void LCD_ClearLine(int x, int y);

/*
 *  LCD_PrintHex
 *  功能描述：以16进制显示数值
 *  输入参数：x - x坐标
 *            y - y坐标
 *            val -   显示的数据
 *            pre -   非零时显示"0x"前缀
 *  输出参数：无
 *  返回值：打印了多少个字符
 */
int LCD_PrintHex(int x, int y, uint32_t val, uint8_t pre);

/*
 *  LCD_PrintSignedVal
 *  功能描述：以10进制显示一个数值
 *  输入参数：x --> x坐标(0~15)
 *            y --> y坐标(0~7)
 *            val -->   显示的数据
 *  输出参数：无
 *  返回值：打印了多少个字符
*/
int LCD_PrintSignedVal(int x, int y, int32_t val);

/**********************************************************************
 *  LCD_GetFrameBuffer
 *  功能描述：获得LCD的Framebuffer
 *  输入参数：无
 *  输出参数：pXres/pYres/pBpp - 用来保存分辨率、bpp
 *  返回值：Framebuffer首地址
 * -----------------------------------------------
 * 2023/08/31        V1.0     韦东山       创建
 ***********************************************************************/
void * LCD_GetFrameBuffer(uint32_t *pXres, uint32_t *pYres, uint32_t *pBpp);

/**********************************************************************
 *  LCD_Flush
 *  功能描述：把Framebuffer的数据全部刷新到LCD
 *  输入参数：无
 *  输出参数：无
 *  返回值：无
 * -----------------------------------------------
 * 2023/08/31        V1.0     韦东山       创建
 ***********************************************************************/
void LCD_Flush(void);

/**********************************************************************
 *  LCD_FlushRegion
 *  功能描述：刷新LCD的区域
 *  输入参数：col     - LCD的列,取值范围0~127
 *            row - LCD的行,取值范围0~63
 *            width - 宽度
 *            heigh - 高度,必须是8的整数倍
 *  输出参数：无
 *  返回值：无
 * -----------------------------------------------
 * 2023/08/31        V1.0     韦东山       创建
 ***********************************************************************/
void LCD_FlushRegion(int col, int row, int width, int heigh);

/**********************************************************************
 *  LCD_ClearFrameBuffer
 *  功能描述：把Framebuffer的数据全部清零
 *  输入参数：无
 *  输出参数：无
 *  返回值：无
 * -----------------------------------------------
 * 2023/08/31        V1.0     韦东山       创建
 ***********************************************************************/
void LCD_ClearFrameBuffer(void);
```

使用流程：先调用“LCD_Init()”初始化LCD，然后就可以调用各类“LCD_Print*”函数在Framebuffer中填充内容了。注意，这些函数仅仅是在Framebuffer里构造内容，并没有更新到屏幕上，最后还需要调用“LCD_Flush”函数。

## 4.3 红外遥控器驱动使用方法

本节介绍板载红外接收器驱动的使用方法。

### 4.3.1 硬件接线

本次实验使用的是板载IRDA模块，其原理图如下图所示：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image6.png)  

使用的引脚是P404，属于定时器GPT3的输入输出控制引脚。

### 4.3.2 RASC配置

先配置引脚：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image7.png" style="zoom:75%;" />  

再添加GTP Stack：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image8.png" style="zoom: 80%;" />  

接着配置GPT Stack：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image9.png" style="zoom:80%;" />  

最后添加ELD Stack：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image10.png)  

### 4.3.3 函数说明

红外遥控器的驱动分为2部分：

① 它需要用到GPT3定时器，这套驱动分为2层：硬件驱动drivers/drv_gpt.c，Timer管理程序devices/dev_timer.c

② 红外驱动：devices\irda\dev_irda.c

使用时，包含dev_irda.h，使用里面的函数即可。

示例如下“applications\irda_app.c”：

```c
#include "dev_irda.h"

void irda_thread_entry(void *params)
{
    unsigned int dev, val;
    struct IRDADev *pIRDA = IRDADeviceGet();

    pIRDA->Init(pIRDA);

    if(ESUCCESS == pIRDA->Read(pIRDA, &dev, &val))
    {
    }
}
```

## 4.4 无源蜂鸣器驱动使用方法

本节介绍板载LED灯驱动的使用方法，最终实现控制LED灯的亮灭。

### 4.4.1 硬件接线

无源蜂鸣器的I/O引脚接到扩展板的“GPIO2/PWM”引脚，VCC、GND分别接到扩展板的5V、GND引脚。

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image11.png" style="zoom:75%;" />  

### 4.4.2 RASC配置

先配置引脚：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image12.png" style="zoom:80%;" />  

在添加timer：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image13.png" style="zoom:80%;" />  

设置PWM：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image14.png" style="zoom:70%;" />  

### 4.4.3 函数说明

对应驱动程序为：devices\dev_passive_buzzer.c。

使用时，包含dev_passive_buzzer.h，使用里面的函数即可。

函数说明如下：

```c
/**********************************************************************
 * 函数名称： PassiveBuzzer_Init
 * 功能描述： 无源蜂鸣器的初始化函数
 * 输入参数： 无
 * 输出参数： 无
 * 返 回 值： 无
 * 修改日期：      版本号     修改人	      修改内容
 * -----------------------------------------------
 * 2023/08/04	     V1.0	  韦东山	      创建
 ***********************************************************************/
void PassiveBuzzer_Init(void);

/**********************************************************************
 * 函数名称： PassiveBuzzer_Control
 * 功能描述： 无源蜂鸣器控制函数
 * 输入参数： on - 1-响, 0-不响
 * 输出参数： 无
 * 返 回 值： 无
 * 修改日期：      版本号     修改人	      修改内容
 * -----------------------------------------------
 * 2023/08/04	     V1.0	  韦东山	      创建
 ***********************************************************************/
void PassiveBuzzer_Control(int on);

/**********************************************************************
 * 函数名称： PassiveBuzzer_Set_Freq_Duty
 * 功能描述： 无源蜂鸣器控制函数: 设置频率和占空比
 * 输入参数： freq - 频率, duty - 占空比
 * 输出参数： 无
 * 返 回 值： 无
 * 修改日期：      版本号     修改人	      修改内容
 * -----------------------------------------------
 * 2023/08/04	     V1.0	  韦东山	      创建
 ***********************************************************************/
void PassiveBuzzer_Set_Freq_Duty(int freq, int duty);
```

## 4.5 I2C触摸屏驱动使用方法

### 4.5.1 硬件接线

本章使用的是外接触摸屏，使用FPC排线与主板相连，FPC的I2C原理图如下图所示：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image15.png)  

使用的引脚是P409和P410。

### 4.5.2 RASC配置

先把P403、P408配置为输出引脚。以P403为例，如下图操作（P408也是类似的）：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image16.png" style="zoom:80%;" />  

再配置I2C模块。先在RASC的“Pin Configuration”里的“Peripherals”找到“Connectivity:IIC”，然后根据硬件设计选择I2C通道。比如本书使用的是P409/P410作为I2C的SDA和SCL，这两个IO属于I2C2的A组引脚，因而选择“IIC2”，然后在展开的引脚配置中的“Pin Group Selection”选择“_A_only”并且使能操作模式，如下图所示：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image17.png" style="zoom: 80%;" />  

接着再去“Stacks”里添加I2C的模块。点击“New Stack”，选择“Connectivity”，再选择里面的“I2C Master(r_iic_master)”。本章目标是作为主机去读取触摸屏的数据，所以选择Master，如下图所示：

 ![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image18.png) 

当添加了I2C的Master模块后，就要去配置它的参数来。本章实验在RASC中配置I2C的参数具体如下图所示：

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image19.png)  

- Name：I2C模块的名称，需要满足C语言字符串标准；
- Channel：I2C模块的通道；
-  Rate：I2C通信速率，Standard支持的最大速率400kbps，快速模式最大能达到1Mbps；
- Rise/Fall Time：SCL信号上升沿和下降沿的耗时；

![](https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image20.png)  

- Duty Cycle：SCL时钟线的占空比，范围是4%~96%，默认是50%；
- Slave Address：从机设备地址，根据从机芯片设置；
-  Address Mode：地址模式，支持7-Bit和10-Bit；
-  Timeout Mode：数据检测超时模式，支持long mode和short mode。long mode的超时计数器是16bit的，short mode的超时计数器是14bit的；当超时计数溢出都没有检测到数据则通信中止；
-  Timeout during SCL Low：在SCL低电平时是否使能超时检测，默认是Enabled；
-  Callback：中断回调函数名称，建议和通道匹配，例如i2c1_callback；
-  Interrupt Priority Level：I2C中断优先级； 

### 4.5.3 函数说明

对应的驱动程序为：drivers\drv_gt911.c，它被封装为一个TouchDev结构体。

使用时，包含drv_touch.h，示例代码如下：

```c
#include "drv_touch.h"

unsigned short x, y;
struct TouchDev* ptDev = TouchDevGet();
if (ptDev->Read(ptDev, &x, &y) == true)
{
}
```

## 4.6 DHT11驱动使用方法

### 4.6.1 硬件接线

DHT11模块接入扩展板的J2接口，注意DHT11板子的白边跟扩展板的白边对齐（其中的数据引脚使用P503），如下图所示：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image21.png" style="zoom:80%;" />  

### 4.6.2 RASC配置

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-4/image22.png" style="zoom:75%;" />  

### 4.6.3 函数说明

对应驱动程序为：devices\dev_dht11.c。

使用时，包含dev_dht11.c，使用里面的函数即可。

函数说明如下：

```c
/**********************************************************************
 * 函数名称： DHT11_Init
 * 功能描述： DHT11的初始化函数
 * 输入参数： 无
 * 输出参数： 无
 * 返 回 值： 无
 * 修改日期：      版本号     修改人	      修改内容
 * -----------------------------------------------
 * 2023/08/04	     V1.0	  韦东山	      创建
 ***********************************************************************/
void DHT11_Init(void);

/**********************************************************************
 * 函数名称： DHT11_Read
 * 功能描述： 读取DHT11的温度/湿度
 * 输入参数： 无
 * 输出参数： hum  - 用于保存湿度值
 *            temp - 用于保存温度值
 * 返 回 值： 0 - 成功, (-1) - 失败
 * 修改日期：      版本号     修改人	      修改内容
 * -----------------------------------------------
 * 2023/08/04	     V1.0	  韦东山	      创建
 ***********************************************************************/
int DHT11_Read(int *hum, int *temp);
```

