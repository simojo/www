from flask import Flask

app = Flask(__name__)

@app.route("/")
def landing():
    f = open("../index.html")
    txt = f.read()
    return txt

if __name__ == "__main__":
    app.run(port=4000)
