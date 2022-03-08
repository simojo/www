# external
import json
import sys
# internal
from helpers import Helpers
from posts import Posts
from structs import Structs
from globals import Globals

from flask import Flask

app = Flask(__name__)

@app.route("/posts", methods=["GET"])
def getPosts():
    try:
        result = Posts.fetchPostsJson()
        return Helpers.OK(result)
    except Exception as e:
        return Helpers.ERROR_INTERNAL(e)

@app.route("/posts/<postroute>", methods=["GET"])
def getPost(postroute):
    try:
        result = Posts.fetchPostJson(postroute)
        return Helpers.OK(result)
    except Exception as e:
        return Helpers.ERROR_INTERNAL(e)

@app.route("/postslanding", methods=["GET"])
def getPostsLanding():
    try:
        result = Posts.fetchPostsLandingJson()
        return Helpers.OK(result)
    except Exception as e:
        return Helpers.ERROR_INTERNAL(e)

if __name__ == "__main__":
    Globals.isDebug = "--debug" in sys.argv
    Posts.fetchPosts()
    if Globals.isDebug:
        app.run(port=4000)
    else:
        app.run(port=8000)
