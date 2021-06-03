module Types exposing (..)
import Html exposing (Html)
import Browser.Dom as Dom

type alias Command = {
    name : String,
    desc : String,
    usage : String,
    args : List String,
    receiver : (List String) -> Model -> Model
  }

type Line
  = Input String
  | Output (Result (Html Msg) (Html Msg))

type alias Prompt = {
    user : String,
    host : String,
    cwd : String,
    tag : Maybe String
  }

type alias Model = {
    history : List Line,
    current : String,
    belowprompt : Maybe (Html Msg),
    prompt : Prompt
  }

type Msg
  = TextInput String
  | KeyDown Int
  | NoOp
