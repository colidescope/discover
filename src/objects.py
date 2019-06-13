import urllib, os, sys, random, math, json, string
from time import localtime, strftime
from pathlib import Path
from src.utils import remap, rank, permutation2inversion, inversion2permutation

class Design:

	def __init__(self, _id, des, gen, logger):
		self.logger = logger
		self.id = _id
		self.desNum = des
		self.genNum = gen
		self.parents = [None, None]

		self.inputs = []
		self.objectives = []

		self.feasible = True
		self.penalty = 0
		self.rank = 0
		self.elite = 0

	def generate_random(self, inputs_def):

		self.inputs = []

		for _i in inputs_def:
			if _i["type"] == "Continuous":
				p = [remap(random.random(), 0, 1, _i["Min"], _i["Max"]) for i in range(int(_i["Set length"]))]
				self.inputs.append(p)

			elif _i["type"] == "Categorical":
				p = [int(math.floor(random.random() * 0.9999 * float(_i["Num options"]))) for i in range(int(_i["Set length"]))]
				self.inputs.append(p)

			elif _i["type"] == "Sequence":
				seq = list(range(int(_i["Num options"])))
				random.shuffle(seq)
				self.inputs.append(seq)

		self.logger.log("Generated random inputs for design [{}]".format(str(self.id)))#, self.get_inputs_string()))

	def crossover(self, partner, inputs_def, genNum, desNum, idNum):
		child = Design(idNum, desNum, genNum, self.logger)

		child_inputs = []

		for i in range(len(self.get_inputs())):
			if inputs_def[i]["type"] == "Continuous":

				new_input = []

				inputs_1 = self.get_inputs()[i]
				inputs_2 = partner.get_inputs()[i]

				for j in range(len(inputs_1)):
					# establish spread of possible values based on values from two parents
					x1 = inputs_1[j]
					x2 = inputs_2[j]

					d = abs(x1 - x2)
					y1 = min(x1, x2) - d/3
					y2 = max(x1, x2) + d/3

					# choose random value from range
					newVal = y1 + (y2-y1) * random.random()
					clippedVal = float(max(float(inputs_def[i]["Min"]), min(newVal, float(inputs_def[i]["Max"]))))

					new_input.append(clippedVal)

				child_inputs.append( new_input )

			elif inputs_def[i]["type"] == "Categorical":
				# coin flip on each value of series
				a = self.get_inputs()[i]
				b = partner.get_inputs()[i]
				new_input = [a[j] if random.random() > 0.5 else b[j] for j in range(len(a))]
				child_inputs.append( new_input )

			elif inputs_def[i]["type"] == "Sequence":

				a = permutation2inversion(self.get_inputs()[i])
				b = permutation2inversion(partner.get_inputs()[i])

				# coin flip on each value of inverted sequence
				new_input = inversion2permutation([a[j] if random.random() > 0.5 else b[j] for j in range(len(a))])

				child_inputs.append( new_input )

		child.set_inputs(child_inputs)
		self.logger.log("Crossover: [{}/{}] --> [{}] ".format(self.get_id(), partner.get_id(), child.get_id()))#, child.get_inputs_string()))
		return child

	def mutate(self, inputs_def, mutation_rate):
		inputs_out = []
		mutation = []

		for i in range(len(self.get_inputs())):

			if inputs_def[i]["type"] == "Continuous":
				# jitter input based on normal distribution
				input_set = self.get_inputs()[i]

				new_input_set = []

				goalRange = float(abs(float(inputs_def[i]["Max"]) - float(inputs_def[i]["Min"])))
				for _input in input_set:
					if random.random() < mutation_rate:
						new_input = _input + random.gauss(0, goalRange/5.0)
						# final value clipped by bounds
						new_input_set.append(float(max(float(inputs_def[i]["Min"]), min(new_input, float(inputs_def[i]["Max"])))))
						mutation.append(1)
					else:
						new_input_set.append(_input)
						mutation.append(0)
				inputs_out.append(new_input_set)

			elif inputs_def[i]["type"] == "Categorical":
				input_set = self.get_inputs()[i]
				new_input_set = []

				for _input in input_set:
					if random.random() < mutation_rate:
						new_input = int(math.floor(random.random() * 0.9999 * float(inputs_def[i]["Num options"])))
						new_input_set.append(new_input)
						mutation.append(1)
					else:
						new_input_set.append(_input)
						mutation.append(0)
				inputs_out.append(new_input_set)

			elif inputs_def[i]["type"] == "Sequence":
				# some number of random swaps based on input-specific mutation rate 
				# we want mutation rate to roughly correspond to percentage of sequence altered
				# since each flip alters 2 places we divide mutation rate by 2
				numMutations = int(math.ceil(float(inputs_def[i]["Num options"]) * (mutation_rate / 2.0)))

				mutation.append(float(numMutations)/float(inputs_def[i]["Num options"]))

				newSequence = list(self.get_inputs()[i])
				for j in range(numMutations):
					choices = list(range(len(newSequence)))
					choice1 = choices.pop(choices.index(random.choice(choices)))
					choice2 = choices.pop(choices.index(random.choice(choices)))

					val1 = newSequence[choice1]
					val2 = newSequence[choice2]
					newSequence[choice2] = val1
					newSequence[choice1] = val2
				inputs_out.append(newSequence)

		mutation_total = float(sum(mutation)) / float(len(mutation))
		if mutation_total > 0.0:
			self.logger.log("Mutation: [{}] {}%".format(self.get_id(), mutation_total*100))#, child.get_inputs_string()))
		
		self.set_inputs(inputs_out)

	def get_id(self):
		return self.id

	def set_inputs(self, inputs):
		self.inputs = inputs

	def get_inputs(self):
		return self.inputs

	def get_inputs_string(self):
		return ",".join(["[{}]".format(",".join([str(_i) for _i in _input])) for _input in self.inputs])

	def set_outputs(self, outputs, outputs_def):

		for i,_o in enumerate(outputs):

			_o = float(_o)

			if _o is None:
				self.penalty += 1
				self.feasible = False
				continue

			if outputs_def[i]["type"] == "Objective":
				self.objectives.append(_o)

			elif outputs_def[i]["type"] == "Constraint":
				goal = outputs_def[i]["Requirement"]
				goal_val = float(outputs_def[i]["val"])

				if goal == "Less than":
					if _o >= goal_val:
						self.penalty += 1
						self.feasible = False
				elif goal == "Greater than":
					if _o <= goal_val:
						self.penalty += 1
						self.feasible = False
				elif goal == "Equals":
					if _o != goal_val:
						self.penalty += 1
						self.feasible = False
		self.logger.log("[{}] --> Outputs [{}], Penalty: {}".format(self.get_id(), ",".join([str(o) for o in outputs]), self.penalty))#, child.get_inputs_string()))

	def check_duplicate(self, des):
		# return False if any inputs different, True if all are same
		for i, _in in enumerate(self.get_inputs()):
			if str(_in) != str(des.get_inputs()[i]):
				return False
		return True

	def check_duplicates(self, other_designs):
		for des in other_designs:
			if self.check_duplicate(des):
				return True
		return False

	def get_objectives(self):
		return self.objectives

	def get_penalty(self):
		return self.penalty

	def set_elite(self):
		self.elite = 1

	def get_elite(self):
		return self.elite

	def set_parents(self, p1, p2):
		self.parents = [p1, p2]

	def get_parents(self):
		return self.parents

	def get_data(self):
		return [str(self.id), str(self.genNum), str(self.parents[0]), str(self.parents[1]), str(self.feasible)] + [str(d) for d in self.inputs] + [str(d) for d in self.objectives]


