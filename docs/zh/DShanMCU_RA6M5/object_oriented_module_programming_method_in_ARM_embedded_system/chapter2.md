# 第2章 面向过程与面向对象

本章目标

- 理解面向过程与面向对象编程方法的特点
- 锻炼面向对象编程的能力

## 2.1 特性对比

### 2.1.1 概念介绍

学习单片机开发时，我们写的第 1 个程序通常是点灯，示例代码如下：

 ```c
 // 点灯
 void main()
 {
     while (1)
     {
         led_on();
         delay_ms(500);
         led_off();
         delay_ms(500);
     }
 }
 ```

在 main 函数中是一个 while 循环，首先调用 led_on()函数点亮 LED，然后延迟一阵子，接着调用 led_off()熄灭 LED，最后延迟一阵子。

这个程序就是面向过程的，它的编程方法是：先分析出解决问题所需的步骤，然后针对每一步骤编写函数，最后依次调用这些函数。

对于面向对象，最初级的理解就是使用结构体或类来封装硬件的操作（C 语言中没有类，就使用结构体），示例代码如下：

```c
// 点灯
struct led
{
    void (*on)(void);
    void (*off)(void);
};

static ra_led_on(void)
{
    // 点亮 LED
}

static ra_led_off(void)
{
    // 熄灭 LED
}

static struct led g_led = {
    .on = ra_led_on,
    .off = ra_led_off,
};

void main()
{
    while (1)
    {
        g_led.on();
        delay_ms(500);
        g_led.off();
        delay_ms(500);
    }
}
```

- 第 2~5 行:对于 LED，它是一个“对象”，抽象出一个结构体“struct led”，里面有 2 个函数指针。
- 第 18~19 行，定义了一个结构体变量 g_led，填充了结构体里的 2 个函数指针，让它们指向具体的函数。
- 第 23 行开始的 main 函数，跟面向过程的 main 函数类似，只不过操作 LED 时是调用结构体 g_led 的函数指针。

上述程序就是面向对象的，它的编程方法是：把问题中的事务分解成各个对象，在对象里描述事务的属性、行为，最后使用对象来解决问题。

上述面向对象的程序过于粗浅，其实对于 main 函数里实现的功能也可以抽象为一个结构体。比如可以抽象出一个结构体“struct business”，表示“业务”。示例代码如下：

```c
struct business{
    void (*run)(void);
};

void led_blink(void)
{
    while (1)
    {
        g_led.on();
        delay_ms(500);
        g_led.off();
        delay_ms(500);
    }
}

struct business g_business = {
    .run = led_blink,
};

void main()
{
    g_business.run();
}
```

- 第 1~3 行，把业务抽象为结构体“struct business”，里面有一个函数指针 run。
- 第 5~14 行，实现了 LED 的闪烁功能。
- 第 16~18 行，定义了一个“struct business”结构体 g_business。
- 第 20~23 行，在 main 函数里调用 g_business 结构的 run 函数指针。

我们把程序分解成了“业务”、“LED”，在实现“业务”时需要操作硬件“LED”。

### 2.1.2 优缺点对比

使用面向过程编写程序时，符合人类的认知过程，比较自然。它的效率也比较高，因为省去了结构体的初始化，调用函数时也比较直接，无需通过结构体进行调用。

使用面向过程编写程序时，更容易维护、复用、扩展。

怎么理解面向对象的优点呢？

假设有一个产品更新了 2 代，第 1 代使用 I2C 接口的屏幕，第 2 代使用 SPI 接口的屏幕。怎么使用一套代码支持这两代产品？有三种方法：宏开关、使用条件判断、使用结构体。

我们要实现在屏幕上显示字符串的函数 lcd_print，使用宏开关时示例代码如下：

```c
// LCD
#ifdef LCD_VER1
void i2c_lcd_print(char *str)
{
    // 在 I2C 屏幕上显示字符串
}
#else
void spi_lcd_print(char *str)
{
    // 在 SPI 屏幕上显示字符串
}
#endif

void lcd_print(char *str)
{
#ifdef LCD_VER1
    i2c_lcd_print(str);
#else
    spi_lcd_print(str);
#endif
}
```

对于第 14 行的 lcd_print 函数，当定义宏 LCD_VER1 时，它调用 i2c_lcd_print 操作第1 代的屏幕；当没有定义宏 LCD_VER1 时，它调用 spi_lcd_print 操作第 2 代的屏幕。这种方法的优点是编译出来的可执行程序比较小，因为它只支持 1 种屏幕，要么支持第 1 代要么支持第 2 代。缺点是：同一个可执行程序，不能既支持第 1 代屏幕也支持第 2 代屏幕。

为了能同时支持两代屏幕，假设可以读到屏幕的型号，那么可以使用条件判断的方法，示例代码如下：

