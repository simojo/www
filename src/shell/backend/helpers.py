# external
import flask
import os
import sys
# internal
from globals import Globals

class Helpers:
    ## Responses ##
    @staticmethod
    def OK(str=""):
        response = flask.Response([str.encode("utf-8")])
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Content-Type"] = "application/json"
        response.status_code = 200
        return response

    @staticmethod
    def ERROR_INTERNAL(e):
        if Globals.isDebug:
            excType, excObj, excTb = sys.exc_info()
            print(f"{excTb.tb_lineno}: {e}")
        response = flask.Response(["An internal error occured.".encode("utf-8")])
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.status_code = 500
        return response
