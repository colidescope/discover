#!flask/bin/python
import json
import os
import sys
from pathlib import Path
from time import sleep
import configparser

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from src.design import Design
from src.job import Job
from src.client import Client
from src.logger import Logger

# from src.test import Test

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:4200"}})
socketio = SocketIO(app)

client = Client()

local_path = Path(os.path.dirname(os.path.abspath(__file__)))
logger = Logger()
logger.init_local(local_path)

job = None
des = Design(None, None, None, client, logger)
fetch_design = False

config = configparser.ConfigParser()
config.read("config.ini")

SLEEP_TIMER = float(config.get('SETTINGS', 'SLEEP_TIMER'))
TEST_MODE = bool(int(config.get('SETTINGS', 'TEST_MODE')))

@app.route("/")
def home():
	return app.send_static_file("index.html")


@app.route("/<path:path>")
def serve_static(path):
	if path.endswith("js"):
		return send_from_directory(
			app.static_folder, path, cache_timeout=app.get_send_file_max_age(path), mimetype='application/javascript')
	else:
		return send_from_directory(app.static_folder, path, cache_timeout=app.get_send_file_max_age(path))


@app.route('/api/v1.0/connect', methods=['GET', 'POST'])
def connect():
	data = request.json

	gh_path = data["path"]
	connection_id = data["id"]

	file_path = gh_path.split("\\")
	file_dir = "\\".join(file_path[:-1])
	local_dir = Path(file_dir) / "discover"
	file_name = file_path[-1].split(".")[0]

	client.connect(local_dir, file_name, connection_id)

	fetch_design = False

	# logger.init(local_dir)
	message = "\nConnected to GH file: {}.gh".format(file_name)
	socketio.emit('server message', {"message": message})
	logger.log(message)

	return jsonify("Connected to server with id {}".format(client.get_connection()))


@app.route("/api/v1.0/start", methods=['GET', 'POST'])
def start():
	global job

	if not client.is_connected():
		client.connect(local_path / "data", "test-model", None)

	job_spec = request.json
	options = job_spec["options"]

	job = Job(options, client, logger)
	header = job.init_data_file()
	socketio.emit('job header', header)

	logger.log(
		"Job started, connected to inputs {} and outputs {}".format(client.get_input_ids(), client.get_output_ids()))

	message = "\nOptimization started: {} designs / {} generations".format(job.num_designs, job.max_gen)
	socketio.emit('server message', {"message": message})

	if client.get_ss_connection() is not None:
		ss_path = client.get_dir(["jobs", job.get_id(), "images"])
		os.makedirs(ss_path, exist_ok=True)

	if client.get_connection():
		do_next()
	else:
		run_local()

	return jsonify({"status": "success", "job_id": str(job.get_path())})


def do_next():
	run, message = job.run_next()

	if message is not None:
		socketio.emit('server message', {"message": message})

	if run:
		client.set_block()
		client.ping_model()
		return jsonify({'status': 'Job running...'})
	else:
		job.running = False
		socketio.emit('job finished', True)
		logger.log("Job finished.")

		return jsonify({'status': 'No job running'})


def run_local():
	model = client.model

	while True:
		run, message = job.run_next()

		if message is not None:
			socketio.emit('server message', {"message": message})

		if not run:
			job.running = False
			socketio.emit('job finished', True)
			logger.log("Job finished.")
			break

		input_vals = []
		for _id in model.get_input_ids():
			input_vals.append(job.get_design_input(_id))

		outputs = model.calculate(input_vals)
		for _o in outputs:
			job.set_output(_o)

		data = job.write_des_data()
		socketio.emit('job data', data)


@app.route("/api/v1.0/stop", methods=['GET'])
def stop():
	global job

	if job is None or not job.is_running():
		return jsonify({"status": "fail"})
	else:
		job.running = False
		message = "Job terminated."
		socketio.emit('server message', {"message": message})
		logger.log(message)

	return jsonify({"status": "success", "job_id": job.job_id})


@app.route("/api/v1.0/register-input", methods=['GET', 'POST'])
def register_input():
	input_def = request.json

	input_object = client.add_input(input_def)
	input_vals = input_object.generate_random()

	status = "Success: registered input {} with Discover".format(input_object.get_id())

	message = "- Input {}: {}".format(len(client.get_inputs()), input_object.get_type())
	socketio.emit('server message', {"message": message})
	logger.log(message)

	return jsonify({'status': status, 'input_id': input_object.get_id(), 'input_vals': input_vals})

@app.route("/api/v1.0/get-input", methods=['GET', 'POST'])
def get_input():
	input_def = request.json

	if fetch_design:
		input_vals = des.get_input(input_def["id"])
		if input_vals is not None:
			status = "Success: regenerated values for input {}".format(input_def["id"])
		else:
			input_object = client.create_input(input_def)
			input_vals = input_object.generate_random()
			status = "Warning: input {} not found, generating random values".format(input_def["id"])

	elif job is None or not job.is_running():
		input_object = client.create_input(input_def)
		input_vals = input_object.generate_random()
		status = "Success: created new random values for input {}".format(input_object.get_id())

	else:
		input_vals = job.get_design_input(input_def["id"])
		status = "Success: received values for input {}".format(input_def["id"])

	return jsonify({'status': status, 'input_id': input_def["id"], 'input_vals': input_vals})