```c
// LCD
void i2c_lcd_print(char *str)
{
    // 在 I2C 屏幕上显示字符串
}

void spi_lcd_print(char *str)
{
    // 在 SPI 屏幕上显示字符串
}

void lcd_print(char *str)
{
    if (read_lcd_type() == VER1)
        i2c_lcd_print(str);
    else
        spi_lcd_print(str);
}
```

第 14 行的代码里，先读取屏幕的型号，后面根据型号决定调用 i2c_lcd_print 还是spi_lcd_print。

使用条件判断的方法可以同时支持两代屏幕，但是有一个缺点：效率低。如果需要实现多个屏幕的操作函数，比如 lcd_on、lcd_off、lcd_rotate 等等函数，这些函数内部都要进行型号的判断。如果要支持更多种屏幕，那么就需要更多的条件判断，比如：

```c
void lcd_print(char *str)
{
    int type = read_lcd_type();
    if (type == VER1)
        i2c_lcd_print(str);
    else if (type == VER2)
        spi_lcd_print(str);
    else if (type == VER3)
        usb_lcd_print(str);
    ......
}
```

这样写出来的代码，既低效又丑陋。最好的办法就是使用结构体，初始化时指定具体函数，以后直接调用，示例代码如下：

```c
// 使用结构体操作 LCD
struct lcd{
    void (*on)(void);
    void (*off)(void);
    void (*print)(const char *str);
};

// 根据 LCD 的型号设置 struct lcd 结构体的函数指针
void lcd_init(struct lcd *plcd)
{
    int type = read_lcd_type();
    if (type == VER1)
    {
        plcd->on = i2c_lcd_on;
        plcd->off = i2c_lcd_off;
        plcd->print = i2c_lcd_print;
    }
    else if (type == VER2)
    {
        plcd->on = spi_lcd_on;
        plcd->off = spi_lcd_off;
        plcd->print = spi_lcd_print;
    }
    else if (type == VER3)
    {
        plcd->on = usb_lcd_on;
        plcd->off = usb_lcd_off;
        plcd->print = usb_lcd_print;
    }
    ......
}

// 使用
struct lcd g_lcd;
void main(void)
{
    lcd_init(&g_lcd);              // 初始化
    g_lcd.on();                    // 启动 LCD
    g_lcd.print("www.100ask.net"); // 显示文字
}
```

- 第 2~6 行，把屏幕抽象为一个结构体“struct lcd”，里面有 on、off、print 等函数指针。
- 第 9~31 行，根据屏幕的型号设置结构体，让它的函数指针指向具体屏幕的操作函数。
- 第 35 行的 main 函数，在初始化 g_lcd 后就可以直接使用了，效率更高。

使用面向对象的思想，把硬件的操作封装在一个结构体里，甚至把一个业务的操作封装在一个结构体里。初次接触这种风格的代码时，不容易理解。特别是在比较复杂的系统里，这些封装的层次更多，层层封装和多次跳转之下程序更难理解。但是一旦理解之后，就会发现程序设计的精妙。一旦习惯了面向对象的编程方法，你就不会再使用面向过程的编程方法。

## 2.2 面向对象的程序设计方法

在《代码大全》第 5 章中，把程序设计分为这几个层次：

- 第 1 层：软件系统，就是整个系统、整个程序
- 第 2 层：分解为子系统，比如可以把整个程序拆分为：输入系统、显示系统、业务系统
- 第 3 层：分解为类，在 C 语言里没有类，可以分解为结构体
- 第 4 层：分解为子程序，就是实现那些结构体(实现里面的函数指针)

### 2.2.1 分解为子系统

一个系统，必定可以分为这 3 大子系统：输入系统、处理系统、输出系统。

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-2/image01.jpg" alt="image01" style="zoom:50%;" />

这种拆分方法过于粗糙，在复杂场景里需要进一步拆分。比如对于输入子系统，如果产品有用户输入、传感器、远程控制等功能，那么输入子系统可以拆分为：用户输入子系统、传感器子系统、远程控制子系统，如下：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-2/image02.jpg" alt="image02" style="zoom:50%;" />

比如对于输出子系统，可能会涉及显示、操作各类设备、数据保存，那么就可以细分为：显示子系统、设备操作、数据子系统，如下：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-2/image03.jpg" alt="image03" style="zoom:50%;" />

对于中间的处理子系统，它根据输入，提供输出。不同的产品有不同的处理逻辑，对于智能家居产品，它根据用户按键、或者根据预设时间、或者根据远程控制命令，去操作各类家居产品；对于工业机器人，它根据各类信号，执行特定的动作。处理子系统是一个集成者：根据业务逻辑，采集左侧各类输入子系统的数据，操作右侧各类输出子系统。以智能家居产品为例，处理子系统又可以细分为：用户关系处理子系统、设备控制子系统、配置子系统等

