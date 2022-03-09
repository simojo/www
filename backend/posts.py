# external
import json
import os
import re
from datetime import datetime
# internal
from structs import Structs
from globals import Globals

POSTS = os.path.join(os.path.dirname(__file__), "data/posts/")

class Posts:
    @staticmethod
    def fetchPosts():
        result = []
        for path in os.listdir(POSTS):
            txt = open(POSTS + path).read()
            blob = lambda x: f"(?<=^{x} ).*"
            # title -> # Title
            title = re.findall(blob("#"), txt, re.MULTILINE)[0].strip()
            # subtitle -> ## Subtitle
            subtitle = re.findall(blob("##"), txt, re.MULTILINE)[0].strip()
            # date -> ### 2002-04-19
            dateSplit = re.findall(blob("###"), txt, re.MULTILINE)[0].strip().split("-")
            year = int(dateSplit[0])
            month = int(dateSplit[1])
            day = int(dateSplit[2])
            date = datetime(year, month, day)
            # body -> leftover text
            body = "\n".join(txt.split("\n")[4:]).lstrip().rstrip()
            fname = re.findall(".*(?=\.md)", path)[0]
            result.append(Structs.Post(
                id = fname,
                title = title,
                subtitle = subtitle,
                date = date,
                body = body
            ))
        Globals.postsCache.addRange(result)

    @staticmethod
    def fetchPostsJson():
        return json.dumps(list(map(lambda x: {
                "id": x.id,
                "title": x.title,
                "subtitle": x.subtitle,
                "date": str(x.date),
                "body": x.body
            },
            Globals.postsCache
        )))

    @staticmethod
    def fetchPostJson(postid):
        return json.dumps(list(map(lambda x: {
                "id": x.id,
                "title": x.title,
                "subtitle": x.subtitle,
                "date": str(x.date),
                "body": x.body
            },
            list(filter(lambda y:
                y.id == postid,
                Globals.postsCache
            ))
        ))[0])

    @staticmethod
    def fetchPostsLandingJson():
        return json.dumps(list(map(lambda x: {
                "id": x.id,
                "title": x.title,
                "subtitle": x.subtitle,
                "date": str(x.date),
                "body": ""
            },
            Globals.postsCache
        )))
