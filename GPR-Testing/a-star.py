import matplotlib.pyplot as plt
import heapq


class Node:
    def __init__(self, x, y, cost, parent):
        self.x = x
        self.y = y
        self.cost = cost
        self.parent = parent

    def __lt__(self, other):
        return self.cost < other.cost


def astar(start, goal, grid):
    open_set = []
    closed_set = set()
    heapq.heappush(open_set, Node(start[0], start[1], 0, None))

    while open_set:
        current = heapq.heappop(open_set)
        if current.x == goal[0] and current.y == goal[1]:
            return current

        closed_set.add((current.x, current.y))

        for neighbor in [(current.x + 1, current.y), (current.x - 1, current.y), (current.x, current.y + 1), (current.x, current.y - 1)]:
            if neighbor in closed_set:
                continue

            if neighbor[0] < 0 or neighbor[0] >= len(grid) or neighbor[1] < 0 or neighbor[1] >= len(grid[0]):
                continue

            if grid[neighbor[0]][neighbor[1]] == 1:
                continue

            new_cost = current.cost + 1
            new_node = Node(neighbor[0], neighbor[1], new_cost, current)

            if new_node not in open_set:
                heapq.heappush(open_set, new_node)

    return None


def visualize_path(path, grid, start, goal):
    plt.figure()

    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == 1:
                plt.plot(i, j, 'ko')
            else:
                plt.plot(i, j, 'wo')

    current = path
    while current.parent is not None:
        plt.plot([current.x, current.parent.x], [
                 current.y, current.parent.y], 'g-')
        current = current.parent

    plt.plot(start[0], start[1], 'ro')
    plt.plot(goal[0], goal[1], 'bo')

    plt.xlim([-1, len(grid[0])])
    plt.ylim([-1, len(grid)])
    plt.xlabel('X')
    plt.ylabel('Y')
    plt.title('A* Pathfinding Visualization')
    plt.show()


def main():
    # grid = [[0, 0, 0, 0, 0, 0, 0, 0], 
    #         [0, 1, 1, 0, 0, 0, 0, 0], 
    #         [0, 0, 1, 0, 0, 0, 0, 0], 
    #         [0, 0, 1, 0, 1, 1, 1, 0], 
    #         [0, 1, 0, 0, 1, 0, 0, 0], 
    #         [0, 1, 0, 1, 1, 0, 1, 1], 
    #         [0, 1, 0, 0, 0, 0, 1, 0],
    #         [1, 0, 0, 0, 0, 0, 0, 0]]

    grid = [[0]*20]*20
    for lst in grid:
        print(lst) 
    start = (0, 0)
    goal = (19, 19)

    path = astar(start, goal, grid)

    if path is None:
        print("No path found")
    else:
        visualize_path(path, grid, start, goal)


if __name__ == "__main__":
    main()
