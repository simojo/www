import json
import os
import re

POSTS = "./data/posts/"

class Data:
    @staticmethod
    def fetchPosts():
        result = []
        for path in os.listdir(POSTS):
            txt = open(POSTS + path).read()
            blob = lambda x: f"(?<=^{x} ).*"
            title = re.findall(blob("#"), txt, re.MULTILINE)[0]
            subtitle = re.findall(blob("##"), txt, re.MULTILINE)[0]
            date = re.findall(blob("###"), txt, re.MULTILINE)[0]
            body = re.sub(r"^(#.*)\n", "", txt, flags=re.MULTILINE).lstrip().rstrip()
            route = re.findall("(?=\.md)", path)[0]
            result.append({
                "route": route,
                "title": title,
                "subtitle": subtitle,
                "date": date,
                "body": body
            })
        return result

    @staticmethod
    def fetchPostsJson():
        return json.dumps(Data.fetchPosts())

    @staticmethod
    def fetchPostJson(postroute):
        return json.dumps(list(filter(lambda x: x["route"] == postroute, Data.fetchPosts()))[0])

    @staticmethod
    def fetchPostsLandingJson():
        # FIXME do not capture variable
        return json.dumps(list(map(lambda x: x.pop("body"), Data.fetchPosts())))

def OK(str=""):
    return str,200
