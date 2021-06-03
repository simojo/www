from flask import Flask
import json
import helpers

app = Flask(__name__)

@app.route("/")
def landing():
    f = open("../frontend/index.html")
    txt = f.read()
    result = txt
    return helpers.OK(result)

@app.route("/posts", methods=["GET"])
def getPosts():
    result = helpers.Data.fetchPostsJson()
    return helpers.OK(result)

@app.route("/posts/<postroute>", methods=["GET"])
def getPost(postroute):
    result = helpers.Data.fetchPostJson(postroute)
    return helpers.OK(result)

@app.route("/postslanding", methods=["GET"])
def getPostsLanding():
    result = helpers.Data.fetchPostsLandingJson()
    return helpers.OK(result)

if __name__ == "__main__":
    app.run(port=4000)
