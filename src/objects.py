import urllib, os, sys, random, math, json, string
from time import localtime, strftime
from pathlib import Path
from src.utils import remap, rank, permutation2inversion, inversion2permutation
from src.test import Test

class Input:

	def __init__(self, input_def):
		self.id = input_def["id"]
		self.name = input_def["name"]
		self.type = input_def["type"]
		self.min = float(input_def["min"])
		self.max = float(input_def["max"])
		self.num = int(input_def["num"])

	def update_def(self, input_def):
		self.id = input_def["id"]
		self.name = input_def["name"]
		self.type = input_def["type"]
		self.min = float(input_def["min"])
		self.max = float(input_def["max"])
		self.num = int(input_def["num"])

	def get_id(self):
		return self.id
	def get_name(self):
		return self.name
	def get_type(self):
		return self.type
	def get_min(self):
		return self.min
	def get_max(self):
		return self.max
	def get_num(self):
		return self.num

	def generate_random(self):
		if self.type == "Continuous":
			random_params = [remap(random.random(), 0, 1, self.min, self.max) for i in range(int(self.num))]
		elif self.type == "Categorical":
			random_params = [int(math.floor(random.random() * 0.9999 * float(self.max-self.min) + self.min)) for i in range(int(self.num))]
		elif self.type == "Sequence":
			seq = list(range(int(self.num)))
			random.shuffle(seq)
			random_params = seq
		return random_params

class Output:

	def __init__(self, output_def):
		self.id = output_def["id"]
		self.name = output_def["name"]
		self.type = output_def["type"]
		self.goal = output_def["goal"]

	def get_id(self):
		return self.id
	def get_name(self):
		return self.name
	def get_type(self):
		return self.type
	def get_goal(self):
		return self.goal


class Client:

	def __init__(self):
		self.connected = False
		self.local_dir = None
		self.file_name = ""
		self.connection_id = None
		self.inputs = []
		# self.block = []
		self.outputs = []
		self.model = None
		self.ss = False

	def capture_screenshots(self):
		return self.ss

	def is_connected(self):
		return self.connected

	def connect(self, local_dir, file_name, _id):
		self.local_dir = local_dir
		self.file_name = file_name
		# self.connections = []
		self.connection_id = _id
		self.inputs = []
		self.outputs = []
		# self.gather_inputs()
		self.connected = True

		if self.connection_id is None:
			# initialize model with inputs and outputs
			self.model = Test(self)
			# set inputs and outputs from model
			for input_def in self.model.get_inputs():
				self.add_input(input_def)
			for output_def in self.model.get_outputs():
				self.add_output(output_def)

	def get_file_name(self):
		return self.file_name
	def get_dir(self, paths):
		path_out = self.local_dir
		for p in paths:
			path_out = path_out / p
		return path_out

	def get_connection(self):
		return self.connection_id

	def add_input(self, input_def):
		input_id = input_def["id"]

		if input_id in self.get_input_ids():
			old_input = self.get_inputs()[self.get_input_ids().index(input_id)]
			old_input.update_def(input_def)
			return old_input
		else:
			new_input = Input(input_def)
			self.inputs.append(new_input)
			return new_input

	def get_inputs(self):
		return self.inputs
	def get_input_ids(self):
		return [i.get_id() for i in self.get_inputs()]

	def add_output(self, output_def):
		output_id = output_def["id"]

		if output_id in self.get_output_ids():
			return self.get_outputs()[self.get_output_ids().index(output_id)]
		else:
			new_output = Output(output_def)
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
		pos = _ids.index(_id)
		self.block[pos] = 1
		return pos
	def check_block(self):
		return sum(self.block) == len(self.block)

	def ping_model(self):
		with open(self.get_dir(["temp"]) / ".".join([self.file_name, self.get_connection()]), 'w') as f:
			# f.write(strftime("%a, %d %b %Y %H:%M:%S", localtime()))
			pass


class Logger:

	def __init__(self):
		self.path = None

	def init_local(self, path):
		self.path = path / "log.txt"
		with open(self.path, 'w') as f:
			f.write("\t".join([strftime("%H:%M:%S", localtime()), "Log initialized"]))

	def init(self, path):
		log_path = path / "logs"

		if not os.path.exists(log_path):
			os.makedirs(log_path)

		log_id = strftime("%y%m%d_%H%M%S", localtime())
		self.path = log_path / "log_{}.txt".format(log_id)

		with open(self.path, 'w') as f:
			f.write("\t".join([strftime("%H:%M:%S", localtime()), "Server started"]))

	def log(self, message):
		with open(self.path, 'a') as f:
			f.write("\n" + "\t".join([strftime("%H:%M:%S", localtime()), message]))