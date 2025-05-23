---
layout: default
---

<div class="shadow-box"><smartvideo src="https://www.dropbox.com/scl/fi/vp66rosnxmildbvwzhuzw/Discover-2.mp4?rlkey=p24x76gixeii356wl4w2xwdoy&st=rguc3qa9&dl=1" width="1280" height="720" class="swarm-fluid" poster="https://previews.dropbox.com/p/thumb/AAywh4Ey9sWRgY65vSI-C3upbJYfgCo-R8W45MZznCxNNYz_e7fBIOL9xhMLoAjkINrRpCaIbqgMIl0pkmquEL3-K9HLHVgvAL1YSUQfdWxee8bT_e_4wO8oEn37oi7wqtdedRihBDicWfUrVVokGujov1aGZsDyXcCQGnTpfa3xBe96uwe_Er1dN9cHCEp9Nwji9HpqVI8vm4HLQX0boNKnTq80YdJbO_BU4t7RIfk3v3f05XgvxypfdaLVH6wfyi4w_D4MZexxvcIRE5aho5BOqq3CFhWebJfV0JBggIBWrpYMep0D2Shf1lMWYbK2x6PY9wMWVm95_cYS71wJQBO2fToe83hjS8YbH7SbqgO4UJuXoxXi8CI3nSJC9iLSwz62SIzsHE0gamjFgK5p5Crz4wfin2iIHT13XsBfexsxdA/p.png" controls loop muted autoplay></smartvideo></div>

## 👋 Hi there, welcome to Discover!

