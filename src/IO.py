import urllib, os, sys, random, math, json, string
from time import localtime, strftime
from pathlib import Path
from src.utils import remap, rank, permutation2inversion, inversion2permutation
from src.test import Test

##INPUTS

class Continuous:

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
		random_params = [remap(random.random(), 0, 1, self.min, self.max) for i in range(int(self.num))]
		return random_params

class Categorical:

	def __init__(self, input_def):
		self.id = input_def["id"]
		self.name = input_def["name"]
		self.type = input_def["type"]
		self.opt = float(input_def["opt"])
		self.num = int(input_def["num"])

	def update_def(self, input_def):
		self.id = input_def["id"]
		self.name = input_def["name"]
		self.type = input_def["type"]
		self.opt = float(input_def["opt"])
		self.num = int(input_def["num"])

	def get_id(self):
		return self.id
	def get_name(self):
		return self.name
	def get_type(self):
		return self.type
	def get_opt(self):
		return self.opt
	def get_num(self):
		return self.num

	def generate_random(self):
		random_params = [int(math.floor(random.random() * 0.9999 * self.opt)) for i in range(int(self.num))]
		return random_params

class Sequence:

	def __init__(self, input_def):
		self.id = input_def["id"]
		self.name = input_def["name"]
		self.type = input_def["type"]
		self.num = int(input_def["num"])

	def update_def(self, input_def):
		self.id = input_def["id"]
		self.name = input_def["name"]
		self.type = input_def["type"]
		self.num = int(input_def["num"])

	def get_id(self):
		return self.id
	def get_name(self):
		return self.name
	def get_type(self):
		return self.type
	def get_num(self):
		return self.num

	def generate_random(self):
		seq = list(range(int(self.num)))
		random.shuffle(seq)
		random_params = seq
		return random_params

##OUTPUTS

class Objective:

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

class Constraint:

	def __init__(self, output_def):
		self.id = output_def["id"]
		self.name = output_def["name"]
		self.type = output_def["type"]
		self.goal = output_def["goal"]
		self.target = output_def["target"]

	def get_id(self):
		return self.id
	def get_name(self):
		return self.name
	def get_type(self):
		return self.type
	def get_goal(self):
		return self.goal
	def get_target(self):
		return self.target