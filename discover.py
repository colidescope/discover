#!flask/bin/python
import json
import os
import sys
from pathlib import Path
from time import sleep

from flask import Flask, jsonify, request, send_from_directory  # , send_file
from flask_cors import CORS
from flask_socketio import SocketIO, emit

from src.design import Design
from src.job import Job
from src.objects import Client, Logger

# from src.test import Test

testing = False

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

	# logger.init(local_dir)
	message = "Connected to Grasshopper file: {}".format(file_name)
	socketio.emit('server message', {"message": message})
	logger.log(message)

	return jsonify("Connected to server with id {}".format(client.get_connection()))


@app.route("/api/v1.0/start", methods=['GET', 'POST'])
def start():
	global job

	if not client.is_connected():
		client.connect(local_path / "data", "test-model", None)
	# return jsonify({"status": "fail"})

	job_spec = request.json
	options = job_spec["options"]

	job = Job(options, client, logger)
	header = job.init_data_file()
	socketio.emit('job header', header)
	# client.set_job(job)

	logger.log(
		"Job started, connected to inputs {} and outputs {}".format(client.get_input_ids(), client.get_output_ids()))

	message = "Optimization started: {} designs / {} generations".format(job.num_designs, job.max_gen)
	socketio.emit('server message', {"message": message})

	if client.get_ss_connection() is not None:
		ss_path = client.get_dir(["jobs", job.get_id(), "images"])
		os.makedirs(ss_path, exist_ok=True)

	if client.get_connection():
		# client.create_connection_file()
		do_next()
	else:
		run_local()

	return jsonify({"status": "success", "job_id": str(job.get_path())})


def do_next():
	run, message = job.run_next()

	# sleep(1)

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


@app.route("/api/v1.0/input_ack", methods=['GET', 'POST'])
def input_ack():
	input_def = request.json

	if fetch_design:
		input_vals = des.get_input(input_def["id"])
		status = "Success: regenerated values for input {}".format(input_def["id"])

	elif job is None or not job.is_running():
		input_object = client.add_input(input_def)

		status = "Success: registered input {} with Discover".format(input_object.get_id())
		input_vals = input_object.generate_random()
	# elif :
		# self.design_queue = self.init_designs(self.client)
	else:
		input_vals = job.get_design_input(input_def["id"])
		status = "Success: values for input {}".format(input_def["id"])

	return jsonify({'status': status, 'input_vals': input_vals})


@app.route('/api/v1.0/send_output', methods=['GET', 'POST'])
def send_output():
	global fetch_design

	output_def = request.json
	
	if fetch_design:
		pos = client.lift_block(output_def["id"])

		if client.check_block():
			# data = job.write_des_data()
			# socketio.emit('server message', data)
			# socketio.emit('job data', data)
			# return jsonify({'status': 'run next'})

			fetch_design = False

			return jsonify({'status': 'reinstated design'})
		else:
			return jsonify({'status': 'reinstating design'})

	elif job is None or not job.is_running():
		output_object = client.add_output(output_def)

		status = "Success: registered output {} with Discover".format(output_object.get_id())
		return jsonify({'status': status})

	else:
		pos = client.lift_block(output_def["id"])
		job.set_output(output_def)

		if client.check_block():
			data = job.write_des_data()
			# socketio.emit('server message', data)
			socketio.emit('job data', data)
			return jsonify({'status': 'run next'})
		else:
			return jsonify({'status': 'Process blocked'})


@app.route('/api/v1.0/next', methods=['GET', 'POST'])
def next():
	sleep(0.1)

	if client.get_ss_connection() is None:
		return do_next()
	else:
		client.ping_ss()
		return jsonify({'status': 'done'})


# @app.route('/api/v1.0/sleep', methods=['GET', 'POST'])
# def sleep_function():
# 	sleep(1.0)
# 	return jsonify({'status': None})

###


@app.route("/api/v1.0/ss-register-id", methods=['GET', 'POST'])
def ss_register_id():
	ss_id = request.json["id"]
	path = client.set_ss_connection(ss_id)
	status = "Success: registered screenshot id {} with Discover".format(ss_id)
	return jsonify({"status": status, "path": str(path)})

	# status = "Success: registered input {} with Discover".format(input_object.get_id())
	# input_vals = input_object.generate_random()

	# if job is not None and job.is_running():
	# 	des = job.get_latest_des()
	# 	des_id = des.get_id()

	# 	path = client.get_dir(["jobs", job.get_id(), "images"])
	# 	os.makedirs(path, exist_ok=True)

	# 	img_path = path / str(des_id)

	# 	# ss_path = "\\".join([local_path, , "images", str(des_id)])
	# 	return jsonify({"status": "success", "file_path": str(img_path)})
	# else:
	# 	return jsonify({"status": "No job running.", "file_path": ""})


@app.route("/api/v1.0/ss-get-path", methods=['GET', 'POST'])
def ss_get_path():

	ss_id = request.json["id"]

	if job is not None and job.is_running():
		des = job.get_latest_des()
		des_id = des.get_id()

		path = client.get_dir(["jobs", job.get_id(), "images"])

		img_path = path / str(des_id)

		# ss_path = "\\".join([local_path, , "images", str(des_id)])
		return jsonify({"status": "success", "path": str(img_path)})
	else:
		return jsonify({"status": "No job running.", "path": ""})

# @app.route("/api/v1.0/job_running", methods=['GET'])
# def job_running():
# 	if job is not None and job.is_running():
# 		return jsonify(True)
# 	else:
# 		return jsonify(False)

@app.route('/api/v1.0/ss-done', methods=['GET', 'POST'])
def ss_done():
	ss_id = request.json["id"]
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

	message = "Loaded data from server: {}".format(job_path)
	socketio.emit('server message', {"message": message})

	return json.dumps({"status": "success", "load_images": image_path.exists(), "data": json_out})


@app.route('/api/v1.0/get_design/<string:job_path>/<string:des_id>', methods=['GET'])
def get_design(job_path, des_id):
	# if not client.is_connected():
	# return jsonify({"status": "no-gh"})

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

	message = "Reinstated design {} from {}".format(des_id, job_path)
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

	if testing:
		with app.test_client() as c:

			options = {
				"Designs per generation": 4,
				"Number of generations": 4,
				"Elites": 1,
				"Mutation rate": 0.05
			}

			rv = c.post('/api/v1.0/start', json={
				"options": options
			})
	else:
		socketio.run(app, debug=True, host='0.0.0.0', port=5000)
