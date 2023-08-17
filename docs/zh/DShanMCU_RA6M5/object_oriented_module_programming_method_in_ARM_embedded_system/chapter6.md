# 第6章 串行通信接口（SCI）

本章目标

- 了解串行通信协议
- 了解SCI模块内部原理

## 6.1 协议介绍

### 6.1.1 通信的基本概念

一个嵌入式产品由许多元器件组成的，它们之间要互相协作，相互之间要进行通信。不同的元器件支持的通信方式是不同的，有的是串行的，有的是并行的；有的是同步的，有的是异步的。

本小节介绍一些常见的通信概念。

1. 单工、半双工和全双工通信

- 按照数据传输的方向，通信可以分为全双工、半双工和单工；
- 全双工：双方之间、两个方向的数据都可以同时发送；
- 半双工：双方之间、两个方向的数据都可以发送，但是同一时刻只能一方发送信息；
- 单工：只能一方发信息，一方接受信息，通信是单向的。

全双工就像电话通信，双方任意时刻都可以同时说话、听到声音；半双工就像对讲机通信，两边不能同时说话；单工就像收音机，只能由广播站发送给收音机，是单向的。如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image1.png" style="zoom: 25%;" />

2. 串行通信和并行通信

照数据传输的方式，通信可以分为串行通信和并行通信。串行通信简单的说就是数据依次传输，比如要传输0b11111111，一位一位的发送，需要发送8次。并行通信则是几个数据一起传输，同样是0b11111111，如果8位一起发送，只需要发送1次，如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image2.png"  />

由此可见，串行传输占用的通信线更少，成本低，通信速度相对较慢；并行传输占用的通信线多，成本高，通信速度相对更快。但随着对传输速度要求越来越高，并行传输开始出现信号之间的干扰，串行通信反而受干扰影响较小，之后又发展出差分传输等技术，极大地提高了串行传输速率，使得串行通信速度可能比并行通信速度更快。

串行通信就像单车道，行驶的车辆需要依次行驶。并行通信就像多车道，同时多辆汽车并排行驶。但当车速很快的时候，多车道上并列行驶的汽车之间会形成“气流”相互干扰，单车道则受影响较小，速度能够进一步提升。

3. 同步通信和异步通信

按每一位数据的传输方式，可以分为同步通信和异步通信。数据在双方之间传输时，需要制定规则约定怎样传输一位数据，在这个基础上再约定怎样传输一个数据包。

同步通信的做法是加一个时钟信号，发送方和接收方在这个时钟的节拍下传输数据，比如常见的SPI、I2C。数据发起方会发出时钟信号，用来通知对方：你要接收数据了。对方可以在时钟信号的上升沿或下降沿采样数据。如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image3.png) 

对于异步通信，无需时钟信号，但是双方要遵守相同的约定：怎么表示起始信号、停止信号，怎么表示一位数据。如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image4.png)  

有多种异步通信协议，以红外遥控器的信号为例：

① 起始信号：遥控器发出一个9ms的低电平、4.5ms的高电平。接收器检测到这样的信号后，就知道要准备接收数据了

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image5.png" style="zoom:150%;" />  

② 接下来就可以传输若干位的数据了，怎么表示每一位的数据呢？每一位数据都以0.56ms的低脉冲开始，随后是高脉冲：高脉冲为0.56ms时表示这位数据为0，高脉冲为1.69ms时表示这位数据为1。如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image6.png" style="zoom:150%;" />  

因此，可以通过这样简单判断：有时钟信号的是同步通信，否则是异步通信。

4. 通信的速率

对于同步通信，通信速率由时钟信号决定，时钟信号越快，传输速度就越快。

对于异步通信，需要收发双方提前约定速率，这也就是我们串口调试时，波特率不对显示乱码的原因。

通常使用比特率来描述通信速率的快慢，与之容易混淆的是波特率。

- 比特率（Bitrate）：系统在单位时间内传输的比特位（二进制0或1）个数，通常用Rb表示，单位是比特/秒（bit/s），缩写为bps；

- 波特率（Baudrate）：系统在单位时间内传输的码元个数，通常用RB表示，单位是波特（Bd）；

100bit/s即是一秒钟传输100个0或1，100Bd即是一秒钟传输100个码元。

码元就是“承载信息量的基本信号单位”，以一条电线上传输的信号为例，码元就是电线上的电平值。