等，如下：


<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-2/image04.png" alt="image-20230815214356726" style="zoom:50%;" />

### 2.2.2 分解为结构体

怎么实现某个子系统？关键在于抽象出合适的结构体。比如对于用户输入子系统，可以对外提供两个接口函数：初始化、获得按键数据。关键就在于怎么表示“按键数据”。对于用户输入，来源有多种：按键、鼠标、触摸屏。使用怎样的结构体，能统一地描述这些不同来源的输入事件？可以参考 Linux 中的代码，在 Linux 中有如下结构体：

```c
struct input_event{
    struct timeval time;
    __u16 type;
    __u16 code;
    __s32 value;
};
```

- 第 2 行的 time，表示事件发生的时间。
- 第 3 行 type 表示事件类型，有下面这些取值，EV_KEY 表示按键，EV_REL 表示相对位移比如鼠标，EV_ABS 表示绝对位移比如触摸屏。

```c
#define EV_KEY 0x01
#define EV_REL 0x02
#define EV_ABS 0x03
```

- 第 4 行 code 表示编码，比如按键有 A、B、C 等按键的编码值，鼠标有 X、Y 等方向的编码值，触摸屏有 X、Y、Z 等方向的编码值。
- 第 5 行 value 表示取值，比如对于按键：0 表示松开，1 表示按下；对于鼠标，它就表示偏移值；对于触摸屏，它就表示触点坐标。

举几个例子，比如按下键盘上的 A 键时，怎么使用 input_event 结构体表示它？如下：

```c
{time, EV_KEY, KEY_A, 1}
```

往右边移动鼠标 100 个单位，往下移动鼠标 200 个单位，怎么使用 input_event 结构体表示它？需要用 2 个 input_event 结构体，如下：

```c
{time, EV_REL, REL_X, 100}

{time, EV_REL, REL_Y, 200}
```

在触摸屏(100, 200)的位置点击、松开，怎么使用 input_event 结构体表示它？需要用3 个 input_event 结构体，如下：

```c 
{time, EV_ABS, ABS_X, 100}

{time, EV_ABS, ABS_Y, 200}

{time, EV_ABS, ABS_Z, 1} // 表示按下
```

考虑完善的结构体，有助于涉及实现子系统，有了 input_event 结构体后，用户输入子系统对外提供的接口就可以如下定义：

```c
int Init_User_Input_System(void);

int Get_Input_Event(struct input_event *ptEvent);
```

假设需要同时支持多种用户输入设备，那么还可以继续抽象出其他结构体，比如用来描述输入设备的“struct input_dev”，如下：

```c
struct input_dev {
	const char *name;
	int (*Init)(void);
  };
```

对于每一个输入设备，都会为它构建一个“struct input_dev”结构体。

### 2.2.3 分解为子程序

还是以用户输入系统为例，假设需要支持按键、鼠标、触摸屏，那么可以构造对应的 3个“struct input_dev”结构体，给里面的 Init 函数指针提供按键、鼠标、触摸屏的初始化函数，最重要的是：分别注册中断处理函数。

1) 在按键中断处理函数里，消除抖动、构造“struct input_event”结构体，并把它写入一个环形缓冲区。
2) 在鼠标中断处理函数里，解读鼠标数据、构造“struct input_event”结构体，并把它写入一个环形缓冲区。
3) 在触摸屏中断处理函数里，通过 I2C 等接口读取触点数据、构造“struct input_event”结构体，并把它写入一个环形缓冲区。

程序框图如下：


<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/object_oriented_module_programming_method_in_ARM_embedded_system/chapter-2/image05.jpg" alt="image04" style="zoom:50%;" />


如果使用多任务系统，那么可以把上图的环形缓冲区替换为消息队列，各类中断程序写消息队列时可以唤醒等待输入事件的任务。


### 2.2.4 结构体的继承

在单片机软件开发中，基本使用的是 C 语言，很少使用 C++。C 语言是面向过程的语言，但是我们可以使用结构体实现面向对象的开发。但是结构体跟类，有很大的差别。

在 C++中实现类时，可以有继承关系。在 C 语言中使用结构体时，也可以使用继承（在RT-Thread 中大量使用到结构体的继承）。比如人类、狗都属于生物，生物都有性别、体重等属性，那么可以如下定义生物、人类、狗三个结构体，人类和狗都继承了生物的特性：

```c
struct organism
{
    int sex;    // 性别
    int weight; // 体重
};

struct person
{
    struct organism parent; // 父类
    const char *school;     // 毕业学校
};

struct dog
{
    struct organism parent; // 父类
    const char *species;    // 种类
};

```

