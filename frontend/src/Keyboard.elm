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
        Input commandBody ->
          Command.handleCommand commandBody model
        Input "" ->
          { model | history = (Output <| Ok <| text "") :: model.history}
    9 -> -- Tab
      case model.current of
        Input str ->
          Command.completeCommand str model
        Input "" ->
          model
    _ ->
      model

onKeyDown : (Int -> msg) -> Attribute msg
onKeyDown tagger =
  on "keydown" (Decode.map tagger keyCode)
