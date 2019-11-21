import urllib, os, sys, random, math, json, string
from time import localtime, strftime
from pathlib import Path
from src.utils import remap, rank, permutation2inversion, inversion2permutation
from src.test import Test

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