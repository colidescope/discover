import random
import math
import sys


def remap(value, min1, max1, min2, max2):
	return float(min2) + (float(value) - float(min1)) * (float(max2) - float(min2)) / (float(max1) - float(min1))



def permutation2inversion(permutation):

    inversion = []

    for i in range(len(permutation)):
        inversion.append(0)
        m = 0
        while permutation[m] != i:
            if permutation[m] > i: 
                inversion[i] += 1
            m += 1

    return inversion

def inversion2permutation(inversion):

    permutation = [0] * len(inversion)
    pos = [0] * len(inversion)

    l = list(range(len(inversion)))
    l.reverse()

    for i in l:
        for m in range(i,len(inversion)):

            if pos[m] >= inversion[i] + 1:
                pos[m] += 1
        pos[i] = inversion[i] + 1

    for i in range(len(inversion)):
        permutation[pos[i]-1] = i

    return permutation


def rank(population, outputs):

    designs = []
    for i, des in enumerate(population):
        designs.append({'id': i, 'scores': des.get_objectives()})

    objectiveGoals = [o.get_goal() for o in outputs if o.get_type() == "Objective"]

    print("objective goals: " + ",".join(objectiveGoals), file=sys.stderr)

    validSet = [x for x in designs if len(x['scores']) == len(objectiveGoals)]

    # print len(validSet)

    dom = []
    ranking = []

    P = validSet

    while len(P) > 0:
        ranking.append([x['id'] for x in getDominantSet(P, objectiveGoals)])
        dom = dom + ranking[-1]
        P = [x for x in validSet if x['id'] not in dom]

    # ranking list format = [[design id's in pareto front 1], [design id's in pareto front 2], ...]

    # initialize distances for all designs
    distances = [ 0.0 ] * len(population)

    # calculate crowding factor for each pareto front
    for front in ranking:
        frontDesigns = [design for design in designs if design['id'] in front]

        # compute normalized distance of neighbors for each objective
        for score in range(len(objectiveGoals)):
            sortedDesigns = sorted(frontDesigns, key=lambda k: k['scores'][score])

            # assign infinite distance to boundary points so they are always selected
            distances[sortedDesigns[0]['id']] += float("inf")
            distances[sortedDesigns[-1]['id']] += float("inf")

            if len(sortedDesigns) > 2:

                # print "computing interior", len(sortedDesigns)-2, "designs"

                # min/max objective values for normalization
                f_min = sortedDesigns[0]['scores'][score]
                f_max = sortedDesigns[-1]['scores'][score]

                if f_min < f_max:
                    # for all interior designs, calculate distance between neighbors
                    for i, des in enumerate(sortedDesigns[1:-1]):
                        distances[des['id']] += (sortedDesigns[i+2]['scores'][score] - sortedDesigns[i]['scores'][score]) / (f_max - f_min)

    ranking.reverse()

    penalties = [x.get_penalty() for x in population]

    rankingOut = [0] * len(population)
    for i, ids in enumerate(ranking):
        for id in ids:
            rankingOut[id] = (i + 1)

    return rankingOut, distances, penalties


def getDominantSet(data, objectiveGoals):

    # single objective ranking
    if len(objectiveGoals) == 1:
        scores = [float(x['scores'][0]) for x in data]
        if objectiveGoals[0] == "Minimize":
            return [data[scores.index(min(scores))]]
        else:
            return [data[scores.index(max(scores))]]

    # multi-objective ranking
    else:
        def keyfunc(x):
            fac = [(obj == "Minimize") * 2 - 1 for obj in objectiveGoals]
            keys = [x['scores'][i] * fac[i] for i in range(len(x['scores']))]
            return tuple(keys)

        P = sorted(data, key = keyfunc)
        # P = sorted(data, key = lambda x: x['scores'][0])
        # if objectiveGoals[0] == "max":
            # P.reverse()
        return front(P, objectiveGoals)

def front(P, objectiveGoals):

    if (len(P) == 1):
        return P
    else:
        div = int(math.floor(len(P)/2.0))
        T = front(P[:div], objectiveGoals)
        B = front(P[div:], objectiveGoals)
        M = []

        for des1 in B:
            dominated = True
            for des2 in T:
                dominated = True
                for k in range(len(des1['scores'])):
                    # if target is not min, fac is -1 (reverse dominance criteria for maximization objective)
                    fac = (objectiveGoals[k] == "Minimize") * 2 - 1
                    if (fac * float(des1['scores'][k])) < (fac * float(des2['scores'][k])):
                        dominated = False
                        break
                if dominated:
                    break
            if not dominated:
                M.append(des1)
        return T + M


def testRanking():

    outputsDef = [
        { "name": "y1", "type": "min"},
        { "name": "y2", "type": "min"}
        ]

    performance = [
        {'id': 0, 'scores': [0, 4]},
        {'id': 1, 'scores': [1, 4]},
        {'id': 2, 'scores': [2, 4]},
        {'id': 3, 'scores': [4, 4]},
        {'id': 4, 'scores': [1, 3]},
        {'id': 5, 'scores': [2, 3]},
        {'id': 6, 'scores': [3, 3]},
        {'id': 7, 'scores': [2, 2]},
        {'id': 8, 'scores': [3, 2]},
        {'id': 9, 'scores': [4, 2]},
        {'id': 10, 'scores': [3, 1]},
        {'id': 11, 'scores': [4, 1]},
        {'id': 12, 'scores': [4, 0]},
        ]

    print(rank(performance, outputsDef, 0, 0, False))

# testRanking()



