import json
from time import localtime, strftime
from src.job import Job


class Model:

	def __init__(self, client):

		self.inputs = []
		self.inputs.append({"id": "in-1", "type": 0, "min": 0, "max": 10, "num": 1})

		self.outputs = []
		self.outputs.append({"id": "out-1", "name": "square", "type": "Objective", "goal": "Max"})

		self.job = None
		# self.logger = logger
		self.client = client

	def set_job(self, job):
		self.job = job

	def get_inputs(self):
		return self.inputs
	def get_input_ids(self):
		return [i["id"] for i in self.inputs]

	def get_outputs(self):
		return self.outputs

	def run_design(self):

		#load input values from job
		input_vals = []
		for _id in self.get_input_ids():
			input_vals.append(self.job.get_design_input(_id))

		#process inputs to compute outputs
		output_def = dict(self.outputs[0])
		output_def["value"] = sum(input_vals[0])

		return output_def

		# self.job.set_output(output_def)
		# self.job.write_des_data()

		# run, message = self.job.run_next()

		# # if message is not None:
		# 	# socketio.emit('server message', {"message": message})

		# if run:
		# 	# client.set_block()
		# 	self.client.ping_model()
		# 	# return jsonify({'status': 'Job running...'})
		# else:
		# 	self.job.running = False
		# 	# logger.log("Job finished.")

		# 	# return jsonify({'status': 'No job running'})

