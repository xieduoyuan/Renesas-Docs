# 第5章 GPIO输入输出

本章目标

- 了解RASC的使用
- 掌握GPIO的配置与使用

## 5.1 硬件操作原理

### 5.1.1 引脚表示方法

GPIO（General-Purpose Input/Output ports，通用输入/输出接口），用于感知外界信号（输入方向）和控制外部设备（输出方向）。

学习单片机时第一个程序往往是点亮一个LED，第二个程序是使用按键控制LED。理解GPIO的操作之后，就可以操作更丰富的模块，比如蜂鸣器、温度传感器等。这些外设模块比较简单，硬件上它只需与MCU的一个GPIO引脚相连。在单个GPIO引脚的基础上，还可以扩展出需要多个引脚才能实现的“协议”，比如UART、I2C、SPI接口等。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image1.png) 

如上图所示，如今的MCU大都采用引脚复用技术，一个引脚可以用作普通的GPIO，也可以用作某种接口的引脚，比如用作I2C接口的时钟引脚SCK。此外，有些引脚还能作为ADC引脚用来读取模拟信号，或者作为DAC引脚输出模拟信号。

芯片的引脚，在数据手册里可能被称为PIN或者PAD。怎么表示一个引脚？有两种方法：引脚编号（pin number）、引脚名（pin name）。

芯片的每一个引脚都有一个编号。对于贴片封装的芯片，使用数字编号，比如第100号引脚、PIN100；对于BGA封装的芯片，使用行列编号：使用数字（1、2、3、……）表示行，使用字母（A、B、C、……，忽略字母I、O以免跟数字1、0混淆）表示列，比如A1表示第A列第1行的引脚。如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image2.png)  

使用引脚编号可以快速找到引脚的位置，但是不容易分辨它的功能。芯片厂商还会给每个引脚赋予一个名字，以表明它的功能。比如LQFP176封装的芯片，它的51号引脚名字是P202，表示它是“Port 2的第2个引脚”；BGA176封装的芯片，它的C4引脚名字是P300/TCK/SWCLK，表示它有三种功能：“Port 3的第0个引脚”、JTAG的TCK引脚、SWD调试接口的时钟引脚。有些引脚的功能有很多种，而引脚名一般都比较短，并不能完全描述它的所有功能。

### 5.1.2 GPIO操作方法

在RA5M5芯片手册里，可以看到GPIO的框图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image3.png)  

这个框图里有4部分内容：

① 引脚；
② 配置（比如上拉电阻、open-drain等配置）、叁引脚复用；
③ GPIO模块；
④ 其他模块。

这4部分的关系，可以用下面简化的图来概括：

![image4](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image4.png)

一个引脚，可以对它进行配置，比如使能内部上拉、使用开漏输出等等。

一个引脚有多个功能时，可以通过“引脚复用”选择它的功能：让这个引脚连接到芯片内部的GPIO模块、I2C模块或其他模块。默认情况下，大多数引脚都是连接到GPIO模块。

当引脚用作GPIO时，第1步就是设置它的方向：输入还是输出。接下来还可以进行配置：对于输入引脚可以使能它的上拉电阻、下拉电阻，或者浮空；对于输出引脚，可以让它使用开漏功能。

对于输入引脚，通常可以配置它使能内部上拉电阻，这是为了给引脚一个确定的默认电平。通常情况下，要避免引脚浮空。

![image5](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image5.png)

在上图中，PIN1被配置为输入方向，用来读取KEY1的状态，本意是：读PIN1得到‘0’表示KEY1被按下，得到‘1’表示KEY1被松开。如果内部上拉电阻、下拉电阻都没有被使能，在KEY1被松开时，它就是浮空的状态，这时读取PIN1的电平可能得到‘0’也可能得到‘1’，是不确定的。这个场景里，应该使能PIN1的内部上拉电阻，或者在芯片之外提供一个上拉电阻。

对于PIN2，它连接到芯片内部的ADC模块，想把PIN2上的模拟信号转换为数值。这个场景里，PIN2的内部上拉电阻、下拉电阻都要禁止，让PIN2处于高阻态，否则会影响模拟信号。

