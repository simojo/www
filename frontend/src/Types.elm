module Types exposing (..)
import Html exposing (Html)

type alias Command = {
    name : String,
    desc : String,
    usage : String,
    args : List String,
    receiver : List String -> Result (Html Msg) (Html Msg)
  }

type alias Line = {
    input : String,
    output : Result (Html Msg) (Html Msg)
  }

type alias Model = {
    lines : List Line,
    input : String
  }

type Msg
  = Input String
  | KeyDown Int