如果电线上电平只有0和3.3V两种选择，传输的信号是这2种电平之一，码元的状态只有2种。接收方可以把0V认为是二进制的0，把3.3V认为是二进制1。即：传输1个码元时，能用来表示1位数据。

如果电线上电平有0V、3.3V、5V、12V四种选择，传输的信号是这4种电平之一，码元的状态有4种。接收方可以把这4个电平认为是二级制的4个值：00、01、10、11。即：传输1个码元时，能用来表示2位数据。

因此码元状态为2时，比特率等于波特率，码元状态越多，每次传输的码元能携带的信息越多，自然速率也越高。

码元有N个状态时，比特率与波特率的关系式：

![image6-1](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image6-1.png) 

5. 常见通信协议

在嵌入式中，有众多通信协议，往往从性能、成本、稳定性、易用性等角度考虑选择合适的协议。常见的通信协议如下所示：

![image7](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image7.png)

### 6.1.2 UART协议

通用异步收发器简称UART，即“Universal Asynchronous Receiver Transmitter”，它用来传输串行数据：发送数据时，CPU将并行数据写入UART，UART按照一定的格式在一根电线上串行发出；接收数据时，UART检测另一根电线上的信号，将串行数据收集放在缓冲区中，CPU即可读取UART获得这些数据。UART之间以全双工方式传输数据，最精简的连线方法只有三根电线：TxD用于发送数据，RxD用于接收数据，GND用于给双方提供参考电平，连线如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image8.png" style="zoom:67%;" />

UART使用标准的TTL/CMOS逻辑电平(0～5V、0～3.3V、0～2.5V或0～1.8V四种)来表示数据，高电平表示1，低电平表示0。进行长距离传输时，为了增强数据的抗干扰能力、提高传输长度，通常将TTL/CMOS逻辑电平转换为RS-232逻辑电平，3～12V表示0，-3～-12V表示1。

TxD、RxD数据线以“位”为最小单位传输数据。帧(frame)由具有完整意义的、不可分割的若干位组成，它包含开始位、数据位、较验位(需要的话)和停止位。发送数据之前，UART之间要约定好数据的传输速率(即每位所占据的时间，其倒数称为波特率)、数据的传输格式(即有多少个数据位、是否使用较验位、是奇较验还是偶较验、有多少个停止位)。

数据传输流程如下：

1) 平时数据线处于“空闭”状态(1状态)。
2) 当要发送数据时，UART改变TxD数据线的状态(变为0状态)并维持1位的时间──这样接收方检测到开始位后，再等待1.5位的时间就开始一位一位地检测数据线的状态得到所传输的数据。
3) UART一帧中可以有5、6、7或8位的数据，发送方一位一位地改变数据线的状态将它们发送出去，首先发送最低位。
4) 如果使用较验功能，UART在发送完数据位后，还要发送1个较验位。有两种较验方法：奇较验、偶较验──数据位连同较验位中，“1”的数目等于奇数或偶数。
5) 最后，发送停止位，数据线恢复到“空闭”状态(1状态)。停止位的长度有3种：1位、1.5位、2位。

下图演示了UART使用7个数据位、偶较验、2个停止位的格式传输字符“A”(二进制值为0b1000001)时，TTL/CMOS逻辑电平、RS-232逻辑电平对应的波形。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image9.png" style="zoom: 150%;" /> 

### 6.1.3 I2C协议

1. I2C总线的概念

I2C(Inter-Integrated Circuit，又称IIC)总线是一种由PHILIPS公司开发的串行总线，用于连接微控制器及其外围设备，它具有如下特点：

- 只有两条总线线路：一条串行数据线(SDA)，一条串行时钟线(SCL)。
- 每个连接到总线的器件都可以使用软件根据它的惟一的地址来识别。
- 传输数据的设备间是简单的主/从关系。
- 主机可以用作主机发送器或主机接收器。
- 它是一个真正的多主机总线，两个或多个主机同时发起数据传输时，可以通过冲突检测和仲裁来防止数据被破坏。
- 串行的8 位双向数据传输，位速率在标准模式下可达100kbit/s，在快速模式下可达400kbit/s，在高速模式下可达3.4Mbit/s。
- 片上的滤波器可以增加抗干扰功能，保证数据的完整。
- 连接到同一总线上的IC 数量只受到总线的最大电容400pF的限制。

下图是一条I2C总线上多个设备相连的例子。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image10.png" style="zoom:150%;" /> 