对于输出引脚，它的内部通常是PMOS和NMOS的组合电路，用以实现IO的推挽输出或者开漏输出，例如下图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image6.png)

当输出引脚被配置为推挽输出时，PMOS和NMOS都会参与工作。当“Output control”输出低电平时NMOS导通使得引脚输出低电平，当“Output control”输出高电平时PMOS导通使得引脚输出高电平。

当输出引脚被配置为开漏输出时，PMOS被禁止。当“Output control”输出低电平时NMOS导通使得引脚输出低电平；但是当“Output control”输出高电平时，PMOS被禁止而NMOS不导通，这使得引脚相当于浮空，它的电平由外接的电路决定。I2C引脚通常被配置为开漏输出。

### 5.1.3 LED和按键

怎么控制LED？要输出什么电平才能点亮一个LED呢？怎么读取按键状态？读取到什么电平表示按键被按下了？

这完全取决于硬件的设计，需要根据硬件原理图来分析，例如下图的LED和按键的硬件原理图：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image7.png)

- 通过P400引脚来控制LED：P400输出低电平则点亮LED，输出高电平则熄灭LED。
- 通过P000引脚读取K2状态：读到0表示K2被按下，读到1表示K2被松开。

## 5.2 ioport模块的使用

### 5.2.1 使用RASC配置

如果要从头创建工程，可以参考《3.2.3 创建e2 studio工程》或《3.5.1 使用RASC创建MDK工程》，然后再根据本节内容配置引脚。

本节工程是“0501_led”，User LED的控制引脚是P400。

使用RASC配置引脚时，打开Pins页面，在“Port”下面找到端口P4，进而找到引脚P400，就可以在“Pin Configuration”窗口配置这个引脚了。

各配置项的取值如下图所示（Mode选为“Output mode(Initial Low)”、Outputtype选为“CMOS”）：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image8.png)

上图里各个配置参数的含义如下：

| 配置项                  | 取值/描述                                                    |
| ----------------------- | ------------------------------------------------------------ |
| Mode                    | l “Input mode”（输入模式）l “Output mode(Initial Low)”（输出模式，初始电平为低）l “Output mode(Initial High)”（输出模式，初始电平为高） |
| Pull up（上拉电阻）     | l “None”（禁止内部上拉）l “input pull-up”（使能内部上拉）当引脚被配置为Output mode时无法设置Pull up参数 |
| IRQ（中断）             | l “None”（不使用中断）l “IRQ10”（使用中断）                  |
| Output type（输出类型） | l “CMOS”l “n-ch open drain”（开漏）当引脚被配置为Input mode时无法设置本参数 |

配置好引脚后，点击右上角的“Generate Project Content”就会生成代码。RASC会为这些引脚生成配置信息，保存在pin_data.c文件里。

### 5.2.2 配置信息解读

使用RASC配置引脚后，在 `0501_LED -> ra_gen -> pin_data.c` 中生成如下代码：

```c
 const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
     ......（省略内容）
     {.pin = BSP_IO_PORT_04_PIN_00,
      .pin_cfg = ((uint32_t) IOPORT_CFG_PORT_DIRECTION_OUTPUT 
                | (uint32_t) IOPORT_CFG_PORT_OUTPUT_LOW)
     },
 };
```

对于要配置的每一个引脚，都会生成一个ioport_pin_cfg_t数组项，这个结构体类型定义如下：

```c
typedef struct st_ioport_pin_cfg
{
    uint32_t          pin_cfg;         ///< 引脚的配置值，取值类型为ioport_cfg_options_t
    bsp_io_port_pin_t pin;             // 引脚ID，即：哪个引脚
} ioport_pin_cfg_t;
```

指定引脚时需要2个参数：它是哪一组？它是这组里的哪一个？比如引脚P400属于第4组里的第0个引脚。使用一个整数来表示引脚：高8位表示组号，低8位表示引脚号，比如P400的引脚ID是“0x070D”。在bsp_io.h里，为每一引脚都事先定义了一个宏，比如：

