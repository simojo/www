module Main exposing (..)
import Browser
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
import Http
import Html.Attributes exposing (..)
import Json.Decode as Decode
import Types exposing (..)
import Command

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
  (Model [ Line "start" (Ok <| text "Elm shell - (c) 2021\nSimon Jones - https://github.com/simojo\nType \"help\" for help.") ] "", Cmd.none)

-- UPDATE --

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Input str ->
      ({ model | input = str}, Cmd.none)
    KeyDown key ->
      case key of
        13 ->
          ({ model |
             lines = model.lines ++ ((Command.lineFromCommand model.input) :: []),
             input = ""
          }, Cmd.none)
        9 ->
          ({ model | input = (Command.completeCommand model.input)}, Cmd.none)
        _ ->
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
      input [ onKeyDown KeyDown, onInput Input, placeholder "", value thisValue] []
    ]
  ]

onKeyDown : (Int -> msg) -> Attribute msg
onKeyDown tagger =
  on "keydown" (Decode.map tagger keyCode)
