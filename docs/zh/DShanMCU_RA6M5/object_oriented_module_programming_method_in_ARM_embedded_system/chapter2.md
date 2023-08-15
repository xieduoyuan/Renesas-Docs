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