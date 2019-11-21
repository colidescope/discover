import urllib, os, sys, random, math, json, string
from time import localtime, strftime
from pathlib import Path
from src.utils import remap, rank, permutation2inversion, inversion2permutation

class Design:

	def __init__(self, _id, des, gen, client, logger):
		self.logger = logger
		self.id = _id
		self.desNum = des
		self.genNum = gen
		self.parents = [None, None]

		self.client = client
		# self.inputs_def = inputs_def
		# self.outputs_def = outputs_def

		self.inputs = []
		self.objectives = []

		self.feasible = True
		self.penalty = 0
		self.rank = 0
		self.elite = 0

	def generate_random_inputs(self):
		for _input in self.client.get_inputs():
			self.inputs.append(_input.generate_random())

		self.logger.log("Created design [{}] with random inputs".format(str(self.id)))#, self.get_inputs_string()))
	# def generate_random(self):

	# 	self.inputs = []

	# 	for _i in self.inputs_def:
	# 		self.inputs.append(_i.generate_random())

	# 	self.logger.log("Generated random inputs for design [{}]".format(str(self.id)))#, self.get_inputs_string()))

	def crossover(self, partner, inputs_def, genNum, desNum, idNum):
		child = Design(idNum, desNum, genNum, self.client, self.logger)

		child_inputs = []

		for i in range(len(self.get_inputs())):
			if inputs_def[i].get_type() == "Continuous":

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
					clippedVal = float(max(float(inputs_def[i].get_min()), min(newVal, float(inputs_def[i].get_max()))))

					new_input.append(clippedVal)

				child_inputs.append( new_input )

			elif inputs_def[i].get_type() == "Categorical":
				# coin flip on each value of series
				a = self.get_inputs()[i]
				b = partner.get_inputs()[i]
				new_input = [a[j] if random.random() > 0.5 else b[j] for j in range(len(a))]
				child_inputs.append( new_input )

			elif inputs_def[i].get_type() == "Sequence":

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

			if inputs_def[i].get_type() == "Continuous":

				# jitter input based on normal distribution
				input_set = self.get_inputs()[i]

				new_input_set = []

				goalRange = float(abs(float(inputs_def[i].get_max()) - float(inputs_def[i].get_min())))
				for _input in input_set:
					if random.random() < mutation_rate:
						new_input = _input + random.gauss(0, goalRange/5.0)
						# final value clipped by bounds
						new_input_set.append(float(max(float(inputs_def[i].get_min()), min(new_input, float(inputs_def[i].get_max())))))
						mutation.append(1)
					else:
						new_input_set.append(_input)
						mutation.append(0)
				inputs_out.append(new_input_set)

			elif inputs_def[i].get_type() == "Categorical":
				input_set = self.get_inputs()[i]
				new_input_set = []

				for _input in input_set:
					if random.random() < mutation_rate:
						new_input = int(math.floor(random.random() * 0.9999 * float(inputs_def[i].get_opt())))
						# new_input = int(math.floor(random.random() * 0.9999 * float(inputs_def[i].get_max()-inputs_def[i].get_min()) + inputs_def[i].get_min()))
						new_input_set.append(new_input)
						mutation.append(1)
					else:
						new_input_set.append(_input)
						mutation.append(0)
				inputs_out.append(new_input_set)

			elif inputs_def[i].get_type() == "Sequence":
				# some number of random swaps based on input-specific mutation rate 
				# we want mutation rate to roughly correspond to percentage of sequence altered
				# since each flip alters 2 places we divide mutation rate by 2
				numMutations = int(math.ceil(float(inputs_def[i].get_num()) * (mutation_rate / 2.0)))

				mutation.append(float(numMutations)/float(inputs_def[i].get_num()))

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

	def get_input(self, input_id):
		input_names = [i.get_id() for i in self.client.get_inputs()]
		return self.inputs[input_names.index(input_id)]

	def get_inputs(self):
		return self.inputs

	def get_inputs_string(self):
		return ",".join(["[{}]".format(",".join([str(_i) for _i in _input])) for _input in self.inputs])

	def set_output(self, _o):
		value = float(_o["value"])

		if _o["type"] == "Objective":
			self.objectives.append(value)

		elif _o["type"] == "Constraint":

			goal = _o["goal"]
			target = float(_o["target"])
			# goal_type = (" ").join(goal.split(" ")[:-1])
			# goal_val = float(goal.split(" ")[-1])

			if goal == "Less than":
				if value >= target:
					self.penalty += 1
					self.feasible = False
			elif goal == "Greater than":
				if value <= target:
					self.penalty += 1
					self.feasible = False
			elif goal == "Equals":
				if value != target:
					self.penalty += 1
					self.feasible = False

	def log_outputs(self):
		self.logger.log("[{}] --> Outputs [{}], Penalty: {}".format(self.get_id(), ",".join([str(o) for o in self.objectives]), self.penalty))#, child.get_inputs_string()))

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
