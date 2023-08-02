
# 6. 配置PYOCD(e2studio)

## 6.1 安装 e2stduio

> 如果之前已经安装了e2studio，请卸载原有的e2studio并且重启电脑，之后再按照下面的步骤进行安装！

安装位于资料包的 `6_使用软件/setup_fsp_v4_5_0_e2s_v2023-04.exe`，或者自行获取[更新版本](https://github.com/renesas/fsp/releases)，建议使用配套的版本。

安装步骤：

1. 打开之后会有一个加载进度条，进度条满之后会弹出这个界面，选择 `All Users`(所有用户)：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-020.png" alt="DShanMCU-RA6M5-DAP-020" style="zoom:67%;" />

2. 下一步选择 `Custom Install`(自定义安装)：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-021.png" alt="DShanMCU-RA6M5-DAP-021" style="zoom:80%;" />

3. `Welcome` 和 `Extra Features` 按照默认的选项即可不需要更新，不建议在 Extra Features 中勾选中文语言包，**建议使用默认的英文界面**。在第三步，也就是 `Customise Features` 中，按照下图勾选，然后点击 Next，进入下一步：

![DShanMCU-RA6M5-DAP-022](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-022.png)

4. 下一步，如下图所示勾选之后点击 next 进入下一步：

![DShanMCU-RA6M5-DAP-023](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-023.png)

5. 下一步，同意Licenses点击 next 进入下一步：

![DShanMCU-RA6M5-DAP-024](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-024.png)

6. 下一步，默认即可，点击 next 进入下一步：

![DShanMCU-RA6M5-DAP-025](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-025.png)

7. 下一步，等待检查完成，没有红色提示说明一切正常，可以点击 install 进行安装：

![DShanMCU-RA6M5-DAP-026](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-026.png)

8. 正式安装阶段，耐心等待其安装完成，期间会有一些**弹窗询问**是否安装或者允许，一定要点击安装或者允许。

![DShanMCU-RA6M5-DAP-027](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-027.png)

9. 安装完成，点击 ok 退出安装程序：

![DShanMCU-RA6M5-DAP-028](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-028.png)

## 6.2 在e2stduio中配置PYOCD

1. 打开 `e2stduio` 按照下图进行操作`Window --> Perspectives --> Open Perspective -->Other...`：

![DShanMCU-RA6M5-DAP-029](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-029.png)

2. 在打开的新窗口中，按照下图操作，打开 **CMSIS Packs**：

![DShanMCU-RA6M5-DAP-030](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-030.png)

3. 按照下图操作打开 `Window --> Perspective --> Customize Perspective`：

![DShanMCU-RA6M5-DAP-031](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-031.png)

4. 在打开的新窗口中，去掉这两个选项的勾选，如图所示操作：

![DShanMCU-RA6M5-DAP-032](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-032.png)

5. 按照下图操作打开 `Window --> Preferences`：

![DShanMCU-RA6M5-DAP-033](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-033.png)

6. 在打开的新窗口中，按照下图所示的位置，粘贴在前面使用 Everything 软件搜索定位到的路径 `C:\Users\biubiu\AppData\Roaming\Python\Python311\Scripts` ：

![DShanMCU-RA6M5-DAP-034](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-034.png)

7. 新建一个工程或者打开一个现有工程，并且完成编译，然后按照下图操作打开 `Run--> Debug Configuratons...`：

![DShanMCU-RA6M5-DAP-035](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-035.png)

8. 进入新窗口后，按照下图操作，打开新建配置文件：

![DShanMCU-RA6M5-DAP-036](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-036.png)

9. 在新打开的页面中按照下图进行配置：

![DShanMCU-RA6M5-DAP-037](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-037.png)

10. 点击 `Debugger`,继续进行配置，如下图所示：

    需要输入的文字为：

    - R7FA6M5BF
    - --config C:\100ASK_PYOCD\pyocd.yaml

![DShanMCU-RA6M5-DAP-038](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-038.png)

11. 点击 `Common`，继续进行配置，如下图所示：

![DShanMCU-RA6M5-DAP-039](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-039.png)

12. 最后点击 `Debug` 按钮，会顺利进入debug模式并且开始工作，等待起烧写完成之后即可进行debug操作，如下图所示：

![DShanMCU-RA6M5-DAP-040](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-040.png)

当退出debug模式之后，会发现板子可以单独运行刚刚烧写的程序，也就是说后续可以通过这样将程序烧写到开发板中并且运行。



到这里，我们已经可以正常在e2stduio中使用DAP进行烧写、调试！

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>
