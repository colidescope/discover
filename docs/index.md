---
layout: default
---
<div class="shadow-box"><div class="resp-container"><iframe class="resp-iframe" src="https://www.youtube.com/embed/tazRo4mMBm4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>

## 👋 Hi there, welcome to Discover!

Discover is an optimization tool built to work with [Rhino](https://rhino3d.com) [Grasshopper](http://grasshopper3d.com). It is being developed by [Colidescope](https://colidescope.com/) as free software with the goal of promoting performance-driven automated design workflows in the architecture, engineering, and construction industries.

## Requirements

- PC running Windows 10 64-bit
- [Rhino 6](https://www.rhino3d.com/download) - Discover can probably be made to work with Rhino 5 as well as the OSX version but it is not supported at this time.
- [Python 3.7](https://www.python.org/downloads/windows/)
- Web browser (such as [Chrome](https://www.google.com/chrome/b/) or [Firefox](https://www.mozilla.org/en-US/firefox/new/))

## Installation

### Installing Python

Currently Windows does not ship with Python, so if you've never used Python or you're not sure, you will need to install a version of Python on your computer. 

Discover is built using Python 3.7.4 but any version of Python 3.7 should work. Due to compatibility issues with some of its libraries, Discover **does not currently work with Python 3.8**. If you'd like to use Python 2 it can probably be made to work but it is not supported at this time. If you already have Python 3.7 installed you can skip to the next step.

1. Go to the [Python download page](https://www.python.org/downloads/windows/) and select the latest Python 3.7 release ([3.7.4](https://www.python.org/downloads/release/python-374/) at time of writing).
2. On the download page, scroll down and under 'Files' select and download the [Windows x86-64 executable installer](https://www.python.org/ftp/python/3.7.4/python-3.7.4-amd64.exe). 
3. Run the .exe installation file to install Python on your computer. **IMPORTANT: make sure you select the option to "Add Python 3.7 to PATH". Discover will not work if this is not checked.**

<div class="shadow-box"><img src="/discover/assets/img/01.png"></div>
 
### Downloading Discover

1. Click on the download link on the left to download a zip file with the latest release of Discover
2. Unzip the file to a new folder on your computer.

### Installing dependencies

1. Double-click the `discover.bat` script in the folder where you unzipped Discover. This will launch a new Command Prompt window where the Discover server will run. The first time you run the script it will install any dependencies which are needed for Python. This only needs to happen once. After checking the dependencies the script will start the Discover server and launch the app in your default web browser.
2. Windows may ask for admin privileges the first time you run the server. Make sure to click 'Allow access'. You should only have to do this once.

<div class="shadow-box"><img src="/discover/assets/img/02.png"></div>

You should now see the Discover interface appear in the launched browser window. To make sure everything is working, run a default test optimization by clicking "Run". You should see the scatter plot populate with test data similar to this:

<div class="shadow-box"><img src="/discover/assets/img/05.png"></div>

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

- During the optimization process, Discover writes certain files to a local directory for each computed design. The location of this directory is based on the location of the Grasshopper (.gh) file. There is a known issue where if your Grasshopper file is in a folder which is hosted on a network or a cloud sharing service like Dropbox, the writing process can take too long, causing the components and server to get out of sync. This can result in the optimization process stopping or many of the same designs being generated at once. If you experience these issues, make sure your Grasshopper file is located in a local folder on your computer and is not being shared over any network.

## Support

*Disclaimer: This program is distributed for free in the hope that it will be useful, but without any warranty or guarantee that it will work the way it's described or work at all.*

If you have trouble installing Discover or getting it to run, please follow these instructions:

1. Go to the folder where you unzipped Discover. This is where the 'discover.bat' file is.
2. While holding SHIFT, right click anywhere in the folder (not on a file) and select 'Open Command Prompt window here' or 'Open PowerShell window here'
3. Type this command and hit Enter: `python -m venv env`
4. Type this command and hit Enter: `.\env\Scripts\activate.bat`
5. Type this command and hit Enter: `pip install -r requirements.txt`
6. Type this command and hit Enter: `python server.py`
7. If you see an error in the Command Prompt at any point during this process, take a screenshot of the command prompt and send it to support@colidescope.com with a description of the steps you took during installation.

If you find a bug in Discover, you can submit it to the development team using the link below. If you include an email address we will notify you when we release a fix.
