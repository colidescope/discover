mkdir discover-release

mkdir discover-release\src
xcopy .\src .\discover-release\src

mkdir discover-release\static
xcopy .\static .\discover-release\static
mkdir discover-release\static\assets
xcopy .\static\assets .\discover-release\static\assets

copy start-discover.bat .\discover-release\discover.bat
copy LICENSE.txt .\discover-release\LICENSE.txt
copy requirements.txt .\discover-release\requirements.txt
copy server.py .\discover-release\server.py
copy config.ini .\discover-release\config.ini