```c
typedef enum e_bsp_io_port_pin_t
{
    BSP_IO_PORT_00_PIN_00 = 0x0000,    ///< IO port 0 pin 0
    BSP_IO_PORT_00_PIN_01 = 0x0001,    ///< IO port 0 pin 1
……
    BSP_IO_PORT_04_PIN_00 = 0x0400,    ///< IO port 4 pin 0
```

指定引脚的配置时，需要设置结构体里的pin_cfg成员，它的可取值也事先定义好了，在r_ioport_api.h中有如下定义：

```c
typedef enum e_ioport_cfg_options
{
    IOPORT_CFG_PORT_DIRECTION_INPUT  = 0x00000000, // 输入方向
    IOPORT_CFG_PORT_DIRECTION_OUTPUT = 0x00000004, // 输出方向
    IOPORT_CFG_PORT_OUTPUT_LOW       = 0x00000000, // 低电平
    IOPORT_CFG_PORT_OUTPUT_HIGH      = 0x00000001, // 高电平
    IOPORT_CFG_PULLUP_ENABLE         = 0x00000010, // 使能内部上拉电阻
    IOPORT_CFG_PIM_TTL               = 0x00000020, // 使能引脚的输入模式
    IOPORT_CFG_NMOS_ENABLE          = 0x00000040, // NMOS open-drain output，NMOS开漏输出
    IOPORT_CFG_PMOS_ENABLE           = 0x00000080, // PMOS open-drain ouput, PMOS开漏输出
    IOPORT_CFG_DRIVE_MID             = 0x00000400, // 引脚驱动能力为中等
    IOPORT_CFG_DRIVE_HS_HIGH         = 0x00000800, // 引脚驱动能力为高，并且支持高速率
    IOPORT_CFG_DRIVE_MID_IIC      = 0x00000C00, // 设置引脚的输出能力可用于I2C的20mA端口
    IOPORT_CFG_DRIVE_HIGH            = 0x00000C00, ///< Sets pin drive output to high
    IOPORT_CFG_EVENT_RISING_EDGE     = 0x00001000, // 事件触发方式为上升沿
    IOPORT_CFG_EVENT_FALLING_EDGE    = 0x00002000, // 事件触发方式为下降沿
    IOPORT_CFG_EVENT_BOTH_EDGES      = 0x00003000, // 事件触发方式为双边沿
    IOPORT_CFG_IRQ_ENABLE            = 0x00004000, // 使能引脚的中断功能
    IOPORT_CFG_ANALOG_ENABLE         = 0x00008000, // 引脚用作模拟信号
    IOPORT_CFG_PERIPHERAL_PIN        = 0x00010000  // 引脚用作外设的引脚
} ioport_cfg_options_t;
```

### 5.2.3 API接口

在r_ioport_api.h中定义了ioport模块的接口，它定义了一个结构体类型ioport_api_t，内容如下：

```c
  typedef struct st_ioport_api
  {
     fsp_err_t (* open)(ioport_ctrl_t * const p_ctrl, const ioport_cfg_t * p_cfg);
     fsp_err_t (* close)(ioport_ctrl_t * const p_ctrl);
     fsp_err_t (* pinsCfg)(ioport_ctrl_t * const p_ctrl, const ioport_cfg_t * p_cfg);
     fsp_err_t (* pinCfg)(ioport_ctrl_t * const p_ctrl,);
                          bsp_io_port_pin_t pin, uint32_t cfg);
     fsp_err_t (* pinEventInputRead)(ioport_ctrl_t * const p_ctrl, 
                                     bsp_io_port_pin_t pin,
                                    bsp_io_level_t * p_pin_event);
    fsp_err_t (* pinEventOutputWrite)(ioport_ctrl_t * const p_ctrl, 
                                    bsp_io_port_pin_t pin,
                                     bsp_io_level_t pin_value);
     fsp_err_t (* pinRead)(ioport_ctrl_t * const p_ctrl, 
                           bsp_io_port_pin_t pin,
                           bsp_io_level_t * p_pin_value);
     fsp_err_t (* pinWrite)(ioport_ctrl_t * const p_ctrl, 
                            bsp_io_port_pin_t pin,
                            bsp_io_level_t level);
     fsp_err_t (* portDirectionSet)(ioport_ctrl_t * const p_ctrl, 
                                    bsp_io_port_t port,
                                    ioport_size_t direction_values, 
                                    ioport_size_t mask);
     fsp_err_t (* portEventInputRead)(ioport_ctrl_t * const p_ctrl, 
                                      bsp_io_port_t port, 
                                      ioport_size_t * p_event_data);
     fsp_err_t (* portEventOutputWrite)(ioport_ctrl_t * const p_ctrl, 
                                        bsp_io_port_t port,
                                        ioport_size_t event_data,
                                        ioport_size_t mask_value);
     fsp_err_t (* portRead)(ioport_ctrl_t * const p_ctrl, 
                            bsp_io_port_t port,
                            ioport_size_t * p_port_value);
     fsp_err_t (* portWrite)(ioport_ctrl_t * const p_ctrl, 
                             bsp_io_port_t port,
                             ioport_size_t value, ioport_size_t mask);
  } ioport_api_t;
```