先说明一些术语，如下表所示。

- 发送器：发送数据到总线的器件
- 接收器：从总线接收数据的器件
- 主机：发起/停止数据传输、提供时钟信号的器件
- 从机：被主机寻址的器件
- 多主机：可以有多个主机试图去控制总线，但是不会破坏数据
- 仲裁：当多个主机试图去控制总线时，通过仲裁可以使得只有一个主机获得总线控制权，并且它传输的信息不被破坏
- 同步：多个器件同步时钟信号的过程

2. I2C总线的形象类比

在讲解协议细节前，先使用生活示例形象理解I2C协议：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image11.png) 

体育老师：可以把球发给学生，也可以把球从学生中接过来。

- 老师想发球时，步骤如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image11-2.png) 

- 老师想接球时，步骤如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image11-3.png) 

依照这个简单的例子，可以引入IIC的传输协议：

① 老师说开始了，表示开始信号(start)
② 老师提醒某个学生要发球，表示发送地址和方向(address/read/write)
③ 老师发球/接球，表示数据的传输
④ 到球要回应：回应信号(ACK)
⑤ 老师说结束，表示IIC传输结束(P)

3. I2C总线的信号类型

I2C总线在传送数据过程中共有三种类型信号：开始信号、结束信号和响应信号。

- 开始信号(S)：SCL为高电平时，SDA由高电平向低电平跳变，开始传送数据。
- 结束信号(P)：SCL为低电平时，SDA由低电平向高电平跳变，结束传送数据。 
- 响应信号(ACK)：接收器在接收到8位数据后，在第9个时钟周期，拉低SDA电平。

它们的波形如图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image12.png" style="zoom:150%;" /> 

SDA上传输的数据必须在SCL为高电平期间保持稳定，SDA上的数据只能在SCL为低电平期间变化，如图所示。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image13.png" style="zoom:150%;" /> 

4. I2C总线的数据传输格式：

发送到SDA线上的每个字节必须是8位的，每次传输可以发送的字节数量不受限制。每个字节后必须跟一个响应位。首先传输的是数据的最高位(MSB)。如果从机要完成一些其他功能后(例如一个内部中断服务程序)才能继续接收或发送下一个字节，从机可以拉低SCL迫使主机进入等待状态。当从机准备好接收下一个数据并释放SCL后，数据传输继续。如果主机在传输数据期间也需要完成一些其他功能(例如一个内部中断服务程序)也可以拉低SCL以占住总线。

启动一个传输时，主机先发出S信号，然后发出8位数据。这8位数据中前7位为从机的地址，第8位表示传输的方向(0表示写操作，1表示读操作)。被选中的从机发出响应信号。紧接着传输一系列字节及其响应位。最后，主机发出P信号结束本次传输。

下图是几种I2C总线上数据传输的格式。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image14.png) 

并非每传输8位数据之后，都会有ACK信号。有以下3种例外：

a) 当从机不能响应从机地址时(例如它正忙于其他事而无法响应I2C总线的操作，或者这个地址没有对应的从机)，在第9个SCL周期内SDA线没有被拉低，即没有ACK信号。这时，主机发出一个P信号终止传输或者重新发出一个S信号开始新的传输。

b) 如果从机接收器在传输过程中，不能接收更多的数据时，它也不会发出ACK信号。这样，主机就可以意识到这点，从而发出一个P信号终止传输或者重新发出一个S信号开始新的传输。

主机接收器在接收到最后一个字节后，也不会发出ACK信号。于是，从机发送器释放SDA线，以允许主机发出P信号结束传输。

### 6.1.4 SPI协议

SPI（Serial Peripheral Interface，串行外设接口）是由摩托罗拉（Motorola）在1980前后提出的一种全双工同步串行通信接口，它用于MCU与各种外围设备以串行方式进行通信以交换信息，通信速度最高可达25MHz以上。

SPI接口主要应用在EEPROM、FLASH、实时时钟、网络控制器、OLED显示驱动器、AD转换器，数字信号处理器、数字信号解码器等设备之间。

SPI通常由四条线组成，一条主设备输出与从设备输入（Master Output Slave Input，MOSI），一条主设备输入与从设备输出（Master Input Slave Output，MISO），一条时钟信号（Serial Clock，SCLK），一条从设备使能选择（Chip Select，CS）。假设现在主控芯片要传输一个0x56数据给SPI Flash，时序如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image15.png) 

