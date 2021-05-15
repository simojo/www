module Keyboard exposing (handleKeyDown, onKeyDown)
import Types exposing (..)
import Command exposing (..)
import Html exposing (Attribute, text)
import Json.Decode as Decode
import Html.Events exposing (
    keyCode,
    on
  )

handleKeyDown : Int -> Model -> Model
handleKeyDown key model =
  case key of
    13 -> -- Enter
      case model.current of
        "" ->
          { model | history = (Output <| Ok <| text "") :: model.history}
        commandBody ->
          Command.handleCommand commandBody model
    9 -> -- Tab
      case model.current of
        "" ->
          model
        str ->
          Command.completeCommand str model
    _ ->
      model

onKeyDown : (Int -> msg) -> Attribute msg
onKeyDown tagger =
  on "keydown" (Decode.map tagger keyCode)