在具体的C文件中，需要实现一个ioport_api_t结构体，比如在r_ioport.c里实现了如下结构体：

```c
  /* IOPort Implementation of IOPort Driver  */
  const ioport_api_t g_ioport_on_ioport =
  {
  	.open				  = R_IOPORT_Open,
  	.close				  = R_IOPORT_Close,
  	.pinsCfg			  = R_IOPORT_PinsCfg,
  	.pinCfg				  = R_IOPORT_PinCfg,
  	.pinEventInputRead	  = R_IOPORT_PinEventInputRead,
  	.pinEventOutputWrite  = R_IOPORT_PinEventOutputWrite,
  	.pinRead			  = R_IOPORT_PinRead,
  	.pinWrite			  = R_IOPORT_PinWrite,
  	.portDirectionSet	  = R_IOPORT_PortDirectionSet,
  	.portEventInputRead	  = R_IOPORT_PortEventInputRead,
  	.portEventOutputWrite = R_IOPORT_PortEventOutputWrite,
  	.portRead			  = R_IOPORT_PortRead,
  };
```

要操作某个引脚时，可以调用结构体g_ioport_on_ioport里的各个函数指针，也可以直接调用r_ioport.c里实现的各个函数（比如R_IOPORT_Open、R_IOPORT_PinRead）。

### 5.2.4 API接口用法

操作一个GPIO引脚时，要先打开它（open），在open函数内部会进行配置（pinsCfg/pinCfg），最后就可以读写了（pinRead/pinWrite）。

1. 打开IO设备

函数原型：

```c
  /** Initialize internal driver data and initial pin configurations.
  	* Called during startup.  Do not call this API during runtime.
  	* Use @ref ioport_api_t::pinsCfg for runtime reconfiguration of multiple pins.
  	* @par Implemented as
  	* - @ref R_IOPORT_Open()
  	* @param[in]  p_cfg				   Pointer to pin configuration data array.
  	*/
  fsp_err_t (* open)(ioport_ctrl_t * const p_ctrl, const ioport_cfg_t * p_cfg);
```

此函数指针有两个参数，p_ctrl是一个ioport_ctrl_t指针，它的定义如下：

```c
typedef void ioport_ctrl_t;
```

所以在r_ioport_api.h文件里，p_ctrl实际上是一个void指针，它可以指向任意类型的数据类型，这是一种良好的编程思想：封装内部实现的细节。在r_ioport.h里，这个参数实际的类型是ioport_instance_ctrl_t结构体，定义如下：

```c
typedef struct st_ioport_instance_ctrl
{
    uint32_t     open;
    void const * p_context;
} ioport_instance_ctrl_t;
```

ioport_instance_ctrl_t结构体的open成员，被用来标记这个模块是否已经被打开，p_context成员没有被用到。作为模块的使用者无需了解这个结构体的内部结构，所以在r_ioport_api.h文件里把open函数指针的第1个参数指定为void指针。

第二个参数p_cfg是一个ioport_cfg_t结构体指针，原型如下：

