module Types exposing (..)
import Html exposing (Html)
import Browser.Dom as Dom

type alias Command = {
    name : String,
    desc : String,
    usage : String,
    args : List String,
    msg : CommandMsg
  }

type alias Line = {
    content : LineKind
  }

type LineKind
  = Input String
  | Output (Result (Html Msg) (Html Msg))

type alias Model = {
    history : List Line,
    current : Line
  }

type Msg
  = TextInput String
  | KeyDown Int
  | CommandSent CommandMsg
  | NoOp

type CommandMsg
  = Clear
  | Echo String
  | Exit
  | Help (Maybe String)
  | Start
