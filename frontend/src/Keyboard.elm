module Keyboard exposing (handleKeyDown, onKeyDown)
import Types exposing (..)
import Command exposing (..)

handleKeyDown : Int -> Model -> Model
handleKeyDown key model =
  case key of
    13 -> -- Enter
      { model |
          lines = model.lines ++ ((Command.lineFromCommand model.input) :: []),
          input = ""
      }
    9 -> -- Tab
      { model | input = (Command.completeCommand model.input)}
    _ ->
      model

onKeyDown : (Int -> msg) -> Attribute msg
onKeyDown tagger =
  on "keydown" (Decode.map tagger keyCode)