```c
  typedef struct st_ioport_cfg
  {
  	   uint16_t number_of_pins; ///< Number of pins for which there is configuration data
  	   ioport_pin_cfg_t const * p_pin_cfg_data; ///< Pin configuration data
  } ioport_cfg_t;
```

这个结构体有两个成员：

- number_of_pins：要配置的引脚数量，表示后面的p_pin_cfg_data数组里有多少项
- p_pin_cfg_data：它是一个ioport_pin_cfg_t结构体数组，每个数组项都表示一个引脚的配置参数；

引脚的配置参数也是用一个结构体来表示的，原型如下：

```c
  typedef struct st_ioport_pin_cfg
  {
  ///< Pin PFS configuration - Use ioport_cfg_options_t parameters to configure
     uint32_t			 pin_cfg;	
     bsp_io_port_pin_t pin;			  ///< Pin identifier
  } ioport_pin_cfg_t;
```

这个结构体的成员含义是：

- pin_cfg：GPIO的具体配置值，比如方向、默认输出电平等；
- pin：具体的GPIO引脚，这是一个枚举类型的成员，该枚举中包括了处理器的所有引脚的宏定义值；

示例代码如下：

```c
  const ioport_pin_cfg_t g_bsp_pin_cfg_data[] =
  {
      { .pin = BSP_IO_PORT_01_PIN_06,
        .pin_cfg = ((uint32_t) IOPORT_CFG_DRIVE_HIGH
                  | (uint32_t) IOPORT_CFG_PORT_DIRECTION_OUTPUT
                  | (uint32_t) IOPORT_CFG_PORT_OUTPUT_HIGH)
      },
  };
  const ioport_cfg_t g_bsp_pin_cfg =
  {
      .number_of_pins = sizeof(g_bsp_pin_cfg_data) / sizeof(ioport_pin_cfg_t),
      .p_pin_cfg_data = &g_bsp_pin_cfg_data[0],
  };
```

- 第1~8行，先定义一个ioport_pin_cfg_t结构体数组，每个数组项被用来配置一个引脚。
- 第9~13定义一个ioport_cfg_t结构体，它会应用前面定义的ioport_pin_cfg_t结构体数组，并表明这个数组多大。ioport_cfg_t结构体就含有这些引脚的配置信息了。

在common_data.c中，使用如下代码定义了一个ioport模块的实例，即ioport_instance_t结构体：

```c
 const ioport_instance_t g_ioport =
 {
     .p_api = &g_ioport_on_ioport,
     .p_ctrl = &g_ioport_ctrl,
     .p_cfg = &g_bsp_pin_cfg,
 };
```

- 第3行，指定API结构体，g_ioport_on_ioport里含有各个API函数。
- 第4行，指定Ctrl结构体，作用不大，仅仅记录模块的状态（是否open）。
- 第5行，指定配置结构体，含有多个引脚的配置信息。

如果使用面向对象的编程方法，后续对GPIO的操作可以只使用g_ioport结构体。

在哪里打开引脚、配置引脚呢？在hal_entry.c中有R_BSP_WarmStart函数，代码如下：

```c
  void R_BSP_WarmStart(bsp_warm_start_event_t event)
  {
      if (BSP_WARM_START_RESET == event)
      {
  #if BSP_FEATURE_FLASH_LP_VERSION != 0
          /* Enable reading from data flash. */
          R_FACI_LP->DFLCTL = 1U;
  #endif
      }
      if (BSP_WARM_START_POST_C == event)
      {
          /* C runtime environment and system clocks are setup. */
          /* Configure pins. */
          R_IOPORT_Open (&g_ioport_ctrl, g_ioport.p_cfg);
      }
  }
```

在第14行直接调用r_ioport.c里实现的R_IOPORT_Open函数，它的内部会使用了Renesas的库函数r_ioport_pins_config来配置引脚。R_IOPORT_Open函数的代码如下：

