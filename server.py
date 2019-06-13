#!flask/bin/python
from flask import Flask, jsonify, request, Response, render_template, send_from_directory#, send_file
from flask_socketio import SocketIO, emit

# from queue import Queue
import urllib, os, sys, random, math, json
from time import localtime, strftime
from pathlib import Path#, PureWindowsPath

from src.objects import Design, Job, GHClient, Context, Logger
from src.utils import remap


app = Flask(__name__)
app.config['SECRET_KEY'] = 'key1234'
socketio = SocketIO(app)

context = Context(os.path.dirname(os.path.abspath(__file__)), sys.platform)
gh = GHClient()
logger = Logger(context.get_server_path(["data", "temp"]))

job = None
des = Design(None, None, None, logger)


@app.route("/")
def index():
	logger.init()
	return render_template("index.html")


@app.route('/api/v1.0/connect/<string:fileName>', methods=['GET'])
def connect(fileName):
	fn = urllib.parse.unquote(fileName)
	ping_file_names = ["0", "1"]
	gh.connect(fn, ping_file_names, context.get_server_path([]))
	gh.ping(0)

	message = "Connected to Grasshopper file: {}".format(fn)
	socketio.emit('server message', {"message": message})
	logger.log(message)

	local_ping_paths = ["\\".join([context.get_local_path([]), "data", "temp", fn]) for fn in gh.ping_file_names]

	return jsonify({'status': 'Server connected', 'connections': gh.get_local_pingPaths(context.get_local_path([]))})

@app.route("/api/v1.0/test/", methods=['GET', 'POST'])
def test_inputs():
	if not gh.is_connected():
		return jsonify({"status": "fail"})

	job_spec = request.json
	des.generate_random(job_spec["inputs"])
	gh.ping(0)

	message = "Generated test inputs"
	socketio.emit('server message', {"message": message})

	return jsonify({"status": "success"})

@app.route("/api/v1.0/start/", methods=['GET', 'POST'])
def start_optimization():
	global job

	if not gh.is_connected():
		return jsonify({"status": "fail"})

	job_spec = request.json
	job = Job(job_spec, gh.get_name(), context.get_server_path(["data"]), logger)
	gh.ping(0)

	message = "Optimization started: {} designs / {} generations".format(job.num_designs, job.max_gen)
	socketio.emit('server message', {"message": message})

	return jsonify({"status": "success", "job_id": job.job_id})

@app.route("/api/v1.0/stop/", methods=['GET'])
def stop_optimization():
	global job

	if job is None or not job.is_running():
		return jsonify({"status": "fail"})
	else:
		job.running = False
		message = "Job terminated."
		socketio.emit('server message', {"message": message})
		logger.log(message)

	return jsonify({"status": "success", "job_id": job.job_id})

@app.route("/api/v1.0/get_ss_path/", methods=['GET'])
def get_ss_path():
	if job is not None and job.is_running():
		des = job.get_latest_des()
		des_id = des.get_id()

		local_path = context.get_local_path(["data"])

		ss_path = "\\".join([local_path, job.get_id(), "images", str(des_id)])
		return jsonify({'status': 'success', 'path': ss_path})
	else:
		return jsonify({"status": "fail"})

@app.route("/api/v1.0/job_running/", methods=['GET'])
def job_running():
	if job is not None and job.is_running():
		return jsonify(True)
	else:
		return jsonify(False)

@app.route("/api/v1.0/get_inputs/", methods=['GET'])
def get_inputs():
	if job is not None and job.is_running():
		return jsonify(job.get_next())
	else:
		return jsonify(des.get_inputs())

@app.route('/api/v1.0/set_outputs/', methods=['GET', 'POST'])
def set_outputs():
	if job is None or not job.is_running():
		return jsonify({'status': 'No job running'})

	outputs = request.json
	job.set_outputs(outputs)
	
	if job.get_spec()["options"]["Save screenshot"]:
		gh.ping(1)
		return jsonify({'status': 'Waiting for screenshot...'})
	else:
		return do_next()

@app.route('/api/v1.0/ss_done/', methods=['GET'])
def ss_done():
	if job is None or not job.is_running():
		return jsonify({'status': 'No job running'})
	return do_next()

def do_next():
	run, message = job.run_next()

	if message is not None:
		socketio.emit('server message', {"message": message})

	if run:
		gh.ping(0)
		return jsonify({'status': 'Job running...'})
	else:
		job.running = False
		logger.log("Job finished.")

		return jsonify({'status': 'No job running'})



@app.route('/api/v1.0/get_data/<string:job_name>', methods=['GET'])
def get_data(job_name):

	data_path = context.get_server_path(["data"]) / job_name / "results.tsv"
	if not data_path.exists():
		return jsonify({"status": "fail"})

	image_path = context.get_server_path(["data"]) / job_name / "images"

	json_out = []

	with open(data_path, 'r') as f:
		lines = f.readlines()

	header = lines.pop(0).split("\t")

	for line in lines:
		d = line.split("\t")
		json_out.append({header[i]: d[i] for i in range(len(d)) })

	message = "Loaded data from server: {}".format(job_name)
	socketio.emit('server message', {"message": message})

	return json.dumps({"status": "success", "load_images": image_path.exists(), "data": json_out})


@app.route('/api/v1.0/get_design/<string:job_name>/<string:des_id>', methods=['GET'])
def get_design(job_name, des_id):
	if not gh.is_connected():
		return jsonify({"status": "no-gh"})
	if job is not None:
		if job.is_running():
			return jsonify({"status": "job-running"})

	data_path = context.get_server_path(["data"]) / job_name / "results.tsv"
	if not data_path.exists():
		return jsonify({"status": "fail"})

	with open(data_path, 'r') as f:
		lines = f.readlines()

	header = lines.pop(0).split("\t")

	ids = [line.split("\t")[0] for line in lines]
	des_loc = ids.index(des_id)

	d = lines[des_loc].split("\t")

	inputs = [ json.loads(d[i]) for i in range(len(d)) if "[Continuous]" in header[i] or "[Categorical]" in header[i] or "[Sequence]" in header[i] ]

	des.set_inputs(inputs)
	gh.ping(0)

	message = "Reinstated design {} from {}".format(des_id, job_name)
	socketio.emit('server message', {"message": message})

	return jsonify({"status": "success"})


@app.route("/api/v1.0/get_image/<string:job_name>/<string:des_id>", methods=['GET'])
def get_image(job_name, des_id):
	image_path = context.get_server_path(["data"]) / job_name / "images" 
	return send_from_directory(image_path, des_id + '.png')

def ack():
	print('message was received!', file=sys.stderr)

@socketio.on('client message')
def handle_my_custom_event(json):
	print('received json: ' + str(json), file=sys.stderr)
	emit('server message', json, callback=ack)

if __name__ == '__main__':
	socketio.run(app, debug=True, host='0.0.0.0', port=5000)