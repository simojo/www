import json
import os
import re
# https://www.w3schools.com/python/python_regex.asp

POSTS = "./data/posts/"

class Data:
    @staticmethod
    def fetchPostsJson():
        for path in os.listdir(POSTS):
            txt = open(POSTS + path).read()
            blob = lambda x: f"(?<=^{x} ).*"
            title = re.findall(blob("#"), txt, re.MULTILINE)[0]
            subtitle = re.findall(blob("##"), txt, re.MULTILINE)[0]
            date = re.findall(blob("###"), txt, re.MULTILINE)[0]
            body = re.sub(r"^(#.*)\n", "", txt, flags=re.MULTILINE).lstrip().rstrip()
            print(json.dumps({
                "title": title,
                "subtitle": subtitle,
                "date": date,
                "body": body
            }))