```c
  fsp_err_t R_IOPORT_Open (ioport_ctrl_t * const p_ctrl, const ioport_cfg_t * p_cfg)
  {
      ioport_instance_ctrl_t * p_instance_ctrl = (ioport_instance_ctrl_t *) p_ctrl;

  #if (1 == IOPORT_CFG_PARAM_CHECKING_ENABLE)
      FSP_ASSERT(NULL != p_instance_ctrl);
      FSP_ASSERT(NULL != p_cfg);
      FSP_ASSERT(NULL != p_cfg->p_pin_cfg_data);
      FSP_ERROR_RETURN(IOPORT_OPEN != p_instance_ctrl->open, FSP_ERR_ALREADY_OPEN);
  #else
      FSP_PARAMETER_NOT_USED(p_ctrl);
  #endif
```

- 从第15行可以知道，参数p_ctrl仅仅是用来表示状态（模块是否已经被打开）。
- 从第17行可以知道，引脚的配置的重点在于构造p_cfg参数。

要初始化GPIO，步骤如下：

① 定义一个ioport_pin_cfg_t结构体数组，每个数组项里指定引脚、引脚配置值
② 定义ioport_cfg_t结构体，引用步骤①的数组，并指明数组大小；
③ 调用R_IOPORT_Open

使用RASC时，这几个步骤都是自动生成的。R_IOPORT_Open函数的调用流程如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image9.png)

2. 关闭IO设备

关闭IO设备的函数指针是close，传入的参数是ioport_ctrl_t结构体变量：

```c
  /** Close the API.
   * @par Implemented as
   * - @ref R_IOPORT_Close()
   *
   * @param[in]   p_ctrl  Pointer to control structure.
   **/
  fsp_err_t (* close)(ioport_ctrl_t * const p_ctrl);
```

这个函数指针在使用FSP生成到工程中会指向R_IOPORT_Close，代码如下：

```c
  fsp_err_t R_IOPORT_Close (ioport_ctrl_t * const p_ctrl)
  {
      ioport_instance_ctrl_t * p_instance_ctrl = (ioport_instance_ctrl_t *) p_ctrl;
 
  #if (1 == IOPORT_CFG_PARAM_CHECKING_ENABLE)
      FSP_ASSERT(NULL != p_instance_ctrl);
      FSP_ERROR_RETURN(IOPORT_OPEN == p_instance_ctrl->open, FSP_ERR_NOT_OPEN);
  #else
      FSP_PARAMETER_NOT_USED(p_ctrl);
  #endif

      /* Set state to closed */
      p_instance_ctrl->open = IOPORT_CLOSED;

      return FSP_SUCCESS;
  }
```

- 第13行：仅仅是修改p_instance_ctrl->open为IOPORT_CLOSED以记录状态，不涉及硬件操作。

3. 配置多个引脚

在open函数里已经配置所涉及的引脚了。如果想再次配置引脚，可以使用pinsCfg或pinCfg，前者可以配置多个引脚，后者只配置一个引脚。

pinsCfg函数指针的原型如下：

```c
 /** Configure multiple pins.
  * @par Implemented as
  * - @ref R_IOPORT_PinsCfg()
  * @param[in]  p_cfg                Pointer to pin configuration data array.
  */
 fsp_err_t (* pinsCfg)(ioport_ctrl_t * const p_ctrl, const ioport_cfg_t * p_cfg);
```

所用的参数跟open函数指针是一样的，不再赘述。

4. 配置单个引脚

使用pinsCfg函数指针来配置单个引脚，原型如下：

```c
/** Configure settings for an individual pin.
 * @par Implemented as
 * - @ref R_IOPORT_PinCfg()
 * @param[in]  pin          Pin to be read.
 * @param[in]  cfg          Configuration options for the pin.
 */
fsp_err_t (* pinCfg)(ioport_ctrl_t * const p_ctrl,

          bsp_io_port_pin_t pin,
          uint32_t cfg);
```

参数pin表示要配置哪个引脚，参数cfg表示配置值。示例如下：

```c
R_IOPORT_PinCfg(&g_ioport_ctrl, BSP_IO_PORT_01_PIN_06,
       ((uint32_t) IOPORT_CFG_DRIVE_HIGH
       | (uint32_t) IOPORT_CFG_PORT_DIRECTION_OUTPUT
       | (uint32_t) IOPORT_CFG_PORT_OUTPUT_HIGH));
```

