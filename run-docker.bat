mkdir data
cd data
mkdir temp
cd temp
echo %cd% > local_path.txt

docker-compose build

explorer "http://localhost:5000/"

docker-compose up
docker-compose down
