# 第17章 资源管理(Resource Management)

在前面讲解互斥量时，引入过临界资源的概念。在前面课程里，已经实现了临界资源的互斥访问。

本章节的内容比较少，只是引入两个功能：屏蔽/使能中断、暂停/恢复调度器。

要独占式地访问临界资源，有3种方法：

- 公平竞争：比如使用互斥量，谁先获得互斥量谁就访问临界资源，这部分内容前面讲过。
- 谁要跟我抢，我就灭掉谁：
  - 中断要跟我抢？我屏蔽中断
  - 其他任务要跟我抢？我禁止调度器，不运行任务切换

## 17.1 屏蔽中断

屏蔽中断有两套宏：任务中使用、ISR中使用：

- 任务中使用：taskENTER_CRITICA()/taskEXIT_CRITICAL()
- ISR中使用：taskENTER_CRITICAL_FROM_ISR()/taskEXIT_CRITICAL_FROM_ISR()

### 17.1.1 在任务中屏蔽中断

在任务中屏蔽中断的示例代码如下：

```c
/* 在任务中，当前时刻中断是使能的
 * 执行这句代码后，屏蔽中断
 */
 taskENTER_CRITICAL();

/* 访问临界资源 */

/* 重新使能中断 */
taskEXIT_CRITICAL();
```

在taskENTER_CRITICA()/taskEXIT_CRITICAL()之间：

- 低优先级的中断被屏蔽了：优先级低于、等于configMAX_SYSCALL_INTERRUPT_PRIORITY
- 高优先级的中断可以产生：优先级高于configMAX_SYSCALL_INTERRUPT_PRIORITY
  - 但是，这些中断ISR里，不允许使用FreeRTOS的API函数
- 任务调度依赖于中断、依赖于API函数，所以：这两段代码之间，不会有任务调度产生

这套taskENTER_CRITICA()/taskEXIT_CRITICAL()宏，是可以递归使用的，它的内部会记录嵌套的深度，只有嵌套深度变为0时，调用taskEXIT_CRITICAL()才会重新使能中断。

使用taskENTER_CRITICA()/taskEXIT_CRITICAL()来访问临界资源是很粗鲁的方法：

- 中断无法正常运行
- 任务调度无法进行
- 所以，之间的代码要尽可能快速地执行

### 17.1.2 在ISR中屏蔽中断

要使用含有"FROM_ISR"后缀的宏，示例代码如下：

```c
void vAnInterruptServiceRoutine( void )
{
    /* 用来记录当前中断是否使能 */
    UBaseType_t uxSavedInterruptStatus;
    
    /* 在ISR中，当前时刻中断可能是使能的，也可能是禁止的
     * 所以要记录当前状态, 后面要恢复为原先的状态
     * 执行这句代码后，屏蔽中断
     */
    uxSavedInterruptStatus = taskENTER_CRITICAL_FROM_ISR();
    
    /* 访问临界资源 */
    
    /* 恢复中断状态 */
    taskEXIT_CRITICAL_FROM_ISR( uxSavedInterruptStatus );
    /* 现在，当前ISR可以被更高优先级的中断打断了 */
}
```

在taskENTER_CRITICA_FROM_ISR()/taskEXIT_CRITICAL_FROM_ISR()之间：

- 低优先级的中断被屏蔽了：优先级低于、等于configMAX_SYSCALL_INTERRUPT_PRIORITY
- 高优先级的中断可以产生：优先级高于configMAX_SYSCALL_INTERRUPT_PRIORITY
  - 但是，这些中断ISR里，不允许使用FreeRTOS的API函数
- 任务调度依赖于中断、依赖于API函数，所以：这两段代码之间，不会有任务调度产生

## 17.2 暂停调度器

如果有别的任务来跟你竞争临界资源，你可以把中断关掉：这当然可以禁止别的任务运行，但是这代价太大了。它会影响到中断的处理。

如果只是禁止别的任务来跟你竞争，不需要关中断，暂停调度器就可以了：在这期间，中断还是可以发生、处理。

使用这2个函数来暂停、恢复调度器：

```c
/* 暂停调度器 */
void vTaskSuspendAll( void );

/* 恢复调度器
 * 返回值: pdTRUE表示在暂定期间有更高优先级的任务就绪了
 *        可以不理会这个返回值
 */
BaseType_t xTaskResumeAll( void );
```

示例代码如下：

```c
vTaskSuspendScheduler();

/* 访问临界资源 */

xTaskResumeScheduler();
```

这套vTaskSuspendScheduler()/xTaskResumeScheduler()宏，是可以递归使用的，它的内部会记录嵌套的深度，只有嵌套深度变为0时，调用taskEXIT_CRITICAL()才会重新使能中断。

## 17.3 示例24: 解决DHT11出错问题

本节代码为：1701_suspend_all_dht11，主要看applications\nwatch\game1.c。

本程序在游戏界面，每2秒钟读取DHT11的温湿度，并在屏幕上显示出来。驱动程序devices\dev_dht11.c里，使用轮询方式确定波形时长，进而解析出数据。在多任务系统中，假设任务A在测量DHT11的波形宽度的过程中切换到了任务B，那么再切换回任务A时，它的测量结果必定不准确，导致解析DHT11数据失败。解决方法为：在读取DHT11数据前暂停调度器，读取到数据后再恢复调度器。

game1.c里启动定时器，代码如下：

```c
86 static TimerHandle_t g_TimerDHT11;
/* 省略 */
321     DHT11_Init();
322     /* 创建定时器 */
323     g_TimerDHT11 = xTimerCreate( "dht11_timer",
324                                                     2000,
325                                                     pdTRUE,
326                                                     NULL,
327                                                     DHT11Timer_Func);
328     /* 启动定时器 */
329     xTimerStart(g_TimerDHT11, portMAX_DELAY);
```

第323~327行：创建定时器，它是周期性的、超时时间为2秒。

定时超时函数代码如下：

```c
273 static void DHT11Timer_Func( TimerHandle_t xTimer )
274 {
275     int hum, temp;
276     int err;
277     char buff[16];
278
279     /* 读取DHT11的温湿度 */
280     /* 暂停调度器 */
281     vTaskSuspendAll();
282     err = DHT11_Read(&hum, &temp);
283     /* 恢复调度器 */
284     xTaskResumeAll();
285
286     if (0 == err)
287     {
288             /* 在OLED上显示温湿度 */
289             sprintf(buff, "%dC,%d%%", temp, hum);
290     }
291     else
292     {
293             /* 在OLED上显示错误 */
294         strcpy(buff, "err      ");
295     }
296     draw_string(buff, false, (g_xres - 5*strlen(buff))/2, 0);
297 }
```

关键代码在于第281、284行，它们分别暂停调度器、恢复调度器，使得第282行的读DHT11操作不会被别的任务打断。

定时器超时函数，是在定时器守护任务里运行的，如果这个任务的优先级最高，那么别的任务就无法抢占它，这种情况下，第281、284行的代码可以省略。

为了体验程序效果，使用RASC配置定时器守护任务，把它的优先级设置为1（跟游戏任务一样）。如下图设置：

<img src="https://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/FreeRTOS/chapter-17/image1.png" style="zoom:67%;" />

实现现象：把第281、284行代码注释掉，屏幕第1行显示“err”；把第281、284行保留，可以正确显示温湿度值。
