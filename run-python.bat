mkdir data
cd data
mkdir temp
cd temp
echo %cd% > local_path.txt

cd ..
cd ..

explorer "http://localhost:5000/"

python server.py