Discover is an optimization tool built to work with [Rhino](https://rhino3d.com) [Grasshopper](http://grasshopper3d.com). It is being developed by [Colidescope](https://colidescope.com/) as free software with the goal of promoting performance-driven automated design workflows in the architecture, engineering, and construction industries.

You can find a general overview of Discover's features on its [product page](https://getdiscover.app). You can also find step by step video tutorials for installing Discover and connecting it to your Rhino Grasshopper models on the [Colidescope](https://colide.co/live/intro-to-generative-design#getting-started-with-discover) learning platform.

## Requirements

- PC running Windows 10 64-bit
- [Rhino 6/7/8](https://www.rhino3d.com/download) - Discover can probably be made to work with Rhino 5 as well as the OSX version but it is not supported at this time.
- [Python 3.9](https://www.python.org/downloads/windows/)
- Web browser (such as [Chrome](https://www.google.com/chrome/b/) or [Firefox](https://www.mozilla.org/en-US/firefox/new/))

## Installation

### Installing Python

Currently Windows does not ship with Python, so if you've never used Python or you're not sure, you will need to install a version of Python on your computer.

Discover has been tested using Python 3.9.6 and is not guaranteed to be compatibile with more recent versions of Python due to possible compatibility issues with some of the Python libraries Discover uses. If you'd like to use Python 2 it can probably be made to work but it is not supported at this time. If you already have Python 3 version 3.9 or lower installed you can skip to the next step.

1. Go to the [Python download page](https://www.python.org/downloads/windows/) and select the latest Python 3.9 release ([3.9.6](https://www.python.org/downloads/release/python-396/) at time of writing).
2. On the download page, scroll down and under 'Files' select and download the [Windows x86-64 executable installer](https://www.python.org/ftp/python/3.9.6/python-3.9.6-amd64.exe).
3. Run the .exe installation file to install Python on your computer. **IMPORTANT: make sure you select the option to "Add Python 3.X to PATH". Discover will not work if this is not checked.**

<div class="shadow-box"><img src="/discover/assets/img/01.png"></div>
 
### Downloading Discover

1. Click on the download link on the left to download a zip file with the latest release of Discover
2. Unzip the file to a new folder on your computer.

### Installing dependencies

1. Double-click the `discover.bat` script in the folder where you unzipped Discover. This will launch a new Command Prompt window where the Discover server will run. The first time you run the script it will install any dependencies which are needed for Python. This only needs to happen once. After checking the dependencies the script will start the Discover server and launch the app in your default web browser.
2. Windows may ask for admin privileges the first time you run the server. Make sure to click 'Allow access'. You should only have to do this once.

<div class="shadow-box"><img src="/discover/assets/img/02.png"></div>

You should now see the Discover interface appear in the launched browser window. To make sure everything is working, run a default test optimization by clicking "Run". You should see the scatter plot populate with test data similar to this:

<div class="shadow-box"><img src="/discover/assets/img/06.png"></div>

If you initially get a blank page or a "site not found" error, wait a few moments for the server to boot up and then try to refresh the page. If the interface still does not appear, check the Command Prompt window. If you see any errors, take a screenshot of the Command Prompt window and send it to the email address provided in the [support section](#support) of this page. If the Command Prompt window is no longer running, follow the instructions in the [support section](#support) of this page.

### Installing the Grasshopper components

Discover includes a Grasshopper library of custom components which allows the Discover server to communicate with your Grasshopper model. To install the components:

1. Open Grasshopper and go to `File -> Special Folders -> Components Folder`. This will open the folder where Grasshopper stores its custom plugin files.
2. Copy all the files in the `/Grasshopper Plugin` folder of the Discover zip file to Grasshopper's `Components Folder`.
3. Restart Rhino and Grasshopper. You should now see a new tab in the ribbon called 'Discover' with the 7 Discover components loaded.

<div class="shadow-box"><img src="/discover/assets/img/03.png"></div>
<div class="shadow-box"><img src="/discover/assets/img/04.png"></div>

## Working with Discover

### Starting the server

Double-click the `discover.bat` script in the folder where you unzipped Discover. This will open a Command Prompt window, start the Discover server, and launch the app in your default web browser. Make sure to keep the Command Prompt window open while you're using Discover.

### Shutting down the server

When you're done using Discover, close the Command Prompt window to shut down the server.

## Known issues

- If you're having issues with the Discover tab not appearing when you start Grasshopper, this may be due to the Discover.gha file being blocked by Windows. This is a security feature of Windows when downloading unfamiliar file types. It should not happen if you download the ZIP file on this site, but may happen if you download the Discover.gha file directly from [Food4Rhino](https://www.food4rhino.com/app/discover) or another source. To fix this issue, right-click on the Discover.gha file in your Components Folder, go to 'Properties', and click the 'Unblock' button in the lower right corner. If you don't see this button the file is not blocked and you are having a different issue.
- During the optimization process, Discover writes certain files to a local directory for each computed design. The location of this directory is based on the location of the Grasshopper (.gh) file. There is a known issue where if your Grasshopper file is in a folder which is hosted on a network or a cloud sharing service like Dropbox, the writing process can take too long, causing the components and server to get out of sync. This can result in the optimization process stopping or many of the same designs being generated at once. If you experience these issues, make sure your Grasshopper file is located in a local folder on your computer and is not being shared over any network.

## Support

_Disclaimer: This program is distributed for free in the hope that it will be useful, but without any warranty or guarantee that it will work the way it's described or work at all._

If you have trouble installing Discover or getting it to run, please follow these instructions:

1. Go to the folder where you unzipped Discover. This is where the 'discover.bat' file is.
2. While holding SHIFT, right click anywhere in the folder (not on a file) and select 'Open Command Prompt window here' or ~~'Open PowerShell window here'~~ **(12/24/2019: There seem to be issues with running the virtual environment commands from PowerShell. If you don't see 'Open Command Prompt window here' open Command Prompt manually by searching for it in the Windows Start menu. Then navigate to the local Discover folder by typing 'cd ' followed by the path - for example 'cd C:\Downloads\Discover'**
3. Type this command and hit Enter: `python -m venv env`
4. Type this command and hit Enter: `.\env\Scripts\activate.bat`
5. Type this command and hit Enter: `pip install -r requirements.txt`
6. Type this command and hit Enter: `python server.py`
7. If you see an error in the Command Prompt at any point during this process, take a screenshot of the command prompt and send it to support@colidescope.com with a description of the steps you took during installation.

If you find a bug in Discover, you can submit it to the development team using the link below. If you include an email address we will notify you when we release a fix.
