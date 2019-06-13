FROM python:3.7
COPY requirements.txt /tmp/
RUN pip install -r /tmp/requirements.txt
WORKDIR /app
COPY . /app
ENTRYPOINT [ "python" ]
CMD [ "server.py" ]