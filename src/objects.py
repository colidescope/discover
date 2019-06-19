import urllib, os, sys, random, math, json, string
from time import localtime, strftime
from pathlib import Path
from src.utils import remap, rank, permutation2inversion, inversion2permutation

class Input:

	def __init__(self, _id, input_def):
		self.id = _id
		self.type = int(input_def["type"])
		self.min = float(input_def["min"])
		self.max = float(input_def["max"])
		self.num = int(input_def["num"])

	def get_id(self):
		return self.id
	def get_type(self):
		return self.type
	def get_min(self):
		return self.min
	def get_max(self):
		return self.max
	def get_num(self):
		return self.num

	def generate_random(self):
		if self.type == 0:
			random_params = [remap(random.random(), 0, 1, self.min, self.max) for i in range(int(self.num))]
		elif self.type == 1:
			random_params = [int(math.floor(random.random() * 0.9999 * float(self.max-self.min) + self.min)) for i in range(int(self.num))]
		elif self.type == 2:
			seq = list(range(int(self.num)))
			random.shuffle(seq)
			random_params = seq
		return random_params



class GHClient:

	def __init__(self):
		self.connected = False
		self.local_dir = None
		self.file_name = ""
		self.inputs = []
		self.block = []
		self.outputs = []

	def is_connected(self):
		return self.connected

	def connect(self, local_dir, file_name):
		self.connected = True
		# self.id = ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(8))
		self.local_dir = local_dir
		self.file_name = file_name
		# self.ping_file_names = ["{}.{}".format(self.id,fn) for fn in ping_file_names]
		# self.ping_paths = [server_path / ("data/temp/" + fn) for fn in self.ping_file_names]

	def get_name(self):
		return self.file_name

	def get_dir(self, paths):
		path_out = self.local_dir
		for p in paths:
			path_out = path_out / p
		return path_out

	def clear_inputs(self):
		self.inputs = []
	def add_input(self, id, _i):
		if id not in [i.get_id() for i in self.get_inputs()]:
			self.inputs.append(_i)
	def get_inputs(self):
		return self.inputs

	def set_outputs(self, outputs):
		self.outputs = outputs
	def get_outputs(self):
		return self.outputs

	def set_block(self):
		self.block = [0 for i in self.get_inputs()]
		# self.block = bool
	def lift_block(self, input_id):
		input_ids = [i.get_id() for i in self.get_inputs()]
		self.block[input_ids.index(input_id)] = 1
	def check_block(self):
		return not sum(self.block) == len(self.block)

	# def ping(self, ping_id):
		# with open(self.ping_paths[ping_id], 'w') as f:
			# f.write(strftime("%a, %d %b %Y %H:%M:%S", localtime()))
	def ping(self, file_name):
		with open(self.get_dir(["temp"]) / file_name, 'w') as f:
			f.write(strftime("%a, %d %b %Y %H:%M:%S", localtime()))
	# def ping_ack(self, file_name):
	# 	with open(self.get_dir(["temp"]) / file_name, 'w') as f:
	# 		f.write("ack")
	def ping_inputs(self):
		self.set_block()
		for _i in self.get_inputs():
			with open(self.get_dir(["temp"]) / ".".join([self.file_name, _i.get_id()]), 'w') as f:
				f.write(strftime("%a, %d %b %Y %H:%M:%S", localtime()))

	def get_server_pingPaths(self):
		return self.ping_paths

	def get_local_pingPaths(self, local_path):
		return ["\\".join([local_path, "data", "temp", fn]) for fn in self.ping_file_names]

class Context:

	def __init__(self):
		# if "linux" in platform:
			# self.server_path = Path("/")
		# else:
			# self.server_path = Path(server_path)

		# self.server_path = 

		# with open(self.server_path / "data/temp/local_path.txt", 'r') as f:
		# 	path = f.read().strip()
		# 	self.local_path = "\\".join(path.split("\\")[:-2])
		self.connected = False
		self.path = ""

	def connect(self, path):
		self.connected = True

		self.path = Path(path)
		print(self.path)

	def get_server_path(self, paths):
		# path_out = self.server_path
		path_out = self.path
		for p in paths:
			path_out = path_out / p
		return path_out

	def get_local_path(self, paths):
		# path_out = self.local_path
		path_out = self.path
		return "\\".join([path_out] + paths)

class Logger:

	def __init__(self):
		self.path = None

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