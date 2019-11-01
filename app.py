from flask import Flask, send_file

app = Flask(__name__, static_url_path="")


@app.route("/demo", methods=["GET"])
def index():
    return send_file("static/html/demo.html")


@app.route("/map", methods=["GET"])
def map():
    return send_file("static/html/map-demo-formal.html")


@app.route("/bmap", methods=["GET"])
def baiduditu():
    return send_file("static/html/baiduditu-demo.html")


if __name__ == "__main__":
    app.run("0.0.0.0", 8083, False)
