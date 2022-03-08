# external
import ctypes

class Structs:
    class Post(object):
        def __init__(self, id, title, subtitle, date, body):
            self.id = id             # str
            self.title = title       # str
            self.subtitle = subtitle # str
            self.date = date         # datetime
            self.body = body         # str

        def __str__(self):
            result = f"-- {id(self)} --\n"
            result += f"\tid:       {self.id}\n"
            result += f"\ttitle:    {self.title}\n"
            result += f"\tsubtitle: {self.subtitle}\n"
            result += f"\tdate:     {self.date}\n"
            result += f"\tbody:     {self.body[0:20]}\n"
            return result

    # NOTE: This implements a dynamic array to store the posts in memory. This is not scalable, but it will work for the first thousand posts to exist.
    class PostsCache(object):
        def __init__(self):
            self.length = 0                          # int
            self.capacity = 0                        # int
            self.arr = self.makeArray(self.capacity) # dynamic

        def __len__(self):
            return self.length

        def __iter__(self):
            self.i = 0
            return iter(self.arr)

        def __next__(self):
            if self.i < self.length:
                result = self.arr[self.i]
                self.i += 1
                return result
            else:
                raise StopIteration

        def __getitem__(self, id):
            for item in self.arr:
                if item.id == id:
                    return item

        def __str__(self):
            result = f"-- {id(self)} --\n"
            for item in self.arr:
                result += f"\t{str(item)}\n"
            return result

        def append(self, item):
            if self.length == self.capacity:
                self.resize(self.capacity + 1)
            self.arr[self.length] = item
            self.length += 1

        def resize(self, newCapacity):
            temp = self.makeArray(newCapacity)
            for i in range(0, self.length):
                temp[i] = self.arr[i]
            self.arr = temp
            self.capacity += 1

        def addRange(self, arr):
            for item in arr:
                self.append(item)

        def makeArray(self, newCapacity):
            return (newCapacity * ctypes.py_object)()