使用结构体的继承时，“父结构体”必须是“子结构体”的第一个成员。这样有一些好处，比如要实现一个打印体重的函数，可以只实现一个版本，示例代码如下：

```c
void PrintWeight(struct organism *p)
{
    printf("weight : %d\n", p->weight);
}

void main(void)
{
    struct person per = {{1, 100}, "USTC"};
    struct person dog = {{1, 10}, "Husky"};

    PrintWeight(&per);
    PrintWeight(&dog);
}
```

- 第 1 行实现了一个“打印生物体重”的函数。
- 第 8、9 行分别定义了一个“人”、“狗”的结构体。
- 第 11、12 行，可以使用同一个函数“PrintWeight”来打印人的体重、打印狗的体重。如果不使用结构体的继承，那么就需要分别实现人、狗的打印函数，示例代码如下：

```c
struct person{
    int sex;            // 性别
    int weight;         // 体重
    const char *school; // 毕业学校
};

struct dog{
    int sex;             // 性别
    int weight;          // 体重
    const char *species; // 种类
};

void PrintPersonWeight(struct person *p)
{
    printf("weight : %d\n", p->weight);
}

void PrintDogWeight(struct person *p)
{
    printf("weight : %d\n", p->weight);
}
void main(void)
{
    struct person per = {{1, 100}, "USTC"};
    struct person dog = {{1, 10}, "Husky"};

    PrintPersonWeight(&per);
    PrintDogWeight(&dog);
}
```

### 2.2.5 结构体的函数指针

结构体的成员里，可以使用变量来描述属性，使用函数指针来描述方法，比如 LED 可以抽象出如下结构体：

```c
struct led {
	void (*on)(void);
	void (*off)(void);
};
```

对于使用芯片引脚控制的 LED，即使引脚不同，操作函数也是类似的。那怎么分辨使用哪个引脚呢？需要在“struct led”里添加属性以描述引脚，如下：

```c
struct led {
	int pin; // 引脚
 	void (*on)(void);
 	void (*off)(void);
};
```

但是，在 on、off 指针对应的函数里，怎么引用到属性 pin？C 语言的结构体里不能想C++的类那样使用 this 指针来引用自己，所以结构体还需要改进，在 on、off 函数指针里增加一个参数：增加结构体本身的指针，如下：

```c
struct led{
    int pin; // 引脚
    void (*on)(struct led *p);
    void (*off)(struct led *p);
};
```

使用“struct led”的示例代码如下：

```c
// 点灯
struct led{
    int pin; // 引脚
    void (*on)(struct led *p);
    void (*off)(struct led *p);
};

    static ra_led_on(struct led *p)
{
    // 点亮 LED
    // 操作引脚 p->pin
}

static ra_led_off(struct led *p)
{
    // 熄灭 LED
    // 操作引脚 p->pin
}

static struct led g_led = {
    .pin = 100,
    .on = ra_led_on,
    .off = ra_led_off,
};

void main()
{
    while (1)
    {
        g_led.on(&g_led);
        delay_ms(500);
        g_led.off(&g_led);
        delay_ms(500);
    }
}
```

- 第 8、11 行实现的函数，需要从参数“struct led *p”获得要操作哪个引脚：p->pin。
- 第 21~25 行实现的结构体，需要指定属性 pin：使用哪个引脚。
- 第 31、33 行，调用 g_led.on、g_led.off 函数指针时，需要传输 g_led 的地址。

### 2.2.6 程序设计原则

怎样把整个系统拆分多个子系统？在实现子系统时怎样抽象出各个结构体？原则是：高内聚，低耦合。

- 高内聚：一个子系统（或者一个结构体），尽可能只完成一个功能，即最大限度地耦合。
- 低耦合：一个子系统（或者一个结构体）的实现，尽可能少地调用到另一个子系统（或另一个结构体）的功能。

简单地说，就是尽可能让一个子系统（或一个结构体）的功能比较单一，减少对其他子系统（或其他结构体）的依赖。增强内聚度、降低耦合度的方法：

- 基于接口编程，隐藏内部实现的细节
- 模块只对外暴露最小限度的接口，形成最低的依赖关系
- 只要对外接口不变，模块内部的修改不得影响其他模块
- 删除一个模块，应当只影响有依赖关系的其他模块，而不应该影响其他无关部分
- 模块的功能尽可能的单一
- 接口函数在头文件中声明，内部函数不要放在头文件里声明
- 接口函数在 C 文件中实现，内部函数定义为 static 函数，内部变量定义为 static
- 尽量少用全局变量，要使用全局变量的话不要直接访问，使用函数来访问
- 调用者只需要包含头文件
- 函数代码不要太长，功能太复杂的话拆分为多个子函数



