import json
from time import localtime, strftime
# from src.job import Job


class Test:

	def __init__(self, client):

		self.inputs = []
		self.inputs.append({"id": "in-1", "name": "number", "type": "Continuous", "min": 0, "max": 10, "num": 1})

		self.outputs = []
		self.outputs.append({"id": "out-1", "name": "sum", "type": "Objective", "goal": "Maximize"})

	def get_inputs(self):
		return self.inputs
	def get_input_ids(self):
		return [i["id"] for i in self.inputs]

	def get_outputs(self):
		return self.outputs

	def calculate(self, inputs):
		output = sum([sum(i) for i in inputs])
		
		#process inputs to compute outputs
		output_def = dict(self.outputs[0])
		output_def["value"] = output

		return [output_def]