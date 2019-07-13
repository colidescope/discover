import urllib, os, sys, random, math, json, string
from time import localtime, strftime
from pathlib import Path
from src.utils import remap, rank, permutation2inversion, inversion2permutation
from src.design import Design

class Job:

	def __init__(self, options, client, logger):
		# self.options = options
		self.client = client
		self.logger = logger

		self.des_count = 0
		self.num_designs = int(options["Designs per generation"])

		self.gen = 0
		self.max_gen = int(options["Number of generations"])

		self.save_elites = int(options["Elites"])
		self.mutation_rate = float(options["Mutation rate"])

		self.job_id = "_" + client.get_file_name() + "_" + strftime("%y%m%d_%H%M%S", localtime())
		self.path = client.get_dir(["jobs"]) / self.job_id

		os.makedirs(self.path, exist_ok=True)

		if self.client.capture_screenshots():
			os.makedirs(self.path / "images")

		self.logger.log("-----")
		self.logger.log("Job created: {}, {} Designs / {} Generations".format(self.job_id, self.num_designs, self.max_gen))

		self.design_queue = self.init_designs(self.client)
		self.design_log = []
		# self.design_log = [self.design_queue.pop(0)]

		self.running = True


	def init_designs(self, client):
		self.logger.log("-----")
		self.logger.log("Initializing random designs")
		designs = []

		for i in range(self.num_designs):
			des = Design(self.des_count, i, self.gen, client, self.logger)
			des.generate_random_inputs()
			designs.append(des)
			self.des_count += 1

		return designs

	def next_generation(self, population):
		
		children = []

		ranking, crowding, penalties = rank(population, self.client.get_outputs())
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
				child = Design(self.des_count, i, self.gen, self.client, self.logger)
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

			child = population[parents[0]].crossover(population[parents[1]], self.client.get_inputs(), self.gen, childNum, self.des_count)
			child.mutate(self.client.get_inputs(), self.mutation_rate)
			child.set_parents(population[parents[0]].get_id(), population[parents[1]].get_id())

			if not child.check_duplicates(children):
				children.append(child)
				self.des_count += 1
				childNum += 1
			else:
				self.logger.log("Duplicate child found, skipping...")
				# duplicate child, skipping...
				continue

		return children

	def is_running(self):
		return self.running
	def is_initialized(self):
		return self.initialized

	def get_id(self):
		return self.job_id

	def get_path(self):
		return self.path

	def get_latest_des(self):
		return self.design_log[-1]

	def get_design_input(self, input_id):
		des = self.design_log[-1]
		return des.get_input(input_id)

	def set_output(self, output_def):
		des = self.design_log[-1]
		des.set_output(output_def)

	def write_des_data(self):
		des = self.design_log[-1]
		des.log_outputs()

		data = des.get_data()
		self.write_to_data_file(data)
		return data

	def run_next(self):
		if len(self.design_queue) > 0:
			des = self.design_queue.pop(0)
			self.design_log.append(des)
			return True, None
		else:
			if self.gen < self.max_gen:
				self.gen += 1
				self.design_queue = self.next_generation(self.design_log)
				self.design_log = []

				des = self.design_queue.pop(0)
				self.design_log.append(des)

				return True, "Starting generation {}".format(self.gen)
			else:
				return False, "Job finished."

	def init_data_file(self):

		header = []
		header.append("id")
		header.append("generation")
		header.append("parent1")
		header.append("parent2")

		# if usingConstraints:
		header.append("feasible")

		for _i in self.client.get_inputs():
			header.append("[{}] {}".format(_i.get_type(), _i.get_id()) )
		
		for _o in self.client.get_outputs():
			if _o.get_type() == "Objective":
				header.append("[{}] {}".format(_o.get_goal(), _o.get_name()) )
			elif _o.get_type() == "Constraint":
				header.append("[{}] {}".format(_o["requirement"], _o["name"]) )

		with open(self.path / "results.tsv", 'a') as f:
			f.write("\t".join(header))

		return header

	def write_to_data_file(self, data):
		with open(self.path / "results.tsv", 'a') as f:
			f.write("\n" + "\t".join(data))