5.读取IO电平

Renesas读取电平支持两种模式：读取单个引脚的电平、读取多个引脚的电平。

读取单个引脚的电平的API原型如下：

```c
/** Read level of a pin.
 * @par Implemented as
 * - @ref R_IOPORT_PinRead()
 * @param[in]  pin                   Pin to be read.
 * @param[in]  p_pin_value           Pointer to return the pin level.
 */
fsp_err_t (* pinRead)(ioport_ctrl_t * const p_ctrl,
                      bsp_io_port_pin_t pin,
                      bsp_io_level_t * p_pin_value);
```

- 第1个参数p_ctrl，跟前面的函数类似，只是用来表示是否打开了模块；
- 第2个参数pin，被用来表示“读取哪个引脚”；
- 第3个参数p_pin_value，是输出参数，被用来保存读取到电平值。

这个函数指针默认指向库函数：

```c
fsp_err_t R_IOPORT_PinRead (ioport_ctrl_t * const p_ctrl,
                            bsp_io_port_pin_t pin,
                            bsp_io_level_t * p_pin_value);
```

示例代码如下：

```c
01 bsp_io_level_t level = BSP_IO_LEVEL_LOW;
02 R_IOPORT_PinRead(&g_ioport_ctrl, BSP_IO_PORT_01_PIN_06, &level);
```

6. 读取多个IO的电平

还可以读取多个IO的电平，函数原型如下：

```c
/** Read states of pins on the specified port.
 * @par Implemented as
 * - @ref R_IOPORT_PortRead()
 * @param[in]  port         Port to be read.
 * @param[in]  p_port_value     Pointer to return the port value.
 */
fsp_err_t (* portRead)(ioport_ctrl_t * const p_ctrl,
                       bsp_io_port_t port,
                       ioport_size_t * p_port_value);
```

- 第2个参数port指“哪一组GPIO”，比如P1、P2等。
- 第3个参数p_port_value是一个输出参数，被用来保存“这组GPIO”的多个引脚的状态。

这个函数指针默认指向库函数：

```c
 fsp_err_t R_IOPORT_PortRead (ioport_ctrl_t * const p_ctrl,
             				  bsp_io_port_t port,
                              ioport_size_t * p_port_value);
```

示例代码如下：

```c
 ioport_size_t portr_01_values;
 R_IOPORT_PortRead(&g_ioport_ctrl, BSP_IO_PORT_01, &portr_01_values);
```

7. 控制IO电平

怎么控制GPIO引脚的输出电平？函数原型如下：

```c
 /** Write specified level to a pin.
  * @par Implemented as
  * - @ref R_IOPORT_PinWrite()
  * @param[in]  pin               Pin to be written to.
  * @param[in]  level             State to be written to the pin.
  */
 fsp_err_t (* pinWrite)(ioport_ctrl_t * const p_ctrl,
              	      bsp_io_port_pin_t pin,
                        bsp_io_level_t level);
```

这个函数指针默认指向库函数：

```c
 fsp_err_t R_IOPORT_PinWrite (ioport_ctrl_t * const p_ctrl,
                				bsp_io_port_pin_t pin,
                				bsp_io_level_t level)
```

示例代码如下：

```c
 bsp_io_level_t level = BSP_IO_LEVEL_LOW;
 R_IOPORT_PinWrite(&g_ioport_ctrl, BSP_IO_PORT_01_PIN_06, level);
```

8.控制多个IO的电平

还可使用一个函数设置多个GPIO引脚的电平，函数原型如下：

```c
 /** Write to multiple pins on a port.
  * @par Implemented as
  * - @ref R_IOPORT_PortWrite()
  * @param[in]  port                 Port to be written to.
  * @param[in]  value                Value to be written to the port.
  * @param[in]  mask         		   Mask controlling which pins on the port are written to.
  */
 fsp_err_t (* portWrite)(ioport_ctrl_t * const p_ctrl,
             			   bsp_io_port_t port,
            			   ioport_size_t value,
             			   ioport_size_t mask);
```

-  第3个参数value里，每一位都对应一个GPIO引脚的输出值，并非每一位都被用到，这由mask参数来确定。
-  第4个参数mask，某位为1，就表示要设置这一位。

