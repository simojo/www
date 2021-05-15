module Main exposing (..)
import Browser
import Command
import Browser.Dom as Dom
import Html.Attributes exposing (..)
import Http
import Types exposing (..)
import Keyboard
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
init flags = (
  Model
    [ Output (Ok <| text "Elm shell - (c) 2021\nSimon Jones - https://github.com/simojo\nType \"help\" for help.") ]
    ""
    Nothing
    (Prompt "you" "here" "~" Nothing),
    focusPrompt)

-- UPDATE --

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    TextInput str ->
      ({ model | current = str }, Cmd.none)
    KeyDown key ->
      (Keyboard.handleKeyDown key model, focusPrompt)
    NoOp ->
      (model, Cmd.none)

-- SUBSCRIPTIONS --

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

-- VIEW --

view : Model -> (Browser.Document Msg)
view model = {
    title = "Shell",
    body = [
      div [ class "console" ] [
        ul [] (
          (promptLine model.current model.prompt)
          :: (displayLines model.history model.prompt)
          |> List.reverse
        )
      ]
    ]
  }

-- HELPERS --

displayLines : List Line -> Prompt -> List (Html Msg)
displayLines lines promptInfo =
  lines
  |> List.map (\line ->
    case line of
      Input str ->
        li [] [
          prompt promptInfo,
          text str
        ]
      Output result ->
        li [] [
          case result of
            Ok html ->
              html
            Err html ->
              div [ class "error" ] [ html ]
        ]
  )

prompt : Prompt -> Html Msg
prompt promptInfo =
  span [ class "prompt" ] [
    text <| promptInfo.user
    ++ "@"
    ++ promptInfo.host
    ++ " "
    ++ promptInfo.cwd
    ++ " ",
    case promptInfo.tag of
      Nothing ->
        text ""
      Just tag ->
        span [ class "prompt-tag" ] [
          text tag
        ]
  ]


promptLine : String -> Prompt -> Html Msg
promptLine inputValue promptInfo = (
    li [] [
      div [ id "prompt-line" ] [
        prompt promptInfo,
        input [ id "prompt-input", Keyboard.onKeyDown KeyDown, onInput TextInput, placeholder "", value inputValue, tabindex -1] []
      ]
    ]
  )

focusPrompt : Cmd Msg
focusPrompt =
  Task.attempt (\_ -> NoOp) (Dom.focus "prompt-input")
