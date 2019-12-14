import urllib, os, sys, random, math, json, string
from time import localtime, strftime
from pathlib import Path
from src.utils import remap, rank, permutation2inversion, inversion2permutation
from src.test import Test
from src.IO import *


class Client:

	def __init__(self):
		self.connected = False
		self.local_dir = None
		#self.file_name = ""
		#self.connection_id = None
		self.inputs = []
		self.outputs = []
		self.model = None
		#self.ss_connection_id = None

	def connect(self, local_dir, file_name, _id):
		self.local_dir = local_dir
		self.file_name = file_name
		# self.connections = []
		self.connection_id = _id
		self.inputs = []
		self.outputs = []
		# self.gather_inputs()
		self.connected = True
		self.ss_connection_id = None

		if self.connection_id is None:
			# initialize model with inputs and outputs
			self.model = Test(self)
			# set inputs and outputs from model
			for input_def in self.model.get_inputs():
				self.add_input(input_def)
			for output_def in self.model.get_outputs():
				self.add_output(output_def)

	def is_connected(self):
		return self.connected

	def get_file_name(self):
		return self.file_name
	def get_dir(self, paths):
		path_out = self.local_dir
		for p in paths:
			path_out = path_out / p
		return path_out

	def get_connection(self):
		return self.connection_id

	def create_input(self, input_def, input_id=None):
		if input_def["type"] == "Continuous":
			new_input = Continuous(input_def, input_id)
		elif input_def["type"] == "Categorical":
			new_input = Categorical(input_def, input_id)
		elif input_def["type"] == "Sequence":
			new_input = Sequence(input_def, input_id)

		return new_input

	def add_input(self, input_def):
		input_id = input_def["id"]

		if input_id in self.get_input_ids():
			# old_input = self.get_inputs()[self.get_input_ids().index(input_id)]
			# old_input.update_def(input_def)
			# return old_input
			input_id = ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(8))

		new_input = self.create_input(input_def, input_id)

		self.inputs.append(new_input)

		return new_input

	def get_inputs(self):
		return self.inputs
	def get_input_ids(self):
		return [i.get_id() for i in self.get_inputs()]

	def add_output(self, output_def):
		output_id = output_def["id"]

		if output_id in self.get_output_ids():
			# return self.get_outputs()[self.get_output_ids().index(output_id)]
			output_id = ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(8))
		# else:

		if output_def["type"] == "Objective":
			new_output = Objective(output_def, output_id)
		elif output_def["type"] == "Constraint":
			new_output = Constraint(output_def, output_id)

		self.outputs.append(new_output)

		return new_output

	def get_outputs(self):
		return self.outputs
	def get_output_ids(self):
		return [o.get_id() for o in self.get_outputs()]

	def set_block(self):
		self.block = [0 for i in self.get_outputs()]
	def lift_block(self, _id):
		_ids = self.get_output_ids()
		if _id in _ids:
			pos = _ids.index(_id)
			self.block[pos] = 1
		else:
			pos = None
		return pos
	def check_block(self):
		return sum(self.block) == len(self.block)

	def get_ss_connection(self):
		return self.ss_connection_id
	def set_ss_connection(self, _id):
		self.ss_connection_id = _id
		return self.get_dir(["temp"]) / ".".join([self.file_name, self.ss_connection_id])
	def ping_ss(self):
		with open(self.get_dir(["temp"]) / ".".join([self.file_name, self.ss_connection_id]), 'w') as f:
			# f.write(strftime("%a, %d %b %Y %H:%M:%S", localtime()))
			pass

	def ping_model(self):
		with open(self.get_dir(["temp"]) / ".".join([self.file_name, self.get_connection()]), 'w') as f:
			# f.write(strftime("%a, %d %b %Y %H:%M:%S", localtime()))
			pass