@app.route('/api/v1.0/send-output', methods=['GET', 'POST'])
def send_output():
	global fetch_design

	output_def = request.json
	output_id = output_def["id"]
	status = ""
	
	if fetch_design:
		pos = client.lift_block(output_id)

		if client.check_block():
			fetch_design = False
			status = "reinstated design"
		else:
			status = "reinstating design"

	elif job is None or not job.is_running():
		output_object = client.add_output(output_def)

		status = "Success: registered output {} with Discover".format(output_object.get_id())

		message = "- Output {}: [{}] {}".format(len(client.get_outputs()), output_object.get_type(), output_object.get_name())
		socketio.emit('server message', {"message": message})
		logger.log(message)

		output_id = output_object.get_id()

	else:
		pos = client.lift_block(output_def["id"])
		job.set_output(output_def)

		if client.check_block():
			data = job.write_des_data()
			socketio.emit('job data', data)
			status = "run next"
		else:
			status = "process blocked"

	return jsonify({'status': status, 'output_id': output_id})


@app.route('/api/v1.0/next', methods=['GET', 'POST'])
def next():
	sleep(SLEEP_TIMER)

	if client.get_ss_connection() is None:
		return do_next()
	else:
		client.ping_ss()
		return jsonify({'status': 'done'})


###


@app.route("/api/v1.0/ss-register-id", methods=['GET', 'POST'])
def ss_register_id():
	ss_id = request.json["id"]
	path = client.set_ss_connection(ss_id)
	status = "Success: registered screenshot id {} with Discover".format(ss_id)

	message = "- Screenshots enabled"
	socketio.emit('server message', {"message": message})
	logger.log(message)

	return jsonify({"status": status, "path": str(path)})

@app.route("/api/v1.0/ss-get-path", methods=['GET', 'POST'])
def ss_get_path():

	ss_id = request.json["id"]

	if job is not None and job.is_running():
		des = job.get_latest_des()
		des_id = des.get_id()

		path = client.get_dir(["jobs", job.get_id(), "images"])
		img_path = path / str(des_id)

		return jsonify({"status": "success", "path": str(img_path)})
	else:
		return jsonify({"status": "No job running.", "path": ""})

@app.route('/api/v1.0/ss-done', methods=['GET'])
def ss_done():
	return do_next()


@app.route('/api/v1.0/get_data/<string:job_path>', methods=['GET'])
def get_data(job_path):
	data_path = Path(job_path) / "results.tsv"
	if not data_path.exists():
		return jsonify({"status": "fail"})

	image_path = Path(job_path) / "images"

	json_out = []

	with open(data_path, 'r') as f:
		lines = f.read().splitlines()  # Read lines deleting last \n

	header = lines.pop(0).split("\t")

	for line in lines:
		d = line.split("\t")
		json_out.append({header[i]: d[i] for i in range(len(d))})

	message = "\nLoaded data from server: {}".format(job_path)
	socketio.emit('server message', {"message": message})

	return json.dumps({"status": "success", "load_images": image_path.exists(), "data": json_out})


@app.route('/api/v1.0/get_design/<string:job_path>/<string:des_id>', methods=['GET'])
def get_design(job_path, des_id):

	global job
	global fetch_design

	if job is not None:
		if job.is_running():
			return jsonify({"status": "job-running"})

	data_path = Path(job_path) / "results.tsv"
	if not data_path.exists():
		return jsonify({"status": "fail"})

	with open(data_path, 'r') as f:
		lines = f.readlines()

	header = lines.pop(0).split("\t")

	ids = [line.split("\t")[0] for line in lines]
	des_loc = ids.index(des_id)

	d = lines[des_loc].split("\t")

	inputs = [json.loads(d[i]) for i in range(len(d)) if
		"[Continuous]" in header[i] or "[Categorical]" in header[i] or "[Sequence]" in header[i]]

	des.set_inputs(inputs)
	fetch_design = True
	client.set_block()
	client.ping_model()

	message = "\nReinstated design {} from {}".format(des_id, job_path)
	socketio.emit('server message', {"message": message})

	return jsonify({"status": "success"})


@app.route("/api/v1.0/image_folder_exists/<string:job_path>", methods=['GET'])
def image_folder_exists(job_path):
	image_path = Path(job_path) / "images"
	return jsonify(os.path.exists(image_path))


@app.route("/api/v1.0/get_image/<string:job_path>/<string:des_id>", methods=['GET'])
def get_image(job_path, des_id):
	image_path = Path(job_path) / "images"
	return send_from_directory(image_path, des_id + '.png')


#SOCKET-IO
def ack():
	print('message was received!', file=sys.stderr)
@socketio.on('client message')
def handle_my_custom_event(json):
	print('received json: ' + str(json), file=sys.stderr)
	emit('server message', json, callback=ack)

#FLASK
if __name__ == '__main__':

	if TEST_MODE:
		with app.test_client() as c:

			options = {
				"Designs per generation": 4,
				"Number of generations": 4,
				"Mutation rate": 0.05
			}

			rv = c.post('/api/v1.0/start', json={
				"options": options
			})
	else:
		socketio.run(app, debug=True, host='0.0.0.0', port=5000)
