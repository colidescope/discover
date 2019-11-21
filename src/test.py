import json
from time import localtime, strftime
# from src.job import Job


class Test:

	def __init__(self, client):

		self.inputs = []
		self.inputs.append({"id": "in-1", "name": "x", "type": "Continuous", "min": 0, "max": 5, "num": 1})
		self.inputs.append({"id": "in-2", "name": "y", "type": "Continuous", "min": 0, "max": 3, "num": 1})

		self.outputs = []
		self.outputs.append({"id": "out-1", "name": "f1", "type": "Objective", "goal": "Minimize"})
		self.outputs.append({"id": "out-2", "name": "f2", "type": "Objective", "goal": "Minimize"})

	def get_inputs(self):
		return self.inputs
	def get_input_ids(self):
		return [i["id"] for i in self.inputs]

	def get_outputs(self):
		return self.outputs

	def calculate(self, input_vals):

		x = input_vals[0][0]
		y = input_vals[1][0]

		f1 = 4 * x ** 2 + 4 * y ** 2
		f2 = (x-5) ** 2 + (y-5) ** 2 
		output_vals = [f1, f2]

		outputs_out = []

		for i, o in enumerate(self.outputs):
			o["value"] = output_vals[i]
			outputs_out.append(o)

		return outputs_out