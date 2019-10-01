---
layout: default
---

Discover is an optimization tool built to work with [Rhino](https://rhino3d.com) [Grasshopper](http://grasshopper3d.com). It is being developed in parallel with the [Generative Design](https://performance.thinkific.com/courses/generative-design-course?ref=a6f24f) course on [Performance Network](https://performance.thinkific.com/?ref=a6f24f). 

![image](/assets/img/screenshot.png)

## Requirements

- PC running Windows 10 64-bit
- [Rhino 6](https://www.rhino3d.com/download) - Discover can probably be made to work with Rhino 5 as well as the OSX version but it is not supported at this time.
- [Python 3.7](https://www.python.org/downloads/windows/)
- Web browser (such as [Chrome](https://www.google.com/chrome/b/) or [Firefox](https://www.mozilla.org/en-US/firefox/new/))

## Installation

### Installing Python

Currently Windows does not ship with Python, so if you've never used Python or you're not sure, you will need to install a version of Python on your computer. 

Discover is built on Python 3.7.4, which is the latest version at the time of writing, but any version of Python 3 should work. If you'd like to use Python 2 it can probably be made to work but it is not supported at this time. If you already have Python 3 installed you can skip to the next step.

1. Go to the [Python download page](https://www.python.org/downloads/windows/) and select the latest Python 3 release ([3.7.4](https://www.python.org/downloads/release/python-374/) at time of writing).
2. On the download page, scroll down and under 'Files' select and download the [Windows x86-64 executable installer](https://www.python.org/ftp/python/3.7.4/python-3.7.4-amd64.exe). 
3. Run the .exe installation file to install Python on your computer. **IMPORTANT: make sure you select the option to "Add Python 3.7 to PATH". Discover will not work if this is not checked.**

![image](/assets/img/01.png)
 
### Downloading Discover

1. Click on the download link on the left to download a zip file with the latest release of Discover
2. Unzip the file to a new folder on your computer.

### Installing dependencies

3. Double-click the `discover.bat` script in the folder where you unzipped Discover. The first time you run the script it will install any dependencies which are needed for Python. This only needs to happen once. After checking the dependencies the script will start the Discover server and launch the app in your default web browser.
4. Windows may ask for admin privileges the first time you run the server. Make sure to click 'Allow access'. You should only have to do this once.

![image](/assets/img/02.png)

### Installing the Grasshopper components

Discover includes a Grasshopper library of custom components which allows the optimization server to communicate with your Grasshopper model. To install the components:

1. Open Grasshopper and go to `File -> Special Folders -> Components Folder`. This will open the folder where Grasshopper stores its custom plugin files.
2. Copy all the files in the `/Grasshopper Plugin` folder of the Discover zip file to Grasshopper's `Components Folder`. 
3. Restart Grasshopper. You should now see a new tab in the ribbon called 'Discover' with the 7 Discover components loaded.

![image](/assets/img/03.png)
![image](/assets/img/04.png)

## Working with the Discover server

### Starting the server

Double-click the `discover.bat` script in the folder where you unzipped Discover. This will open a Command Prompt window, start the Discover server, and launch the app in your default web browser. Make sure to keep the Command Prompt window open while you're using Discover.

### Shutting down the server

When you're done using Discover, close the Command Prompt window to shut down the server.