class Job:

	def __init__(self, job_spec, job_name, server_path, logger):
		self.spec = job_spec
		self.logger = logger

		self.des_count = 0
		self.num_designs = int(job_spec["options"]["Designs per generation"])

		self.gen = 0
		self.max_gen = int(job_spec["options"]["Number of generations"])

		self.save_elites = int(job_spec["options"]["Elites"])
		self.mutation_rate = float(job_spec["options"]["Mutation rate"])

		self.job_id = "_" + job_name + "_" + strftime("%y%m%d_%H%M%S", localtime())
		self.path = server_path / self.job_id

		os.makedirs(self.path)

		if job_spec["options"]["Save screenshot"]:
			os.makedirs(self.path / "images")

		self.logger.log("-----")
		self.logger.log("Job start: {}, {} Designs / {} Generations".format(self.job_id, self.num_designs, self.max_gen))

		self.init_data_file()

		self.design_queue = self.init_designs()
		self.design_log = []

		self.running = True

	def init_designs(self):
		self.logger.log("-----")
		self.logger.log("Initializing random designs")
		designs = []

		for i in range(self.num_designs):
			des = Design(self.des_count, i, self.gen, self.logger)
			des.generate_random(self.spec["inputs"])
			self.des_count += 1
			designs.append(des)

		return designs

	def next_generation(self, population):
		children = []

		ranking, crowding, penalties = rank(population, self.spec["outputs"])
		stats = [ [penalties[i], ranking[i], crowding[i]] for i in range(len(ranking))]

		self.logger.log("Rank {}".format([str(x) for x in ranking]))
		self.logger.log("Crowding {}".format([str(x) for x in crowding]))
		self.logger.log("Penalties {}".format([str(x) for x in penalties]))

		self.logger.log("-----")
		self.logger.log("Generation {}".format(self.gen))
		self.logger.log("-----")

		# carry over elite to next generation
		if self.save_elites > 0:
			# get elites from sorted list of ranking and crowding
			elites = [i[0] for i in sorted(enumerate(stats), key=lambda x: (x[1][0], -x[1][1], -x[1][2]))][:self.save_elites]

			# add elites to next generation
			for i, eliteNum in enumerate(elites):
				child = Design(self.des_count, i, self.gen, self.logger)
				child.set_inputs(population[eliteNum].get_inputs())
				child.set_elite()
				child.set_parents(population[eliteNum].get_id(), None)
				children.append(child)
				self.logger.log("Elitism: [{}] --> [{}]".format(population[eliteNum].get_id(), child.get_id()))
				self.des_count += 1

		childNum = self.save_elites
		while childNum < len(population):
			# choose two parents through two binary tournaments
			pool = list(range(len(population)))
			parents = []
			for j in range(2):
				# select one candidate from pool
				candidate1 = random.choice(pool)
				# take first candidate out of pool
				pool.pop(pool.index(candidate1))
				# select another candidate from remaining pool
				candidate2 = random.choice(pool)
				# take second candidate out of pool
				pool.pop(pool.index(candidate2))

				candidates = [[x, stats[x]] for x in [candidate1, candidate2]]
				standings = sorted( candidates, key=lambda x: (x[1][0], -x[1][1], -x[1][2]) )

				# add winner to parent set
				parents.append(standings[0][0])
				# add loser back to pool
				pool.append(standings[1][0])

			child = population[parents[0]].crossover(population[parents[1]], self.spec["inputs"], self.gen, childNum, self.des_count)
			child.mutate(self.spec["inputs"], self.mutation_rate)
			child.set_parents(population[parents[0]].get_id(), population[parents[1]].get_id())

			if not child.check_duplicates(children):
				children.append(child)
				self.des_count += 1
				childNum += 1
			else:
				# duplicate child, skipping...
				continue

		return children

	def is_running(self):
		return self.running

	def get_id(self):
		return self.job_id

	def get_path(self):
		return self.path

	def get_spec(self):
		return self.spec

	def get_latest_des(self):
		return self.design_log[-1]

	def get_next(self):
		des = self.design_queue.pop(0)
		self.design_log.append(des)

		return des.get_inputs()

	def set_outputs(self, outputs):
		des = self.design_log[-1]
		des.set_outputs(outputs, self.spec["outputs"])
		self.write_to_data_file(des.get_data())

	def run_next(self):
		if len(self.design_queue) > 0:
			return True, None
		else:
			if self.gen < self.max_gen:
				self.gen += 1
				self.design_queue = self.next_generation(self.design_log)
				self.design_log = []
				return True, "Starting generation {}".format(self.gen)
			else:
				return False, "Job finished."

	def init_data_file(self):

		types = [x["type"] for x in self.spec["outputs"]]
		# usingConstraints = "Constraint" in types

		header = []
		header.append("id")
		header.append("generation")
		header.append("parent1")
		header.append("parent2")

		# if usingConstraints:
		header.append("feasible")

		for _i in self.spec["inputs"]:
			header.append("[{}] {}".format(_i["type"], _i["name"]) )
		for _o in self.spec["outputs"]:
			if _o["type"] == "Objective":
				header.append("[{}] {}".format(_o["Goal"], _o["name"]) )
			elif _o["type"] == "Constraint":
				header.append("[{}] {}".format(_o["Requirement"], _o["name"]) )

		with open(self.path / "results.tsv", 'a') as f:
			f.write("\t".join(header))

	def write_to_data_file(self, data):
		with open(self.path / "results.tsv", 'a') as f:
			f.write("\n" + "\t".join(data))


