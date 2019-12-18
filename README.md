## 👋 Hi there, welcome to Discover!

Discover is an optimization tool built to work with Rhino Grasshopper. It is being developed by [Colidescope](https://colidescope.com) as free software with the goal of promoting performance-driven automated design workflows in the architecture, engineering, and construction industries.

## Working with Discover

To get started with Discover, please download the latest stable release and follow the instructions here: [https://colidescope.com/discover](https://colidescope.com/discover)

## Build instructions

If you'd like to tinker with the source code and test the latest build of Discover, you can compile it yourself from the source code hosted here. To start, clone, fork, or download a .zip file of the `master` branch of this repository.

### Building the front-end app

1. Install Node JS by going to https://nodejs.org/ and downloading the installer for the latest stable build ([v12.14.0](https://nodejs.org/dist/v12.14.0/node-v12.14.0-x64.msi) at the time of writing).
2. Open a new Command Prompt window and run `npm install -g @angular/cli` to install the Angular CLI (command line iterface).
3. `cd` into the root folder of the Angular app (`/discover-ng-app`). 
4. Run `npm install` to install the components of the app.
5. In `\discover\discover-ng-app\node_modules\@types\chart.js\`, replace the file `index.d.ts` with version found in `\discover\discover-ng-app\utils\`
6. In the same Command Prompt window, run `ng build` to build the app. This will create a new folder in the root directory called `static` that contains a compiled version of the front-end.

### Running the server

1. Open a new Command Prompt window and `cd` into the root folder of Discover.
2. Run `python -m venv env` to create a new virtual environment.
3. Run `.\env\Scripts\activate.bat` to activate the virtual environment.
4. Run `pip install -r requirements.txt` to install all Python dependencies.
5. Run `python server.py` to start the server. The app should now be running at `http://localhost:5000`

### Notes

- Discover is developed on Windows 10 using [Python 3.7.x](https://www.python.org/downloads/release/python-375/). It may work on other systems but has not been tested.
