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
  (Model [ Line "start" (Ok "Elm shell - (c) 2021\nSimon Jones - https://github.com/simojo") ] "", Cmd.none)

type alias Line = {
    input : String,
    output : Result String String
  }

type alias Model = {
    lines : List Line,
    input : String
  }

type Msg
  = Input String
  | KeyDown Int

-- UPDATE --

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    Input str ->
      ({ model | input = str}, Cmd.none)
    KeyDown key ->
      case key of
        13 ->
          ({ model | lines = model.lines ++ ((lineFromCommand model.input) :: []) }, Cmd.none)
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
          (displayLines model.lines) ++ (promptLine :: [])
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
          Ok str ->
            text str
          Err str ->
            span [ class "error" ] [ text str ]
      ]
    ]
  )
  |> List.concat

lineFromCommand : String -> Line
lineFromCommand command =
  Line
    command
    (case String.split " " command of
      [] ->
        Ok ""
      "help" :: [] ->
        Ok " Welcome to the terminal!\nType a command to get started."
      "start" :: [] ->
        Ok "Elm shell - (c) 2021\nSimon Jones - https://github.com/simojo"
      "exit" :: [] ->
        Ok "You can't really do that here."
      char :: _ ->
        Err <| "Error: Command \"" ++ char ++ "\" not found."
    )


prompt : Html Msg
prompt =
  span [ class "prompt" ] [ text "you@here - " ]

promptLine : Html Msg
promptLine =
  li [] [
    div [ id "prompt-line" ] [
      prompt,
      input [ onKeyDown KeyDown, onInput Input, placeholder ""] []
    ]
  ]

onKeyDown : (Int -> msg) -> Attribute msg
onKeyDown tagger =
  on "keydown" (Decode.map tagger keyCode)