首先拉低CS0选中SPI Flash，0x56的二进制就是0b0101 0110，因此在每个SCK时钟周期，DO输出对应的电平。SPI Flash会在每个时钟周期的上升沿读取D0上的电平.

SPI和I²C对比如下表所示。SPI可以同时发出和接收数据，因此SPI的理论传输速度比I²C更快。SPI通过片选引脚选择从机，一个片选一个从机，因此在多从机结构中，需要占用较多引脚，而I²C通过设备地址选择从机，只要设备地址不冲突，始终只需要两个引脚。

| 功能说明   | SPI总线             | I2C总线                |
| ---------- | ------------------- | ---------------------- |
| 通信方式   | 同步 串行 全双工    | 同步 串行 半双工       |
| 通信速度   | 一般50MHz以下       | 100KHz、400KHz、3.4MHz |
| 从设备选择 | 引脚片选            | 设备地址片选           |
| 总线接口   | MOSI、MISO、SCK、CS | SDA、SCL               |

1. SPI的物理拓扑结构

SPI可以一个主机连接单个或多个从机，每个从机都使用一个引脚进行片选，物理连接示意图如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image16.png) 

8. SPI的数据交换

在SCK时钟周期的驱动下，主机把数据驱动到MOSI上传给从机，从机把数据驱动到MISO上传给主机，如下图所示。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image17.png) 

主机发送N字节给从机时，必定能接收到N字节，至于接收到的N字节是否有意义由从机决定。如果主机只想对从机进行写操作，主机只需忽略接收的从机数据即可。如果主机只想读取从机数据，它也要发送数据给从机（发送的数据可以是空数据）。

3. SPI的传输模式

SPI有四种传输模式，如下表所示，主要差别在于CPOL和CPHA的不同。

- CPOL（Clock Polarity，时钟极性）表示SCK在空闲时为高电平还是低电平。当CPOL=0，SCK空闲时为低电平，当CPOL=1，SCK空闲时为高电平。
- CPHA（Clock Phase，时钟相位）表示SCK在第几个时钟边缘采样数据。当CPHA=0，在SCK第一个边沿采样数据，当CPHA=1，在SCK第二个边沿采样数据。

| SPI模式 | CPOL | CPHA | 说明                                                     |
| ------- | ---- | ---- | -------------------------------------------------------- |
| 0       | 0    | 0    | 时钟空闲状态为低电平；在时钟第一个边沿（上升沿）采样数据 |
| 1       | 0    | 1    | 时钟空闲状态为低电平；在时钟第二个边沿（下降沿）采样数据 |
| 2       | 1    | 0    | 时钟空闲状态为高电平；在时钟第一个边沿（下降沿）采样数据 |
| 3       | 1    | 1    | 时钟空闲状态为高电平；在时钟第二个边沿（上升沿）采样数据 |

如下图所示，CPHA=0时，表示在时钟第一个时钟边沿采样数据。当CPOL=1，即空闲时为高电平，从高电平变为低电平，第一个时钟边沿（下降沿）即进行采样。当CPOL=0，即空闲时为低电平，从低电平变为高电平，第一个时钟边沿（上升沿）即进行采样。

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image18.png) 

- CPHA=1时，表示在时钟第二个时钟边沿采样数据。
- 当CPOL=1，即空闲时为高电平，从高电平变为低电平再变为高电平，第二个时钟边沿（上升沿）即进行采样。
- 当CPOL=0，即空闲时为低电平，从低电平变为高电平再变为低电平，第二个时钟边沿（下降沿）即进行采样，如图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image19.png) 

## 6.2 SCI模块

### 6.2.1 概述

SCI的含义是“Serial Communications Interface”，即串行通信接口，它的结构图如下：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image20.png) 

上图的“PSR”含义为“Receive Shift Register”，即“接收移位寄存器”，它可以接收一位一位的数据，组合好后保存在上面的RDR寄存器里供程序读取。“RDR”含义为“Receive Data Register”，即接收数据寄存器。

“TSR”含义为“Transmit Shift Register”，即“发送移位寄存器”。程序把数据写到TDR寄存器后，里面的数据就经过TSR一位一位地发送出去。“TDR”含义为“Transmit Data Register，”即发送数据寄存器。

正因为SCI模块里有PSR、TSR移位寄存器，再结合其他控制单元（比如引脚、时钟、波特率产生器），就可以支持多种串行协议，比如UART、I2C、SPI、Smart Card等。

