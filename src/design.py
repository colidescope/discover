import urllib, os, sys, random, math, json, string
from time import localtime, strftime
from pathlib import Path
from src.utils import remap, rank, permutation2inversion, inversion2permutation

class Design:

	def __init__(self, _id, des, gen, inputs_def, outputs_def, logger):
		self.logger = logger
		self.id = _id
		self.desNum = des
		self.genNum = gen
		self.parents = [None, None]

		self.inputs_def = inputs_def
		# self.outputs_def = outputs_def

		self.inputs = []
		self.objectives = []

		self.feasible = True
		self.penalty = 0
		self.rank = 0
		self.elite = 0

	def generate_random(self):

		self.inputs = []

		for _i in self.inputs_def:
			self.inputs.append(_i.generate_random())
			# if _i["type"] == "Continuous":
			# 	p = [remap(random.random(), 0, 1, _i["Min"], _i["Max"]) for i in range(int(_i["Set length"]))]
			# 	self.inputs.append(p)

			# elif _i["type"] == "Categorical":
			# 	p = [int(math.floor(random.random() * 0.9999 * float(_i["Num options"]))) for i in range(int(_i["Set length"]))]
			# 	self.inputs.append(p)

			# elif _i["type"] == "Sequence":
			# 	seq = list(range(int(_i["Num options"])))
			# 	random.shuffle(seq)
			# 	self.inputs.append(seq)

		self.logger.log("Generated random inputs for design [{}]".format(str(self.id)))#, self.get_inputs_string()))

	def crossover(self, partner, inputs_def, genNum, desNum, idNum):
		child = Design(idNum, desNum, genNum, inputs_def, None, self.logger)

		child_inputs = []

		for i in range(len(self.get_inputs())):
			if inputs_def[i].get_type() == 0:

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

			elif inputs_def[i].get_type() == 1:
				# coin flip on each value of series
				a = self.get_inputs()[i]
				b = partner.get_inputs()[i]
				new_input = [a[j] if random.random() > 0.5 else b[j] for j in range(len(a))]
				child_inputs.append( new_input )

			elif inputs_def[i].get_type() == 2:

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

			if inputs_def[i].get_type() == 0:
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

			elif inputs_def[i].get_type() == 1:
				input_set = self.get_inputs()[i]
				new_input_set = []

				for _input in input_set:
					if random.random() < mutation_rate:
						# new_input = int(math.floor(random.random() * 0.9999 * float(inputs_def[i]["Num options"])))
						new_input = int(math.floor(random.random() * 0.9999 * float(inputs_def[i].get_max()-inputs_def[i].get_min()) + inputs_def[i].get_min()))
						new_input_set.append(new_input)
						mutation.append(1)
					else:
						new_input_set.append(_input)
						mutation.append(0)
				inputs_out.append(new_input_set)

			elif inputs_def[i].get_type() == 2:
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
		input_names = [i.get_id() for i in self.inputs_def]
		return self.inputs[input_names.index(input_id)]

	def get_inputs(self):
		return self.inputs

	def get_inputs_string(self):
		return ",".join(["[{}]".format(",".join([str(_i) for _i in _input])) for _input in self.inputs])

	def set_outputs(self, outputs):

		for _o in outputs:

			if _o is None:
				self.penalty += 1
				self.feasible = False
				continue

			value = float(_o["value"])

			if _o["type"] == "Objective":
				self.objectives.append(value)

			elif _o["type"] == "Constraint":
				goal = _o["goal"]
				goal_val = float(_o["val"])

				if goal == "Less than":
					if value >= goal_val:
						self.penalty += 1
						self.feasible = False
				elif goal == "Greater than":
					if value <= goal_val:
						self.penalty += 1
						self.feasible = False
				elif goal == "Equals":
					if value != goal_val:
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