class GHClient:

	def __init__(self):
		self.connected = False
		self.file_name = ""

	def is_connected(self):
		return self.connected

	def connect(self, name, ping_file_names, server_path):
		self.connected = True
		self.id = ''.join(random.choice(string.ascii_uppercase + string.ascii_lowercase + string.digits) for _ in range(8))
		self.file_name = name
		self.ping_file_names = ["{}.{}".format(self.id,fn) for fn in ping_file_names]
		self.ping_paths = [server_path / ("data/temp/" + fn) for fn in self.ping_file_names]

	def get_name(self):
		return self.file_name

	def ping(self, ping_id):
		with open(self.ping_paths[ping_id], 'w') as f:
			f.write(strftime("%a, %d %b %Y %H:%M:%S", localtime()))

	def get_server_pingPaths(self):
		return self.ping_paths

	def get_local_pingPaths(self, local_path):
		return ["\\".join([local_path, "data", "temp", fn]) for fn in self.ping_file_names]

class Context:

	def __init__(self, server_path, platform):
		if "linux" in platform:
			self.server_path = Path("/")
		else:
			self.server_path = Path(server_path)

		with open(self.server_path / "data/temp/local_path.txt", 'r') as f:
			path = f.read().strip()
			self.local_path = "\\".join(path.split("\\")[:-2])

	def get_server_path(self, paths):
		path_out = self.server_path
		for p in paths:
			path_out = path_out / p
		return path_out

	def get_local_path(self, paths):
		path_out = self.local_path
		return "\\".join([path_out] + paths)

class Logger:
	def __init__(self, path):
		self.path = path / "log_{}.txt".format(strftime("%y%m%d_%H%M%S", localtime()))

	def init(self):
		with open(self.path, 'w') as f:
			f.write("\t".join([strftime("%H:%M:%S", localtime()), "Server started"]))

	def log(self, message):
		with open(self.path, 'a') as f:
			f.write("\n" + "\t".join([strftime("%H:%M:%S", localtime()), message]))