以UART、I2C、SPI为例，它们的硬件实现里都用到了“移位寄存器”，对比如下：

|                    | UART         | I2C            | SPI            |
| ------------------ | ------------ | -------------- | -------------- |
| 时钟信号           | 无           | 有             | 有             |
| 数据信号           | TXD、RXD两条 | SDA一条        | MOSI、MISO两条 |
| 片选信号           | 无           | 无             | 有             |
| 速率               | 双方事先约定 | 由时钟信号决定 | 由时钟信号决定 |
| 通过移位寄存器发送 | 是           | 是             | 是             |
| 通过移位寄存器接收 | 是           | 是             | 是             |

### 6.2.2 使用方法

RA6M5芯片的SCI模块有10个SCI通道，每个通道能支持的协议（也被称为模式）如下表所示：

| 模式                           | SCI0、SCI5~SCI9 | SCI3、SCI4 | SCI1、SCI2 |
| ------------------------------ | --------------- | ---------- | ---------- |
| Asynchronous 异步模式          | 支持            | 支持       | 支持       |
| Clock synchronous 时钟同步模式 | 支持            | 支持       | 支持       |
| Smart cardinterface            | 支持            | 支持       | 支持       |
| Simple I2C 简化版本的I2C       | 支持            | 支持       | 支持       |
| Simple SPI 简化版本的SPI       | 支持            | 支持       | 支持       |
| FIFO 模式                      | 支持            | 支持       | 不支持     |
| Address match 地址匹配         | 支持            | 支持       | 不支持     |
| Manchester mode                | 不支持          | 支持       | 不支持     |
| Extended serial                | 不支持          | 不支持     | 支持       |
| GPT clock input                | 不支持          | 不支持     | 支持       |

使用SCI模块时，步骤如下：

① 查看原理图，确定引脚

根据引脚编号在芯片手册里找到引脚名，如果引脚名里有“TXDn”、“RXDn”字样更好。比如对于下面的原理图，使用P100作为SPI的MISO引脚：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image21.png) 

在芯片手册的《1.7 Pin Lists》中查找P100，得到它的引脚名“RXD0/SCK1/MISOB_A/QSPCLK/OM_SCLK”，如下所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image22.png) 

② 根据引脚名确定使用哪个SCI通道

SCIn通道使用TXDn、RXDn引脚，所以可以根据TXDn或RXDn的编号确定SCI通道。

以P100引脚为例，它的引脚名里含有“RXD0”，就表示这个引脚可以连接到SCI模块的通道0；再根据表6.5可以知道SCI0支持“Simple SPI”,以后就可以使用RASC配置SCI0工作于“Simple SPI”模式，并选择P100这些引脚。

怎么使用RASC进行配置、怎么编写程序，在后续章节讲解。

### 6.2.3 与其他模块的关系

以I2C、SPI为例，可以使用SCI模块实现这些功能，也可以使用单独的I2C模块、SPI模块实现这些功能。SCI模块和I2C、SPI模块是并列的关系，如下图所示：

![](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-6/image23.PNG)

当引脚连接到SCI模块时，SCI可以工作于“Simple I2C”、“Simple SPI”模式。如果想使用更完善的I2C、SPI功能，需要配置这些引脚连接到专门的I2C模块、SPI模块。

以P100为例，它的引脚名为“RXD0/SCK1/MISOB_A/QSPCLK/OM_SCLK”，解析如下：

1) RXD0：可以连接到SCI0通道，用作RXD0信号，SCI0可被配置为UART、I2C、SPI等模式
2) SCK1：可以连接到SCI1通道，用作SCK1信号，SCI1被配置为SPI模式时用到SCK1
3) MISOB_A：可以连接到SPIB通道，用作MISO引脚
4) QSPCLK：可以连接到QSPI模块（有4条数据线的、类似SPI的协议）
5) OM_SCLK：可以连接到OSPI模块（有8条数据线的、类似SPI的协议）

需要注意的是，引脚被连接到I2C模块，或者被连接到SCI模块并工作于“Simple I2C”模式时，这些引脚的功能是相反的。比如I2C1模块使用P511作为SDA引脚，使用P512作为SCL引脚；但是SCI4通道工作于“Simple I2C”模式时刚好反过来，它使用P511作为SCL引脚，使用P512作为SDA引脚。

