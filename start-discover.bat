@echo off
IF EXIST ".\env" (
    CALL .\env\Scripts\activate.bat
    ECHO Discover already installed
) ELSE (
    ECHO Installing Discover, this may take a few minutes...
    CALL python -m venv env
    CALL .\env\Scripts\activate.bat
    CALL pip install -r requirements.txt
    ECHO Discover successfully installed
)
CALL explorer "http://localhost:5000/"
CALL python server.py