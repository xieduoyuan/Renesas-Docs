# 在e2studio中使用DAP进行开发调试（基于DShanMCU-RA6M5开发板）

# 目录

[toc]

<div STYLE="page-break-after: always;"></div>

# 1. 资料准备

本文档所有用到的资料获取页面： [http://download.100ask.net/boards/Renesas/DShanMCU-RA6M5/index.html](http://download.100ask.net/boards/Renesas/DShanMCU-RA6M5/index.html)

-----

<center>本节完</center>


<div STYLE="page-break-after: always;"></div>

# 2. 硬件准备

我们将用到如下开发套件：

| 名称                                                         | 数量 |
| :----------------------------------------------------------- | :--- |
| [DShanMCU-RA6M5开发板](https://item.taobao.com/item.htm?id=728461040949) | 1    |
| USB Type-C数据线                                             | 1    |

> DShanMCU-RA6M5开发板购买链接： [https://item.taobao.com/item.htm?id=728461040949](https://item.taobao.com/item.htm?id=728461040949)

## 2.1 硬件接线

将**USB Type-C数据线**接到**DShanMCU-RA6M5开发板**上印有 `Debug` 丝印的Type-C接口，然后将**USB Type-C数据线**的另一端接到电脑的USB口。如下图所示：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-000.png" alt="DShanMCU-RA6M5-DAP-000" style="zoom:67%;" />


-----

<center>本节完</center>


<div STYLE="page-break-after: always;"></div>

# 3. 安装Python

我们提供的资料包中已经包含了Python的安装包，直接打开安装即可，如果你想自己从Python官网获取或者获取更新版本，地址： [https://www.python.org/downloads](https://www.python.org/downloads)

>  建议使用和课程配套版本的安装包，这样可以避免一些未知的问题。

打开位于 `6_使用软件/PYOCD/` 目录下的python安装包，64位系统直接双击 `python-3.11.4-amd64-Recommended.exe` 即可安装，如果提示**不能安装则使用** `python-3.11.4-32bit.exe`。如下图所示：

![DShanMCU-RA6M5-DAP-001](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-001.png)

安装步骤如下：

1. 先点击勾选 **Add  python.exe to PATH*** 然后点击 **Customize installation**：

![DShanMCU-RA6M5-DAP-002](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-002.png)

2. 这些选项默认是勾选的，如果没有勾选，请按照图中所示将其勾选：

![DShanMCU-RA6M5-DAP-003](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-003.png)

3. 选择 **Install Python 3.11 for all users** ：

![DShanMCU-RA6M5-DAP-004](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-004.png)

4. 安装完成，点击 **Close** 完成并退出安装：

![DShanMCU-RA6M5-DAP-005](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-005.png)

-----

<center>本节完</center>


<div STYLE="page-break-after: always;"></div>

# 4. 安装PYOCD

当将python安装之后，按下键盘的 **win+r** 键，在屏幕左下角会弹出一个小窗口，在其输入框中输入 `cmd` 之后按下回车键：

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-006.png" alt="DShanMCU-RA6M5-DAP-006" style="zoom: 67%;" />

按照上图点击运行python会得到如下图所示的窗口：

![DShanMCU-RA6M5-DAP-007](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-007.png)

点击选中该窗口，输入/复制粘贴 `python -m pip install -U pyocd` 然后按回车，之后耐心等待安装完成，如下图所示：

![DShanMCU-RA6M5-DAP-008](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-008.png)

如果提示报错，一般都是因为网络问题导致的，因为相关资源需要在国外拉取，所以，这需要多次尝试，并且耐心等待：

![DShanMCU-RA6M5-DAP-009](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-009.png)

一般都是由于访问国外服务器的问题导致的 **timed out** 错误，此时我们继续运行 `python -m pip install -U pyocd` 多尝试几次即可：

![DShanMCU-RA6M5-DAP-010](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-010.png)

可能只需要一次，也可能需要尝试多次，一般在提示出错后重新尝试2-3次可顺利完成，成功界面如下图所示：

![DShanMCU-RA6M5-DAP-011](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-011.png)

完整的安装过程，截图：

![DShanMCU-RA6M5-DAP-012](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-012.png)

完整安装过程，文字：

```shell
C:\Users\biubiu>python -m pip install -U pyocd
Defaulting to user installation because normal site-packages is not writeable
Collecting pyocd
  Downloading pyocd-0.35.1-py3-none-any.whl (13.7 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 13.7/13.7 MB 24.6 kB/s eta 0:00:00
Collecting capstone<5.0,>=4.0 (from pyocd)
  Downloading capstone-4.0.2-py2.py3-none-win_amd64.whl (896 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 896.4/896.4 kB 24.6 kB/s eta 0:00:00
Collecting cmsis-pack-manager<1.0,>=0.5.2 (from pyocd)
  Downloading cmsis_pack_manager-0.5.2-py3-none-win_amd64.whl (2.7 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2.7/2.7 MB 19.0 kB/s eta 0:00:00
Collecting colorama<1.0 (from pyocd)
  Downloading colorama-0.4.6-py2.py3-none-any.whl (25 kB)
Collecting importlib-metadata>=3.6 (from pyocd)
  Downloading importlib_metadata-6.8.0-py3-none-any.whl (22 kB)
Collecting importlib-resources (from pyocd)
  Downloading importlib_resources-6.0.0-py3-none-any.whl (31 kB)
Collecting intelhex<3.0,>=2.0 (from pyocd)
  Downloading intelhex-2.3.0-py2.py3-none-any.whl (50 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 50.9/50.9 kB 26.8 kB/s eta 0:00:00
Collecting intervaltree<4.0,>=3.0.2 (from pyocd)
  Downloading intervaltree-3.1.0.tar.gz (32 kB)
  Installing build dependencies ... done
  Getting requirements to build wheel ... done
  Preparing metadata (pyproject.toml) ... done
Collecting lark<2.0,>=1.1.5 (from pyocd)
  Downloading lark-1.1.7-py3-none-any.whl (108 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 108.9/108.9 kB 28.8 kB/s eta 0:00:00
Collecting libusb-package<2.0,>=1.0 (from pyocd)
  Downloading libusb_package-1.0.26.2-cp311-cp311-win_amd64.whl (90 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 90.4/90.4 kB 19.2 kB/s eta 0:00:00
Collecting natsort<9.0,>=8.0.0 (from pyocd)
  Downloading natsort-8.4.0-py3-none-any.whl (38 kB)
Collecting prettytable<4.0,>=2.0 (from pyocd)
  Downloading prettytable-3.8.0-py3-none-any.whl (27 kB)
Collecting pyelftools<1.0 (from pyocd)
  Downloading pyelftools-0.29-py2.py3-none-any.whl (174 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 174.3/174.3 kB 25.2 kB/s eta 0:00:00
Collecting pylink-square<2.0,>=1.0 (from pyocd)
  Downloading pylink_square-1.2.0-py2.py3-none-any.whl (82 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 82.4/82.4 kB 25.5 kB/s eta 0:00:00
Collecting pyusb<2.0,>=1.2.1 (from pyocd)
  Downloading pyusb-1.2.1-py3-none-any.whl (58 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 58.4/58.4 kB 19.0 kB/s eta 0:00:00
Collecting pyyaml<7.0,>=6.0 (from pyocd)
  Downloading PyYAML-6.0.1-cp311-cp311-win_amd64.whl (144 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 144.7/144.7 kB 19.0 kB/s eta 0:00:00
Collecting six<2.0,>=1.15.0 (from pyocd)
  Downloading six-1.16.0-py2.py3-none-any.whl (11 kB)
Collecting typing-extensions<5.0,>=4.0 (from pyocd)
  Downloading typing_extensions-4.7.1-py3-none-any.whl (33 kB)
Collecting hidapi<1.0,>=0.10.1 (from pyocd)
  Downloading hidapi-0.14.0-cp311-cp311-win_amd64.whl (58 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 58.2/58.2 kB 9.5 kB/s eta 0:00:00
Collecting appdirs<2.0,>=1.4 (from cmsis-pack-manager<1.0,>=0.5.2->pyocd)
  Downloading appdirs-1.4.4-py2.py3-none-any.whl (9.6 kB)
Collecting cffi (from cmsis-pack-manager<1.0,>=0.5.2->pyocd)
  Downloading cffi-1.15.1-cp311-cp311-win_amd64.whl (179 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 179.0/179.0 kB 27.5 kB/s eta 0:00:00
Requirement already satisfied: setuptools>=19.0 in c:\program files\python311\lib\site-packages (from hidapi<1.0,>=0.10.1->pyocd) (65.5.0)
Collecting zipp>=0.5 (from importlib-metadata>=3.6->pyocd)
  Downloading zipp-3.16.2-py3-none-any.whl (7.2 kB)
Collecting sortedcontainers<3.0,>=2.0 (from intervaltree<4.0,>=3.0.2->pyocd)
  Downloading sortedcontainers-2.4.0-py2.py3-none-any.whl (29 kB)
Collecting wcwidth (from prettytable<4.0,>=2.0->pyocd)
  Downloading wcwidth-0.2.6-py2.py3-none-any.whl (29 kB)
Collecting psutil>=5.2.2 (from pylink-square<2.0,>=1.0->pyocd)
  Downloading psutil-5.9.5-cp36-abi3-win_amd64.whl (255 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 255.1/255.1 kB 26.4 kB/s eta 0:00:00
Collecting pycparser (from cffi->cmsis-pack-manager<1.0,>=0.5.2->pyocd)
  Downloading pycparser-2.21-py2.py3-none-any.whl (118 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 118.7/118.7 kB 23.9 kB/s eta 0:00:00
Building wheels for collected packages: intervaltree
  Building wheel for intervaltree (pyproject.toml) ... done
  Created wheel for intervaltree: filename=intervaltree-3.1.0-py2.py3-none-any.whl size=26128 sha256=dea34301fef6a0d0440f15d693ac29517637e1a213aa8d421aa6794f2329c089
  Stored in directory: c:\users\biubiu\appdata\local\pip\cache\wheels\31\d7\d9\eec6891f78cac19a693bd40ecb8365d2f4613318c145ec9816
Successfully built intervaltree
Installing collected packages: wcwidth, sortedcontainers, pyelftools, intelhex, appdirs, zipp, typing-extensions, six, pyyaml, pyusb, pycparser, psutil, prettytable, natsort, lark, intervaltree, importlib-resources, hidapi, colorama, capstone, pylink-square, libusb-package, importlib-metadata, cffi, cmsis-pack-manager, pyocd
  WARNING: The script natsort.exe is installed in 'C:\Users\biubiu\AppData\Roaming\Python\Python311\Scripts' which is not on PATH.
  Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
  WARNING: The script pylink.exe is installed in 'C:\Users\biubiu\AppData\Roaming\Python\Python311\Scripts' which is not on PATH.
  Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
  WARNING: The scripts pyocd-gdbserver.exe and pyocd.exe are installed in 'C:\Users\biubiu\AppData\Roaming\Python\Python311\Scripts' which is not on PATH.
  Consider adding this directory to PATH or, if you prefer to suppress this warning, use --no-warn-script-location.
Successfully installed appdirs-1.4.4 capstone-4.0.2 cffi-1.15.1 cmsis-pack-manager-0.5.2 colorama-0.4.6 hidapi-0.14.0 importlib-metadata-6.8.0 importlib-resources-6.0.0 intelhex-2.3.0 intervaltree-3.1.0 lark-1.1.7 libusb-package-1.0.26.2 natsort-8.4.0 prettytable-3.8.0 psutil-5.9.5 pycparser-2.21 pyelftools-0.29 pylink-square-1.2.0 pyocd-0.35.1 pyusb-1.2.1 pyyaml-6.0.1 six-1.16.0 sortedcontainers-2.4.0 typing-extensions-4.7.1 wcwidth-0.2.6 zipp-3.16.2

[notice] A new release of pip is available: 23.1.2 -> 23.2.1
[notice] To update, run: python.exe -m pip install --upgrade pip

C:\Users\biubiu>
```

到这里，PYOCD的安装顺利完成！

-----

<center>本节完</center>


<div STYLE="page-break-after: always;"></div>


# 5. 配置PYOCD(Windows)

在windows系统上配置好PYOCD之后才可以在e2stduio上使用，因此我们要先在windows系统中配置好PYOCD，下面是配置步骤。

在文件管理器中打开 `C盘` ，新建 `100ASK_PYOCD` 目录，如下图所示：

![DShanMCU-RA6M5-DAP-013](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-013.png)

进入新建的 `100ASK_PYOCD` 目录，将资料包位于 `6_使用软件/PYOCD/` 的 **pyocd.yaml** 和 **MDK_Device_Packs_v4.5.0.zip** 复制到刚刚新建位于C盘的 `100ASK_PYOCD` 目录中，如下图所示：

![DShanMCU-RA6M5-DAP-014](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-014.png)

使用解压缩工具解压 **MDK_Device_Packs_v4.5.0.zip** 得到 **Renesas.RA_DFP.4.5.0.pack**

![DShanMCU-RA6M5-DAP-015](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-015.png)

继续使用解压缩工具解压 **Renesas.RA_DFP.4.5.0.pack** ，得到 `Renesas.RA_DFP.4.5.0` 文件夹：

![DShanMCU-RA6M5-DAP-016](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-016.png)

将文件夹 `Renesas.RA_DFP.4.5.0` **重命名** 为 `Renesas.RA_DFP`：

![DShanMCU-RA6M5-DAP-017](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-017.png)

安装位于资料包的 `6_使用软件/Everything-1.4.1.1024.x64-Setup.exe` ,安装之后打开 `Everything`，按照下图**输入搜索** `pyocd`

![DShanMCU-RA6M5-DAP-018](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-018.png)

在上面的搜索结果中，我们重点关注 `pyocd.exe` 与 `pyocd-gdbserver.exe`，这两者的目录都是一样的，位于：`C:\Users\biubiu\AppData\Roaming\Python\Python311\Scripts` 不同电脑不同系统都可能会不一样，以自己实际得出的为准。请将这个路径要记下来，后面还需要用到一次。

按下键盘的 **win+r** 键，在屏幕左下角会弹出一个小窗口，在其输入框中输入 `cmd` 之后按下回车键进入windows命令行窗口，在窗口中输入 **C:\Users\biubiu\AppData\Roaming\Python\Python311\Scripts\pyocd.exe list --targets --config C:\100ASK_PYOCD\pyocd.yaml** 按下回车键执行，如下图所示：

![DShanMCU-RA6M5-DAP-019](http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/DShanMCU-RA6M5-DAP-019.png)

到这里，配置PYOCD(Windows)已完成！

-----

<center>本节完</center>


<div STYLE="page-break-after: always;"></div>

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

-----

<center>本节完</center>

<div STYLE="page-break-after: always;"></div>


# 8. 更多学习资源

- 瑞萨电子官网： [https://www.renesas.cn](https://www.renesas.cn)
- 瑞萨 RA MCU 生态社区： [https://www.ramcu.cn](https://www.ramcu.cn)
- DShanMCU-RA6M5技术交流QQ群： [881706770](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=LwH6qzFGzSNVwsIQtMta9JZrMcuzfTcb&authKey=96jtabNBcdn%2BbHCPa85j79brjcgntsG1d2YDRMiAvmO3DPRAyi9Vi7KGOAbbOYAP&noverify=0&group_code=881706770)
- DShanMCU-RA6M5开发板配套资料： [http://download.100ask.net/boards/Renesas/DShanMCU-RA6M5/index.html](http://download.100ask.net/boards/Renesas/DShanMCU-RA6M5/index.html)
- DShanMCU-RA6M5开发板购买链接： [https://100ask.taobao.com](https://item.taobao.com/item.htm?id=728461040949)
- 百问网在线学习平台： [https://www.100ask.net](https://www.100ask.net)
- 百问网bilibili： [https://space.bilibili.com/275908810](https://space.bilibili.com/275908810)
- 百问网技术交流社区： [https://forums.100ask.net](https://forums.100ask.net)

<div STYLE="page-break-after: always;"></div>


-----

<div STYLE="page-break-after: always;"></div>

<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/wechat_official_account_renesas-mcu.jpg" alt="wechat_official_account_renesas-mcu" style="zoom: 33%;" />

<center>瑞萨MCU小百科微信公众号</center>



<img src="http://photos.100ask.net/renesas-docs/DShanMCU_RA6M5/e2studio_use_dap/wechat_official_account_100ask.jpg" alt="wechat_official_account_100ask" style="zoom:33%;" />

<center>深圳百问网微信公众号</center>