这个函数指针默认指向库函数：

```c
 fsp_err_t R_IOPORT_PortWrite (ioport_ctrl_t * const p_ctrl,
                bsp_io_port_t port,
                ioport_size_t value,
                ioport_size_t mask)
```

假设要控制P0这组IO的P1_01为高，P1_03为低，P1_05为高，示例代码如下：

```c
 ioport_size_t value = (1<<1) | (0<<3) | (1<<5);
 ioport_size_t mask = (1<<1) | (1<<3) | (1<<5);

 R_IOPORT_PortWrite(&g_ioport_ctrl, BSP_IO_PORT_00, value, mask);
```



## 5.3 LED实验

本实验的源码是“0501_led”，它让LED1循环闪烁。

### 5.3.1 配置引脚

参考《5.2.1 使用RASC配置》进行配置。

### 5.3.2 应用程序

在0501_led\src\hal_entry.c文件中的hal_entry()函数里添加LED的控制代码。可以使用面向对象的方式，编写如下代码：

```c
   /* TODO: add your own code here */
   bsp_io_level_t level = BSP_IO_LEVEL_LOW;
   
   while (1)
   {
     // 让P400引脚输出level电平
     g_ioport.p_api->pinWrite(g_ioport.p_ctrl, BSP_IO_PORT_04_PIN_00, level);
     // 延时1秒
     R_BSP_SoftwareDelay(100, BSP_DELAY_UNITS_MILLISECONDS);
     // 电平反转
     level = !level;
   }
```

也可使用比较直观的方法，直接调用函数：

```c
   /* TODO: add your own code here */
   bsp_io_level_t level = BSP_IO_LEVEL_LOW;
   
   while (1)
   {
     // 让P400引脚输出level电平
     R_IOPORT_PinWrite((g_ioport.p_ctrl, BSP_IO_PORT_04_PIN_00, level);
     // 延时1秒
     R_BSP_SoftwareDelay(100, BSP_DELAY_UNITS_MILLISECONDS);
     // 电平反转
     level = !level;
   }
```

### 5.3.3 上机实验

实际上的现象是LED在快速的闪烁，这是因为我们的程序中设计的时间间隔只有100ms，间隔很短，闪烁太快，不好观察，读者可以将间隔时间拉长一点。

## 5.4 按键实验

本实验的源码是“0502_key”，它的功能是：按下K2按键，就点亮LED；松开则熄灭。

### 5.4.1 配置引脚

本实验源码是在“0501_led”的基础上增加输入引脚：K2按键的引脚是P000。

在RASC配置界面点击“Pins”页面，找到P000引脚，先把它的Mode选择为“Input mode”；然后就可以点击“Generate Project Content”生成代码了。如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-5/image10.png) 

### 5.4.2 源码分析

使用FSP配置引脚生成工程内容后，在0502_key\src_gen\pin_data.c文件中生成了ioport_pin_cfg_t结构体数组，代码如下：

```c
  const ioport_pin_cfg_t g_bsp_pin_cfg_data[] = {
      {.pin = BSP_IO_PORT_00_PIN_00,
       .pin_cfg = ((uint32_t) IOPORT_CFG_PORT_DIRECTION_INPUT)
      },
      ......（省略内容）
  };
```

可以看到比起“0501_led”工程，新增了一个.pin是BSP_IO_PORT_00_PIN_00，它被配置为输入模式。

### 5.4.3 应用程序

在0502_key\src\hal_entry.c文件中的hal_entry()函数里添加如下代码：

```c
  /* TODO: add your own code here */
  bsp_io_level_t level;
  while(1)
  {
      /* 读按键状态 */
      g_ioport.p_api->pinRead(&g_ioport_ctrl, BSP_IO_PORT_00_PIN_00, &level);
      /* 根据按键状态设置LED */
      g_ioport.p_api->pinWrite(&g_ioport_ctrl, BSP_IO_PORT_04_PIN_00, level);
  }
```

### 5.4.4 上机实验

按下K2后LED被点亮，松开K2后LED熄灭。
