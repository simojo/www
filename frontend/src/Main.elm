module Main exposing (..)
import Browser
import Command
import Browser.Dom as Dom
import Html.Attributes exposing (..)
import Http
import Json.Decode as Decode
import Types exposing (..)
import Task
import Html exposing (
    Attribute,
    Html,
    a,
    button,
    div,
    h1,
    h2,
    h3,
    header,
    input,
    label,
    li,
    nav,
    p,
    pre,
    span,
    text,
    ul
  )
import Html.Events exposing (
    keyCode,
    on,
    onCheck,
    onClick,
    onInput
  )

main : Program () Model Msg
main =
  Browser.document {
    init = init,
    view = view,
    update = update,
    subscriptions = subscriptions
  }

init : () -> (Model, Cmd Msg)
init flags =
  (Model [ Line "start" (Ok <| text "Elm shell - (c) 2021\nSimon Jones - https://github.com/simojo\nType \"help\" for help.") ] "", focusPrompt)

-- UPDATE --

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Input str ->
      ({ model | input = str}, Cmd.none)
    KeyDown key ->
      case key of
        13 -> -- Enter
          ({ model |
             lines = model.lines ++ ((Command.lineFromCommand model.input) :: []),
             input = ""
          }, focusPrompt)
        9 -> -- Tab
          ({ model | input = (Command.completeCommand model.input)}, focusPrompt)
        _ ->
          (model, focusPrompt)
    Clear n ->
      ({ model | lines = model.lines |> List.take (List.length model.lines - n) }, Cmd.none)
    NoOp ->
      (model, Cmd.none)

-- SUBSCRIPTIONS --

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

-- VIEW --

view : Model -> (Browser.Document Msg)
view model = {
    title = "Terminal",
    body = [
      div [ class "console" ] [
        ul [] (
          (displayLines model.lines) ++ (promptLine model.input :: [])
        )
      ]
    ]
  }

-- HELPERS --

displayLines : List Line -> List (Html Msg)
displayLines lines =
  lines
  |> List.map (\line -> [
      li [] [
        prompt,
        text line.input
      ],
      li [] [
        case line.output of
          Ok html ->
            html
          Err html ->
            div [ class "error" ] [ html ]
      ]
    ]
  )
  |> List.concat

prompt : Html Msg
prompt =
  span [ class "prompt" ] [ text "you@here - " ]

promptLine : String -> Html Msg
promptLine thisValue =
  li [] [
    div [ id "prompt-line" ] [
      prompt,
      input [ id "prompt-input", onKeyDown KeyDown, onInput Input, placeholder "", value thisValue, tabindex -1] []
    ]
  ]

focusPrompt : Cmd Msg
focusPrompt =
  Task.attempt (\_ -> NoOp) (Dom.focus "prompt-input")

onKeyDown : (Int -> msg) -> Attribute msg
onKeyDown tagger =
  on "keydown" (Decode.map tagger keyCode)
